"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMapEvent, useMap } from "react-leaflet";
import L, { LatLng, Point, setOptions, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import 'leaflet/dist/leaflet.css'



L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow
});

// Custom icon cho vị trí người dùng
const userLocationIcon = divIcon({
  className: 'custom-user-marker',
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

// Custom icon cho marker được chọn
const selectedLocationIcon = divIcon({
  className: 'custom-selected-marker',
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 50px;
    ">
      <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15z" 
          fill="#EF4444" filter="url(#shadow)"/>
        <circle cx="20" cy="15" r="6" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
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
    return (
      <Marker position={position} icon={selectedLocationIcon}>
        <Popup>
          <div style={{ padding: '4px', fontFamily: 'Inter, sans-serif' }}>
            <strong>Selected Location</strong>
            <br />
            Lat: {position.lat.toFixed(5)}
            <br />
            Lng: {position.lng.toFixed(5)}
          </div>
        </Popup>
      </Marker>
    )
  }
  else 
  {
    return null
  }
}

function LocateUserOnLoad({locationSetter} : {
  locationSetter: (LatLng: LatLng) => void;
}) {
  const [hasLocated, setHasLocated] = useState(false);
  
  const map = useMapEvents({
      locationfound(e) {
        if (!hasLocated) {
          map.flyTo(e.latlng, 15)
          locationSetter(e.latlng)
          setHasLocated(true)
        }
      }
  })
  
  useEffect(() => {
    if (!hasLocated) {
      map.locate()
    }
  }, [map, hasLocated])
  
  return null
}
export default function LeafletMap() {

  const [highlightPosition, setPosition] = useState<LatLng>(new LatLng(0, 0))
  const [isHighlighted, setHighlighted] = useState<boolean>(false)
  const [userLocation, setUserLocation] = useState<LatLng>(new LatLng(0, 0))

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
        <LocateUserOnLoad locationSetter = {setUserLocation}/>
        <MarkerSetter setDisplay={setHighlighted} setPosition={setPosition}/>
        <DisplayMarker displayed = {isHighlighted} position = {highlightPosition}/>
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>
            <div style={{ padding: '4px', fontFamily: 'Inter, sans-serif' }}>
              <strong>📍 Your Location</strong>
              <br />
              Lat: {userLocation.lat.toFixed(5)}
              <br />
              Lng: {userLocation.lng.toFixed(5)}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
