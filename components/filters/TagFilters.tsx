"use client";

export interface AmenityTag {
	id: string;
	label: string;
	icon: string; // Material Symbols icon name
	color: string;
}

export const AMENITY_TAGS: AmenityTag[] = [
	{
		id: "museum",
		label: "Museum",
		icon: "museum",
		color: "#8b5cf6",
	},
	{
		id: "history",
		label: "History",
		icon: "history_edu",
		color: "#a855f7",
	},
	{
		id: "park",
		label: "Park",
		icon: "park",
		color: "#22c55e",
	},
	{
		id: "nature",
		label: "Nature",
		icon: "forest",
		color: "#16a34a",
	},
	{
		id: "landmark",
		label: "Landmark",
		icon: "location_city",
		color: "#f59e0b",
	},
	{
		id: "tourism",
		label: "Tourism",
		icon: "tour",
		color: "#06b6d4",
	},
	{
		id: "zoo",
		label: "Zoo",
		icon: "pets",
		color: "#f97316",
	},
	{
		id: "hotel",
		label: "Hotel",
		icon: "hotel",
		color: "#3b82f6",
	},
	{
		id: "restaurant",
		label: "Restaurant",
		icon: "restaurant",
		color: "#ef4444",
	},
	{
		id: "cafe",
		label: "Café",
		icon: "local_cafe",
		color: "#f59e0b",
	},
	{
		id: "gas_station",
		label: "Gas Station",
		icon: "local_gas_station",
		color: "#10b981",
	},
	{
		id: "parking",
		label: "Parking",
		icon: "local_parking",
		color: "#6366f1",
	},
	{
		id: "hospital",
		label: "Hospital",
		icon: "local_hospital",
		color: "#ec4899",
	},
	{
		id: "pharmacy",
		label: "Pharmacy",
		icon: "local_pharmacy",
		color: "#14b8a6",
	},
	{
		id: "atm",
		label: "ATM",
		icon: "local_atm",
		color: "#8b5cf6",
	},
	{
		id: "shopping",
		label: "Shopping",
		icon: "shopping_cart",
		color: "#f97316",
	},
	{
		id: "bank",
		label: "Bank",
		icon: "account_balance",
		color: "#06b6d4",
	},
	{
		id: "school",
		label: "School",
		icon: "school",
		color: "#fbbf24",
	},
	{
		id: "place_of_worship",
		label: "Place of Worship",
		icon: "church",
		color: "#a855f7",
	},
];

// Map backend amenity types to our tag IDs (handles variations and additional types)
export const AMENITY_TYPE_MAP: Record<string, string> = {
	// City-wide POI tags
	museum: "museum",
	history: "history",
	park: "park",
	nature: "nature",
	landmark: "landmark",
	tourism: "tourism",
	zoo: "zoo",
	
	// Accommodation
	hotel: "hotel",
	motel: "hotel",
	hostel: "hotel",
	guesthouse: "hotel",
	lodging: "hotel",
	
	// Food & Drink
	restaurant: "restaurant",
	cafe: "cafe",
	bar: "restaurant",
	pub: "restaurant",
	food_court: "restaurant",
	fast_food: "restaurant",
	bistro: "restaurant",
	
	// Transportation
	gas_station: "gas_station",
	fuel: "gas_station",
	charging_station: "gas_station",
	parking: "parking",
	parking_space: "parking",
	bicycle_parking: "parking",
	
	// Healthcare
	hospital: "hospital",
	clinic: "hospital",
	doctors: "hospital",
	dentist: "hospital",
	pharmacy: "pharmacy",
	
	// Finance
	bank: "bank",
	atm: "atm",
	bureau_de_change: "bank",
	
	// Shopping
	supermarket: "shopping",
	convenience: "shopping",
	shop: "shopping",
	mall: "shopping",
	marketplace: "shopping",
	
	// Education
	school: "school",
	kindergarten: "school",
	college: "school",
	university: "school",
	
	// Religion
	place_of_worship: "place_of_worship",
	church: "place_of_worship",
	mosque: "place_of_worship",
	temple: "place_of_worship",
	synagogue: "place_of_worship",
};

// Helper function to get icon/color for any amenity type
export function getAmenityIcon(amenityType: string): { icon: string; color: string; label: string } {
	console.log('[TagFilters] Getting icon for amenity type:', amenityType);
	
	// Direct match
	const tag = AMENITY_TAGS.find(t => t.id === amenityType);
	if (tag) {
		console.log('[TagFilters] Direct match found:', tag);
		return { icon: tag.icon, color: tag.color, label: tag.label };
	}
	
	// Check mapped type
	const mappedType = AMENITY_TYPE_MAP[amenityType];
	if (mappedType) {
		console.log('[TagFilters] Mapped type found:', amenityType, '->', mappedType);
		const mappedTag = AMENITY_TAGS.find(t => t.id === mappedType);
		if (mappedTag) {
			console.log('[TagFilters] Mapped tag found:', mappedTag);
			return { icon: mappedTag.icon, color: mappedTag.color, label: mappedTag.label };
		}
	}
	
	// Default fallback
	console.log('[TagFilters] No match found, using default for:', amenityType);
	return {
		icon: "place",
		color: "#9ca3af",
		label: amenityType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
	};
}

interface TagFilterProps {
	tag: AmenityTag;
	isSelected: boolean;
	onToggle: (tagId: string) => void;
}

export function TagFilter({ tag, isSelected, onToggle }: TagFilterProps) {
	return (
		<button
			type="button"
			onClick={() => onToggle(tag.id)}
			className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
				isSelected
					? "bg-white/20 border-2 scale-105"
					: "bg-white/5 border-2 border-transparent hover:bg-white/10"
			}`}
			style={{
				borderColor: isSelected ? tag.color : "transparent",
			}}
		>
			<span
				className="material-symbols-outlined text-[25px]"
				style={{ color: tag.color }}
			>
				{tag.icon}
			</span>
			<span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
				{tag.label}
			</span>
		</button>
	);
}
