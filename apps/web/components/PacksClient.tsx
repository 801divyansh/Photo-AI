"use client";

import { useState } from "react";
import { PackCard, TPack } from "./PackCard";
import { SelectModel } from "./Models";

export function PacksClient({packs}: {
    packs: TPack[]
}) {
    const [selectedModelId, setSelectedModelId] = useState<string>();
    return <div className="grid md:grid-cols-3 gap-4 p-4 grids-cols-1">
         <SelectModel setSelectedModel={setSelectedModelId} />
         {packs.map(p => <PackCard selectedModelId={selectedModelId!} {...p} />)}
    </div>
}