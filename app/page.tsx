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

interface SmallPreview {
  imagePath: string
  targetSite: string
  text: string
}
function SmallPreview({imagePath, targetSite, text = ""}: SmallPreview) {

  
  let placeHolder = "";
  if (imagePath === "")
    placeHolder = "placeholder: there are no image"
  return <Link href = {targetSite} className="flex h-60 w-5/16 bg-yellow-950 rounded-2xl content-center justify-center items-center ">
    <div className = "flex content-center justify-center items-center rounded-2xl w-full h-full hover:text-white transition hover:backdrop-blur-sm bg-transparent hover:uppercase hover:text-2xl" >
    {text}

    </div>
    </Link>
}
export default function Page() {
  var mainPageElement =
    <div className="flex flex-row p-6  gap-10 flex-wrap">
      <div className="flex flex-row w-full m-10 bg-transparent rounded justify-center gap-10 px-5 h-30 items-center">
        <div className="flex-auto bg-transparent w-6/10 justify-start text-center items-center" >
          <div className="flex bg-transparent items-center justify-start p-4">
            Brand and group, maybe logo

          </div>
        </div>
        <div className="flex-auto bg-blue-100 rounded-full text-center h-1/2 w-1/10 hover:bg-blue-200 hover:text-gray-800 content-center">
          Features
        </div>
        <div className="flex-auto bg-blue-100 rounded-full text-center h-1/2 w-1/10 hover:bg-blue-200 hover:text-gray-800 content-center">
          Account
        </div>
      </div>
    <div className="h-60 w-full bg-amber-300 rounded-2xl"></div>
    <div className="flex w-full h-50 justify-between">

    <SmallPreview imagePath = "" targetSite = "" text = "Testing"/>
    <SmallPreview imagePath = "" targetSite = "" text = "Testing"/>
    <SmallPreview imagePath = "" targetSite = "" text = "Testing"/>

    </div>
    <div className="h-full mt-10 flex"> Lorem ipsum aabbc <br/> lkdsjfslkjdflsdljflkdsf </div>
    </div>
  return mainPageElement
}