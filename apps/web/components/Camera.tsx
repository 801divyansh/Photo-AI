"use client"
import { useAuth } from "@clerk/nextjs" 
import { BACKEND_URL } from "@/app/config"
import { useEffect, useState } from "react"
import axios from "axios";
import { ImageCard, ImageCardSkeleton, TImage } from "./ImageCard";
import { Skeleton } from "./ui/skeleton";


export function Camera(){
    const { getToken } = useAuth();
    const [images, setImages] = useState< TImage[] >([]);
    const [imagesLoading, setImagesLoading] = useState(false);

    useEffect(() => {
        (async() => {
            const token = await getToken();
            const respones = await axios.get(`${BACKEND_URL}/image/bulk`,{
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            setImages(respones.data.images);
            setImagesLoading(false);
        })()
    },[])

    return <div>
        {images.map(image => <ImageCard {...image} />)}
        {imagesLoading && <ImageCardSkeleton></ImageCardSkeleton>}
    </div>
}