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
                    baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:9000",
                    securityWorker: async () => ({
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY || "taylorswefts"}`,
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
					<div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
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

						{/* Radius Slider */}
						<div>
							<label className="text-xs font-semibold text-gray-300 mb-2 block uppercase tracking-wider">
								Search Radius
							</label>
							<div className="space-y-2">
								<input
									type="range"
									min="1"
									max="5000"
									value={radius}
									onChange={(e) => setRadius(Number(e.target.value))}
									className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
								/>
								<div className="flex items-center gap-2">
									<input
										type="number"
										min="1"
										max="5000"
										value={radius}
										onChange={(e) => setRadius(Number(e.target.value))}
										className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
									/>
									<span className="text-sm text-gray-400 font-medium">meters</span>
								</div>
							</div>
						</div>
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
