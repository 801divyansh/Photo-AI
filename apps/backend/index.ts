import express from "express";
import { TrainModel, GenerateImage, GenerateImageFromPack } from "common/types";
import { prismaClient } from "db";
import { S3Client } from "bun";
import { FalAIModel } from "./models/FalAIModel";
import cors from "cors";
import { authMiddleware } from "./middleware";
import { fal } from "@fal-ai/client";
import paymentRouter from "./routes/payment.routes"
import { router as webhookRouter } from "./routes/webhook.router";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8080;

const falAiModel = new FalAIModel();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/pre-signed-url", async (req, res) => {
    const key = `models/${Date.now()}_${Math.random()}.zip`;
    const url = S3Client.presign(key, {
      method: "PUT",
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
      endpoint: process.env.ENDPOINT,
      bucket: process.env.BUCKET_NAME,
      expiresIn: 60 * 5,
      type: "application/zip",
    });
  
    res.json({
      url,
      key,
    });
  });

app.post("/ai/training", authMiddleware , async (req, res) => {
    try {
        const parsedBody = TrainModel.safeParse(req.body);
    
        if(!parsedBody.success) {
            res.status(411).json({
                message: "Input incorrect",
                error: parsedBody.error,
            })
            return;
        }

        const { request_id, response_url } = await falAiModel.trainModel(parsedBody.data.zipUrl, parsedBody.data.name);

        const data = await prismaClient.model.create({
            data: {
                name: parsedBody.data.name,
                type: parsedBody.data.type,
                age: parsedBody.data.age,
                ethinicity: parsedBody.data.ethinicity,
                eyeColor: parsedBody.data.eyeColor,
                bald: parsedBody.data.bald,
                userId: req.userId!,
                zipUrl: parsedBody.data.zipUrl,
                falAiRequestId: request_id,

            },
        });
        
        res.json({
            modelId: data.id
        });
    } catch (error) {
        console.error("Error in ai/training:", error);
        res.status(500).json({
            message: "Training failed",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

app.post("/ai/generate",authMiddleware , async (req, res) => {
    const parsedBody = GenerateImage.safeParse(req.body);

    if(!parsedBody.success) {
        res.status(411).json({
            message: "Input incorrect"
        })
        return;
    }

    const model = await prismaClient.model.findUnique({
        where: {
            id: parsedBody.data.modelId
        }
    })

    if(!model || !model.tensorPath) {
        res.status(411).json({
            message: "Model not found"
        })
        return;
    }
    
    // for credits check
    const credits = await prismaClient.userCredit.findUnique({
        where: {
            userId: req.userId!,
        },
    });

    if((credits?.amount ?? 0) < 1){
        res.status(411).json({
            message: "Not enough credits"
        });
        return;
    }

    const {request_id, response_url} = await falAiModel.generateImage(parsedBody.data.prompt, model.tensorPath);

    const data =  await prismaClient.outputImages.create({
        data: {
            prompt: parsedBody.data.prompt,
            userId: req.userId!,
            modelId: parsedBody.data.modelId,
            imageUrl:"",
            falAiRequestId: request_id
        }
    });

    await prismaClient.userCredit.update({
        where: {
            userId: req.userId!,
        },
        data: {
            amount: { decrement: 1 },
        },
    });

    res.json({
        imageId: data.id
    });
    
});

app.post("/pack/generate" ,authMiddleware , async (req, res) => {
    const parsedBody = GenerateImageFromPack.safeParse(req.body);

    if(!parsedBody.success) {
        res.status(411).json({
            message: "Input incorrect"
        })
        return;
    }

    const prompts = await prismaClient.packPrompts.findMany({
        where: {
            packId: parsedBody.data.packId
        }
    });

    const model = await prismaClient.model.findFirst({
        where: {
            id: parsedBody.data.modelId,
        },
    });

    if (!model) {
        res.status(411).json({
          message: "Model not found",
        });
        return;
      }

    const credits = await prismaClient.userCredit.findUnique({
        where: {
            userId: req.userId!,
        },
    });

    if((credits?.amount ?? 0 ) < 1 * prompts.length) {
        res.status(411).json({
            message: "Not enough credits",
        });
        return;
    }

    let requestIds: { request_id: string }[] = await Promise.all(
        prompts.map((prompt) => 
            falAiModel.generateImage(prompt.prompt, model.tensorPath!)
    ));

    const images = await prismaClient.outputImages.createManyAndReturn({
        data: prompts.map((prompt, index) => ({
            prompt: prompt.prompt,
            userId: req.userId!,
            modelId: parsedBody.data.modelId,
            imageUrl: "",
            falAiRequestId: requestIds[index].request_id
        })),          
    });

    await prismaClient.userCredit.update({
        where: {
            userId: req.userId!,
        },
        data: {
            amount: { decrement: 1 * prompts.length },
        },
    })

    res.json({
       images: images.map((image) => image.id)
    })
});

app.get("/pack/bulk", async (req, res) => {
    const packs = await prismaClient.packs.findMany({})

    res.json({
        packs
    })
});

app.get("/image/bulk", authMiddleware, async (req, res) => {
  const ids = req.query.ids as string[];
  const limit = (req.query.limit as string) ?? "100";
  const offset = (req.query.offset as string) ?? "0";

  const imagesData = await prismaClient.outputImages.findMany({
    where: {
      id: { in: ids },
      userId: req.userId!,
      status: {
        not: "Failed",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: parseInt(offset),
    take: parseInt(limit),
  });

  res.json({
    images: imagesData,
  });
});

app.get("/models" , authMiddleware , async(req , res) =>{
    const models = await prismaClient.model.findMany({
        where: {
            OR: [{userId: req.userId}, { open: true }],
        },
    });

    res.json({
        models,
    });
});

app.post("/fal-ai/webhook/train", async (req, res) => {
    console.log("====================Received training webhook====================");
    console.log("Received training webhook:", req.body);
    const requestId = req.body.request_id as string;

    const model = await prismaClient.model.findFirst({
        where: {
            falAiRequestId: requestId,
        },
    });

    console.log("Model found:", model);
    
    if (!model) {
        console.log("Model not found for request ID:", requestId);
        res.status(404).json({ message: "Model not found" });
        return;
    }

    //for error
    if(req.body.status === "ERROR") {
        console.error("Training error:", req.body.error);
        await prismaClient.model.updateMany({
            where: {
                falAiRequestId: requestId,
            },
            data: {
                trainingStatus: "Failed",
            },
        });

        res.json({
            message: " Error received",
        })
        return;
    };

    // for success
    if(req.body.status === "COMPLETED" || req.body.status === "OK") {
        try{
            let loraUrl;
            if(req.body.payload && req.body.payload.diffusers_lora_file && req.body.payload.diffusers_lora_file.url) {
                loraUrl = req.body.payload.diffusers_lora_file.url;
                console.log("Using lora Url from webhook payload:", loraUrl);
            } else {
                console.log("Fetching result from fal.ai");
                const result = await fal.queue.result("fal-ai/flux-lora-fast-trainig" ,{
                    requestId,
                });
                console.log("Fal.ai result:", result);
                const resultData = result.data as any;
                loraUrl = resultData.diffusers_lora_file.url;
            }

            const credits = await prismaClient.userCredit.findUnique({
                where:{
                    userId: model.userId,
                }
            });

            console.log("User credits" , credits);

            if((credits?.amount ?? 0) < 20) {
                console.error("Not enough credits for user:" , model.userId);
                res.status(411).json({
                    message: "Not enough credits",
                });
                return;
            }

            console.log("Generated preview image with lora Url:" , loraUrl);
            const { imageUrl } = await falAiModel.generateImageSync(loraUrl);

            console.log("generated preview image:", imageUrl);

            await prismaClient.model.updateMany({
                where: {
                    falAiRequestId: requestId,
                },
                data: {
                    trainingStatus: "Generated",
                    tensorPath: loraUrl,
                    thumbnail: imageUrl,
                },
            });
            console.log("Update model and decremented credits for user:",model.userId);

        } catch (error) {
            console.error("Error proccessing webhook:", error);
            await prismaClient.model.updateMany({
                where:{
                    falAiRequestId: requestId,
                },
                data: {
                    trainingStatus: "Failed",
                },
            })
        }
    } else {
        console.log("updated model status to: Pending");
        await prismaClient.model.updateMany({
            where:{
                falAiRequestId: requestId,
            },
            data: {
                trainingStatus: "Pending",
            },
        });
    }
    
    res.json({
        message:"webhook processed successfully (^_^)",
    })
});

app.post("/fal-ai/webhook/image", async (req, res) => {
    console.log("fal-ai/webhook/image");
    console.log(req.body);

    const requestId = req.body.request_id;

    if(req.body.status === "ERROR"){
        res.status(411).json({});
        prismaClient.outputImages.updateMany({
            where: {
                falAiRequestId: requestId,
            },
            data: {
                status:"Failed",
                imageUrl: req.body.payload.image[0].url,
            },
        });
        return;
    }

    await prismaClient.outputImages.updateMany({
        where: {
            falAiRequestId: requestId
        },
        data: {
            status: "Generated",
            imageUrl: req.body.payload.images[0].url,
        },
    });

    res.json({
        message: "Webhook received"
    });
});

app.get("/model/status/:modelId", authMiddleware, async (req, res) => {
    try {
      const modelId = req.params.modelId;
  
      const model = await prismaClient.model.findUnique({
        where: {
          id: modelId,
          userId: req.userId,
        },
      });
  
      if (!model) {
        res.status(404).json({
          success: false,
          message: "Model not found",
        });
        return;
      }
  
      // Return basic model info with status
      res.json({
        success: true,
        model: {
          id: model.id,
          name: model.name,
          status: model.trainingStatus,
          thumbnail: model.thumbnail,
          createdAt: model.createAt,
          updatedAt: model.updatedAt,
        },
      });
      return;
    } catch (error) {
      console.error("Error checking model status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check model status",
      });
      return;
    }
});

app.use("/payment", paymentRouter);
app.use("/api/webhook", webhookRouter);

app.listen(PORT , () => {
    console.log("Server is running on port 8080");
});