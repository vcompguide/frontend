"use client";

import { useState } from "react";
import { FaClock, FaDownload, FaEdit, FaRoute, FaTimes, FaTrash } from "react-icons/fa";

export interface Plan {
  id: string;
  title: string;
  description: string;
  location?: [number, number];
  color: string;
  finished?: boolean;
  startTime?: number; // Timestamp for planned start time
  createdAt?: number; // Internal creation time
}
export interface SavedRoute {
  id: string;
  name: string;
  distance: string;
  duration: string;
  waypointsList: Plan[];
  color: string;
  createdAt: string;
}

interface SavedRoutesScreenProps {
  initialRoutes?: SavedRoute[];
  onRoutesChange?: (routes: SavedRoute[]) => void;
  onImportToPlanner?: (route: SavedRoute) => void;
}

export function SavedRoutesScreen({ initialRoutes = [], onRoutesChange, onImportToPlanner }: SavedRoutesScreenProps) {
  const [routes, setRoutes] = useState<SavedRoute[]>(initialRoutes);
  const [isCreating, setIsCreating] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const COLOR_OPTIONS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ];

  const createRoute = () => {
    // Cycle through colors based on the current number of routes
    const colorIndex = routes.length % COLOR_OPTIONS.length;
    const route: SavedRoute = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRouteName.trim() || `New Route ${routes.length + 1}`,
      distance: "0 km",
      duration: "0 min",
      waypointsList: [],
      color: COLOR_OPTIONS[colorIndex],
      createdAt: new Date().toLocaleDateString(),
    };
    const updated = [...routes, route];
    setRoutes(updated);
    onRoutesChange?.(updated);
    setIsCreating(false);
    setNewRouteName("");
  };

  const updateRoute = (id: string, updates: Partial<SavedRoute>) => {
    const updated = routes.map(r => r.id === id ? { ...r, ...updates } : r);
    setRoutes(updated);
    onRoutesChange?.(updated);
    // setEditingRouteId(null);
  };

  const stopEditingRoute = (event) => {
    if (event.key === 'Enter')
      setEditingRouteId(null);
  }

  return (
    <div className="w-full h-full bg-[#0f1110] p-8 overflow-auto">
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Saved Routes</h1>
          <button type="button" onClick={() => setIsCreating(true)} className="bg-emerald-500 px-6 py-2 rounded-lg text-white font-medium hover:brightness-90 transition">+ New Route</button>
        </div>

        <div className="space-y-4">
          {routes.map(route => (
            <div key={route.id} className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-4 rounded-full" style={{ backgroundColor: route.color }} />
                  <h3 className="text-lg font-bold text-white">{route.name}</h3>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><FaRoute /> {route.waypointsList.length} plans</span>
                  <span className="flex items-center gap-1"><FaClock /> {route.duration}</span>
                  <span>📏 {route.distance}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingRouteId(route.id)} className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 border border-blue-500/20 hover:brightness-150 transition"><FaEdit size={14} /> Edit</button>
                <button type="button" onClick={() => onImportToPlanner?.(route)} className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-2 border border-emerald-500/20 hover:brightness-150 transtion"><FaDownload /> Import</button>
                <button type="button" onClick={() => {
                  const updated = routes.filter(r => r.id !== route.id);
                  setRoutes(updated);
                  onRoutesChange?.(updated);
                }} className="text-red-500 p-2 hover:brightness-150"><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Route Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1e1e1e] p-6 rounded-2xl w-full max-w-sm">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold text-white">New Route</h2>
              <button type="button" onClick={() => setIsCreating(false)}><FaTimes /></button>
            </div>
            <input className="w-full bg-[#2a2a2a] p-3 rounded-lg text-white mb-6" placeholder="Route name (optional)" value={newRouteName} onChange={e => setNewRouteName(e.target.value)} onKeyDown = {(e) => {
              if (e.key === 'Enter') 
                createRoute();
            }} />
            <button type="button" onClick={createRoute} className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold">Create Route</button>
          </div>
        </div>
      )}

      {/* Edit Route Modal */}
      {editingRouteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1e1e1e] p-6 rounded-2xl w-full max-w-sm">
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Edit Route</h2>
              <button type="button" onClick={() => setEditingRouteId(null)}><FaTimes /></button>
            </div>

            {(() => {
              const route = routes.find(r => r.id === editingRouteId);
              if (!route) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="route-name" className="text-xs text-gray-400 mb-2 block">Route Name</label>
                    <input
                      className="w-full bg-[#2a2a2a] p-3 rounded-lg text-white text-sm"
                      value={route.name}
                      onChange={e => updateRoute(editingRouteId, { name: e.target.value })}
                      onKeyDown={e => stopEditingRoute(e)}
                    />
                  </div>

                  <div>
                    <label htmlFor="route-color" className="text-xs text-gray-400 mb-2 block">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_OPTIONS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateRoute(editingRouteId, { color })}
                          className={`h-8 rounded-lg transition ${route.color === color ? "ring-2 ring-white" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingRouteId(null)}
                    className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold mt-6"
                  >
                    Done
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
