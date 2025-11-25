"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./map"), {
  ssr: false,
});

export default function Page() {
  return (
    <div className="relative w-full h-screen">
      <div>

        <div className="w-full h-screen ">
          <LeafletMap />
        </div>
      </div>
      <div className="absolute top-10 left-10 z-1000 flex flex-row items-center  bg-cream-50 border-2 hover:border-2   focus:border-2 rounded-full p-1">
        <Input className="w-50 h-12 bg-cream-50 border-2 hover:border-2   focus:border-2 rounded-full"/>
        <Button className="rounded-full size-8 right-0 top-50/100 bg-transparent hover:bg-transparent">
        <FaSearch className = "fill-black"/>
        </Button>
      </div>
    </div>
  );
}
