"use client";

import { Sdk } from "@/src/backend/RESTful/BackendRESTfulSDK";
import type { LatLng } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

interface SearchResult {
	id: number;
	name: string;
	lat: number;
	lng: number;
	type: string;
	icon?: string;
}

export interface SearchResultMarker {
	place_id: number;
	display_name: string;
	lat: number;
	lng: number;
	type: string;
}

interface SearchBoxProps {
	onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
	onSearchResultsChange?: (results: SearchResultMarker[]) => void;
}

export function SearchBox({ onLocationSelect, onSearchResultsChange }: SearchBoxProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const searchRef = useRef<HTMLDivElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Search function using Nominatim (OpenStreetMap)
	const searchLocation = useCallback(async (searchQuery: string) => {
		if (!searchQuery.trim()) {
			setResults([]);
			if (onSearchResultsChange) {
				onSearchResultsChange([]);
			}
			return;
		}

		setIsLoading(true);
		try {
			const searchCallString =`http://localhost:9000/api/map/search?q=${encodeURIComponent(searchQuery)}&limit=5`
			console.log(searchCallString) ;
			const api = new Sdk({
				baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
				securityWorker: async () => ({
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
					},
				}),
			})
			const response = await api.map.mapControllerSearchPlace({q: searchQuery, limit: 5});				
			
			console.log("Search results:", response.data);
			const resultsData = response.data.data || [];
			
			const mappedResults: SearchResult[] = resultsData.map((result: any, index: number) => ({
				id: result.id ? Number(result.id) : index,
				name: result.name,
				lat: result.lat,
				lng: result.lng,
				type: result.type,
				icon: result.icon
			}));
			
			setResults(mappedResults);
			setShowResults(true);
			
			// Notify parent of search results for map markers
			if (onSearchResultsChange) {
				const markers: SearchResultMarker[] = mappedResults.map((result) => ({
					place_id: result.id,
					display_name: result.name,
					lat: result.lat,
					lng: result.lng,
					type: result.type 
				}));
				console.log('Sending search markers to parent:', markers);
				onSearchResultsChange(markers);
			}
		} catch (error) {
			console.error("Search error:", error);
			setResults([]);
			if (onSearchResultsChange) {
				onSearchResultsChange([]);
			}
		} finally {
			setIsLoading(false);
		}
	}, [onSearchResultsChange]);

	// Debounced search
	useEffect(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		if (query.trim()) {
			debounceTimerRef.current = setTimeout(() => {
				searchLocation(query);
			}, 500); // Wait 500ms after user stops typing
		} else {
			setResults([]);
			setShowResults(false);
			setSelectedIndex(-1);
			if (onSearchResultsChange) {
				onSearchResultsChange([]);
			}
		}

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [query, searchLocation]);

	// Reset selected index when results change
	useEffect(() => {
		setSelectedIndex(-1);
		resultRefs.current = [];
	}, [results]);

	// Scroll selected item into view
	useEffect(() => {
		if (selectedIndex >= 0 && resultRefs.current[selectedIndex]) {
			resultRefs.current[selectedIndex]?.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth'
			});
		}
	}, [selectedIndex]);

	// Close results when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setShowResults(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleResultClick = (result: SearchResult) => {
		const location = {
			lat: result.lat,
			lng: result.lng,
			name: result.name
		};
		
		if (onLocationSelect) {
			onLocationSelect(location);
		}
		
		setQuery(result.name.split(",")[0]); // Set to the main location name
		setShowResults(false);
		setSelectedIndex(-1);
	};

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// Always prevent default behavior for arrow keys to disable cursor movement
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
		}

		if (!showResults || results.length === 0) return;

		switch (e.key) {
			case 'ArrowDown':
				setSelectedIndex((prev) => 
					prev < results.length - 1 ? prev + 1 : prev
				);
				break;
			case 'ArrowUp':
				setSelectedIndex((prev) => 
					prev > 0 ? prev - 1 : -1
				);
				break;
			case 'Enter':
				e.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < results.length) {
					handleResultClick(results[selectedIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				setShowResults(false);
				setSelectedIndex(-1);
				break;
		}
	};

	return (
		<div ref={searchRef} className="relative w-1/3 min-w-[300px]">
			<div className="relative">
				<FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => results.length > 0 && setShowResults(true)}
					onKeyDown={handleKeyDown}
					className="w-full h-12 bg-[#1e1e1e]/90 backdrop-blur-md pl-12 pr-4 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
					placeholder="Search places..."
				/>
				{isLoading && (
					<div className="absolute right-4 top-1/2 -translate-y-1/2">
						<div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
					</div>
				)}
			</div>

			{/* Results dropdown */}
			{showResults && results.length > 0 && (
				<div className="absolute top-full mt-2 w-full bg-[#1e1e1e]/95 backdrop-blur-md rounded-2xl border border-gray-700 overflow-hidden shadow-2xl max-h-96 overflow-y-auto">
					{results.map((result, index) => (
						<button
							key={result.id}
							ref={(el) => {
								resultRefs.current[index] = el;
							}}
							type="button"
							onClick={() => handleResultClick(result)}
							className={`w-full px-4 py-3 flex items-start gap-3 transition-colors border-b border-gray-800 last:border-b-0 text-left group ${
								selectedIndex === index ? 'bg-emerald-500/30 ring-2 ring-emerald-500/50' : 'hover:bg-emerald-500/10'
							}`}
						>
							<div className="mt-1 shrink-0">
								<FaMapMarkerAlt className="text-emerald-500 group-hover:text-emerald-400" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-white truncate">
									{result.name.split(",")[0]}
								</p>
								<p className="text-xs text-gray-400 truncate mt-0.5">
									{result.name.split(",").slice(1).join(",")}
								</p>
								<p className="text-xs text-gray-500 mt-1">
									{result.type}
								</p>
							</div>
						</button>
					))}
				</div>
			)}

			{/* No results message */}
			{showResults && !isLoading && query.trim() && results.length === 0 && (
				<div className="absolute top-full mt-2 w-full bg-[#1e1e1e]/95 backdrop-blur-md rounded-2xl border border-gray-700 p-4 text-center shadow-2xl">
					<p className="text-sm text-gray-400">No locations found</p>
				</div>
			)}
		</div>
	);
}
