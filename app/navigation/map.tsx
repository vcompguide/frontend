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
import { AMENITY_TAGS, getAmenityIcon } from "../../components/filters/TagFilters";
import { MarkerPopupContent } from "./MarkerPopupContent";

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

// Create POI marker with Material Symbol icon - scales with zoom
const createPOIMarkerIcon = (poiType: string, zoom: number = 14) => {
	console.log('[Map] Creating POI marker for type:', poiType, 'at zoom:', zoom);
	
	// Use the helper function to get icon/color for any amenity type
	const { icon: iconName, color } = getAmenityIcon(poiType);
	console.log('[Map] Using icon:', iconName, 'color:', color);

	// Calculate size based on zoom level (similar to Google Maps)
	// Zoom 10: 12px, Zoom 14: 22px, Zoom 18: 32px - smaller for better visibility
	const minZoom = 10;
	const maxZoom = 18;
	const minSize = 12;
	const maxSize = 32;
	
	const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
	const scale = (clampedZoom - minZoom) / (maxZoom - minZoom);
	const size = minSize + (maxSize - minSize) * scale;
	const iconSize = size * 0.5; // Icon is half the marker size
	const borderWidth = Math.max(1.5, size * 0.06);

	const html = `
		<div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
			<div style="
				position: absolute;
				width: ${size}px;
				height: ${size}px;
				background: ${color};
				border-radius: 50% 50% 50% 0;
				transform: rotate(-45deg);
				box-shadow: 0 ${size * 0.1}px ${size * 0.3}px rgba(0, 0, 0, 0.4);
				border: ${borderWidth}px solid white;
			"></div>
			<span class="material-symbols-outlined" style="
				position: relative;
				color: white;
				font-size: ${iconSize}px;
				z-index: 1;
				text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
			">${iconName}</span>
		</div>
	`;

	return L.divIcon({
		html,
		className: "poi-marker",
		iconSize: [size, size],
		iconAnchor: [size / 2, size],
		popupAnchor: [0, -size],
	});
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

// Component to track zoom changes and update POI markers
function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
	const map = useMap();

	useEffect(() => {
		const handleZoom = () => {
			onZoomChange(map.getZoom());
		};

		// Set initial zoom
		onZoomChange(map.getZoom());

		// Listen to zoom events
		map.on('zoomend', handleZoom);

		return () => {
			map.off('zoomend', handleZoom);
		};
	}, [map, onZoomChange]);

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
			map.flyTo(e.latlng, 14, { duration: 1.5 });
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

function ClosePopupHandler({ shouldClose }: { shouldClose: boolean }) {
	const map = useMap();
	useEffect(() => {
		if (shouldClose) {
			map.closePopup();
		}
	}, [shouldClose, map]);
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
	pois?: Array<{
		id: string;
		name: string;
		lat: number;
		lng: number;
		type: string;
		address?: string;
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
	pois = [],
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
	const [currentZoom, setCurrentZoom] = useState<number>(14);
	const [openPopupId, setOpenPopupId] = useState<string | null>(null);
	const [closeAllPopups, setCloseAllPopups] = useState<boolean>(false);

	useEffect(() => {
		initDefaultMarker();
	}, []);

	useEffect(() => {
		if (closeAllPopups) {
			setCloseAllPopups(false);
		}
	}, [closeAllPopups]);

	// Log POIs for debugging
	useEffect(() => {
		if (pois.length > 0) {
			console.log('[Map] Rendering', pois.length, 'POI markers:', pois.map(p => ({ id: p.id, name: p.name, type: p.type })));
		}
	}, [pois]);

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
		// Close any open marker popups
		setOpenPopupId(null);
		setCloseAllPopups(true);
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
			// Close popup after adding to plan
			setCloseAllPopups(true);
			setOpenPopupId(null);
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

				<ClosePopupHandler shouldClose={closeAllPopups} />
				<MapResizer />
			<MapCenterUpdater center={mapCenter} />
			<LocateUserOnLoad locationSetter={setUserLocation} onUserLocationChange={onUserLocationChange} />
			<ZoomTracker onZoomChange={setCurrentZoom} />
			<CursorTracker
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

				{/* Context Menu Marker - Shows when context menu is open */}
				{contextMenu && (
					<Marker position={contextMenu.latLng} icon={highlightMarkerIcon} />
				)}

				{/* User Location */}
				<Marker 
					position={userLocation} 
					icon={userLocationIcon}
					eventHandlers={{
						popupopen: () => {
							setContextMenu(null);
							setOpenPopupId('user-location');
						},
						popupclose: () => {
							if (openPopupId === 'user-location') {
								setOpenPopupId(null);
							}
						}
					}}
				>
					<Popup>
						<MarkerPopupContent
							title="📍 Your Location"
							subtitle="You are currently here"
							latLng={userLocation}
							onAddToPlan={onAddPlanFromMap}
						/>
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
						eventHandlers={{
							popupopen: () => {
								setContextMenu(null);
								setOpenPopupId(`search-${result.place_id}`);
							},
							popupclose: () => {
								if (openPopupId === `search-${result.place_id}`) {
									setOpenPopupId(null);
								}
							}
						}}
					>
						<Popup>
							<MarkerPopupContent
								title={result.display_name.split(",")[0]}
								subtitle={result.display_name.split(",").slice(1).join(",")}
								latLng={new LatLng(result.lat, result.lng)}
								onAddToPlan={onAddPlanFromMap}
								showType={result.type}
							/>
						</Popup>
					</Marker>			))}

				{/* POI Markers - Filtered amenities */}
				{pois.length > 0 && pois.map((poi) => (
					<Marker
						key={`poi-${poi.id}`}
						position={[poi.lat, poi.lng]}
						icon={createPOIMarkerIcon(poi.type, currentZoom)}
						zIndexOffset={60}
						pane="markerPane"
						eventHandlers={{
							popupopen: () => {
								setContextMenu(null);
								setOpenPopupId(`poi-${poi.id}`);
							},
							popupclose: () => {
								if (openPopupId === `poi-${poi.id}`) {
									setOpenPopupId(null);
								}
							}
						}}
					>
						<Popup>
							<MarkerPopupContent
								title={poi.name}
								subtitle={poi.address}
								latLng={new LatLng(poi.lat, poi.lng)}
								onAddToPlan={onAddPlanFromMap}
								showType={poi.type}
							/>
						</Popup>
					</Marker>
			))}

			{/* Plan Card Markers - Render last to appear on top */}
			{planCards.map(
				(card) =>
					card.position && (
						<Marker
							key={card.id}
							position={card.position}
							icon={createCustomMarker(card.color)}
							zIndexOffset={100}
							eventHandlers={{
								popupopen: () => {
									setContextMenu(null);
									setOpenPopupId(card.id);
								},
								popupclose: () => {
									if (openPopupId === card.id) {
										setOpenPopupId(null);
									}
								}
							}}
						>
							<Popup>
								<MarkerPopupContent
									title={card.title}
									subtitle={card.description}
									latLng={card.position}
									onAddToPlan={onAddPlanFromMap}
								/>
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
