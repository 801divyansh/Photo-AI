import { auth } from "@clerk/nextjs/server";
import TransactionsPage from "@/components/payment/PurchasesPage";
import { redirect } from "next/navigation";


export default async function PurchasesPage(){
    const{ userId } = await auth();
    if(!userId){
        redirect("/");
    }

    return <TransactionsPage />;
}