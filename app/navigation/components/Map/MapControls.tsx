"use client";

import { useMap } from "react-leaflet";
import { LuPlus, LuMinus } from "react-icons/lu";
import { LuLocateFixed } from "react-icons/lu";

interface MapControlsProps {
  onLocateUser: () => void;
}

export default function MapControls({ onLocateUser }: MapControlsProps) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        className="bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 size-11 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center group"
        title="Zoom in"
      >
        <LuPlus className="size-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        className="bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 size-11 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center group"
        title="Zoom out"
      >
        <LuMinus className="size-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
      </button>

      {/* Locate User Button */}
      <button
        onClick={onLocateUser}
        className="bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 size-11 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center group"
        title="Show my location"
      >
        <LuLocateFixed className="size-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
      </button>
    </div>
  );
}
