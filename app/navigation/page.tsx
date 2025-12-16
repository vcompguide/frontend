"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect, useCallback, useRef } from "react";
import { LatLng } from "leaflet";
import MapWrapper from "./components/Map/MapWrapper";
import SearchPane from "./components/SideBar/SearchPane";
import PlaceDetail from "./components/SideBar/PlaceDetail";
import ContextMenu from "./components/Map/ContextMenu";
import RouteInfoPanel from "./components/Map/RouteInfoPanel";
import WaypointPanel from "./components/SideBar/WaypointPanel";
import type { Place, RoutePoint, RouteData } from "../types";

export default function Page() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedPlaceLocation, setSelectedPlaceLocation] = useState<LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuLatLng, setContextMenuLatLng] = useState<LatLng | null>(null);
  const [waypoints, setWaypoints] = useState<RoutePoint[]>([]);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = new LatLng(position.coords.latitude, position.coords.longitude);
          setUserLocation(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a location if geolocation fails
          setUserLocation(new LatLng(51.505, -0.09));
        }
      );
    }
  }, []);

  // Search with Nominatim API
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=10&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchValue.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(searchValue);
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, searchLocation]);

  const handleSelectPlace = useCallback((place: Place) => {
    setSelectedPlace(place);
    const location = new LatLng(parseFloat(place.lat), parseFloat(place.lon));
    setSelectedPlaceLocation(location);
  }, []);

  const handleContextMenu = useCallback((e: L.LeafletMouseEvent) => {
    setContextMenuPosition({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
    setContextMenuLatLng(e.latlng);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuPosition(null);
    setContextMenuLatLng(null);
  }, []);

  const handleDirectionsFrom = useCallback(() => {
    if (contextMenuLatLng && userLocation) {
      const newWaypoints: RoutePoint[] = [
        {
          id: "start",
          latlng: contextMenuLatLng,
          name: `Location (${contextMenuLatLng.lat.toFixed(4)}, ${contextMenuLatLng.lng.toFixed(4)})`,
        },
        {
          id: "end",
          latlng: userLocation,
          name: "Your Location",
        },
      ];
      setWaypoints(newWaypoints);
      setIsRoutingMode(true);
      setRouteData(null);
    }
    handleCloseContextMenu();
  }, [contextMenuLatLng, userLocation, handleCloseContextMenu]);

  const handleDirectionsTo = useCallback(() => {
    if (contextMenuLatLng && userLocation) {
      const newWaypoints: RoutePoint[] = [
        {
          id: "start",
          latlng: userLocation,
          name: "Your Location",
        },
        {
          id: "end",
          latlng: contextMenuLatLng,
          name: `Location (${contextMenuLatLng.lat.toFixed(4)}, ${contextMenuLatLng.lng.toFixed(4)})`,
        },
      ];
      setWaypoints(newWaypoints);
      setIsRoutingMode(true);
      setRouteData(null);
    }
    handleCloseContextMenu();
  }, [contextMenuLatLng, userLocation, handleCloseContextMenu]);

  const handleDirectionsToPlace = useCallback(() => {
    if (selectedPlace && userLocation) {
      const location = new LatLng(parseFloat(selectedPlace.lat), parseFloat(selectedPlace.lon));
      const newWaypoints: RoutePoint[] = [
        {
          id: "start",
          latlng: userLocation,
          name: "Your Location",
        },
        {
          id: "end",
          latlng: location,
          name: selectedPlace.display_name.split(",")[0],
        },
      ];
      setWaypoints(newWaypoints);
      setIsRoutingMode(true);
      setSelectedPlace(null);
      setSelectedPlaceLocation(null);
      setRouteData(null);
    }
  }, [selectedPlace, userLocation]);

  const handleCalculateRoute = useCallback(() => {
    if (waypoints.length >= 2 && waypoints.every(wp => wp.name)) {
      // Route will be automatically calculated by RoutingLayer component
      // No need to clear routeData - it will be updated when calculation completes
    }
  }, [waypoints]);

  const handleClearRoute = useCallback(() => {
    setWaypoints([]);
    setRouteData(null);
    setIsRoutingMode(false);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <MapWrapper
          userLocation={userLocation}
          onUserLocationUpdate={setUserLocation}
          onContextMenu={handleContextMenu}
          selectedPlaceLocation={selectedPlaceLocation}
          waypoints={waypoints}
          onRouteCalculated={setRouteData}
        />
      </div>

      {/* Search bar or Waypoint Panel */}
      {!isRoutingMode ? (
        <div className="absolute top-5 left-5 z-[1000] flex flex-row items-center gap-3 pointer-events-none">
          <div className="flex flex-row items-center bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 rounded-full p-1 pointer-events-auto hover:shadow-xl transition-all duration-300">
            <Input
              className="w-[280px] h-12 bg-transparent border-0 hover:border-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full pl-5 pr-2 text-gray-700 placeholder:text-gray-400 font-[Inter] transition-all"
              value={searchValue}
              placeholder="Search location: park, hotel, etc."
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button className="rounded-full size-10 bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center">
              <FaSearch className="fill-white w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <WaypointPanel
          waypoints={waypoints}
          onWaypointsChange={setWaypoints}
          onClose={handleClearRoute}
          onCalculateRoute={handleCalculateRoute}
        />
      )}

      {/* Search Results */}
      {!isRoutingMode && (
        <SearchPane
          results={searchResults}
          onSelectPlace={handleSelectPlace}
          isLoading={isSearching}
        />
      )}

      {/* Place Detail */}
      {!isRoutingMode && (
        <PlaceDetail
          place={selectedPlace}
          onClose={() => {
            setSelectedPlace(null);
            setSelectedPlaceLocation(null);
          }}
          onDirections={handleDirectionsToPlace}
        />
      )}

      {/* Context Menu */}
      <ContextMenu
        position={contextMenuPosition}
        latlng={contextMenuLatLng}
        onDirectionsFrom={handleDirectionsFrom}
        onDirectionsTo={handleDirectionsTo}
        onClose={handleCloseContextMenu}
      />

      {/* Route Info Panel */}
      {routeData && waypoints.length >= 2 && (
        <RouteInfoPanel
          routeData={routeData}
          waypoints={waypoints}
          onClose={handleClearRoute}
        />
      )}
    </div>
  );
}
