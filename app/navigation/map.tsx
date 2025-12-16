"use client";

import L, { LatLng } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import { uuidv7 } from "uuidv7";

// L.Icon.Default.mergeOptions({
//   iconUrl: icon.src,
//   shadowUrl: iconShadow.src,
// });

function MarkerSetter({ setDisplay, setPosition }: {
  setDisplay: (isDisplayed: boolean) => void;
  setPosition: (LatLng: LatLng) => void;
}) {
  useMapEvents({
    click() {
      setDisplay(false);
    },
    contextmenu(e) {
      setPosition(e.latlng);
      setDisplay(true);
    },
  });
  return null;
}

function DisplayMarker({ displayed, position }: { displayed: boolean; position: LatLng }) {
  return displayed ? <Marker position={position} /> : null;
}

function LocateUserOnLoad({ locationSetter }: { locationSetter: (LatLng: LatLng) => void }) {
  const map = useMapEvents({
    locationfound(e) {
      map.flyTo(e.latlng, 14); // Zoom level 14 fits the city view better
      locationSetter(e.latlng);
    },
  });
  useEffect(() => {
    map.locate();
  }, [map]);
  return null;
}

// Ensure the map resizes correctly
function MapResizer() {
  const map = useMapEvents({});
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
}

export default function LeafletMap() {
  const [highlightPosition, setPosition] = useState<LatLng>(new LatLng(0, 0));
  const [isHighlighted, setHighlighted] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<LatLng>(new LatLng(0, 0));

  return (
    <div className="w-full h-full bg-[#1a1a1a]"> {/* Dark background to prevent flash */}
      <MapContainer
        center={[48.8606, 2.3376]} // Centered on Paris (Louvre) as per image
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full outline-none"
        zoomControl={false} // We will build custom UI for this
        attributionControl={false}
        key={uuidv7()}
      >
        {/* Dark Mode Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapResizer />
        <LocateUserOnLoad locationSetter={setUserLocation} />
        <MarkerSetter setDisplay={setHighlighted} setPosition={setPosition} />
        <DisplayMarker displayed={isHighlighted} position={highlightPosition} />
        
        {/* User Marker */}
        <Marker position={userLocation}>
          <Popup>You are currently here</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}