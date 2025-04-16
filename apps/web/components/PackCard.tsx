import axios from "axios"
import { BACKEND_URL } from "@/app/config";
import { useAuth } from "@clerk/nextjs"

export interface TPack {
    selectedModelId: any;
    id: string;
    name: string;
    imageUrl1: string;
    imageUrl2: string;
    description: string;
}

export function PackCard(props: TPack) {
    const { getToken } = useAuth();

    return <div className="border rounded-xl hover:border-red-300 max-w-[300px] p-2 cursor-pointer" onClick={async()=>{
        const token = await getToken();
        await axios.post(`${BACKEND_URL}/pack/generate`,{
            packId: props.id,
            modelId: props.selectedModelId
        },{
            headers: {
                Authorization : `Bearer ${token}`
            }
        })
    }}>
        <div className="flex p-3 gap-3">
            <div >
                <img src={props.imageUrl1} className="rounded"/>
            </div>
            <div >
                <img src={props.imageUrl2} className="rounded"/>
            </div>
        </div>
        <div className="text-xl front-bold pl-3 p-1">
            {props.name}
        </div>
        <div className="text-sm pl-3 p-1">
            {props.description}
        </div>
    </div>
}