// app/map/page.tsx

'use client'; // This component uses client-side hooks (useState, useEffect)

import { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { Search, Menu, X, ZoomIn, ZoomOut } from 'lucide-react';

// --- Leaflet CSS ---
// This is required for the map to render correctly
import 'leaflet/dist/leaflet.css';

// --- Leaflet Icon Fix ---
// This boilerplate fixes issues with marker icons in Webpack/Next.js
// (See: https://github.com/PaulLeCam/react-leaflet/issues/453)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});
// --- End Icon Fix ---

export default function MapPage() {
  // State to control the sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State to hold the map instance
  const [map, setMap] = useState<L.Map | null>(null);

  // Default map position (London)
  const position: L.LatLngExpression = [51.505, -0.09];

  /**
   * A helper component to get the map instance.
   * This is the recommended way to access the map object in react-leaflet.
   */
  function MapController() {
    const mapInstance = useMap();
    useEffect(() => {
      setMap(mapInstance);
    }, [mapInstance]);
    return null; // This component doesn't render anything
  }

  // --- Zoom Handlers ---
  const handleZoomIn = () => {
    map?.zoomIn();
  };

  const handleZoomOut = () => {
    map?.zoomOut();
  };

  return (
    <div className="relative h-screen w-full">
      {/* =================================================================
          MAP CONTAINER
      ================================================================= */}
      {/* <MapContainer */}
        {/* // center={position} */}
        {/* // zoom={13} */}
        {/* // zoomControl={false} // Disable default zoom control */}
        {/* // className="h-full w-full z-0" */}
      {/* // > */}
        {/* <TileLayer */}
          {/* // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' */}
          {/* // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" */}
        {/* // /> */}
        {/* <Marker position={position}> */}
          {/* <Popup> */}
            {/* A pretty CSS3 popup. <br /> Easily customizable. */}
          {/* </Popup> */}
        {/* </Marker> */}
        {/* Component to get map instance */}
        {/* <MapController /> */}
      {/* </MapContainer> */}

      {/* =================================================================
          FLOATING SEARCH BAR (TOP LEFT)
      ================================================================= */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        {/* --- Sidebar Toggle Button --- */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5 text-gray-700" />
          ) : (
            <Menu className="h-5 w-5 text-gray-700" />
          )}
        </button>

        {/* --- Search Input --- */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search map..."
            className="w-72 pl-10 pr-4 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* =================================================================
          FLOATING ZOOM CONTROLS (BOTTOM RIGHT)
      ================================================================= */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="bg-white p-2.5 rounded-md shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white p-2.5 rounded-md shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* =================================================================
          RIGHT POP-UP SIDEBAR
      ================================================================= */}
      <div
        className={`absolute top-0 right-0 h-full w-80 md:w-96 bg-white z-20 shadow-xl transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Details Panel</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <p className="mt-4 text-gray-600">
            This is the pop-up sidebar. Clicking a marker on the map could
            populate this area with details.
          </p>
        </div>
      </div>
    </div>
  );
}