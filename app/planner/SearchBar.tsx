import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

interface SearchResult {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
}

export default function SearchBar({
	externalQuery,
	onClearQuery,
}: {
	externalQuery: string;
	onClearQuery: () => void;
}) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);

	// 1. React to changes from the "Import Title" button on cards
	useEffect(() => {
		if (externalQuery) {
			setQuery(externalQuery);
			handleSearch(externalQuery);
			onClearQuery(); // Reset parent state so we can click the same card again
		}
	}, [externalQuery]);

	const handleSearch = async (searchTerm: string) => {
		if (!searchTerm) {
			setResults([]);
			return;
		}
		try {
			// Fetching from OSM Nominatim API
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`,
			);
			const data = await response.json();

			// 3. LIMIT TO 5 RELEVANT POSITIONS
			setResults(data.slice(0, 5));
		} catch (e) {
			console.error("Search failed", e);
		} finally {
		}
	};

	return (
		<div className="relative w-full max-w-md z-50">
			{/* Input Field */}
			<div className="flex items-center bg-white rounded-full shadow-lg px-4 py-2 border border-gray-200">
				<FaSearch className="text-gray-400 mr-2" />
				<input
					className="grow outline-none text-gray-700 bg-transparent"
					placeholder="Search for a location..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						// Optional: Debounce this in production
						handleSearch(e.target.value);
					}}
				/>
			</div>

			{/* Results Dropdown */}
			{results.length > 0 && (
				<div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
					{results.map((result) => (
						<button
							type="button"
							key={result.place_id}
							className="flex items-start text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition"
							onClick={() => {
								setQuery(result.display_name.split(",")[0]); // Just take the main name
								setResults([]); // Close dropdown
								console.log("Selected:", result);
							}}
						>
							<FaMapMarkerAlt className="mt-1 text-red-500 mr-3 shrink-0" />
							<div className="text-sm text-gray-600 line-clamp-2">
								{result.display_name}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
