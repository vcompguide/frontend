"use client";

import { Place } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LuMapPin, LuClock } from "react-icons/lu";

interface SearchPaneProps {
  results: Place[];
  onSelectPlace: (place: Place) => void;
  isLoading?: boolean;
}

export default function SearchPane({ results, onSelectPlace, isLoading }: SearchPaneProps) {
  if (isLoading) {
    return (
      <div className="absolute left-5 top-20 z-[1000] w-96 bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute left-5 top-20 z-[1000] w-96 bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-white/50">
        <h3 className="font-semibold text-gray-800 text-lg">Search Results</h3>
        <p className="text-sm text-gray-500 mt-1">{results.length} places found</p>
      </div>
      
      <ScrollArea className="h-[500px]">
        <div className="p-2">
          {results.map((place) => (
            <button
              key={place.place_id}
              onClick={() => onSelectPlace(place)}
              className="w-full text-left p-4 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 mb-2 group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                  <LuMapPin className="size-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {place.display_name.split(",")[0]}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {place.display_name}
                  </p>
                  {place.type && (
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {place.type}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
