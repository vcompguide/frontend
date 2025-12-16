"use client";

import { RoutePoint, Place } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuMapPin, LuX, LuGripVertical, LuPlus, LuNavigation2 } from "react-icons/lu";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WaypointPanelProps {
  waypoints: RoutePoint[];
  onWaypointsChange: (waypoints: RoutePoint[]) => void;
  onClose: () => void;
  onCalculateRoute: () => void;
}

export default function WaypointPanel({
  waypoints,
  onWaypointsChange,
  onClose,
  onCalculateRoute,
}: WaypointPanelProps) {
  const [searchValues, setSearchValues] = useState<string[]>(
    waypoints.map((wp) => wp.name)
  );
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update search values when waypoints change externally
  useEffect(() => {
    setSearchValues(waypoints.map((wp) => wp.name));
  }, [waypoints]);

  const handleAddWaypoint = () => {
    const newWaypoint: RoutePoint = {
      id: `waypoint-${Date.now()}`,
      latlng: waypoints[waypoints.length - 1]?.latlng || waypoints[0]?.latlng,
      name: "",
    };
    onWaypointsChange([...waypoints, newWaypoint]);
    setSearchValues([...searchValues, ""]);
  };

  const handleRemoveWaypoint = (index: number) => {
    if (waypoints.length <= 2) return; // Keep at least start and end
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    const newSearchValues = searchValues.filter((_, i) => i !== index);
    onWaypointsChange(newWaypoints);
    setSearchValues(newSearchValues);
    if (activeInputIndex === index) {
      setActiveInputIndex(null);
      setSearchResults([]);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string, index: number) => {
    const newSearchValues = [...searchValues];
    newSearchValues[index] = value;
    setSearchValues(newSearchValues);
    setActiveInputIndex(index);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    if (value.trim().length > 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(value);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectPlace = (place: Place, index: number) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = {
      ...newWaypoints[index],
      latlng: new (window as any).L.LatLng(parseFloat(place.lat), parseFloat(place.lon)),
      name: place.display_name.split(",")[0],
    };
    
    const newSearchValues = [...searchValues];
    newSearchValues[index] = place.display_name.split(",")[0];
    
    onWaypointsChange(newWaypoints);
    setSearchValues(newSearchValues);
    setSearchResults([]);
    setActiveInputIndex(null);
  };

  const handleSwapPoints = () => {
    if (waypoints.length >= 2) {
      const newWaypoints = [...waypoints];
      const temp = newWaypoints[0];
      newWaypoints[0] = newWaypoints[waypoints.length - 1];
      newWaypoints[waypoints.length - 1] = temp;
      
      const newSearchValues = [...searchValues];
      const tempValue = newSearchValues[0];
      newSearchValues[0] = newSearchValues[searchValues.length - 1];
      newSearchValues[searchValues.length - 1] = tempValue;
      
      onWaypointsChange(newWaypoints);
      setSearchValues(newSearchValues);
    }
  };

  return (
    <div className="absolute left-5 top-5 z-[1000] w-[420px] bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between">
        <h3 className="font-semibold text-white text-lg">Plan Your Route</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <LuX className="size-4 text-white" />
        </button>
      </div>

      {/* Waypoints List */}
      <div className="p-4">
        <div className="space-y-3">
          {waypoints.map((waypoint, index) => (
            <div key={waypoint.id} className="flex items-center gap-2">
              {/* Drag Handle */}
              <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                <LuGripVertical className="size-4" />
              </div>

              {/* Icon */}
              <div
                className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                  index === 0
                    ? "bg-green-100"
                    : index === waypoints.length - 1
                    ? "bg-red-100"
                    : "bg-blue-100"
                }`}
              >
                {index === 0 ? (
                  <span className="text-green-600 font-bold text-sm">A</span>
                ) : index === waypoints.length - 1 ? (
                  <span className="text-red-600 font-bold text-sm">B</span>
                ) : (
                  <LuMapPin className="size-4 text-blue-600" />
                )}
              </div>

              {/* Input */}
              <Input
                value={searchValues[index] || waypoint.name}
                onChange={(e) => handleSearchChange(e.target.value, index)}
                placeholder={
                  index === 0
                    ? "Your location"
                    : index === waypoints.length - 1
                    ? "Choose destination"
                    : "Add stop"
                }
                className="flex-1 h-10 bg-white border-gray-300 focus-visible:ring-blue-500"
              />

              {/* Remove Button */}
              {waypoints.length > 2 && index !== 0 && index !== waypoints.length - 1 && (
                <button
                  onClick={() => handleRemoveWaypoint(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <LuX className="size-4" />
                </button>
              )}

              {/* Swap Button (only show between first and last) */}
              {index === 0 && waypoints.length === 2 && (
                <button
                  onClick={handleSwapPoints}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="Swap start and end"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Search Results Dropdown */}
        {activeInputIndex !== null && searchResults.length > 0 && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
            <ScrollArea className="max-h-64">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Searching...
                </div>
              ) : (
                <div className="py-1">
                  {searchResults.map((place) => (
                    <button
                      key={place.place_id}
                      onClick={() => handleSelectPlace(place, activeInputIndex)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-gray-100 p-1.5 rounded-full flex-shrink-0">
                          <LuMapPin className="size-3.5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm line-clamp-1">
                            {place.display_name.split(",")[0]}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {place.display_name.split(",").slice(1).join(",")}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Add Destination Button */}
        <button
          onClick={handleAddWaypoint}
          className="w-full mt-3 py-2.5 px-4 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium text-sm border border-dashed border-blue-300 hover:border-blue-400"
        >
          <LuPlus className="size-4" />
          Add destination
        </button>

        {/* Calculate Route Button */}
        <Button
          onClick={onCalculateRoute}
          disabled={waypoints.length < 2 || waypoints.some(wp => !wp.name)}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuNavigation2 className="size-4" />
          Calculate Route
        </Button>
      </div>
    </div>
  );
}
