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
import { FaMinus, FaPlus, FaLocationArrow } from "react-icons/fa";
import { uuidv7 } from "uuidv7";

// Import custom markers
import {
	markerAnimationsStyles,
	userLocationIcon,
	highlightMarkerIcon,
	getCachedCustomMarker,
	initDefaultMarker,
} from "./MapMarkers"; // Giả sử file nằm cùng thư mục

// --- COMPONENTS ---

function MapCenterUpdater({
	center,
}: { center: { lat: number; lng: number } | undefined }) {
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
		},
	});
	useEffect(() => {
		map.locate();
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
		if (centerLocation && mapCenter !== centerLocation) {
			setMapCenter(centerLocation);
		}
	}, [centerLocation, mapCenter]);

	return (
		<div
			className={`w-full h-full bg-[#1a1a1a] ${
				isPickingCardLocation ? "cursor-crosshair" : ""
			}`}
		>
			{/* Inject CSS Animations từ file markers */}
			<style>{markerAnimationsStyles}</style>

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
								icon={getCachedCustomMarker(card.color)}
							>
								<Popup>{card.title}</Popup>
							</Marker>
						),
				)}

				<UserLocationController />
				<MapZoomController />
				<MapResizer />
			</MapContainer>
		</div>
	);
}