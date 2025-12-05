"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMapEvent, useMap } from "react-leaflet";
import L, { LatLng, Point, setOptions } from "leaflet";
import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import 'leaflet/dist/leaflet.css'



L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow
});


function MarkerSetter({ setDisplay, setPosition }: {
  setDisplay: (isDisplayed: boolean) => void;
  setPosition: (LatLng: LatLng) => void;
}) {
  const map = useMapEvents({
    click(e) {
      // console.log(e)
      setDisplay(false)
    },

    contextmenu(e) {
      console.log(e)
      setPosition(e.latlng)
      setDisplay(true)

    },
    locationfound(e) {
      
    }
  })
  return null
}


function DisplayMarker({displayed, position}:{displayed: boolean, position: LatLng}) {
  if (displayed) {
    return <Marker position={position}/>
  }
  else 
  {
    return null
  }
}

function LocateUserOnLoad({locationSetter} : {
  locationSetter: (LatLng: LatLng) => void;
}) {
  const map = useMapEvents({
      locationfound(e) {
        map.flyTo(e.latlng, map.getZoom())
        locationSetter(e.latlng)
      }
  })
  useEffect(() => {
    map.locate()
  })
  return null
}
export default function LeafletMap() {

  const [highlightPosition, setPosition] = useState<LatLng>(new LatLng(0, 0))
  const [isHighlighted, setHighlighted] = useState<boolean>(false)
  const [userLocation, setUserLocation] = useState<LatLng>(new LatLng(0, 0))

  // const mapContainerRef = useRef<HTMLDivElement>(null);
  // const mapInstanceRef = useRef<L.Map | null>(null);

  // useEffect(() => {
  //   if (mapInstanceRef.current) return; // Prevent double init
  //   if (!mapContainerRef.current) return;

  //   // Initialize Map
  //   mapInstanceRef.current = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);

  //   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //     attribution: '© OpenStreetMap contributors',
  //   }).addTo(mapInstanceRef.current);

  
  //   // --- THE CRITICAL FIX FOR HOT RELOAD ---
  //   return () => {
  //     if (mapInstanceRef.current) {
  //       mapInstanceRef.current.remove(); // This fixes "getPane() is undefined"
  //       mapInstanceRef.current = null;
  //     }
  //   };
  // }, []);

  // return <div ref={mapContainerRef} className="w-full h-full" />;
  return (
    <div className="w-full h-full">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* <Marker position={[51.505, -0.09]}>
          <Popup>Hello world</Popup>
        </Marker> */}
        <LocateUserOnLoad locationSetter = {setUserLocation}/>
        <MarkerSetter setDisplay={setHighlighted} setPosition={setPosition}/>
        <DisplayMarker displayed = {isHighlighted} position = {highlightPosition}/>
        <Marker position={userLocation}>
          <Popup>You are currently here</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
