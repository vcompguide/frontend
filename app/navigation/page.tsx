"use client";

import type { LatLng } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { FaMap, FaRoute } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { uuidv7 } from "uuidv7";
import { ChatBox } from "./chat";
import { DashboardScreen } from "./DashboardScreen";
import { NotificationProvider } from "./NotificationContext";
import { type PlannerCard, RouteViewer } from "./RouteViewer";
import { type Plan, type SavedRoute, SavedRoutesScreen } from "./SavedRoutesScreen";
import { SearchBox, type SearchResultMarker } from "./SearchBox";
import { SettingsScreen } from "./SettingsScreen";
import { fetchAddress } from "./MapContextMenu"
const LeafletMap = dynamic(() => import("./map").then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1e1e1e] animate-pulse" />,
});

export default function Page() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [onLocationPicked, setOnLocationPicked] = useState<(p: LatLng) => void>(() => { });
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [plannerCards, setPlannerCards] = useState<PlannerCard[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<SearchResultMarker[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([
  ]);

  // Bidirectional sync: Update saved routes when viewer cards change
  const handleCardsChange = useCallback((cards: PlannerCard[]) => {
    setPlannerCards(cards);
    if (!activeRouteId) return;


    setSavedRoutes(prev => prev.map(route => {
      if (route.id === activeRouteId) {
        return {
          ...route,
          waypointsList: cards.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            location: c.position ? [c.position.lat, c.position.lng] as [number, number] : undefined,
            color: c.color,
            finished: c.finished,
            startTime: c.startTime,
            createdAt: c.createdAt,
          }) as Plan)
        };
      }
      return route;
    }));
  }, [activeRouteId]);

  const handleImportRoute = (route: SavedRoute) => {
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
        priority: "medium" as const,
        color: w.color,
        tags: [],
        finished: w.finished,
        startTime: w.startTime,
        createdAt: w.createdAt,
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
      createdAt: new Date().toLocaleDateString(),
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
      createdAt: Date.now(),
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
        createdAt: new Date().toLocaleDateString(),
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
        createdAt: new Date().toLocaleDateString(),
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
    const newCard: PlannerCard = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Plan ${plannerCards.length + 1}`,
      description: await fetchAddress(position.lat, position.lng),
      color: COLOR_OPTIONS[colorIndex],
      tags: [],
      position: position,
      createdAt: Date.now(),
    };
    const updatedCards = [...plannerCards, newCard];
    setPlannerCards(updatedCards);
    handleCardsChange(updatedCards);

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
        />

        <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-6 flex flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <FaMap className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold text-white">ViComp</h1>
          </div>

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
            <div className="size-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold">AM</div>
            <div className="text-left"><p className="text-sm font-medium text-white">Alex Morgan</p></div>
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
                  onAddPlanFromMap={handleAddPlanFromMap}
                  onUserLocationChange={setUserLocation}
                />
              </div>
              <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between pointer-events-none">
                <div className="pointer-events-auto">
                  <SearchBox
                    onLocationSelect={handleLocationSelect}
                    onSearchResultsChange={handleSearchResultsChange}
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
