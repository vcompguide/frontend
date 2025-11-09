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

  const style = { '--bg-image': `url('${imagePath}')`};
  let placeHolder = "";
  if (imagePath === "")
    placeHolder = "placeholder: there are no image"
  return <Link href={targetSite} className="flex h-full w-full bg-transparent rounded-2xl content-center justify-center items-center relative overflow-hidden bg-contain bg-no-repeat" style={{backgroundImage: `url(${imagePath})`}}>
    <div className={`flex content-center justify-center items-center w-full h-full hover:text-white transition hover:backdrop-blur-sm text-2xl hover:text-2xl absolute inset-0 font-[Inter] text-wrap  opacity-50 bg-transparent`} >
      {text}

    </div>
  </Link>
}

export default function Page() {
  var mainPageElement =
    <div className="flex flex-row flex-wrap items-center justify-center bg-cream-100 relative">
      <div className="absolute top-0 right-0 flex flex-row m-5 mb-20 bg-transparent rounded justify-center gap-10 px-5 h-30 items-center z-10 w-[1/2]"> 
        {/* The top bar */}
        <Button className="flex-auto font-[Inter] bg-cerulean-100  text-center hover:bg-cerulean-50 hover:text-gray-800 content-center transition text-oxford-900">
          Features
        </Button>
        <Button className="flex-auto font-[Inter] bg-cerulean-100 text-center  hover:bg-cerulean-50 hover:text-gray-800 content-center transition text-oxford-900">
          Account
        </Button>
      </div>
      <div className="flex flex-col w-full h-[100vh] bg-linear-to-b from-blue-100 from-75% to-cream-100 to-100%">
        {/* The top front */}
          <div className="h-screen content-center text-center gap">
            A demonstration of how five vibe coders can create a webpage in just 2 months
          <br/>
            (We are finding bugs in the UI. I don't know what I am cooking)
            <br/>
          <div className="flex m-10 gap-5 content-center text-center bg-transparent justify-center ">

            <Button className="">
              See our product
            </Button>

            <Button> Learn more</Button>
          </div>

          </div>
      </div>
      <div className=" flex flex-col gap-10 w-3/5 items-center justify-center h-[100vh]">

        <div className="flex flex-row h-60 w-full  rounded-2xl">
          <Preview imagePath="" targetSite="navigation" text="Navigation"/>
        </div>
        <div className="flex flex-row w-full h-60 justify-between p-4 gap-10">

          <Preview imagePath="sample.png" targetSite="" text="IDK"/>
          <Preview imagePath="" targetSite="" text="IDK"/>
          <Preview imagePath="" targetSite="" text="IDK"/>

        </div>
      </div>
    </div>
  return mainPageElement
}