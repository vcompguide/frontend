"use client";

import { Sdk, RouteRequestDtoModeEnum } from "@/src/backend/RESTful/BackendRESTfulSDK";
import { LatLng } from "leaflet";
import type { LatLng as LatLngType } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { FaMap, FaRoute } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { uuidv7 } from "uuidv7";
import { useRouter } from "next/navigation";
import { ChatBox } from "./chat";
import { DashboardScreen } from "./DashboardScreen";
import { FilterBox, type POIResult } from "./FilterBox";
import { NotificationProvider } from "./NotificationContext";
import { type PlannerCard, RouteViewer } from "./RouteViewer";
import { type Plan, type SavedRoute, SavedRoutesScreen } from "./SavedRoutesScreen";
import { SearchBox, type SearchResultMarker } from "./SearchBox";
import { SettingsScreen } from "./SettingsScreen";
import { fetchAddress } from "./MapContextMenu";
import { AuthProvider, useAuth } from "./AuthContext";
import { AuthScreen } from "./AuthScreen";
import Link from "next/link";
const LeafletMap = dynamic(() => import("./map").then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1e1e1e] animate-pulse" />,
});

function NavigationContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [onLocationPicked, setOnLocationPicked] = useState<(p: LatLng) => void>(() => { });
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [plannerCards, setPlannerCards] = useState<PlannerCard[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<SearchResultMarker[]>([]);
  const [pois, setPois] = useState<POIResult[]>([]);
  const [pathPoints, setPathPoints] = useState<LatLng[]>([]);
  const [routeDistance, setRouteDistance] = useState<string>("0 km");
  const [routeDuration, setRouteDuration] = useState<string>("0 min");
  const [segmentDistances, setSegmentDistances] = useState<{ [key: string]: number }>({}); // Map of "fromId-toId" -> distance in meters
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([
  ]);

  const calculatePathFromCards = useCallback(async (cards: PlannerCard[]): Promise<{ waypoints: LatLngType[], distance: string, duration: string }> => {
    // 1. Filter and format the data
    const cardsWithPositions = cards.filter(card => card.position);
    const formattedPositions = cardsWithPositions.map(card => ({
      lat: card.position!.lat,
      lon: card.position!.lng
    }));

    // 2. Guard clause: Don't fetch if there aren't enough points
    if (formattedPositions.length < 2) return { waypoints: [], distance: "0 km", duration: "0 min" };
    
    try {
      const api = new Sdk({
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:9000",
        securityWorker: async () => ({
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY || "taylorswefts"}`,
          },
        }),
      });

      const response = await api.routing.routingControllerGetRoute({
        waypoints: formattedPositions,
        mode: RouteRequestDtoModeEnum.Driving,
      });

      // Extract route data
      const routeData = response.data;

      // 5. Extract and convert coordinates from API response
      // API returns coordinates as [lng, lat] in geometry.coordinates
      // We need to convert to Leaflet LatLng objects (lat, lng order)
      if (!routeData.success || !routeData.data?.geometry) {
        console.error("Invalid route data structure:", routeData);
        return { waypoints: [], distance: "0 km", duration: "0 min" };
      }

      const coordinates: number[][] = (routeData.data.geometry as any).coordinates || [];
      const waypoints: LatLngType[] = coordinates.map((coord: number[]) => {
        const [lng, lat] = coord;
        return new LatLng(lat, lng);
      });

      // Update total distance and duration
      const distanceKm = (routeData.data.distance / 1000).toFixed(1);
      const durationMin = Math.round(routeData.data.duration / 60);
      const distanceStr = `${distanceKm} km`;
      const durationStr = `${durationMin} min`;
      setRouteDistance(distanceStr);
      setRouteDuration(durationStr);

      // Calculate segment distances between consecutive waypoints
      if ((routeData.data as any).legs && Array.isArray((routeData.data as any).legs)) {
        const segments: { [key: string]: number } = {};
        (routeData.data as any).legs.forEach((leg: any, index: number) => {
          if (index < cardsWithPositions.length - 1) {
            const fromId = cardsWithPositions[index].id;
            const toId = cardsWithPositions[index + 1].id;
            segments[`${fromId}-${toId}`] = leg.distance; // distance in meters
          }
        });
        setSegmentDistances(segments);
      }

      console.log(`Route calculated: ${waypoints.length} points, ${distanceKm}km, ${durationMin}min`);
      return { waypoints, distance: distanceStr, duration: durationStr };

    } catch (error) {
      console.error("Failed to calculate path:", error);
      return { waypoints: [], distance: "0 km", duration: "0 min" }; // Return empty path on failure
    }
  }, []);

  const handleCardsChange = useCallback(async (cards: PlannerCard[]) => {
    setPlannerCards(cards);

    const result = await calculatePathFromCards(cards);
    setPathPoints(result.waypoints);

    if (!activeRouteId) return;
    setSavedRoutes(prev => prev.map(route => {
      if (route.id === activeRouteId) {
        return {
          ...route,
          distance: result.distance,
          duration: result.duration,
          waypointsList: cards.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            location: c.position ? [c.position.lat, c.position.lng] as [number, number] : undefined,
            color: c.color,
            finished: c.finished,
          }) as Plan)
        };
      }
      return route;
    }));
  }, [activeRouteId, calculatePathFromCards]);

  const handleImportRoute = async (route: SavedRoute) => {
    // Load the new route without clearing first to prevent map reset
    const cards: PlannerCard[] = route.waypointsList.map((w) => {
      let position: LatLng | undefined;
      if (w.location && Array.isArray(w.location) && w.location.length === 2) {
        position = { lat: w.location[0], lng: w.location[1] } as LatLng;
      }
      return {
        id: w.id,
        title: w.title,
        description: w.description || "",
        position,
        color: w.color,
        tags: [],
        finished: w.finished,
      };
    });

    // Set map center: if route has waypoints, center on first waypoint; otherwise use default
    if (route.waypointsList.length > 0 && route.waypointsList[0].location) {
      const [lat, lng] = route.waypointsList[0].location;
      setMapCenter({ lat, lng });
    } else {
      setMapCenter({ lat: 10.7725, lng: 106.6980 }); // Default Paris center
    }

    setActiveRouteId(route.id);
    setPlannerCards(cards);
    
    // Calculate and load path for the imported route
    const result = await calculatePathFromCards(cards);
    setPathPoints(result.waypoints);
    
    setViewerOpen(true);
    setActiveTab("Map View");
  };

  const COLOR_OPTIONS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ];


  const handleCreateNewRoute = () => {
    // Create a new empty route in saved routes
    // Cycle through colors based on the current number of routes
    const colorIndex = savedRoutes.length % COLOR_OPTIONS.length;
    const newRoute: SavedRoute = {
      id: uuidv7(),
      name: `New Route ${savedRoutes.length + 1}`,
      distance: "0 km",
      duration: "0 min",
      waypointsList: [],
      color: COLOR_OPTIONS[colorIndex],
    };

    // Add to saved routes
    const updatedRoutes = [...savedRoutes, newRoute];
    setSavedRoutes(updatedRoutes);

    // Import it into route viewer
    handleImportRoute(newRoute);
  };

  const handlePickLocation = useCallback((callback: (p: LatLng) => void) => {
    setIsPickingLocation(true);
    setOnLocationPicked(() => (p: LatLng) => {
      callback(p);
      setIsPickingLocation(false);
    });
  }, []);

  const handleCreateNewPlan = () => {
    // Cycle through colors based on the current number of plans
    const colorIndex = plannerCards.length % COLOR_OPTIONS.length;
    const newCard: PlannerCard = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Plan ${plannerCards.length + 1}`,
      description: "A new card",
      color: COLOR_OPTIONS[colorIndex],
      tags: [],
    };
    if (!activeRouteId) {
      const colorIndex = savedRoutes.length % COLOR_OPTIONS.length;
      const newRoute: SavedRoute = {
        id: uuidv7(),
        name: `New Route ${savedRoutes.length + 1}`,
        distance: "0 km",
        duration: "0 min",
        waypointsList: [],
        color: COLOR_OPTIONS[colorIndex],
      }

      const updatedRoutes = [...savedRoutes, newRoute];
      setSavedRoutes(updatedRoutes);
      setActiveRouteId(newRoute.id);
    }
    const updatedCards = [...plannerCards, newCard];

    setPlannerCards(updatedCards);
    handleCardsChange(updatedCards);
  };

  const handleAddPlanFromMap = useCallback(async (position: LatLng) => {
    if (!activeRouteId) {
      const colorIndex = savedRoutes.length % COLOR_OPTIONS.length;
      const newRoute: SavedRoute = {
        id: uuidv7(),
        name: `New Route ${savedRoutes.length + 1}`,
        distance: "0 km",
        duration: "0 min",
        waypointsList: [],
        color: COLOR_OPTIONS[colorIndex],
      };

      const updatedRoutes = [...savedRoutes, newRoute];
      setSavedRoutes(updatedRoutes);
      setActiveRouteId(newRoute.id);
      if (!viewerOpen) {
        setViewerOpen(true);
      }
      if (activeTab != "Map View") {
        setActiveTab("Map View");
        setMapCenter({ lat: position.lat, lng: position.lng });
      }
    }

    const colorIndex = plannerCards.length % COLOR_OPTIONS.length;
    const cardId = uuidv7();
    const newCard: PlannerCard = {
      id: cardId,
      title: `Plan ${plannerCards.length + 1}`,
      description: "Loading address...",
      color: COLOR_OPTIONS[colorIndex],
      tags: [],
      position: position,
    };

    // Add card immediately without waiting for address
    const updatedCards = [...plannerCards, newCard];
    setPlannerCards(updatedCards);
    handleCardsChange(updatedCards);

    // Fetch address asynchronously and update the card
    fetchAddress(position.lat, position.lng).then(address => {
      setPlannerCards(prevCards => {
        const cardIndex = prevCards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return prevCards;

        const updated = [...prevCards];
        updated[cardIndex] = { ...updated[cardIndex], description: address };
        handleCardsChange(updated);
        return updated;
      });
    });

    // Open route viewer if closed and switch to map view
    if (!viewerOpen) {
      setViewerOpen(true);
    }
  }, [plannerCards, viewerOpen, handleCardsChange, activeRouteId, savedRoutes]);

  const handleAddUserLocationPlan = useCallback(() => {
    if (!userLocation) return;
    handleAddPlanFromMap(userLocation);
  }, [userLocation, handleAddPlanFromMap]);

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; name: string }) => {
    // Center map on selected location
    setMapCenter({ lat: location.lat, lng: location.lng });
    // Switch to map view if not already there
    if (activeTab !== "Map View") {
      setActiveTab("Map View");
    }
  }, [activeTab]);

  const handleSearchResultsChange = useCallback((results: SearchResultMarker[]) => {
    console.log('Page received search results:', results);
    setSearchResults(results);
  }, []);

  const handlePOIsFound = useCallback((results: POIResult[]) => {
    console.log('Page received POI results:', results);
    setPois(results);
  }, []);

  const handleClearPath = useCallback(() => {
    setPathPoints([]);
    setRouteDistance("0 km");
    setRouteDuration("0 min");
    setSegmentDistances({});
  }, []);

  const activeRoute = savedRoutes.find(r => r.id === activeRouteId);

  return (
    <NotificationProvider>
      <div
        className="relative flex flex-row w-full h-screen bg-[#0f1110] overflow-hidden font-sans text-gray-200"
        onContextMenu={(e) => { e.preventDefault(); }}
        role="application"
      >
        <RouteViewer
          isOpen={viewerOpen}
          onToggle={() => setViewerOpen(!viewerOpen)}
          onPickLocation={handlePickLocation}
          onCardsChange={handleCardsChange}
          initialCards={plannerCards}
          activeRouteName={activeRoute?.name}
          onCreateNewRoute={handleCreateNewRoute}
          onCreateNewPlan={handleCreateNewPlan}
          userLocation={userLocation}
          onAddUserLocationPlan={handleAddUserLocationPlan}
          segmentDistances={segmentDistances}
          onClearPath={handleClearPath}
        />

        <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-6 flex flex-col">
          <Link 
            href="/"
            className="mb-8 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <FaMap className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold text-white">ViCons</h1>
          </Link>

          <nav className="flex flex-col gap-2 flex-1">
            <SidebarItem icon={<MdDashboard />} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
            <SidebarItem icon={<FaMap />} label="Map View" active={activeTab === "Map View"} onClick={() => setActiveTab("Map View")} />
            <SidebarItem icon={<FaRoute />} label="Saved Routes" active={activeTab === "Saved"} onClick={() => setActiveTab("Saved")} />

            {activeRoute && (
              <div className="mt-8 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Active Route</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRouteId(null);
                      setPlannerCards([]);
                      setPathPoints([]);
                      setRouteDistance("0 km");
                      setRouteDuration("0 min");
                      setSegmentDistances({});
                    }}
                    className="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition"
                    title="Unload current route"
                  >
                    Unload
                  </button>
                </div>
                <p className="text-sm text-white font-medium truncate">{activeRoute.name}</p>
              </div>
            )}
          </nav>

          <button type="button" className="mt-auto pt-6 border-t border-gray-800 flex items-center gap-3" onClick={() => setActiveTab("Settings")}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="size-10 rounded-full object-cover" />
            ) : (
              <div className="size-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-white truncate max-w-[120px]">{user?.name || "User"}</p>
            </div>
          </button>
        </aside>

        <main className="relative flex-1 h-full overflow-hidden">
          {activeTab === "Dashboard" && <DashboardScreen planCards={plannerCards} savedRoutes={savedRoutes} onNavigate={setActiveTab} />}
          {activeTab === "Saved" && <SavedRoutesScreen initialRoutes={savedRoutes} onRoutesChange={setSavedRoutes} onImportToPlanner={handleImportRoute} />}
          {activeTab === "Settings" && <SettingsScreen />}

          {activeTab === "Map View" && (
            <>
              <div className="absolute inset-0 z-0">
                <LeafletMap
                  isPickingCardLocation={isPickingLocation}
                  onCardLocationPicked={onLocationPicked}
                  planCards={plannerCards}
                  centerLocation={mapCenter}
                  searchResults={searchResults}
                  pois={pois}
                  onAddPlanFromMap={handleAddPlanFromMap}
                  onUserLocationChange={setUserLocation}
                  pathPoints={pathPoints}
                />
              </div>
              <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between pointer-events-none">
                <div className="pointer-events-auto">
                  <SearchBox
                    onLocationSelect={handleLocationSelect}
                    onSearchResultsChange={handleSearchResultsChange}
                  />
                </div>
                <div className="pointer-events-auto">
                  <FilterBox
                    userLocation={userLocation}
                    plannerCards={plannerCards}
                    onPOIsFound={handlePOIsFound}
                  />
                </div>
              </div>
              <ChatBox />
            </>
          )}
        </main>
      </div>
    </NotificationProvider>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${active ? "bg-emerald-500/10 text-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
      {icon} <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

function AuthWrapper() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#0f1110] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-500 mb-4 animate-pulse">
            <FaMap className="text-white" size={32} />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <NavigationContent />;
}
