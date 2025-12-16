"use client";

import { LatLng } from "leaflet";
import { LuNavigation } from "react-icons/lu";

interface ContextMenuProps {
  position: { x: number; y: number } | null;
  latlng: LatLng | null;
  onDirectionsFrom: () => void;
  onDirectionsTo: () => void;
  onClose: () => void;
}

export default function ContextMenu({
  position,
  latlng,
  onDirectionsFrom,
  onDirectionsTo,
  onClose,
}: ContextMenuProps) {
  if (!position || !latlng) return null;

  return (
    <>
      {/* Invisible overlay to close menu when clicking outside */}
      <div
        className="fixed inset-0 z-[1001]"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div
        className="fixed z-[1002] bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-lg overflow-hidden min-w-[200px] animate-pop-in"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="py-1">
          <button
            onClick={onDirectionsFrom}
            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 group"
          >
            <div className="bg-blue-100 p-1.5 rounded group-hover:bg-blue-200 transition-colors">
              <LuNavigation className="size-4 text-blue-600 rotate-180" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
              Directions from here
            </span>
          </button>
          
          <div className="border-t border-gray-200" />
          
          <button
            onClick={onDirectionsTo}
            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 group"
          >
            <div className="bg-green-100 p-1.5 rounded group-hover:bg-green-200 transition-colors">
              <LuNavigation className="size-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
              Directions to here
            </span>
          </button>
        </div>
        
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
          </p>
        </div>
      </div>
    </>
  );
}
