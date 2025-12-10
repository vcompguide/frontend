import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { FaLocationArrow, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import {
	MapContainer,
	Marker,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";

// Fix for default Leaflet markers in Next.js/Webpack
const icon = L.divIcon({
	className: "custom-icon",
	html: '<div style="font-size: 24px; color: #ef4444; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg></div>',
	iconSize: [24, 24],
	iconAnchor: [12, 24],
});

interface LocationPickerProps {
	currentLocation?: { lat: number; lng: number };
	onLocationSelect: (lat: number, lng: number) => void;
	externalQuery?: string;
}

// 1. Updated MapEvents to accept an onMapClick prop
function MapEvents({
	onRightClick,
	onMapClick,
}: {
	onRightClick: (latlng: L.LatLng, point: L.Point) => void;
	onMapClick: () => void;
}) {
	useMapEvents({
		contextmenu(e) {
			onRightClick(e.latlng, e.containerPoint);
		},
		click() {
			// This handles the "click anywhere on map to close dropdown"
			onMapClick();
		},
	});
	return null;
}

function MapUpdater({ center }: { center: L.LatLngExpression | null }) {
	const map = useMap();
	useEffect(() => {
		if (center) map.flyTo(center, 13);
	}, [center, map]);
	return null;
}
function LocateButton({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
    const map = useMapEvents({
        locationfound(e) {
            // 1. Update the parent state so the red marker moves here
            onLocationFound(e.latlng.lat, e.latlng.lng);
            // 2. Fly the camera to the new location
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    const handleClick = () => {
        // triggers the 'locationfound' event above
        map.locate();
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            // Position: absolute bottom-right, strictly inside the map container
            // z-index: 1000 to sit above map tiles
            className="absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded-full shadow-xl border border-gray-200 hover:bg-gray-50 text-blue-600 transition-colors"
            title="Locate Me"
        >
            <FaLocationArrow />
        </button>
    );
}

export default function LocationPicker({
	currentLocation,
	onLocationSelect,
	externalQuery,
}: LocationPickerProps) {
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	
	const [mapCenter, setMapCenter] = useState<L.LatLngExpression | null>(
		currentLocation
			? [currentLocation.lat, currentLocation.lng]
			: [51.505, -0.09],
	);


	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		latlng: L.LatLng;
	} | null>(null);

	useEffect(() => {
		if (externalQuery) {
			setQuery(externalQuery);
			performSearch(externalQuery);
		}
	}, [externalQuery]);

	const performSearch = async (searchTerm: string) => {
		if (!searchTerm) return;
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					searchTerm
				)}&limit=5`
			);
			const data = await response.json();
			setSearchResults(data);
			setShowDropdown(true);
		} catch (error) {
			console.error("Search failed", error);
		}
	};

	const handleManualSearch = (e: React.FormEvent) => {
		e.preventDefault();
		performSearch(query);
	};

	const handleResultSelect = (result: any) => {
		const lat = parseFloat(result.lat);
		const lng = parseFloat(result.lon);
		setMapCenter([lat, lng]);
		onLocationSelect(lat, lng);
		setQuery(result.display_name);
		setShowDropdown(false);
	};
	


	return (
		<div className="relative w-full h-full bg-gray-200">
			{/* Search Bar Overlay */}
			<div className="absolute top-4 left-4 right-4 z-1000 flex flex-col gap-1 max-w-md bg-white">
				<form
					onSubmit={handleManualSearch}
					className="flex gap-2 w-full shadow-lg"
				>
					<input
						className="grow px-4 py-2 rounded-l-md border-0 focus:ring-2 ring-blue-500/50 outline-none"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search places..."
						onFocus={() => {
							if (searchResults.length > 0) setShowDropdown(true);
						}}
					/>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
					>
						<FaSearch />
					</button>
				</form>

				{/* Top 5 Results Dropdown */}
				{showDropdown && searchResults.length > 0 && (
					<div className="bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-60 overflow-y-auto">
						{searchResults.map((result, idx) => (
							<button
								key={result}
								type="button"
								onClick={() => handleResultSelect(result)}
								className="text-left px-4 py-2 text-xs hover:bg-blue-50 border-b last:border-0 border-gray-100 transition-colors flex items-center gap-2"
							>
								<FaMapMarkerAlt className="text-gray-400 shrink-0" />
								<span className="truncate">{result.display_name}</span>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Instruction Overlay */}
			<div className="absolute bottom-4 left-4 z-1000 bg-white/90 p-2 rounded shadow text-xs font-mono max-w-[200px]">
				<p>
					<strong>Right-click</strong> map to set location manually.
				</p>
			</div>
			{/* <div className = "absolute bottom-4 right-4 z-1000 bg-white/60 p-2 rounded-full size-10">
			
			</div> */}
			{/* Context Menu Popup */}
			{contextMenu && (
				<div
					className="absolute z-2000 bg-white rounded shadow-xl border border-gray-200 p-2 flex flex-col gap-2 animate-pop-in"
					style={{ left: contextMenu.x, top: contextMenu.y }}
				>
					<div className="text-xs font-bold text-gray-500">Set Location?</div>
					<div className="text-xs text-gray-400 font-mono mb-1">
						{contextMenu.latlng.lat.toFixed(4)},{" "}
						{contextMenu.latlng.lng.toFixed(4)}
					</div>
					<button
						type="button"
						onClick={() => {
							onLocationSelect(contextMenu.latlng.lat, contextMenu.latlng.lng);
							setContextMenu(null);
						}}
						className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
					>
						Confirm
					</button>
					<button
						type="button"
						onClick={() => setContextMenu(null)}
						className="text-gray-400 text-xs hover:text-black underline"
					>
						Cancel
					</button>
				</div>
			)}

			{/* 2. Removed `whenReady` and added logic to MapEvents */}
			<MapContainer
				center={
					currentLocation
						? [currentLocation.lat, currentLocation.lng]
						: [51.505, -0.09]
				}
				zoom={13}
				className="w-full h-full z-0"
				zoomControl={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				<MapUpdater center={mapCenter} />

				<MapEvents
					onRightClick={(latlng, point) => {
						setContextMenu({ x: point.x, y: point.y, latlng });
						setShowDropdown(false);
					}}
					onMapClick={() => {
						// Closes dropdown when clicking anywhere on the map
						setShowDropdown(false);
					}}
				/>
				<LocateButton onLocationFound={(lat, lng) => {
                    onLocationSelect(lat, lng);
                    setMapCenter([lat, lng]); // Optional: ensures MapUpdater syncs too
                }} />

				{currentLocation && (
					<Marker
						position={[currentLocation.lat, currentLocation.lng]}
						icon={icon}
					/>
				)}
			</MapContainer>
		</div>
	);
}