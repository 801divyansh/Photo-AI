import { Skeleton } from "./ui/skeleton";

export interface TImage {
    id: string;
    status: string;
    imageUrl: string;
}


export function ImageCard(props: TImage) {
    return <div className="rounded-xl border-2 max-w-[400px] p-2 cursor-pointer">
        <div className="flex p-4 gap-4">
            <div >
                {props.status === "Generated" ? <img src={props.imageUrl} className="rounded"/> : <Skeleton className="rounded" />}
            </div>
        </div>
    </div>
}

export function ImageCardSkeleton() {
    return <div className="rounded-xl border-2 max-w-[400px] p-2 cursor-pointer w-full">
        <div className="flex p-4 g-4">
            <Skeleton className="rounded h-40 w-[400px]" />
        </div>
    </div>
}