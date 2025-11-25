"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./map"), {
  ssr: false,
});

export default function Page() {
  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-10 left-10 z-10">
        assl;kfj
      </div>
      <div className="w-full h-screen">
        <LeafletMap />
      </div>
    </div>
  );
}
