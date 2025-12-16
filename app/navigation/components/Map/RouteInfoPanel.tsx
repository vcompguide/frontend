"use client";

import { RouteData } from "@/types";
import { LuX, LuNavigation } from "react-icons/lu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RouteInfoPanelProps {
  routeData: RouteData | null;
  waypoints: Array<{ name: string }>;
  onClose: () => void;
}

export default function RouteInfoPanel({ routeData, waypoints, onClose }: RouteInfoPanelProps) {
  if (!routeData) return null;

  const distanceKm = (routeData.distance / 1000).toFixed(2);
  const durationMin = Math.round(routeData.duration / 60);
  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="absolute right-6 top-6 z-[1000] w-80 bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-2xl overflow-hidden animate-pop-in">
      {/* Header */}
      <div className="relative px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <LuX className="size-4 text-white" />
        </button>
        <div className="flex items-center gap-3 pr-8">
          <div className="bg-white/20 p-2.5 rounded-full">
            <LuNavigation className="size-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">Route Details</h3>
            <p className="text-blue-100 text-sm mt-0.5">{distanceKm} km • {durationText}</p>
          </div>
        </div>
      </div>

      {/* Route Summary with all waypoints */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 mt-1">
            {waypoints.map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`size-3 rounded-full border-2 border-white shadow ${
                    index === 0
                      ? "bg-green-500"
                      : index === waypoints.length - 1
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                ></div>
                {index < waypoints.length - 1 && <div className="w-0.5 h-8 bg-gray-300"></div>}
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            {waypoints.map((waypoint, index) => (
              <div key={index}>
                <p className="text-xs text-gray-500 mb-1">
                  {index === 0
                    ? "From"
                    : index === waypoints.length - 1
                    ? "To"
                    : `Stop ${index}`}
                </p>
                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                  {waypoint.name}
                </p>
                {routeData.legs && routeData.legs[index] && index < waypoints.length - 1 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {(routeData.legs[index].distance / 1000).toFixed(1)} km •{" "}
                    {Math.round(routeData.legs[index].duration / 60)} min
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Turn-by-turn directions */}
      {routeData.instructions && routeData.instructions.length > 0 && (
        <>
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-800 text-sm">Turn-by-turn Directions</h4>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-3">
              {routeData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3 mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="mt-0.5 bg-blue-100 text-blue-600 rounded-full size-6 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{instruction}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
