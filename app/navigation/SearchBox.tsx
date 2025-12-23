"use client";

import type { LatLng } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

interface SearchResult {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
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
	const searchRef = useRef<HTMLDivElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout>();

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
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
				{
					headers: {
						'User-Agent': 'ViComp Navigation App'
					}
				}
			);
			
			if (response.ok) {
				const data = await response.json();
				setResults(data);
				setShowResults(true);
				
				// Notify parent of search results for map markers
				if (onSearchResultsChange) {
					const markers: SearchResultMarker[] = data.map((result: SearchResult) => ({
						place_id: result.place_id,
						display_name: result.display_name,
						lat: parseFloat(result.lat),
						lng: parseFloat(result.lon),
						type: result.type
					}));
					console.log('Sending search markers to parent:', markers);
					onSearchResultsChange(markers);
				}
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
			lat: parseFloat(result.lat),
			lng: parseFloat(result.lon),
			name: result.display_name
		};
		
		if (onLocationSelect) {
			onLocationSelect(location);
		}
		
		setQuery(result.display_name.split(",")[0]); // Set to the main location name
		setShowResults(false);
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
					{results.map((result) => (
						<button
							key={result.place_id}
							type="button"
							onClick={() => handleResultClick(result)}
							className="w-full px-4 py-3 flex items-start gap-3 hover:bg-emerald-500/10 transition-colors border-b border-gray-800 last:border-b-0 text-left group"
						>
							<div className="mt-1 flex-shrink-0">
								<FaMapMarkerAlt className="text-emerald-500 group-hover:text-emerald-400" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-white truncate">
									{result.display_name.split(",")[0]}
								</p>
								<p className="text-xs text-gray-400 truncate mt-0.5">
									{result.display_name.split(",").slice(1).join(",")}
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
