"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useCallback, useRef } from "react";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import MapControls from "./MapControls";
import RoutingLayer from "./RoutingLayer";
import { RouteData, RoutePoint } from "@/types";

L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// Custom icon cho vị trí người dùng
const userLocationIcon = L.divIcon({
  className: "custom-user-marker",
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      "></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface MainMapProps {
  userLocation: LatLng | null;
  onUserLocationUpdate: (location: LatLng) => void;
  onContextMenu: (e: L.LeafletMouseEvent) => void;
  selectedPlaceLocation: LatLng | null;
  waypoints: RoutePoint[];
  onRouteCalculated?: (route: RouteData) => void;
}

function MapEventHandler({
  onContextMenu,
  onMapClick,
}: {
  onContextMenu: (e: L.LeafletMouseEvent) => void;
  onMapClick: () => void;
}) {
  useMapEvents({
    contextmenu: onContextMenu,
    click: onMapClick,
  });
  return null;
}

function LocationControl({
  onUserLocationUpdate,
}: {
  onUserLocationUpdate: (location: LatLng) => void;
}) {
  const map = useMap();

  const handleLocate = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = new LatLng(position.coords.latitude, position.coords.longitude);
          onUserLocationUpdate(newLocation);
          map.flyTo(newLocation, 15, {
            duration: 1.5,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, [map, onUserLocationUpdate]);

  return <MapControls onLocateUser={handleLocate} />;
}

export default function MainMap({
  userLocation,
  onUserLocationUpdate,
  onContextMenu,
  selectedPlaceLocation,
  waypoints,
  onRouteCalculated,
}: MainMapProps) {

  return (
    <MapContainer
      center={userLocation || [51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      <MapEventHandler 
        onContextMenu={onContextMenu} 
        onMapClick={() => {}} 
      />

      {/* User location marker */}
      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>
            <div style={{ padding: "4px", fontFamily: "Inter, sans-serif" }}>
              <strong>📍 Your Location</strong>
              <br />
              Lat: {userLocation.lat.toFixed(5)}
              <br />
              Lng: {userLocation.lng.toFixed(5)}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Selected place marker */}
      {selectedPlaceLocation && waypoints.length === 0 && (
        <Marker position={selectedPlaceLocation}>
          <Popup>
            <div style={{ padding: "4px", fontFamily: "Inter, sans-serif" }}>
              <strong>Selected Location</strong>
              <br />
              Lat: {selectedPlaceLocation.lat.toFixed(5)}
              <br />
              Lng: {selectedPlaceLocation.lng.toFixed(5)}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Routing layer */}
      {waypoints.length >= 2 && (
        <RoutingLayer
          waypoints={waypoints}
          onRouteCalculated={onRouteCalculated}
        />
      )}

      {/* Map controls */}
      <LocationControl onUserLocationUpdate={onUserLocationUpdate} />
    </MapContainer>
  );
}
