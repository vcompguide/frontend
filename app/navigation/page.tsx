"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import dynamic from "next/dynamic";
import { LuLocateFixed } from "react-icons/lu";
import { useState } from "react";

const LeafletMap = dynamic(() => import("./map"), {
  ssr: false,
});

export default function Page() {

  const [searchValue, setSearchValue] = useState<string>("")

  const [sidePaneVisibility, setSidePaneVisiblity] = useState<boolean>(false)
  return (
    <div className="relative flex flex-row w-full h-full overflow-hidden">
        <div className="w-full h-screen inset-0">
          <LeafletMap />
        </div>

      {/* Search bar */}
      <div className="absolute top-15 left-5 z-1000 flex flex-row items-center gap-5">

        <div className="flex flex-row items-center  bg-cream-50 border-2 hover:border-2   focus:border-2 rounded-2xl p-1">
          <Input className={`w-50 h-12 bg-cream-50 border-2 hover:border-2 focus:border-2 rounded-2xl hover:brightness-90 transition`}
          value={searchValue}
          placeholder="Location: park, hotel, etc."
          onChange={(e) => setSearchValue(e.target.value)}/>
          <Button className="rounded-full size-12 right-0 top-50/100 bg-transparent hover:bg-transparent font-[Inter]">
            <FaSearch className="fill-black" />
          </Button>
        </div>
        <div className = "relative bg-cream-100 border-gray-400 outline-2 outline-cream-500 size-12 rounded-full hover:brightness-75 brightness-100 transition ease-in-out">
          <LuLocateFixed className = "absolute -translate-1/2 top-50/100 left-50/100 size-6"/>
        </div>
      </div>
    </div>
  );
}
