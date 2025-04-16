"use client";

import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";
import { Button } from "@/components/ui/button"
import { Hero } from "@/components/home/Hero"

export default function Home(){
  return (
    <div>
        <Hero /> 
    </div>
    
  )
}

