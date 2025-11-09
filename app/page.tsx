"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
interface Posts {
  id: number,
  title: string
  content: string
};


async function fetchMockData() {
  // console.log("Called")
  try {

    let fetchResult = await fetch("http://localhost:5000/api/posts")
    if (!fetchResult.ok) {
      throw new Error("Failed to fetch");
    }
    const data = await fetchResult.json()
    console.log(data)
    return data as Posts[]
  }
  catch {
    return [] as Posts[]
  }

}

interface Preview {
  imagePath: string
  targetSite: string
  text: string
}
function Preview({ imagePath, targetSite, text = "" }: Preview) {


  let placeHolder = "";
  if (imagePath === "")
    placeHolder = "placeholder: there are no image"
  return <Link href={targetSite} className="flex h-full w-full bg-transparent rounded-2xl content-center justify-center items-center relative">
    <img src = {imagePath} alt = "" className="w-full h-full object-cover bg-harvestgold-200 rounded-2xl outline-transparent"/>
    <div className="flex content-center justify-center items-center w-full h-full hover:text-white transition hover:backdrop-blur-sm bg-transparent text-2xl hover:text-2xl absolute inset-0 font-[Inter] rounded-2xl outline-transparent" >
      {text}

    </div>
  </Link>
}
export default function Page() {
  var mainPageElement =
    <div className="flex flex-row flex-wrap items-center justify-center bg-cream-100">
      <div className="flex flex-row w-full m-5 mb-20 bg-transparent rounded justify-center gap-10 px-5 h-30 items-center">
        <div className="flex-auto bg-transparent w-3/10 justify-start text-center items-center" >
          <div className="flex bg-transparent items-center justify-start p-4 font-[Inter]">
            Homepage

          </div>
        </div>
        <div className="flex-auto bg-transparent w-3/10 justify-start text-center items-center" >
          <div className="flex bg-transparent items-center justify-start p-4 font-[Inter]">
            VCOMPGUIDE

          </div>
        </div>
        <div className="flex-auto font-[Inter] bg-cerulean-100 rounded-full text-center h-1/2 w-1/10 hover:bg-cerulean-200 hover:text-gray-800 content-center transition text-oxford-900">
          Features
        </div>
        <div className="flex-auto font-[Inter] bg-cerulean-100 rounded-full text-center h-1/2 w-1/10 hover:bg-cerulean-200 hover:text-gray-800 content-center transition text-oxford-900">
          Account
        </div>
      </div>
      <div className=" flex flex-col gap-10 w-3/5 items-center justify-center">

        <div className="flex flex-row h-60 w-full bg-harvestgold-200 rounded-2xl">
          <Preview imagePath="" targetSite="navigation" text="Navigation"/>
        </div>
        <div className="flex flex-row w-full h-60 justify-between p-4 gap-10">

          <Preview imagePath="" targetSite="" text="Placeholder"/>
          <Preview imagePath="" targetSite="" text="Placeholder"/>
          <Preview imagePath="" targetSite="" text="Placeholder"/>

        </div>
      </div>
    </div>
  return mainPageElement
}