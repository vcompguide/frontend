"use client";

import type { LatLng } from "leaflet";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaCloudSun, FaExpand, FaMapMarkerAlt, FaSpinner, FaTimes } from "react-icons/fa";
import { WiHumidity, WiStrongWind, WiThermometer } from "react-icons/wi";
import { fetchAddress } from "./MapContextMenu";

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

interface MarkerPopupContentProps {
	title: string;
	subtitle?: string;
	latLng: LatLng;
	onAddToPlan: (position: LatLng) => void;
	showType?: string;
	onClose?: () => void;
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
	try {
		const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
		
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

export function MarkerPopupContent({
	title,
	subtitle,
	latLng,
	onAddToPlan,
	showType,
	onClose,
}: MarkerPopupContentProps) {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [address, setAddress] = useState<string>("");
	const [isLoadingWeather, setIsLoadingWeather] = useState(true);
	const [isLoadingAddress, setIsLoadingAddress] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedDay, setSelectedDay] = useState(0);
	const menuRef = useRef<HTMLDivElement>(null);

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

	return (
		<div
			ref={menuRef}
			className={`bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 w-80			}`}
		>
			{/* Header */}
			<div className="p-2 border-b border-white/5 flex justify-between items-center">
				<h3 className="text-sm font-bold text-white flex items-center gap-2">
					<FaMapMarkerAlt className="text-emerald-500" />
					{title}
				</h3>
				<div className="flex items-center gap-0 ">
					{onClose && (
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-white transition p-1"
						>
							<FaTimes size={14} />
						</button>
					)}
				</div>
			</div>

			{subtitle && (
				<div className="px-2 py-1 bg-white/5 border-b border-white/5">
					<p className="text-xs text-gray-400 truncate">{subtitle}</p>
				</div>
			)}

			{/* Weather Section */}
			{/* <div className="px-2 py-1.5 border-b border-white/5">
				<div className="flex items-center gap-2 mb-1">
					<FaCloudSun className="text-blue-400" />
					<h4 className="text-sm font-semibold text-white">Weather</h4>
				</div>

				{isLoadingWeather && (
					<div className="flex items-center justify-center py-2">
						<FaSpinner className="animate-spin text-emerald-500" size={20} />
					</div>
				)}

				{error && (
					<div className="text-xs text-red-400 py-1">{error}</div>
				)}

				{weather && !isLoadingWeather && !error && (
					<>
						{!isExpanded ? (
							// Collapsed View: Only temperature and icon
							<div className="flex items-center gap-1">
								<img
									src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
									alt={weather.description}
									className="w-10 h-10"
								/>
								<div className="flex-1">
									<p className="text-xl font-bold text-white leading-none">
										{weather.temp}°C
									</p>
									<p className="text-xs text-gray-400 capitalize leading-tight mt-0.5">
										{weather.description}
									</p>
								</div>
							</div>
						) : (
							// Expanded View: Two-column layout with forecast list and detail panel
							<div className="flex gap-3">
								{/* Left Column: 7-Day Forecast List *
								<div className="shrink-0 w-[180px]">
									<h5 className="text-xs font-semibold text-gray-300 mb-1.5">7-Day Forecast</h5>
									<div className="space-y-0.5">
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
													className={`w-full flex items-center justify-between rounded-lg p-1.5 transition-all ${
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

								{/* Right Column: Selected Day Details *}
								{weather.daily && weather.daily[selectedDay] && (
									<div className="flex-1">
										<h5 className="text-xs font-semibold text-gray-300 mb-1.5">Detailed Forecast</h5>
										<div className="space-y-2">
											{/* Main Weather Display *}
											<div className="bg-white/5 rounded-lg p-2">
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
														<p className="text-xs text-gray-400 capitalize mb-1">
															{weather.daily[selectedDay].description}
														</p>
														<div className="flex items-center gap-3 text-xs">
															<span className="text-gray-400">H: {weather.daily[selectedDay].temp_max}°</span>
															<span className="text-gray-400">L: {weather.daily[selectedDay].temp_min}°</span>
														</div>
													</div>
												</div>
											</div>

											{/* Weather Details Grid *}
											<div className="grid grid-cols-2 gap-1.5">
												<div className="bg-white/5 rounded-lg p-1.5">
													<div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
														<WiThermometer size={16} />
														<span>Feels Like</span>
													</div>
													<p className="text-base font-semibold text-white">
														{weather.daily[selectedDay].feels_like}°C
													</p>
												</div>
												<div className="bg-white/5 rounded-lg p-1.5">
													<div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
														<WiHumidity size={16} />
														<span>Humidity</span>
													</div>
													<p className="text-base font-semibold text-white">
														{weather.daily[selectedDay].humidity}%
													</p>
												</div>
												<div className="bg-white/5 rounded-lg p-1.5">
													<div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
														<WiStrongWind size={16} />
														<span>Wind Speed</span>
													</div>
													<p className="text-base font-semibold text-white">
														{weather.daily[selectedDay].wind_speed} m/s
													</p>
												</div>
												<div className="bg-white/5 rounded-lg p-1.5">
													<div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
														<FaCloudSun size={12} className="text-yellow-400" />
														<span>UV Index</span>
													</div>
													<p className="text-base font-semibold text-white">
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
			</div> */}

			{/* Actions */}
			<div className="p-1.5">
				<button
					type="button"
					onClick={() => {
						onAddToPlan(latLng);
						if (onClose) {
							onClose();
						}
					}}
					className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-1.5 px-3 rounded-lg text-sm transition flex items-center justify-center gap-2"
				>
					<FaMapMarkerAlt size={14} />
					Add to Current Route
				</button>
			</div>
		</div>
	);
}
