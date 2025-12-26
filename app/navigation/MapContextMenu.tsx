"use client";

import type { LatLng } from "leaflet";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaCloudSun, FaMapMarkerAlt, FaSpinner, FaTimes } from "react-icons/fa";
import { WiHumidity, WiStrongWind, WiThermometer } from "react-icons/wi";

interface WeatherData {
	temp: number;
	feels_like: number;
	humidity: number;
	description: string;
	icon: string;
	wind_speed: number;
	location_name?: string;
}

interface MapContextMenuProps {
	position: { x: number; y: number };
	latLng: LatLng;
	onClose: () => void;
	onAddToPlan: (position: LatLng) => void;
}

export function MapContextMenu({
	position,
	latLng,
	onClose,
	onAddToPlan,
}: MapContextMenuProps) {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y });

	useEffect(() => {
		fetchWeather();
	}, [latLng]);

	const fetchWeather = async () => {
		setIsLoading(true);
		setError(null);
		try {
			// OpenWeather API Key - use environment variable in production
			const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
			
			if (!API_KEY) {
				throw new Error("API key not configured");
			}

			const response = await fetch(
				`https://api.openweathermap.org/data/2.5/weather?lat=${latLng.lat}&lon=${latLng.lng}&appid=${API_KEY}&units=metric`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch weather data");
			}

			const data = await response.json();
			setWeather({
				temp: Math.round(data.main.temp),
				feels_like: Math.round(data.main.feels_like),
				humidity: data.main.humidity,
				description: data.weather[0].description,
				icon: data.weather[0].icon,
				wind_speed: data.wind.speed,
				location_name: data.name,
			});
		} catch (err) {
			console.error("Weather fetch error:", err);
			setError("Unable to fetch weather data");
		} finally {
			setIsLoading(false);
		}
	};

	// Adjust position based on actual menu dimensions
	useLayoutEffect(() => {
		if (!menuRef.current) return;
		
		const menuWidth = menuRef.current.offsetWidth;
		const menuHeight = menuRef.current.offsetHeight;
		
		let adjustedX = position.x;
		let adjustedY = position.y;
		
		// Check horizontal overflow
		if (position.x + menuWidth > window.innerWidth) {
			// Menu would overflow right edge, position to the left of cursor
			adjustedX = position.x - menuWidth;
		}
		
		// Check vertical overflow
		if (position.y + menuHeight > window.innerHeight) {
			// Menu would overflow bottom edge, position above cursor
			adjustedY = position.y - menuHeight;
		}
		
		// Ensure menu doesn't go off left edge
		if (adjustedX < 0) {
			adjustedX = 10; // Small margin from edge
		}
		
		// Ensure menu doesn't go off top edge
		if (adjustedY < 0) {
			adjustedY = 10; // Small margin from edge
		}
		
		setAdjustedPosition({ x: adjustedX, y: adjustedY });
	}, [position, weather]); // Re-calculate when position changes or weather loads (affecting height)
	
	const adjustedStyle: React.CSSProperties = {
		position: "fixed",
		left: adjustedPosition.x,
		top: adjustedPosition.y,
		zIndex: 2000,
	};

	return (
		<>
			{/* Backdrop to close menu */}
			<div
				className="fixed inset-0 z-[1999]"
				onClick={onClose}
				onContextMenu={(e) => {
					e.preventDefault();
					onClose();
				}}
			/>

			{/* Context Menu */}
			<div
				ref={menuRef}
				style={adjustedStyle}
				className="bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[280px]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="p-3 border-b border-white/5 flex justify-between items-center">
					<h3 className="text-sm font-bold text-white flex items-center gap-2">
						<FaMapMarkerAlt className="text-emerald-500" />
						Location Menu
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-white transition"
					>
						<FaTimes size={14} />
					</button>
				</div>

				{/* Coordinates */}
				<div className="px-3 py-2 bg-white/5 border-b border-white/5">
					<p className="text-xs text-gray-400">
						Lat: <span className="text-emerald-400 font-mono">{latLng.lat.toFixed(6)}</span>
					</p>
					<p className="text-xs text-gray-400">
						Lng: <span className="text-emerald-400 font-mono">{latLng.lng.toFixed(6)}</span>
					</p>
				</div>

				{/* Weather Section */}
				<div className="p-3 border-b border-white/5">
					<div className="flex items-center gap-2 mb-2">
						<FaCloudSun className="text-blue-400" />
						<h4 className="text-sm font-semibold text-white">Weather</h4>
					</div>

					{isLoading && (
						<div className="flex items-center justify-center py-4">
							<FaSpinner className="animate-spin text-emerald-500" size={20} />
						</div>
					)}

					{error && (
						<div className="text-xs text-red-400 py-2">{error}</div>
					)}

					{weather && !isLoading && !error && (
						<div className="space-y-2">
							{weather.location_name && (
								<p className="text-xs font-medium text-gray-300">
									{weather.location_name}
								</p>
							)}
							
							<div className="flex items-start gap-3">
								<img
									src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
									alt={weather.description}
									className="w-12 h-12"
								/>
								<div className="flex-1">
									<p className="text-2xl font-bold text-white">
										{weather.temp}°C
									</p>
									<p className="text-xs text-gray-400 capitalize">
										{weather.description}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-2 pt-2">
								<div className="bg-white/5 rounded-lg p-2">
									<div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
										<WiThermometer size={16} />
										<span>Feels Like</span>
									</div>
									<p className="text-sm font-semibold text-white">
										{weather.feels_like}°C
									</p>
								</div>
								<div className="bg-white/5 rounded-lg p-2">
									<div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
										<WiHumidity size={16} />
										<span>Humidity</span>
									</div>
									<p className="text-sm font-semibold text-white">
										{weather.humidity}%
									</p>
								</div>
								<div className="bg-white/5 rounded-lg p-2 col-span-2">
									<div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
										<WiStrongWind size={16} />
										<span>Wind Speed</span>
									</div>
									<p className="text-sm font-semibold text-white">
										{weather.wind_speed} m/s
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="p-2">
					<button
						type="button"
						onClick={() => {
							onAddToPlan(latLng);
							onClose();
						}}
						className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition flex items-center justify-center gap-2"
					>
						<FaMapMarkerAlt size={14} />
						Add to Current Route
					</button>
				</div>
			</div>
		</>
	);
}
