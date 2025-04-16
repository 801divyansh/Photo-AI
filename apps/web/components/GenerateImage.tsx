"use client"
import { Skeleton } from "@/components/ui/skeleton"

import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import axios from "axios"
import { BACKEND_URL } from "@/app/config";
import { SelectModel } from "./Models";

export function GenerateImage() {
    const [prompt, setPrompt] = useState("");
    const [selectedModel, setSelectedModel] = useState<string>();
    const { getToken } = useAuth();
 

    return <div className="h-[60vh] items-center justify-center flex">
        <div>
            <SelectModel setSelectedModel={setSelectedModel}/>
                <div className="flex justify-center pt-4">
                    <Button onClick={async()=>{
                        const token = await getToken();
                        await axios.post(`${BACKEND_URL}/ai/generate`,{
                            prompt,
                            modelId: selectedModel,
                            num: 1
                        },{
                            headers: {
                                Authorization : `Bearer ${token}`
                            }
                        })
                    }} variant={"secondary"}>Create Image</Button>
                </div>
            </div>
        </div>
}