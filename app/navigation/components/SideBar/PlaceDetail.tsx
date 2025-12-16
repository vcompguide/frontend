"use client";

import { Place } from "@/types";
import { Button } from "@/components/ui/button";
import { LuMapPin, LuNavigation, LuX } from "react-icons/lu";

interface PlaceDetailProps {
  place: Place | null;
  onClose: () => void;
  onDirections: () => void;
}

export default function PlaceDetail({ place, onClose, onDirections }: PlaceDetailProps) {
  if (!place) return null;

  const placeName = place.display_name.split(",")[0];
  const placeAddress = place.display_name.split(",").slice(1).join(",");

  return (
    <div className="absolute left-[26rem] top-20 z-[1000] w-80 bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-2xl overflow-hidden animate-pop-in">
      {/* Header */}
      <div className="relative px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <LuX className="size-4 text-white" />
        </button>
        <div className="flex items-start gap-3 pr-8">
          <div className="bg-white/20 p-2.5 rounded-full">
            <LuMapPin className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-lg line-clamp-2">
              {placeName}
            </h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{placeAddress}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Coordinates</h4>
          <div className="flex gap-4 text-sm text-gray-700">
            <span>Lat: {parseFloat(place.lat).toFixed(5)}</span>
            <span>Lon: {parseFloat(place.lon).toFixed(5)}</span>
          </div>
        </div>

        {place.type && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
              {place.type}
            </span>
          </div>
        )}

        {/* Directions Button */}
        <Button
          onClick={onDirections}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <LuNavigation className="size-4" />
          Directions
        </Button>
      </div>
    </div>
  );
}
