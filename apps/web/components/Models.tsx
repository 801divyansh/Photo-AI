import { Skeleton } from "@/components/ui/skeleton"

import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import axios from "axios"
import { BACKEND_URL } from "@/app/config";

interface TModel {
    id: string;
    thumbnail: string;
    name: string;
}


export function SelectModel({setSelectedModel}: {
    setSelectedModel: (model: string) => void;
}) {
    const { getToken } = useAuth();
    const [models, setModels] = useState<TModel[]>([]);
    const [modelLoading, setModelLoading] = useState(true);


       useEffect(()=>{
            (async() => {
                const token = await getToken();
                const response = await axios.get(`${BACKEND_URL}/models`, {
                    headers: {
                        Authorization: `Bearer ${token}` 
                    }
                })
                setModels(response.data.models);
                setSelectedModel(response.data.models[0]?.id)
                setModelLoading(false); 
            })
        },[])

    return <>
        <div className="text-2xl pb-2 max-w-4xl">
                Select Model
            </div>
            <div className="max-w-2xl">
                <div className="grid grid-cols-4 gap-2 p-4">
                    {models.map(model => <div className={`${selectedModel === model.id? "border-red-300" : ""} cursor-pointer rounded border p-2`} onClick={() => {
                        setSelectedModel(model.id);
                    }}>
                        <div className="flex justify-between flex-col h-full">
                            <div>
                                <img src={model.thumbnail} className="rounded"/>
                            </div>
                            <div>
                                {model.name}
                            </div>
                        </div>
                        
                    </div>)}   
                </div>
                {modelLoading && <div className="flex gap-2 p-4">
                        <Skeleton className="h-40 w-full rounded" />
                        <Skeleton className="h-40 w-full rounded" />
                        <Skeleton className="h-40 w-full rounded" />
                        <Skeleton className="h-40 w-full rounded" />
                        </div>}
        </div>
    </>
}