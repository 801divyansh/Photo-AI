import express from 'express';
import Stripe from 'stripe';
import { authMiddleware } from '../middleware';
import { PlanType } from "@prisma/client"
import { createStripeSession, createSubscriptionRecord, verifyStripePayment, PaymentService } from '../services/payment';
import { prismaClient } from 'db';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
});

router.post("/create", authMiddleware, async (req: express.Request, res: express.Response) => {
    try {
        const { plan, isAnnual, method} = req.body;
        const userId = req.userId!;
        const userEmail = (req as any).user?.email;

        console.log("Payment request received:", {
            userId,
            plan,
            isAnnual,
            method,
            headers: req.headers,
            body: req.body,
        });

        if(!userId) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        if(!userEmail) {
            res.status(400).json({
                messsage: "User email not found",
            });
            return;
        }
        if(!plan || !method) {
            res.status(400).json({
                message: "Missing plan or payment method",
            });
            return;
        }

        if(method === "stripe"){
            try{
                const session = await createStripeSession(
                    userId,
                    plan as "basic" | "premium",
                    userEmail
                );
                console.log("Stripe session created:", session);
                res.json({ sessionId: session.id });
                return;
            } catch (error) {
                console.error("Stripe session creation error:", error);
                res.status(500).json({
                    message: "Error creating Stripe session",
                    details:
                        process.env.NODE_ENV === "development"
                            ? (error as Error).message
                            : undefined,
                });
                return;
            }
        }    

        console.log("Razorpay method detected");
        if(method === "razorpay"){
            try{
                const order = await PaymentService.createRazorpayOrder(userId, plan);
                console.log("Razorpay order created:", order);
                res.json(order);
                return;
            } catch (error) {
                console.error("Razorpay order creation error:", error);
                res.status(500).json({
                    message: "Error creating Razorpay order",
                    details:
                        process.env.NODE_ENV === "development"
                            ? (error as Error).message
                            : undefined,
                });
                return;
            }
        } 

        res.status(400).json({
            message: "Invalid payment method",
        });
        return;    
    } catch (error) {
        console.error("Payment creation error:", error);
            res.status(500).json({
                message: "Error creating payment session",
                details: error instanceof Error ? error.message : "Unknown error",
            });
        return;   
    }
});

router.post("/stripe/verify", authMiddleware, async (req: express.Request, res: express.Response) => {
        try {
            const { sessionId } = req.body;
            if(!sessionId) {
                res.status(400).json({
                    message: "Missing session ID",
                });
                return;
            }

            // Get the session with expanded payment_intent
            console.log("Verifying Stripe session:", sessionId);
            const session = await stripe.checkout.sessions.retrieve(sessionId ,{
                expand: ["payment_intent", "subscription"],
            });

            console.log("Session status:", session.payment_status);
            console.log("Session metadata:", session.metadata);

            if(session.payment_status !== "paid"){
                res.status(400).json({
                    success: false,
                    message: "Payment not completed",   
                });
                return;
            }

            const userId = session.metadata?.userId;
            const plan = session.metadata?.plan as PlanType;

            if(!userId || !plan){
                res.status(400).json({
                    seccess: false,
                    message: "Missing user or plan information"
                })
                return;
            }

            const paymentIntentId = typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id;
            
            if(!paymentIntentId){
                res.status(400).json({
                    success: false,
                    message: "Missing payment information",
                });
                return;
            }

            //create subscription and add credits
            await createSubscriptionRecord(userId, plan, paymentIntentId, sessionId);
            res.json({
                success: true,
                message: "Payment verified successfully",
            });
            return;

        } catch (error) {
            console.error("Stripe verification error:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Unknown error",
            });
            return;
        }
    }
);

router.post("/razorpay/verify", authMiddleware, async (req: express.Request, res: express.Response) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            plan,
            isAnnual,
        } = req.body;

        // Debug log
        console.log("Verification Request:", {
            userId: req.userId,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            signature: razorpay_signature,
            plan,
            isAnnual,
        });
        
        if (
            !razorpay_payment_id ||
            !razorpay_order_id ||
            !razorpay_signature ||
            !plan
          ) {
            res.status(400).json({
              message: "Missing required fields",
              received: {
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                plan,
              },
            });
            return;
        }

        try{
            const isValid = await PaymentService.verifyRazorpaySignature({
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                signature: razorpay_signature,
                plan: plan as PlanType,
                userId: req.userId!,
              });
      
            if (!isValid) {
                res.status(400).json({ message: "Invalid payment signature" });
                return;
            }
            // Create subscription and add credits
            const subscription = await PaymentService.createSubscriptionRecord(
                req.userId!,
                plan as PlanType,
                razorpay_payment_id,
                razorpay_order_id,
                isAnnual
            );
    
            // Get updated credits
            const userCredit = await prismaClient.userCredit.findUnique({
                where: { userId: req.userId! },
                select: { amount: true },
            });
    
            console.log("Payment successful:", {
                subscription,
                credits: userCredit?.amount,
            });
    
            res.json({
                success: true,
                credits: userCredit?.amount || 0,
                subscription,
            });
        } catch (verifyError) {
            console.error("Razorpay verification error:", verifyError);
            res.status(500).json({
                message: "Error verifying Razorpay payment",
                details:
                verifyError instanceof Error
                        ? verifyError.message
                        : "Unknown error",
            });
        }
    } catch (error) {
        console.error("Route handler error:", error);
        res.status(500).json({
          message: "Error verifying payment",
          details: error instanceof Error ? error.message : "Unknown error",
        });
    }
})

router.get("/subscription/:userId", async ( req: express.Request, res: express.Response) => {
    try{
        const subscription = await prismaClient.subscription.findFirst({
            where: {
                userId: req.userId!,
            },
            orderBy: {
                createdAt: "desc",  
            },
            select:{
                plan: true,
                createdAt: true,
            },
        });

        res.json({
            subscription: subscription || null,
        });
        return;
    } catch (error) {
        console.error("Error fetching subscription:", error);
        res.status(500).json({
            message: "Error fetching subscription",
        });
        return;
    }
});

router.get("/credits/:userId", async ( req: express.Request, res: express.Response) => {
    try{
        const userCredit = await prismaClient.userCredit.findUnique({
            where: {
                userId: req.userId,
            },
            select: {
                amount: true,
            },
        });
        res.json({
            credits: userCredit?.amount || 0,
        });
        return;
    } catch (error) {
        console.error("Error fetching credits:", error);
        res.status(500).json({
            message: "Error fetching credits",
        });
        return;
    }
});

router.get("/credits", authMiddleware, async ( req: express.Request, res: express.Response) => {
    try{
        if(!req.userId){
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const userCredit = await prismaClient.userCredit.findUnique({
            where: {
                userId: req.userId,
            },
            select: {
                amount: true,
                updatedAt: true,
            },
        });
        res.json({
            credits: userCredit?.amount || 0,
            lastUpdated: userCredit?.updatedAt || null,
        });
        return;
    } catch (error) {
        console.error("Error fetching credits:", error);
        res.status(500).json({
            message: "Error fetching credits",
            details: error instanceof Error ? error.message : "Unknown error",
        });
        return;
    }
});

//add stripe webhook handler

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    try{
        if(!sig) throw new Error("Missing Stripe signature header");

        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        console.log("Webhook event received:" , event.type);

        switch(event.type) {
            case "checkout.session.completed" : {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan as PlanType;

                if(!userId || !plan) {
                    throw new Error("Missing metadata in session");
                }

                console.log("Processing successfule payment:", {
                    userId,
                    plan,
                    sessionId:session.id,
                })

                await createSubscriptionRecord(
                    userId,
                    plan,
                    session.payment_intent as string,
                    session.id
                );

                console.log("Successfully processed payment and added credits");
                break;
            }
        }
        res.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
});

//add this new verification endpoint
router.post("/verify",async (req, res) => {
    try {
        const { sessionId } = req.body;

        if(!sessionId){
            res.status(400).json({
                message: "Missing session ID",
            })
            return;
        }

        //verify the payment session
        const isValid = await PaymentService.verifyStripePayment(sessionId);
        
        if(!isValid){
            res.json({ success: true});
            return;
        }else{
            res.status(400).json({
                message: "Payment verification failed",
            });
            return;
        } 
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({
            message: "Error verifying payment",
            details: error instanceof Error ? error.message : "Unknown error",
        });
        return;
    }
})

router.get("/transactions", authMiddleware, async (req, res) => {
    try {
        const transactions = await prismaClient.transaction.findMany({
            where:
                { userId: req.userId! },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            transactions,
        })
        return;
    } catch (error) {
        res.status(500).json({
            message: "Error fetching transactions",
        });
        return;    
    }
});

export default router;