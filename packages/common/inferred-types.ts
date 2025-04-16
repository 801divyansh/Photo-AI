import {TrainModel,GenerateImage,GenerateImageFromPack} from "./types";
import {z} from "zod";

export type TrainModelInput = z.infer<typeof TrainModel>;
export type GenerateImageInput = z.infer<typeof GenerateImage>;
export type GenerateImageFromPackInput = z.infer<typeof GenerateImageFromPack>;