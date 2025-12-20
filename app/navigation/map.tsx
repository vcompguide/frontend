"use client";

import L, { LatLng } from "leaflet";
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useCallback, useEffect, useState } from "react";
import { FaMapMarkerAlt, FaMinus, FaPlus } from "react-icons/fa";
import { uuidv7 } from "uuidv7";

// Fix for default marker icons in Next.js using public path
L.Icon.Default.mergeOptions({
	iconUrl: "/leaflet/marker-icon.png",
	shadowUrl: "/leaflet/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

// Cache for custom markers to avoid recreating them
const markerCache = new Map<string, L.Icon>();

// Create a custom SVG marker icon with data URL
const createCustomMarker = (color: string = "#3b82f6") => {
	// Return cached marker if available
	const cachedMarker = markerCache.get(color);
	if (cachedMarker) {
		return cachedMarker;
	}

	// SVG string for FaMapMarkerAlt pin marker
	const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="${color}"><path d="M192 0C86 0 0 86 0 192c0 127.4 192 320 192 320s192-192.6 192-320c0-106-86-192-192-192zm0 287.6c-52.6 0-96-43.4-96-96s43.4-96 96-96 96 43.4 96 96-43.4 96-96 96z"/></svg>`;
	
	// Encode SVG for data URL
	const encodedSvg = svgString
		.replace(/"/g, "'")
		.replace(/</g, "%3C")
		.replace(/>/g, "%3E")
		.replace(/#/g, "%23")
		.replace(/\s+/g, " ");
	
	const dataUrl = `data:image/svg+xml,${encodedSvg}`;
	
	const icon = new L.Icon({
		iconUrl: dataUrl,
		iconSize: [24, 32],
		iconAnchor: [12, 32],
		popupAnchor: [0, -32],
	});
	
	// Cache the marker
	markerCache.set(color, icon);
	return icon;
};

// Component to handle map center changes
function MapCenterUpdater({ center }: { center: { lat: number; lng: number } | undefined }) {
	const map = useMap();

	useEffect(() => {
		if (center) {
			map.flyTo([center.lat, center.lng], 15, {
				duration: 1.5,
			});
		}
	}, [center, map]);

	return null;
}

function MarkerSetter({
	setDisplay,
	setPosition,
	isPickingCardLocation,
	onCardLocationPicked,
}: {
	setDisplay: (isDisplayed: boolean) => void;
	setPosition: (LatLng: LatLng) => void;
	isPickingCardLocation: boolean;
	onCardLocationPicked: (position: LatLng) => void;
}) {
	useMapEvents({
		click: (e) => {
			if (isPickingCardLocation) {
				onCardLocationPicked(e.latlng);
			} else {
				setDisplay(false);
			}
		},
		contextmenu: (e) => {
			if (!isPickingCardLocation) {
				setPosition(e.latlng);
				setDisplay(true);
			}
		},
	});
	return null;
}

function DisplayMarker({
	displayed,
	position,
}: {
	displayed: boolean;
	position: LatLng;
}) {
	return displayed ? <Marker position={position} /> : null;
}

function LocateUserOnLoad({
	locationSetter,
}: {
	locationSetter: (LatLng: LatLng) => void;
}) {
	const map = useMapEvents({
		locationfound: (e) => {
			map.setView(e.latlng, 14); // Zoom level 14 fits the city view better
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

function MapZoomController() {
	const map = useMap();

	const handleZoomIn = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		map.zoomIn();
	}, [map]);

	const handleZoomOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		map.zoomOut();
	}, [map]);

	return (
		<div className="z-1000 flex flex-col w-fit h-fit p-1 rounded absolute right-10 bottom-10 gap-2 bg-black/75">
			<button
				type="button"
				className="flex size-fit p-2 bg-black/50 justify-center items-center hover:bg-white/25 transition rounded-t"
				onClick={handleZoomIn}
			>
				<FaPlus className="w-full h-full" />
			</button>
			<button
				type="button"
				className="flex size-fit p-2 bg-black/50 justify-center items-center hover:bg-white/25 transition rounded-b"
				onClick={handleZoomOut}
			>
				<FaMinus />
			</button>
		</div>
	);
}

interface LeafletMapProps {
	isPickingCardLocation?: boolean;
	onCardLocationPicked?: (position: LatLng) => void;
	planCards?: Array<{
		id: string;
		title: string;
		position?: LatLng;
		color: string;
	}>;
	centerLocation?: { lat: number; lng: number };
}

export default function LeafletMap({
	isPickingCardLocation = false,
	onCardLocationPicked = () => {},
	planCards = [],
	centerLocation,
}: LeafletMapProps) {
	const [highlightPosition, setPosition] = useState<LatLng>(new LatLng(0, 0));
	const [isHighlighted, setHighlighted] = useState<boolean>(false);
	const [userLocation, setUserLocation] = useState<LatLng>(new LatLng(0, 0));
	const [mapId] = useState(() => uuidv7());
	const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(centerLocation);

	const handleCardLocationPicked = useCallback(
		(position: LatLng) => {
			onCardLocationPicked(position);
		},
		[onCardLocationPicked]
	);

	// Hook to update map center when centerLocation changes
	useEffect(() => {
		if (centerLocation && mapCenter !== centerLocation) {
			setMapCenter(centerLocation);
		}
	}, [centerLocation, mapCenter]);

	return (
		<div className={`w-full h-full bg-[#1a1a1a] ${isPickingCardLocation ? "cursor-crosshair" : ""}`}>
			{/* Dark background to prevent flash */}
			<MapContainer
				center={[48.8606, 2.3376]}
				zoom={14}
				scrollWheelZoom={true}
				className="w-full h-full outline-none relative"
				zoomControl={false}
				attributionControl={false}
				key={mapId}
			>
				{/* Dark Mode Tiles */}
				<TileLayer
					url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
				/>

				<MapResizer />
				<MapCenterUpdater center={mapCenter} />
				<LocateUserOnLoad locationSetter={setUserLocation} />
				<MarkerSetter
					setDisplay={setHighlighted}
					setPosition={setPosition}
					isPickingCardLocation={isPickingCardLocation}
					onCardLocationPicked={handleCardLocationPicked}
				/>
				<DisplayMarker displayed={isHighlighted} position={highlightPosition} />
				<Marker position={userLocation}>
					<Popup>You are currently here</Popup>
				</Marker>

				{/* Plan Card Markers */}
				{planCards.map(
					(card) =>
						card.position && (
							<Marker
								key={card.id}
								position={card.position}
								icon={createCustomMarker(card.color)}
							>
								<Popup>{card.title}</Popup>
							</Marker>
						),
				)}

				<MapZoomController />
				<MapResizer />
			</MapContainer>
		</div>
	);
}
