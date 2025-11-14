"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./map"), {
  ssr: false,
});

export default function Page() {
  return (
    <div className="w-full h-screen">
      <LeafletMap />
    </div>
  );
}
