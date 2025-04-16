import { Packs } from "@/components/Packs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Train } from "../train/page"
import { GenerateImage } from "@/components/GenerateImage"
import { Camera } from "@/components/Camera"



export default function Dashboard() {
    return <div className="flex justify-center py-18">
        <div className="max-w-6xl">
            <div className="flex justify-center p-2">
                <Tabs defaultValue="camera">
                    <div className="flex justify-center p-10">
                        <TabsList>
                            <TabsTrigger value="camera">Camera</TabsTrigger>
                            <TabsTrigger value="generate">Generate Image</TabsTrigger>
                            <TabsTrigger value="train">Train a Model</TabsTrigger>
                            <TabsTrigger value="packs">Packs</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="generate"><GenerateImage /></TabsContent>
                    <TabsContent value="train"><Train /></TabsContent>
                    <TabsContent value="packs"><Packs /></TabsContent>
                    <TabsContent value="camera"><Camera /></TabsContent>
                </Tabs>
            </div>
        </div>
    </div>
}