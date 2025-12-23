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
import { FaLocationArrow, FaMinus, FaPlus } from "react-icons/fa";
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

// Create a distinct search result marker (same style as plan markers)
const createSearchMarker = () => {
	return createCustomMarker("#00d492"); // Amber color for search results
};

// Component to handle map center changes
function MapCenterUpdater({ 
	center
}: { 
	center: { lat: number; lng: number } | undefined;
}) {
	const map = useMap();
	useEffect(() => {
		if (center) {
			map.flyTo([center.lat, center.lng], 15, { duration: 1.5 });
		}
	}, [center, map]);
	return null;
}


function MarkerSetter({
	setDisplay,
	isPickingCardLocation,
	onCardLocationPicked,
}: {
	setDisplay: (isDisplayed: boolean) => void;
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
	});
	return null;
}

function CursorTracker({
	isPickingCardLocation,
	onCursorMove,
}: {
	isPickingCardLocation: boolean;
	onCursorMove: (position: LatLng) => void;
}) {
	useMapEvents({
		mousemove: (e) => {
			if (isPickingCardLocation) {
				onCursorMove(e.latlng);
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
	return displayed ? (
		<Marker position={position} icon={highlightMarkerIcon} />
	) : null;
}

function LocateUserOnLoad({
	locationSetter,
}: {
	locationSetter: (LatLng: LatLng) => void;
}) {
	const map = useMapEvents({
		locationfound: (e) => {
			map.setView(e.latlng, 14);
			locationSetter(e.latlng);
			// Don't auto-set view - let MapCenterUpdater handle positioning
		},
	});
	useEffect(() => {
		// Only locate once on mount
		const hasLocated = (map as any).__hasLocated;
		if (!hasLocated) {
			map.locate();
			(map as any).__hasLocated = true;
		}
	}, [map]);
	return null;
}

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

	const handleZoomIn = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			map.zoomIn();
		},
		[map],
	);

	const handleZoomOut = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			map.zoomOut();
		},
		[map],
	);

	return (
		<div className="z-[1000] flex flex-col w-fit h-fit p-1 rounded absolute right-10 bottom-10 gap-2 bg-black/75 backdrop-blur-md border border-white/10 shadow-lg">
			<button
				type="button"
				className="flex size-fit p-2 text-white/80 hover:text-white bg-transparent justify-center items-center hover:bg-white/10 transition rounded-t border-b border-white/10"
				onClick={handleZoomIn}
			>
				<FaPlus className="w-full h-full" />
			</button>
			<button
				type="button"
				className="flex size-fit p-2 text-white/80 hover:text-white bg-transparent justify-center items-center hover:bg-white/10 transition rounded-b"
				onClick={handleZoomOut}
			>
				<FaMinus />
			</button>
		</div>
	);
}

function UserLocationController() {
	const map = useMap();

	const handleLocateUser = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const newLocation = new LatLng(
						position.coords.latitude,
						position.coords.longitude,
					);
					map.flyTo(newLocation, 15, { duration: 1.5 });
				},
				(error) => {
					console.error("Error getting location:", error);
					alert(
						"Unable to get your location. Please check your browser permissions.",
					);
				},
			);
		},
		[map],
	);

	return (
		<div className="z-[1000] flex flex-col w-fit h-fit p-1 rounded absolute right-10 bottom-32 gap-2 bg-black/75 backdrop-blur-md border border-white/10 shadow-lg">
			<button
				type="button"
				className="flex size-fit p-2 text-blue-400 hover:text-blue-300 bg-transparent justify-center items-center hover:bg-white/10 transition rounded"
				onClick={handleLocateUser}
				title="Show my location"
			>
				<FaLocationArrow className="w-full h-full" />
			</button>
		</div>
	);
}

interface LeafletMapProps {
	isPickingCardLocation?: boolean;
	onCardLocationPicked?: (position: LatLng) => void;
	onCursorMove?: (position: LatLng) => void;
	planCards?: Array<{
		id: string;
		title: string;
		description: string;
		position?: LatLng;
		color: string;
		priority: "low" | "medium" | "high";
		tags: string[];
	}>;
	searchResults?: Array<{
		place_id: number;
		display_name: string;
		lat: number;
		lng: number;
		type: string;
	}>;
	centerLocation?: { lat: number; lng: number };
	onMapCenterChange?: (center: { lat: number; lng: number }) => void;
	initialCenter?: [number, number];
}

export default function LeafletMap({
	isPickingCardLocation = false,
	onCardLocationPicked = () => {},
	onCursorMove = () => {},
	planCards = [],
	searchResults = [],
	centerLocation,
	initialCenter = [10.7725, 106.6980],
}: LeafletMapProps) {
	const [_highlightPosition, _setPosition] = useState<LatLng>(new LatLng(0, 0));
	const [isHighlighted, setHighlighted] = useState<boolean>(false);
	const [userLocation, setUserLocation] = useState<LatLng>(new LatLng(0, 0));
	const [mapId] = useState(() => uuidv7());
	const [mapCenter, setMapCenter] = useState<
		{ lat: number; lng: number } | undefined
	>(centerLocation);

	// Khởi tạo default marker override khi component mount
	useEffect(() => {
		initDefaultMarker();
	}, []);

	const handleCardLocationPicked = useCallback(
		(position: LatLng) => {
			onCardLocationPicked(position);
		},
		[onCardLocationPicked],
	);

	useEffect(() => {
		if (centerLocation) {
			setMapCenter(centerLocation);
		}
	}, [centerLocation]);

	// Debug: Log search results when they change
	useEffect(() => {
		if (searchResults.length > 0) {
			console.log('Search results received:', searchResults);
		}
	}, [searchResults]);

	return (
		<div
			className={`w-full h-full bg-[#1a1a1a] ${
				isPickingCardLocation ? "cursor-crosshair" : ""
			}`}
		>
			{/* Inject CSS Animations từ file markers */}
			<style>{markerAnimationsStyles}</style>

			<MapContainer
				center={(mapCenter ? [mapCenter.lat, mapCenter.lng] : initialCenter) as [number, number]}
				zoom={14}
				scrollWheelZoom={true}
				className="w-full h-full outline-none relative"
				zoomControl={false}
				attributionControl={false}
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
					isPickingCardLocation={isPickingCardLocation}
					onCardLocationPicked={handleCardLocationPicked}
				/>

				{/* Helper/Highlight Marker */}
				<DisplayMarker displayed={isHighlighted} position={highlightPosition} />

				{/* User Location */}
				<Marker position={userLocation} icon={userLocationIcon}>
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
								zIndexOffset={100}
							>
								<Popup>{card.title}</Popup>
							</Marker>
						),
				)}

				{/* Search Result Markers - Render last to appear on top */}
				{searchResults.length > 0 && searchResults.map((result) => (
					<Marker
						key={`search-${result.place_id}`}
						position={[result.lat, result.lng]}
						icon={createSearchMarker()}
						zIndexOffset={1000}
						pane="markerPane"
					>
						<Popup>
							<div className="text-sm">
								<p className="font-semibold text-gray-900">{result.display_name.split(",")[0]}</p>
								<p className="text-xs text-gray-600 mt-1">{result.display_name.split(",").slice(1).join(",")}</p>
								<p className="text-xs text-gray-500 mt-1 italic">{result.type}</p>
							</div>
						</Popup>
					</Marker>			))}

			<MapZoomController />
		</MapContainer>
	</div>
);
}