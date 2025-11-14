"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMapEvent } from "react-leaflet";
import L, { LatLng, Point } from "leaflet";
import "leaflet/dist/leaflet.css";

import { useState } from "react";

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
  })
  return null
}


function DisplayMarker({displayed, position}:{displayed: boolean, position: LatLng}) {
  let returnComponent;
  if (displayed) {
    return <Marker position={position}/>
  }
  else 
  {
    return null
  }
}
export default function LeafletMap() {

  const [highlightPosition, setPosition] = useState<LatLng>(new LatLng(0, 0))
  const [isHighlighted, setHighlighted] = useState<boolean>(false)


  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[51.505, -0.09]}>
          <Popup>Hello world</Popup>
        </Marker>
        <MarkerSetter setDisplay={setHighlighted} setPosition={setPosition}/>
        <DisplayMarker displayed = {isHighlighted} position = {highlightPosition}/>
      </MapContainer>
    </div>
  );
}
