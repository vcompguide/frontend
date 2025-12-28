"use client";

import { Sdk } from "@/src/backend/RESTful/BackendRESTfulSDK";
import type { LatLng } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaFilter, FaTimes } from "react-icons/fa";
import { AMENITY_TAGS, TagFilter } from "../../components/filters/TagFilters";
import type { PlannerCard } from "./RouteViewer";

interface FilterBoxProps {
	userLocation: LatLng | null;
	plannerCards: PlannerCard[];
	onPOIsFound: (pois: POIResult[]) => void;
}

export interface POIResult {
	id: string;
	name: string;
	lat: number;
	lng: number;
	type: string;
	address?: string;
}

type SearchMode = "current" | "route";

export function FilterBox({ userLocation, plannerCards, onPOIsFound }: FilterBoxProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [searchMode, setSearchMode] = useState<SearchMode>("current");
	const [radius, setRadius] = useState(1000); // meters
	const [isSearching, setIsSearching] = useState(false);
	const filterRef = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
				setIsExpanded(false);
			}
		};

		if (isExpanded) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isExpanded]);

	const handleTagToggle = useCallback((tagId: string) => {
		setSelectedTags((prev) =>
			prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
		);
	}, []);

	const hasRouteCoordinates = plannerCards.some((card) => card.position);

	const handleSearch = useCallback(async () => {
		setIsSearching(true);
		// Empty amenities string means backend returns all available amenities
		const amenities = selectedTags.join(",");

		try {
			if (searchMode === "current") {
				// Single location search
				if (!userLocation) {
					console.error("User location not available");
					return;
				}
                
                const api = new Sdk({
                    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
                    securityWorker: async () => ({
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
                        },
                    }),
                });

                console.log('[FilterBox] Fetching POIs with params:', { lat: userLocation.lat, lng: userLocation.lng, radius, amenities });
				const response = await api.map.mapControllerSearchNearby({
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                    radius,
                    amenities: amenities ? amenities.split(',') : undefined,
                });

				const data = response.data;
				console.log('[FilterBox] Single location API Response:', data);
				// Flatten grouped data into single array
				const poisArray: POIResult[] = [];
				if (data.data && typeof data.data === 'object') {
					for (const category in data.data) {
						const categoryPOIs = data.data[category];
						console.log(`[FilterBox] Processing category ${category}:`, categoryPOIs);
						if (Array.isArray(categoryPOIs)) {
							poisArray.push(...categoryPOIs);
						}
					}
				}
				console.log('[FilterBox] Flattened POI array:', poisArray);
				onPOIsFound(poisArray);
			} else {
				// Multiple locations search (route plan)
				const coordinates = plannerCards
					.filter((card) => card.position)
					.map((card) => ({
						lat: card.position!.lat,
						lng: card.position!.lng,
					}));

				if (coordinates.length === 0) {
					console.error("No coordinates in route plan");
					return;
				}

				const requestBody = amenities
					? { coordinates, radius, amenities }
					: { coordinates, radius };

				console.log('[FilterBox] Bulk request body:', requestBody);
				const response = await fetch("http://localhost:9000/api/map/nearby/bulk", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(requestBody),
				});

				if (!response.ok) {
					throw new Error("Failed to fetch nearby POIs for route");
				}

				const data = await response.json();
				console.log('[FilterBox] Bulk location API Response:', data);
				// Flatten grouped data into single array
				const poisArray: POIResult[] = [];
				if (data.data && Array.isArray(data.data)) {
					for (const location of data.data) {
						if (location.places && typeof location.places === 'object') {
							for (const category in location.places) {
								const categoryPOIs = location.places[category];
								console.log(`[FilterBox] Processing category ${category}:`, categoryPOIs);
								if (Array.isArray(categoryPOIs)) {
									poisArray.push(...categoryPOIs);
								}
							}
						}
					}
				}
				console.log('[FilterBox] Flattened POI array:', poisArray);
				onPOIsFound(poisArray);
			}
		} catch (error) {
			console.error("Error fetching POIs:", error);
		} finally {
			setIsSearching(false);
		}
	}, [selectedTags, searchMode, userLocation, plannerCards, radius, onPOIsFound]);

	const handleClearFilters = useCallback(() => {
		setSelectedTags([]);
		onPOIsFound([]);
	}, [onPOIsFound]);

	return (
		<div ref={filterRef} className="relative pointer-events-auto">
			{/* Filter Button */}
			{!isExpanded && (
				<button
					type="button"
					onClick={() => setIsExpanded(true)}
					className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg hover:bg-[#2a2a2a] transition-all"
				>
					<FaFilter className="text-emerald-500" />
					<span className="text-sm font-medium text-white">Filters</span>
					{selectedTags.length > 0 && (
						<span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-bold">
							{selectedTags.length}
						</span>
					)}
				</button>
			)}

			{/* Expanded Filter Panel */}
			{isExpanded && (
				<div className="w-[400px] bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
					{/* Header */}
					<div className="p-4 border-b border-white/5 flex justify-between items-center">
						<div className="flex items-center gap-2">
							<FaFilter className="text-emerald-500" />
							<h3 className="text-sm font-bold text-white">Search Filters</h3>
						</div>
						<button
							type="button"
							onClick={() => setIsExpanded(false)}
							className="text-gray-400 hover:text-white transition"
						>
							<FaTimes size={14} />
						</button>
					</div>

					{/* Content */}
					<div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
						{/* Tags Section */}
						<div>
							<label className="text-xs font-semibold text-gray-300 mb-2 block uppercase tracking-wider">
								Categories
							</label>
							<div className="grid grid-cols-2 gap-2">
								{AMENITY_TAGS.map((tag) => (
									<TagFilter
										key={tag.id}
										tag={tag}
										isSelected={selectedTags.includes(tag.id)}
										onToggle={handleTagToggle}
									/>
								))}
							</div>
						</div>

						{/* Search Mode */}
						<div>
							<label className="text-xs font-semibold text-gray-300 mb-2 block uppercase tracking-wider">
								Search Around
							</label>
							<div className="grid grid-cols-2 gap-2">
								<button
									type="button"
									onClick={() => setSearchMode("current")}
									disabled={!userLocation}
									className={`p-3 rounded-lg border-2 transition-all ${
										searchMode === "current"
											? "bg-emerald-500/20 border-emerald-500 text-white"
											: "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
									} ${!userLocation ? "opacity-50 cursor-not-allowed" : ""}`}
								>
									<span className="material-symbols-outlined text-2xl mb-1">
										my_location
									</span>
									<p className="text-xs font-medium">Current Location</p>
								</button>
								<button
									type="button"
									onClick={() => setSearchMode("route")}
									disabled={!hasRouteCoordinates}
									className={`p-3 rounded-lg border-2 transition-all ${
										searchMode === "route"
											? "bg-emerald-500/20 border-emerald-500 text-white"
											: "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
									} ${!hasRouteCoordinates ? "opacity-50 cursor-not-allowed blur-[1px]" : ""}`}
								>
									<span className="material-symbols-outlined text-2xl mb-1">
										route
									</span>
									<p className="text-xs font-medium">Route Plan</p>
								</button>
							</div>
						</div>

						{/* Radius Slider - Horizontal */}
						<div>
							<label className="text-xs font-semibold text-gray-300 mb-3 block uppercase tracking-wider">
								Search Radius
							</label>
							<div className="space-y-3">
								{/* Large display badge */}
								<div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40 rounded-xl p-4 text-center backdrop-blur-sm">
									<div className="text-xs text-emerald-400 font-semibold mb-1 uppercase tracking-wider">Current Radius</div>
									<div className="text-3xl font-bold text-white mb-1">
										{radius >= 1000 ? (radius / 1000).toFixed(1) : radius}
									</div>
									<div className="text-sm text-emerald-300 font-medium">
										{radius >= 1000 ? 'kilometers' : 'meters'}
									</div>
								</div>
								
								{/* Horizontal slider container */}
								<div className="relative py-2">
									<input
										type="range"
										min="100"
										max="5000"
										step="50"
										value={radius}
										onChange={(e) => setRadius(Number(e.target.value))}
										className="horizontal-slider w-full h-2 appearance-none cursor-pointer rounded-full"
									/>
									{/* Markers below slider */}
									<div className="flex justify-between mt-2 px-1">
										<span className="text-[10px] text-gray-400">1m</span>
										<span className="text-[10px] text-gray-500">1km</span>
										<span className="text-[10px] text-gray-500">2.5km</span>
										<span className="text-[10px] text-emerald-400 font-semibold">5km</span>
									</div>
								</div>
								
								{/* Number input */}
								<div className="relative">
									<input
									type="text"
									inputMode="numeric"
									value={radius === 0 ? '' : radius}
									onChange={(e) => {
										const value = e.target.value;
										// Only accept digits, allow empty for deletion
										if (value === '') {
											setRadius(0);
										} else if (/^\d+$/.test(value)) {
											setRadius(parseInt(value, 10));
										}
									}}
									onBlur={(e) => {
										// Validate and enforce constraints when done editing
										const value = e.target.value;
										const numValue = parseInt(value, 10);
										if (isNaN(numValue) || numValue < 1) {
											setRadius(1);
										} else if (numValue > 5000) {
											setRadius(5000);
										} else {
											setRadius(numValue);
										}
										}}
										className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
									/>
								</div>
								<div className="grid grid-cols-4 gap-2">
									{[500, 1000, 2000, 3000].map((preset) => (
										<button
											key={preset}
											type="button"
											onClick={() => setRadius(preset)}
											className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
												radius === preset
													? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
													: 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
											}`}
										>
											{preset >= 1000 ? `${preset / 1000}km` : `${preset}m`}
										</button>
									))}
								</div>
							</div>
						</div>
						
						<style jsx>{`
							.custom-scrollbar::-webkit-scrollbar {
								width: 8px;
							}
							
							.custom-scrollbar::-webkit-scrollbar-track {
								background: rgba(255, 255, 255, 0.05);
								border-radius: 10px;
								margin: 4px 0;
							}
							
							.custom-scrollbar::-webkit-scrollbar-thumb {
								background: linear-gradient(180deg, #10b981 0%, #059669 100%);
								border-radius: 10px;
								border: 2px solid rgba(30, 30, 30, 0.5);
								transition: all 0.3s ease;
							}
							
							.custom-scrollbar::-webkit-scrollbar-thumb:hover {
								background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
								border-color: rgba(30, 30, 30, 0.3);
								box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
							}
							
							.custom-scrollbar::-webkit-scrollbar-thumb:active {
								background: linear-gradient(180deg, #059669 0%, #047857 100%);
							}
							
							/* Firefox scrollbar */
							.custom-scrollbar {
								scrollbar-width: thin;
								scrollbar-color: #10b981 rgba(255, 255, 255, 0.05);
							}
						
							.horizontal-slider {
								background: linear-gradient(to right, 
									#10b981 0%, 
									#10b981 ${((radius - 100) / 4900) * 100}%, 
									rgba(255,255,255,0.1) ${((radius - 100) / 4900) * 100}%, 
									rgba(255,255,255,0.1) 100%
								);
								outline: none;
								box-shadow: inset 0 1px 4px rgba(0,0,0,0.3), 0 0 10px rgba(16, 185, 129, 0.2);
							}
							
							.horizontal-slider::-webkit-slider-thumb {
								-webkit-appearance: none;
								appearance: none;
								width: 24px;
								height: 24px;
								background: linear-gradient(135deg, #10b981 0%, #059669 100%);
								border: 3px solid rgba(255, 255, 255, 0.95);
								border-radius: 50%;
								cursor: pointer;
								box-shadow: 
									0 4px 12px rgba(16, 185, 129, 0.5),
									0 0 0 0 rgba(16, 185, 129, 0.4),
									inset 0 1px 0 rgba(255,255,255,0.3);
								transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
							}
							
							.horizontal-slider::-webkit-slider-thumb:hover {
								transform: scale(1.2);
								box-shadow: 
									0 6px 16px rgba(16, 185, 129, 0.7),
									0 0 0 6px rgba(16, 185, 129, 0.15),
									inset 0 1px 0 rgba(255,255,255,0.4);
								border-width: 4px;
							}
							
							.horizontal-slider::-webkit-slider-thumb:active {
								transform: scale(1.1);
								box-shadow: 
									0 2px 8px rgba(16, 185, 129, 0.9),
									0 0 0 8px rgba(16, 185, 129, 0.25),
									inset 0 1px 0 rgba(255,255,255,0.5);
							}
							
							.horizontal-slider::-moz-range-thumb {
								width: 24px;
								height: 24px;
								background: linear-gradient(135deg, #10b981 0%, #059669 100%);
								border: 3px solid rgba(255, 255, 255, 0.95);
								border-radius: 50%;
								cursor: pointer;
								box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
								transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
							}
							
							.horizontal-slider::-moz-range-thumb:hover {
								transform: scale(1.2);
								box-shadow: 0 6px 16px rgba(16, 185, 129, 0.7);
							}
							
							.horizontal-slider::-moz-range-track {
								background: transparent;
								border: none;
							}
						`}</style>
					</div>

					{/* Footer Actions */}
					<div className="p-3 border-t border-white/5 flex gap-2">
						<button
							type="button"
							onClick={handleClearFilters}
							className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-lg text-sm transition"
						>
							Clear
						</button>
						<button
							type="button"
							onClick={handleSearch}
							disabled={isSearching}
							className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition"
						>
							{isSearching ? "Searching..." : "Search"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
