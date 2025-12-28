"use client";

import { Sdk } from "@/src/backend/RESTful/BackendRESTfulSDK";
import type { LatLng } from "leaflet";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaCloudSun, FaExpand, FaMapMarkerAlt, FaSpinner, FaTimes } from "react-icons/fa";
import { WiHumidity, WiStrongWind, WiThermometer } from "react-icons/wi";

interface DailyForecast {
	dt: number;
	temp_min: number;
	temp_max: number;
	temp_day: number;
	icon: string;
	description: string;
	humidity: number;
	wind_speed: number;
	uv_index: number;
	feels_like: number;
}

interface WeatherData {
	temp: number;
	feels_like: number;
	humidity: number;
	description: string;
	icon: string;
	wind_speed: number;
	location_name?: string;
	daily?: DailyForecast[];
}

interface MapContextMenuProps {
	position: { x: number; y: number };
	latLng: LatLng;
	onClose: () => void;
	onAddToPlan: (position: LatLng) => void;
}

// Separate function to fetch address from coordinates
export async function fetchAddress(lat: number, lng: number): Promise<string> {
	try {
		const api = new Sdk({
			baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
			securityWorker: async () => ({
				headers: {
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
				},
			}),
		});

		const response = await api.map.mapControllerGetLocationDetail({ lat, lng });
		console.log(response.data);
		return response.data.data?.address || "Unknown address";
	} catch (err) {
		console.error("Address fetch error:", err);
		return "Unknown address";
	}
}

// Separate function to fetch weather data
// ============================================================================
// TODO: Replace mock data with actual OpenWeatherMap One Call API 3.0
// API endpoint: https://api.openweathermap.org/data/3.0/onecall
// Requires: lat, lon, appid, units=metric
// ============================================================================
async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
	try {
		const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
		
		// ============================================================================
		// MOCK DATA - Replace this entire block with actual API call when ready
		// ============================================================================
		if (!API_KEY) {
			console.warn("Weather API key not configured, using mock data");
			
			// Mock OpenWeatherMap One Call API 3.0 response
			const mockApiResponse = {
				lat: lat,
				lon: lng,
				timezone: "Asia/Ho_Chi_Minh",
				timezone_offset: 25200,
				current: {
					dt: Date.now() / 1000,
					sunrise: Date.now() / 1000 - 3600,
					sunset: Date.now() / 1000 + 7200,
					temp: 25 + Math.random() * 10, // 25-35°C
					feels_like: 24 + Math.random() * 10,
					pressure: 1013,
					humidity: 60 + Math.floor(Math.random() * 30), // 60-90%
					dew_point: 20,
					uvi: 5,
					clouds: 40,
					visibility: 10000,
					wind_speed: 2 + Math.random() * 6, // 2-8 m/s
					wind_deg: 180,
					wind_gust: 5,
					weather: [
						{
							id: 803,
							main: ["Clear", "Clouds", "Rain", "Drizzle"][Math.floor(Math.random() * 4)],
							description: [
								"clear sky",
								"few clouds", 
								"scattered clouds",
								"broken clouds",
								"light rain",
								"moderate rain"
							][Math.floor(Math.random() * 6)],
							icon: ["01d", "02d", "03d", "04d", "09d", "10d"][Math.floor(Math.random() * 6)]
						}
					]
				},
				daily: Array.from({ length: 7 }, (_, i) => {
					const dayOffset = i * 86400; // seconds in a day
					return {
						dt: Date.now() / 1000 + dayOffset,
						sunrise: Date.now() / 1000 + dayOffset + 21600,
						sunset: Date.now() / 1000 + dayOffset + 64800,
						temp: {
							min: 20 + Math.floor(Math.random() * 8), // 20-28°C
							max: 28 + Math.floor(Math.random() * 8), // 28-36°C
							day: 26 + Math.floor(Math.random() * 6),
							night: 22 + Math.floor(Math.random() * 4),
						},
						feels_like: {
							day: 26 + Math.floor(Math.random() * 6),
							night: 22 + Math.floor(Math.random() * 4),
						},
						pressure: 1013,
						humidity: 60 + Math.floor(Math.random() * 30),
						wind_speed: 2 + Math.random() * 6,
						uvi: Math.floor(Math.random() * 11), // 0-10 UV index
						weather: [
							{
								id: 800 + Math.floor(Math.random() * 4),
								main: ["Clear", "Clouds", "Rain", "Drizzle"][Math.floor(Math.random() * 4)],
								description: [
									"clear sky",
									"few clouds",
									"scattered clouds",
									"broken clouds",
									"light rain",
									"moderate rain"
								][Math.floor(Math.random() * 6)],
								icon: ["01d", "02d", "03d", "04d", "09d", "10d"][Math.floor(Math.random() * 6)]
							}
						]
					};
				})
			};
			
			// Extract data from mock response
			return {
				temp: Math.round(mockApiResponse.current.temp),
				feels_like: Math.round(mockApiResponse.current.feels_like),
				humidity: mockApiResponse.current.humidity,
				description: mockApiResponse.current.weather[0].description,
				icon: mockApiResponse.current.weather[0].icon,
				wind_speed: Math.round(mockApiResponse.current.wind_speed * 10) / 10,
				location_name: "Sample Location",
				daily: mockApiResponse.daily.map(day => ({
					dt: day.dt,
					temp_min: Math.round(day.temp.min),
					temp_max: Math.round(day.temp.max),
					temp_day: Math.round(day.temp.day),
					icon: day.weather[0].icon,
					description: day.weather[0].description,
					humidity: day.humidity,
					wind_speed: Math.round(day.wind_speed * 10) / 10,
					uv_index: day.uvi,
					feels_like: Math.round(day.feels_like.day),
				})),
			};
		}
		// ============================================================================
		// END MOCK DATA
		// ============================================================================

		// ============================================================================
		// TODO: Uncomment and use this for production with actual API key
		// ============================================================================
		// const response = await fetch(
		// 	`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&exclude=minutely,hourly,daily,alerts`
		// );
		//
		// if (!response.ok) {
		// 	throw new Error("Failed to fetch weather data");
		// }
		//
		// const data = await response.json();
		// return {
		// 	temp: Math.round(data.current.temp),
		// 	feels_like: Math.round(data.current.feels_like),
		// 	humidity: data.current.humidity,
		// 	description: data.current.weather[0].description,
		// 	icon: data.current.weather[0].icon,
		// 	wind_speed: data.current.wind_speed,
		// 	location_name: data.timezone || "Unknown",
		// };
		// ============================================================================

		// Fallback for legacy API (current weather endpoint)
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
		);

		if (!response.ok) {
			throw new Error("Failed to fetch weather data");
		}

		const data = await response.json();
		return {
			temp: Math.round(data.main.temp),
			feels_like: Math.round(data.main.feels_like),
			humidity: data.main.humidity,
			description: data.weather[0].description,
			icon: data.weather[0].icon,
			wind_speed: data.wind.speed,
			location_name: data.name,
		};
	} catch (err) {
		console.error("Weather fetch error:", err);
		return null;
	}
}

export function MapContextMenu({
	position,
	latLng,
	onClose,
	onAddToPlan,
}: MapContextMenuProps) {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [address, setAddress] = useState<string>("");
	const [isLoadingWeather, setIsLoadingWeather] = useState(true);
	const [isLoadingAddress, setIsLoadingAddress] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedDay, setSelectedDay] = useState(0);
	const menuRef = useRef<HTMLDivElement>(null);
	const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y });

	// Fetch both address and weather when latLng changes
	useEffect(() => {
		const loadData = async () => {
			// Reset selected day
			setSelectedDay(0);
			
			// Fetch address
			setIsLoadingAddress(true);
			const addressResult = await fetchAddress(latLng.lat, latLng.lng);
			setAddress(addressResult);
			setIsLoadingAddress(false);

			// Fetch weather
			setIsLoadingWeather(true);
			setError(null);
			const weatherResult = await fetchWeather(latLng.lat, latLng.lng);
			if (weatherResult) {
				setWeather(weatherResult);
			} else {
				setError("Unable to fetch weather data");
			}
			setIsLoadingWeather(false);
		};

		loadData();
	}, [latLng]);

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
	}, [position, weather, isExpanded]); // Re-calculate when position changes, weather loads, or expansion state changes
	
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
				className={`bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
			isExpanded ? 'w-[600px]' : 'w-[280px]'
				}`}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="p-3 border-b border-white/5 flex justify-between items-center">
					<h3 className="text-sm font-bold text-white flex items-center gap-2">
						<FaMapMarkerAlt className="text-emerald-500" />
						Menu
					</h3>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setIsExpanded(!isExpanded)}
							className="text-gray-400 hover:text-white transition"
							title={isExpanded ? "Collapse" : "Expand"}
						>
							<FaExpand size={14} />
						</button>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-white transition"
						>
							<FaTimes size={14} />
						</button>
					</div>
				</div>

				{/* Coordinates */}
				<div className="px-3 py-2 bg-white/5 border-b border-white/5">
				{isLoadingAddress ? (
					<div className="flex items-center gap-2">
						<FaSpinner className="animate-spin text-emerald-500" size={12} />
						<p className="text-xs text-gray-400">Loading address...</p>
					</div>
				) : (
					<>
						{address && (
							<p className={`text-xs text-white font-medium ${!isExpanded ? 'truncate' : ''}`}>
								{address}
							</p>
						)}
					</>
				)}
				</div>

				{/* Weather Section */}
				<div className="p-3 border-b border-white/5">
					<div className="flex items-center gap-2 mb-2">
						<FaCloudSun className="text-blue-400" />
						<h4 className="text-sm font-semibold text-white">Weather</h4>
					</div>

				{isLoadingWeather && (
					<div className="flex items-center justify-center py-4">
						<FaSpinner className="animate-spin text-emerald-500" size={20} />
					</div>
				)}

				{error && (
					<div className="text-xs text-red-400 py-2">{error}</div>
				)}

				{weather && !isLoadingWeather && !error && (
					<>
						{!isExpanded ? (
							// Collapsed View: Only temperature and icon
							<div className="flex items-center gap-3">
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
						) : (
							// Expanded View: Two-column layout with forecast list and detail panel
							<div className="flex gap-3">
								{/* Left Column: 7-Day Forecast List */}
								<div className="flex-shrink-0 w-[180px]">
									<h5 className="text-xs font-semibold text-gray-300 mb-2">7-Day Forecast</h5>
									<div className="space-y-1">
										{weather.daily && weather.daily.map((day, index) => {
											const date = new Date(day.dt * 1000);
											const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
											const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
											const isSelected = selectedDay === index;
											
											return (
												<button
													key={index}
													type="button"
													onClick={() => setSelectedDay(index)}
													className={`w-full flex items-center justify-between rounded-lg p-2 transition-all ${
														isSelected 
															? 'bg-emerald-500/20 border border-emerald-500/40' 
															: 'bg-white/5 hover:bg-white/10'
													}`}
												>
													<div className="flex items-center gap-2 flex-1">
														<img
															src={`https://openweathermap.org/img/wn/${day.icon}.png`}
															alt={day.description}
															className="w-8 h-8"
														/>
														<div className="text-left">
															<p className={`text-xs font-semibold ${
																isSelected ? 'text-emerald-400' : 'text-white'
															}`}>{dayName}</p>
															<p className="text-[10px] text-gray-400">{dateStr}</p>
														</div>
													</div>
													<div className="flex items-center gap-1">
														<span className="text-xs text-gray-400">{day.temp_min}°</span>
														<span className={`text-sm font-semibold ${
															isSelected ? 'text-emerald-400' : 'text-white'
														}`}>{day.temp_max}°</span>
													</div>
												</button>
											);
										})}
									</div>
								</div>

								{/* Right Column: Selected Day Details */}
								{weather.daily && weather.daily[selectedDay] && (
									<div className="flex-1">
										<h5 className="text-xs font-semibold text-gray-300 mb-2">Detailed Forecast</h5>
										<div className="space-y-3">
											{/* Main Weather Display */}
											<div className="bg-white/5 rounded-lg p-3">
												<div className="flex items-start gap-3">
													<img
														src={`https://openweathermap.org/img/wn/${weather.daily[selectedDay].icon}@2x.png`}
														alt={weather.daily[selectedDay].description}
														className="w-16 h-16"
													/>
													<div className="flex-1">
														<p className="text-3xl font-bold text-white mb-1">
															{weather.daily[selectedDay].temp_day}°C
														</p>
														<p className="text-xs text-gray-400 capitalize mb-2">
															{weather.daily[selectedDay].description}
														</p>
														<div className="flex items-center gap-3 text-xs">
															<span className="text-gray-400">H: {weather.daily[selectedDay].temp_max}°</span>
															<span className="text-gray-400">L: {weather.daily[selectedDay].temp_min}°</span>
														</div>
													</div>
												</div>
											</div>

											{/* Weather Details Grid */}
											<div className="grid grid-cols-2 gap-2">
												<div className="bg-white/5 rounded-lg p-2.5">
													<div className="flex items-center gap-1 text-gray-400 text-xs mb-1.5">
														<WiThermometer size={18} />
														<span>Feels Like</span>
													</div>
													<p className="text-lg font-semibold text-white">
														{weather.daily[selectedDay].feels_like}°C
													</p>
												</div>
												<div className="bg-white/5 rounded-lg p-2.5">
													<div className="flex items-center gap-1 text-gray-400 text-xs mb-1.5">
														<WiHumidity size={18} />
														<span>Humidity</span>
													</div>
													<p className="text-lg font-semibold text-white">
														{weather.daily[selectedDay].humidity}%
													</p>
												</div>
												<div className="bg-white/5 rounded-lg p-2.5">
													<div className="flex items-center gap-1 text-gray-400 text-xs mb-1.5">
														<WiStrongWind size={18} />
														<span>Wind Speed</span>
													</div>
													<p className="text-lg font-semibold text-white">
														{weather.daily[selectedDay].wind_speed} m/s
													</p>
												</div>
												<div className="bg-white/5 rounded-lg p-2.5">
													<div className="flex items-center gap-1 text-gray-400 text-xs mb-1.5">
														<FaCloudSun size={14} className="text-yellow-400" />
														<span>UV Index</span>
													</div>
													<p className="text-lg font-semibold text-white">
														{weather.daily[selectedDay].uv_index}
													</p>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						)}
					</>
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
