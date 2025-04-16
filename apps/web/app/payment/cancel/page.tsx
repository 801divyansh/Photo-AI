import { PaymentCancelContent } from "@/components/payment/PaymentCancelContent";
import { Suspense } from "react";

export default function PaymentCancelPage(){
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen py-10">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Loading...</h1>
                    </div>
                </div>
            }
        >
            <PaymentCancelContent />
        </Suspense>
    )
}