import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { LatLng } from "leaflet";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	FaChevronLeft,
	FaChevronRight,
	FaEdit,
	FaMapMarkerAlt,
	FaPlus,
	FaSearch,
	FaTimes,
	FaTrash,
} from "react-icons/fa";
import { uuidv7 } from "uuidv7";

// Dynamic import for map to avoid SSR issues
const LeafletMap = dynamic(() => import("./map"), {
	ssr: false,
	loading: () => <div className="w-full h-full bg-[#1a1a1a] animate-pulse" />,
});

export interface PlannerCard {
	id: string;
	title: string;
	description: string;
	priority: "low" | "medium" | "high";
	color: string;
	tags: string[];
	position?: LatLng;
}

interface SidePlannerProps {
	isOpen: boolean;
	onToggle: () => void;
	onPickCardLocation?: (callback: (position: LatLng) => void) => void;
	onCardsChange?: (cards: PlannerCard[]) => void;
}

const COLOR_OPTIONS = [
	"#ef4444", // red
	"#f97316", // orange
	"#eab308", // yellow
	"#22c55e", // green
	"#06b6d4", // cyan
	"#3b82f6", // blue
	"#8b5cf6", // purple
	"#ec4899", // pink
	"#6b7280", // gray
	"#ffffff", // white
];

interface SearchResult {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
}

// Location search component
function LocationSearch({
	onLocationHighlight,
}: {
	onLocationHighlight: (lat: number, lng: number) => void;
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [showResults, setShowResults] = useState(false);
	const [selectedPosition, setSelectedPosition] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	const handleSearch = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!searchQuery.trim()) return;

			try {
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
						searchQuery,
					)}&limit=10`,
				);
				const data = await response.json();
				setSearchResults(data);
				setShowResults(true);
			} catch (error) {
				console.error("Search failed:", error);
			}
		},
		[searchQuery],
	);

	const handleSelectResult = useCallback(
		(result: SearchResult) => {
			const lat = parseFloat(result.lat);
			const lng = parseFloat(result.lon);
			setSelectedPosition({ lat, lng });
			setShowResults(false);
			// Jump to location on the map instead of selecting it
			onLocationHighlight(lat, lng);
		},
		[onLocationHighlight],
	);

	return (
		<div className="flex flex-col gap-3 mb-4">
			<form onSubmit={handleSearch} className="flex gap-2">
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search for a location..."
					className="flex-1 bg-[#1e1e1e] text-white rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-blue-500 text-sm"
				/>
				<button
					type="submit"
					className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition flex items-center gap-2"
				>
					<FaSearch size={14} />
				</button>
			</form>

			{showResults && searchResults.length > 0 && (
				<div className="bg-[#1e1e1e] border border-white/10 rounded-lg max-h-48 overflow-y-auto">
					{searchResults.map((result) => (
						<button
							key={result.place_id}
							type="button"
							onClick={() => handleSelectResult(result)}
							className="w-full text-left px-3 py-2 hover:bg-blue-500/20 border-b border-white/5 last:border-0 transition flex items-center gap-2"
						>
							<FaMapMarkerAlt size={12} className="text-blue-400 shrink-0" />
							<span className="text-xs text-gray-300 truncate">
								{result.display_name}
							</span>
						</button>
					))}
				</div>
			)}

			{selectedPosition && (
				<div className="text-xs text-emerald-300 flex items-center gap-2">
					<FaMapMarkerAlt size={12} />
					Selected: {selectedPosition.lat.toFixed(4)},{" "}
					{selectedPosition.lng.toFixed(4)}
				</div>
			)}
		</div>
	);
}

interface CardEditModalProps {
	card: PlannerCard;
	isOpen: boolean;
	onClose: () => void;
	onSave: (card: PlannerCard) => void;
	onPickLocation: (
		cardId: string,
		callback: (position: LatLng) => void,
	) => void;
	isPickingLocation: boolean;
	onPickingLocationChange?: (cardId: string | null) => void;
}

function CardEditModal({
	card,
	isOpen,
	onClose,
	onSave,
	onPickLocation,
	isPickingLocation,
	onPickingLocationChange,
}: CardEditModalProps) {
	const [editedCard, setEditedCard] = useState<PlannerCard>(card);
	const [tagInput, setTagInput] = useState("");
	const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();

	// Update edited card when prop changes to keep it in sync
	useEffect(() => {
		setEditedCard(card);
	}, [card]);

	const handleSave = useCallback(() => {
		onSave(editedCard);
		onClose();
	}, [editedCard, onSave, onClose]);

	const handleAddTag = useCallback(() => {
		if (tagInput.trim() && !editedCard.tags.includes(tagInput.trim())) {
			setEditedCard({
				...editedCard,
				tags: [...editedCard.tags, tagInput.trim()],
			});
			setTagInput("");
		}
	}, [tagInput, editedCard]);

	const handleRemoveTag = useCallback(
		(tag: string) => {
			setEditedCard({
				...editedCard,
				tags: editedCard.tags.filter((t) => t !== tag),
			});
		},
		[editedCard],
	);

	const handlePickLocation = useCallback(() => {
		// Set up location picking with callback to update card
		// Modal stays open so user can see location update in real-time
		onPickLocation(card.id, (position: LatLng) => {
			setEditedCard((prev) => ({ ...prev, position }));
		});
	}, [card.id, onPickLocation]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop - disabled when picking location to allow map interaction */}
			<button
				type="button"
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
				aria-label="Close modal"
				disabled={isPickingLocation}
				style={{ pointerEvents: isPickingLocation ? "none" : "auto" }}
			/>

			{/* Container for modal and map side-by-side */}
			<div className="relative flex w-full h-full max-w-6xl max-h-[90vh] gap-4 p-4">
				{/* Modal */}
				<div
					className={`relative bg-[#2a2a2a] rounded-2xl p-6 shadow-2xl border transition-all flex flex-col ${
						isPickingLocation
							? "w-1/3 border-blue-500"
							: "w-full border-white/10 max-w-md"
					}`}
				>
					{/* Close Button */}
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 text-gray-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Close"
						disabled={isPickingLocation}
						style={{ pointerEvents: isPickingLocation ? "none" : "auto" }}
					>
						<FaTimes size={20} />
					</button>

					<div className="flex-1 overflow-y-auto pr-2">
						<h2 className="text-2xl font-bold text-white mb-6">
							Edit Card
							{isPickingLocation && (
								<span className="text-sm text-blue-400 ml-2">
									(selecting location...)
								</span>
							)}
						</h2>

						{/* Title Input */}
						<div className="mb-4">
							<div className="block text-sm font-medium text-gray-300 mb-2">
								Title
							</div>
							<input
								type="text"
								value={editedCard.title}
								onChange={(e) =>
									setEditedCard({ ...editedCard, title: e.target.value })
								}
								className="w-full bg-[#1e1e1e] text-white rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-emerald-500"
								placeholder="Card title"
							/>
						</div>

						{/* Description Input */}
						<div className="mb-4">
							<div className="block text-sm font-medium text-gray-300 mb-2">
								Content
							</div>
							<textarea
								value={editedCard.description}
								onChange={(e) =>
									setEditedCard({ ...editedCard, description: e.target.value })
								}
								className="w-full bg-[#1e1e1e] text-white rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-emerald-500 resize-none"
								placeholder="Card content"
								rows={3}
							/>
						</div>

						{/* Priority Select */}
						<div className="mb-4">
							<div className="block text-sm font-medium text-gray-300 mb-2">
								Priority
							</div>
							<select
								value={editedCard.priority}
								onChange={(e) =>
									setEditedCard({
										...editedCard,
										priority: e.target.value as "low" | "medium" | "high",
									})
								}
								className="w-full bg-[#1e1e1e] text-white rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-emerald-500"
							>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
							</select>
						</div>

						{/* Color Picker */}
						<div className="mb-4">
							<div className="block text-sm font-medium text-gray-300 mb-2">
								Color
							</div>
							<div className="grid grid-cols-5 gap-2">
								{COLOR_OPTIONS.map((color) => (
									<button
										key={color}
										type="button"
										onClick={() => setEditedCard({ ...editedCard, color })}
										className={`w-8 h-8 rounded-lg transition ${
											editedCard.color === color
												? "ring-2 ring-white scale-110"
												: "hover:scale-105"
										}`}
										style={{ backgroundColor: color }}
										title={color}
										aria-label={`Select color ${color}`}
									/>
								))}
							</div>
						</div>

						{/* Tags Section */}
						<div className="mb-4">
							<div className="block text-sm font-medium text-gray-300 mb-2">
								Tags
							</div>
							<div className="flex gap-2 mb-2">
								<input
									type="text"
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											handleAddTag();
										}
									}}
									className="flex-1 bg-[#1e1e1e] text-white rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-emerald-500 text-sm"
									placeholder="Add tag..."
								/>
								<button
									type="button"
									onClick={handleAddTag}
									className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg transition text-sm"
								>
									Add
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{editedCard.tags.map((tag) => (
									<div
										key={tag}
										className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs flex items-center gap-2 border border-emerald-500/30"
									>
										{tag}
										<button
											type="button"
											onClick={() => handleRemoveTag(tag)}
											className="hover:text-emerald-100 transition"
											aria-label={`Remove tag ${tag}`}
										>
											<FaTimes size={10} />
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Location Section */}
						<div className="mb-6">
							<div className="block text-sm font-medium text-gray-300 mb-2">
								Location on Map
							</div>
							<div
								className={`rounded-lg p-3 border mb-2 transition-colors ${
									isPickingLocation
										? "bg-blue-500/10 border-blue-500"
										: "bg-[#1e1e1e] border-white/10"
								}`}
							>
								{editedCard.position ? (
									<div>
										<p className="text-xs text-gray-300 font-medium mb-1">
											✓ Location Set:
										</p>
										<p className="text-xs text-emerald-300">
											Lat: {editedCard.position.lat.toFixed(4)}, Lng:{" "}
											{editedCard.position.lng.toFixed(4)}
										</p>
									</div>
								) : (
									<p className="text-xs text-gray-500">
										{isPickingLocation
											? "👇 Click on the map..."
											: "No location set"}
									</p>
								)}
							</div>
							<button
								type="button"
								onClick={handlePickLocation}
								className={`w-full py-2 px-3 rounded-lg transition text-sm font-medium ${
									isPickingLocation
										? "bg-blue-500 text-white cursor-wait"
										: "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
								}`}
								disabled={isPickingLocation}
							>
								{isPickingLocation
									? "🎯 Selecting location..."
									: "📍 Pick Location"}
							</button>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 mt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSave}
							className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isPickingLocation}
						>
							Save
						</button>
					</div>
				</div>

				{/* Map Panel - Only show when picking location */}
				{isPickingLocation && (
					<div className="flex-1 flex flex-col gap-3 min-w-0">
						<div className="flex-1 bg-[#2a2a2a] rounded-2xl border border-blue-500 overflow-hidden shadow-2xl flex flex-col">
							{/* Map header with search */}
							<div className="p-4 border-b border-white/10 bg-[#1e1e1e]">
								<h3 className="text-sm font-bold text-white mb-3">
									Search & Select Location
								</h3>
								<LocationSearch
									onLocationHighlight={(lat, lng) => {
										setMapCenter({ lat, lng });
									}}
								/>
							</div>

							{/* Map container */}
							<div className="flex-1 relative">
								<LeafletMap
									isPickingCardLocation={true}
									onCardLocationPicked={(position: LatLng) => {
										setEditedCard((prev) => ({
											...prev,
											position,
										}));
									}}
									centerLocation={mapCenter}
								/>
							</div>

							{/* Confirm button */}
							{editedCard.position && (
								<div className="p-4 border-t border-white/10 bg-[#1e1e1e] flex gap-3">
									<button
										type="button"
										onClick={() => onPickingLocationChange?.(null)}
										className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition font-medium"
									>
										✓ Confirm Location
									</button>
									<button
										type="button"
										onClick={() => {
											setEditedCard((prev) => ({
												...prev,
												position: undefined,
											}));
											onPickingLocationChange?.(null);
										}}
										className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition font-medium"
									>
										✕ Cancel Selection
									</button>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

const PlannerCardItem = React.memo(function PlannerCardItem({
	card,
	onRemove,
	onEdit,
}: {
	card: PlannerCard;
	onRemove: () => void;
	onEdit: () => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: card.id });

	const style = useMemo(
		() => ({
			transform: CSS.Transform.toString(transform),
			transition,
		}),
		[transform, transition],
	);

	const getPriorityColor = useCallback((priority: string) => {
		switch (priority) {
			case "high":
				return "border-red-500 bg-red-500/10";
			case "medium":
				return "border-yellow-500 bg-yellow-500/10";
			case "low":
				return "border-green-500 bg-green-500/10";
			default:
				return "border-gray-500 bg-gray-500/10";
		}
	}, []);

	const handleRemoveClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onRemove();
		},
		[onRemove],
	);

	const handleEditClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onEdit();
		},
		[onEdit],
	);

	return (
		<button
			type="button"
			ref={setNodeRef}
			style={style}
			className={`w-full text-left cursor-pointer bg-[#2a2a2a]/80 border ${getPriorityColor(
				card.priority,
			)} p-4 rounded-xl transition ${
				isDragging ? "shadow-lg scale-105 opacity-50" : "hover:shadow-md"
			}`}
			onClick={onEdit}
			{...attributes}
			{...listeners}
		>
			<div className="flex justify-between items-start mb-2">
				<h3 className="font-semibold text-white text-sm flex-1 pr-2">
					{card.title}
				</h3>
				<div className="flex gap-1">
					<button
						type="button"
						onClick={handleEditClick}
						className="text-gray-400 hover:text-blue-400 transition p-1"
						title="Edit card"
					>
						<FaEdit size={12} />
					</button>
					<button
						type="button"
						onClick={handleRemoveClick}
						className="text-gray-400 hover:text-red-500 transition p-1"
						title="Delete card"
					>
						<FaTrash size={12} />
					</button>
				</div>
			</div>
			<p className="text-xs text-gray-400">{card.description}</p>
			<div className="mt-2 flex items-center gap-2 flex-wrap">
				<span
					className="text-xs px-2 py-1 rounded-full text-white border"
					style={{ borderColor: card.color }}
				>
					{card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
				</span>
				{card.position && (
					<span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
						📍
					</span>
				)}
				{card.tags.length > 0 && (
					<span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
						{card.tags.length} tag{card.tags.length !== 1 ? "s" : ""}
					</span>
				)}
			</div>
		</button>
	);
});

export function SidePlanner({
	isOpen,
	onToggle,
	onPickCardLocation,
	onCardsChange,
}: SidePlannerProps) {
	const [cards, setCards] = useState<PlannerCard[]>([
		{
			id: uuidv7(),
			title: "Visit Louvre Museum",
			description: "Book tickets in advance",
			priority: "high",
			color: "#ef4444",
			tags: ["museum", "paris"],
		},
		{
			id: uuidv7(),
			title: "Eiffel Tower Tour",
			description: "Evening tour at sunset",
			priority: "medium",
			color: "#3b82f6",
			tags: ["landmark"],
		},
		{
			id: uuidv7(),
			title: "River Seine Cruise",
			description: "Romantic evening cruise",
			priority: "low",
			color: "#06b6d4",
			tags: ["activity"],
		},
	]);

	const [editingCardId, setEditingCardId] = useState<string | null>(null);
	const [pickingLocationCardId, setPickingLocationCardId] = useState<
		string | null
	>(null);
	const [locationSuccessMessage, setLocationSuccessMessage] = useState(false);

	// Notify parent when cards change
	useEffect(() => {
		if (onCardsChange) {
			onCardsChange(cards);
		}
	}, [cards, onCardsChange]);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 24, // Increased from 8 to reduce accidental drags and improve responsiveness
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const addCard = useCallback(() => {
		const newCard: PlannerCard = {
			id: uuidv7(),
			title: "New Plan",
			description: "Add details here",
			priority: "medium",
			color: "#8b5cf6",
			tags: [],
		};
		setCards((prev) => [...prev, newCard]);
	}, []);

	const removeCard = useCallback((id: string) => {
		setCards((prev) => prev.filter((card) => card.id !== id));
	}, []);

	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			// Use requestAnimationFrame to sync with browser refresh rate for smoother animation
			requestAnimationFrame(() => {
				setCards((items) => {
					const oldIndex = items.findIndex(
						(item) => item.id === active.id,
					);
					const newIndex = items.findIndex(
						(item) => item.id === over.id,
					);

					return arrayMove(items, oldIndex, newIndex);
				});
			});
		}
	}, []);

	const handleEditCard = useCallback((updatedCard: PlannerCard) => {
		setCards((prev) =>
			prev.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
		);
		setEditingCardId(null);
	}, []);

	const handlePickLocation = useCallback(
		(cardId: string, callback: (position: LatLng) => void) => {
			setPickingLocationCardId(cardId);
			if (onPickCardLocation) {
				// Wrap the callback to stop picking and show success message
				const wrappedCallback = (position: LatLng) => {
					callback(position);
					// Stop picking location immediately
					setPickingLocationCardId(null);
					// Show success message briefly
					setLocationSuccessMessage(true);
					setTimeout(() => {
						setLocationSuccessMessage(false);
					}, 2000);
				};
				onPickCardLocation(wrappedCallback);
			}
		},
		[onPickCardLocation],
	);

	const editingCard = useMemo(
		() => cards.find((card) => card.id === editingCardId),
		[cards, editingCardId],
	);

	const sortableIds = useMemo(() => cards.map((c) => c.id), [cards]);

	return (
		<>
			{/* Toggle Button */}
			<button
				type="button"
				onClick={onToggle}
				className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-r-lg transition"
				title={isOpen ? "Close Planner" : "Open Planner"}
			>
				{isOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
			</button>

			{/* Side Planner Panel */}
			<aside
				className={`fixed left-0 tope0 h-screen w-80 bg-[#1e1e1e]/95 backdrop-blur-xl border-r border-white/10 z-20 flex flex-col transition-transform duration-300 shadow-2xl overflow-hidden ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Header */}
				<div className="p-6 border-b border-white/10">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-2xl font-bold text-white">My Plans</h2>
						<button
							type="button"
							onClick={addCard}
							className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition"
							title="Add new card"
						>
							<FaPlus size={16} />
						</button>
					</div>
					<p className="text-xs text-gray-400">{cards.length} items</p>
				</div>

				{/* Cards Container */}
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
						{cards.length === 0 ? (
							<div className="flex items-center justify-center h-full text-gray-400 text-center">
								<p>No plans yet. Add one to get started!</p>
							</div>
						) : (
							<SortableContext
								items={sortableIds}
								strategy={verticalListSortingStrategy}
							>
								{cards.map((card) => (
									<PlannerCardItem
										key={card.id}
										card={card}
										onRemove={() => removeCard(card.id)}
										onEdit={() => setEditingCardId(card.id)}
									/>
								))}
							</SortableContext>
						)}
					</div>
				</DndContext>

				{/* Footer */}
				<div className="p-4 border-t border-white/10 text-xs text-gray-500 text-center">
					Drag to reorder • Click to edit
				</div>
			</aside>

			{/* Overlay when planner is open */}
			{isOpen && !editingCardId && (
				<button
					type="button"
					className="fixed inset-0 z-10 bg-transparent"
					onClick={onToggle}
				/>
			)}

			{/* Edit Modal */}
			{editingCard && (
				<CardEditModal
					card={editingCard}
					isOpen={!!editingCardId}
					onClose={() => setEditingCardId(null)}
					onSave={handleEditCard}
					onPickLocation={handlePickLocation}
					isPickingLocation={pickingLocationCardId === editingCard.id}
					onPickingLocationChange={setPickingLocationCardId}
				/>
			)}

			{/* Location Picker Context Provider Signal */}
			{pickingLocationCardId && (
				<div className="fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm z-40 animate-pulse">
					Click on the map to set location
				</div>
			)}

			{/* Location Success Notification */}
			{locationSuccessMessage && (
				<div className="fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm z-40">
					✓ Location set! Reopening editor...
				</div>
			)}
		</>
	);
}
