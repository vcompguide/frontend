"use client";

import L, { LatLng } from "leaflet";
import {
	MapContainer,
	Marker,
	Polyline,
	Popup,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useCallback, useEffect, useState } from "react";
import { FaLocationArrow, FaMinus, FaPlus } from "react-icons/fa";
import { MapContextMenu } from "./MapContextMenu";
import { 
	highlightMarkerIcon,
	initDefaultMarker, 
	markerAnimationsStyles, 
	userLocationIcon 
} from "./MapMarkers";

L.Icon.Default.mergeOptions({
	iconUrl: "/leaflet/marker-icon.png",
	shadowUrl: "/leaflet/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

const markerCache = new Map<string, L.Icon>();

const createCustomMarker = (color: string = "#3b82f6") => {
	const cachedMarker = markerCache.get(color);
	if (cachedMarker) {
		return cachedMarker;
	}

	const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="${color}"><path d="M192 0C86 0 0 86 0 192c0 127.4 192 320 192 320s192-192.6 192-320c0-106-86-192-192-192zm0 287.6c-52.6 0-96-43.4-96-96s43.4-96 96-96 96 43.4 96 96-43.4 96-96 96z"/></svg>`;
	
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
	onContextMenu,
}: {
	setDisplay: (isDisplayed: boolean) => void;
	isPickingCardLocation: boolean;
	onCardLocationPicked: (position: LatLng) => void;
	onContextMenu: (e: L.LeafletMouseEvent) => void;
}) {
	useMapEvents({
		click: (e) => {
			// Check if click originated from a control button
			const target = e.originalEvent.target as HTMLElement;
			if (target.closest('button') || target.closest('.leaflet-control')) {
				return; // Ignore clicks on control buttons
			}
			
			if (isPickingCardLocation) {
				onCardLocationPicked(e.latlng);
			} else {
				setDisplay(false);
			}
		},
		contextmenu: (e) => {
			// Check if right-click originated from a control button
			const target = e.originalEvent.target as HTMLElement;
			if (target.closest('button') || target.closest('.leaflet-control')) {
				return; // Ignore right-clicks on control buttons
			}
			
			// Disallow right-clicking when picking location
			if (!isPickingCardLocation) {
				onContextMenu(e);
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
	onUserLocationChange,
}: {
	locationSetter: (LatLng: LatLng) => void;
	onUserLocationChange?: (location: LatLng) => void;
}) {
	const map = useMapEvents({
		locationfound: (e) => {
			map.setView(e.latlng, 14);
			locationSetter(e.latlng);
			onUserLocationChange?.(e.latlng);
			// Don't auto-set view - let MapCenterUpdater handle positioning
		},
	});
	useEffect(() => {
		// Only locate once on mount
		const hasLocated = (map as unknown as { __hasLocated?: boolean }).__hasLocated;
		if (!hasLocated) {
			map.locate();
			(map as unknown as { __hasLocated?: boolean }).__hasLocated = true;
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
			e.preventDefault();
			map.zoomIn();
		},
		[map],
	);

	const handleZoomOut = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			e.preventDefault();
			map.zoomOut();
		},
		[map],
	);

	return (
		<div className="z-1000 flex flex-col w-fit h-fit p-1 rounded absolute right-10 bottom-10 gap-2 bg-black/75 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
			<button
				type="button"
				className="flex size-fit p-2 text-white/80 hover:text-white bg-transparent justify-center items-center hover:bg-white/10 transition rounded-t border-b border-white/10"
				onClick={handleZoomIn}
				onMouseDown={(e) => e.stopPropagation()}
				onContextMenu={(e) => e.preventDefault()}
			>
				<FaPlus className="w-full h-full" />
			</button>
			<button
				type="button"
				className="flex size-fit p-2 text-white/80 hover:text-white bg-transparent justify-center items-center hover:bg-white/10 transition rounded-b"
				onClick={handleZoomOut}
				onMouseDown={(e) => e.stopPropagation()}
				onContextMenu={(e) => e.preventDefault()}
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
			e.preventDefault();
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
		<div className="z-1000 flex flex-col w-fit h-fit p-1 rounded absolute right-10 bottom-32 gap-2 bg-black/75 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
			<button
				type="button"
				className="flex size-fit p-2 text-blue-400 hover:text-blue-300 bg-transparent justify-center items-center hover:bg-white/10 transition rounded"
				onClick={handleLocateUser}
				onMouseDown={(e) => e.stopPropagation()}
				onContextMenu={(e) => e.preventDefault()}
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
		tags: string[];
		finished?: boolean;
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
	onAddPlanFromMap?: (position: LatLng) => void;
	onUserLocationChange?: (location: LatLng) => void;
	pathPoints?: LatLng[];
}

export default function LeafletMap({
	isPickingCardLocation = false,
	onCardLocationPicked = () => {},
	onCursorMove = () => {},
	planCards = [],
	searchResults = [],
	centerLocation,
	initialCenter = [10.7725, 106.6980],
	onAddPlanFromMap = () => {},
	onUserLocationChange = () => {},
	pathPoints = [],
}: LeafletMapProps) {
	const [highlightPosition, _setPosition] = useState<LatLng>(new LatLng(0, 0));
	const [isHighlighted, setHighlighted] = useState<boolean>(false);
	const [userLocation, setUserLocation] = useState<LatLng>(new LatLng(0, 0));
	const [mapCenter, setMapCenter] = useState<
		{ lat: number; lng: number } | undefined
	>(centerLocation);
	const [contextMenu, setContextMenu] = useState<{
		position: { x: number; y: number };
		latLng: LatLng;
	} | null>(null);

	useEffect(() => {
		initDefaultMarker();
	}, []);

	const handleCardLocationPicked = useCallback(
		(position: LatLng) => {
			onCardLocationPicked(position);
		},
		[onCardLocationPicked],
	);

	const handleCursorMove = useCallback(
		(position: LatLng) => {
			onCursorMove(position);
		},
		[onCursorMove],
	);

	const handleContextMenu = useCallback((e: L.LeafletMouseEvent) => {
		e.originalEvent.preventDefault();
		// Update context menu position directly (opens at new location or replaces existing)
		setContextMenu({
			position: { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
			latLng: e.latlng,
		});
		console.log("Context menu opened at:", e.latlng);
	}, []);

	const handleCloseContextMenu = useCallback(() => {
		setContextMenu(null);
	}, []);

	const handleAddToPlan = useCallback(
		(position: LatLng) => {
			onAddPlanFromMap(position);
		},
		[onAddPlanFromMap],
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
			onContextMenu={(e) => e.preventDefault()}
			role="application"
		>
			{/* Inject CSS Animations từ file markers */}
			<style>{markerAnimationsStyles}</style>

			{/* Context Menu */}
			{contextMenu && (
				<MapContextMenu
					position={contextMenu.position}
					latLng={contextMenu.latLng}
					onClose={handleCloseContextMenu}
					onAddToPlan={handleAddToPlan}
				/>
			)}

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
			<LocateUserOnLoad locationSetter={setUserLocation} onUserLocationChange={onUserLocationChange} />			<CursorTracker
				isPickingCardLocation={isPickingCardLocation}
				onCursorMove={handleCursorMove}
			/>				<MarkerSetter
					setDisplay={setHighlighted}
					isPickingCardLocation={isPickingCardLocation}
					onCardLocationPicked={handleCardLocationPicked}
					onContextMenu={handleContextMenu}
				/>

				{/* Helper/Highlight Marker */}
				<DisplayMarker displayed={isHighlighted} position={highlightPosition} />

				{/* User Location */}
				<Marker position={userLocation} icon={userLocationIcon}>
				<Popup>
					<div className="bg-[#1e1e1e] p-4 rounded-lg min-w-[200px]">
						<h3 className="text-white font-bold text-lg mb-2">
							📍 Your Location
						</h3>
						<p className="text-gray-400 text-xs mb-3">
							You are currently here
						</p>

						<button
							type="button"
							onClick={() => onAddPlanFromMap(userLocation)}
							className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-2 px-3 rounded-lg font-medium transition"
						>
							Add to Route
						</button>
			</div>
		</Popup>
	</Marker>
			{pathPoints.length > 0 && (
					<Polyline
						positions={pathPoints}
						pathOptions={{
							color: "#FFD700",
							weight: 5,
							opacity: 0.8,
							lineJoin: "round",
							lineCap: "round",
						}}
					/>
				)}

				{/* Search Result Markers - Render first to appear below plan markers */}
				{searchResults.length > 0 && searchResults.map((result) => (
					<Marker
						key={`search-${result.place_id}`}
						position={[result.lat, result.lng]}
						icon={createSearchMarker()}
						zIndexOffset={50}
						pane="markerPane"
					>
						<Popup>
							<div className="text-sm">
								<p className="font-semibold text-gray-900">{result.display_name.split(",")[0]}</p>
								<p className="text-xs text-gray-600 mt-1">{result.display_name.split(",").slice(1).join(",")}</p>
								<p className="text-xs text-gray-500 mt-1 italic">{result.type}</p>
								<button
									type="button"
									onClick={() => onAddPlanFromMap(new LatLng(result.lat, result.lng))}
									className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-1.5 px-3 rounded transition mt-2"
								>
									Add to Route
								</button>
							</div>
						</Popup>
					</Marker>			))}

				{/* Plan Card Markers - Render last to appear on top */}
				{planCards.map(
					(card) =>
						card.position && (
							<Marker
								key={card.id}
								position={card.position}
								icon={createCustomMarker(card.color)}
								zIndexOffset={100}
							>
								<Popup>
									<div className="bg-[#1e1e1e] p-4 rounded-lg min-w-[200px]">
										<h3 className="text-white font-bold text-lg mb-2">
											{card.title}
										</h3>
										<p className="text-gray-400 text-xs mb-3 line-clamp-2">
											{card.description}
										</p>

										<button
											type="button"
											onClick={() => onAddPlanFromMap(card.position!)}
											className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-2 px-3 rounded-lg font-medium transition"
										>
											Add to Route
										</button>
									</div>
								</Popup>
							</Marker>
						),
				)}

				<UserLocationController />
		
				<MapZoomController />
			</MapContainer>
		</div>
	);
}
