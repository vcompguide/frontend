"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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

export default function Page() {
  var mainPageElement =
    <div className="grid grid-flow-col grid-rows-12 grid-cols-12 h-screen">
      <header className="row-span-1 row-start-1 col-span-12 col-start-1 bg-transparent min-h-0 min-w-0 grid grid-flow-col grid-cols-6 p-4 gap-4">
        <Button className="flex-initial h-full bg-gray-400 rounded-2xl hover:bg-gray-500 text-2xl text-black transition"></Button>
        <Button className="flex-initial h-full bg-gray-400 rounded-2xl hover:bg-gray-500 text-2xl text-black transition"></Button>
        <Button className="flex-initial h-full bg-gray-400 rounded-2xl hover:bg-gray-500 text-2xl text-black transition"></Button>
        <Button className="flex-initial h-full bg-gray-400 rounded-2xl hover:bg-gray-500 text-2xl text-black transition"></Button>
        <Button className="flex-initial h-full bg-gray-400 rounded-2xl hover:bg-gray-500 text-2xl text-black transition"></Button>
        <Button className="flex-initial h-full bg-gray-400 rounded-2xl hover:bg-gray-500 text-2xl text-black transition"></Button>
      </header>
      <div className="m-4 rounded-2xl bg-amber-100 row-span-11 row-start-2 col-span-12 col-start-1">

      </div>
    </div>
  return mainPageElement
}