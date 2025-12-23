import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { LatLng } from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaEdit, FaPlus, FaRoute, FaTimes, FaTrash } from "react-icons/fa";

const LeafletMap = dynamic(() => import("./map"), {
	ssr: false,
	loading: () => <div className="w-full h-full bg-[#0f1110] animate-pulse" />,
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

interface RouteViewerProps {
	isOpen: boolean;
	onToggle: () => void;
	onPickLocation?: (callback: (position: LatLng) => void) => void;
	onCardsChange?: (cards: PlannerCard[]) => void;
	initialCards?: PlannerCard[];
	activeRouteName?: string;
	onCreateNewRoute?: () => void;
	onCreateNewPlan?: () => void;
}

export function RouteViewer({ isOpen, onToggle, onCardsChange, initialCards = [], activeRouteName, onCreateNewRoute, onCreateNewPlan }: RouteViewerProps) {
	const [cards, setCards] = useState<PlannerCard[]>(initialCards);
	const [editingCardId, setEditingCardId] = useState<string | null>(null);

	useEffect(() => { setCards(initialCards); }, [initialCards]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const oldIndex = cards.findIndex((item) => item.id === active.id);
			const newIndex = cards.findIndex((item) => item.id === over.id);
			const newOrder = arrayMove(cards, oldIndex, newIndex);
			setCards(newOrder);
			onCardsChange?.(newOrder);
		}
	};

	const handleCreateNewPlan = () => {
		if (onCreateNewPlan) {
			onCreateNewPlan();
		}
	};

	return (
		<>
			<button type="button" onClick={onToggle} className={`fixed top-1/2 -translate-y-1/2 z-30 bg-emerald-500 text-white p-3 rounded-r-lg transition-all duration-300 ${isOpen ? "left-65" : "left-0"}`}>
				{isOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
			</button>

			<aside className={`fixed left-0 top-0 h-screen w-65 bg-[#1e1e1e]/95 backdrop-blur-xl border-r border-white/10 z-40 flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
				<div className="p-6 border-b border-white/10">
					<div className="flex items-center justify-between mb-2">
						<h2 className="text-xl font-bold text-white">Route Viewer</h2>
						<div className="flex gap-2">
							<button type="button" onClick={() => onCreateNewRoute?.()} className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg text-white transition" title="Create New Route"><FaRoute size={14}/></button>
							<button type="button" onClick={handleCreateNewPlan} className="bg-emerald-500 hover:bg-emerald-600 p-2 rounded-lg text-white transition" title="Create New Plan"><FaPlus size={14}/></button>
						</div>
					</div>
					<p className="text-xs text-emerald-400 font-medium">{activeRouteName || "Import a route to begin"}</p>
				</div>

				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<div className="flex-1 overflow-y-auto p-4 space-y-3">
					{cards.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full gap-4">
							<div className="text-center">
								<p className="text-gray-400 text-sm mb-4">No plans yet. Create one to get started!</p>
								<button 
									type="button" 
									onClick={handleCreateNewPlan} 
									className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 mx-auto transition"
								>
									<FaPlus size={16} /> Create New Plan
								</button>
							</div>
						</div>
					) : (
						<SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
							{cards.map((card) => (
								<SortableCard key={card.id} card={card} onRemove={() => {
									const updated = cards.filter(c => c.id !== card.id);
									setCards(updated);
									onCardsChange?.(updated);
								}} onEdit={() => setEditingCardId(card.id)} />
							))}
						</SortableContext>
					)}
					</div>
				</DndContext>
			</aside>
			
			{editingCardId && (
				<EditModal 
					card={cards.find(c => c.id === editingCardId) as typeof cards[0]} 
					onClose={() => setEditingCardId(null)} 
					onSave={(updated) => {
						const list = cards.map(c => c.id === updated.id ? updated : c);
						setCards(list);
						onCardsChange?.(list);
						setEditingCardId(null);
					}}
					onLocationPicked={(position) => {
						const list = cards.map(c => c.id === editingCardId ? { ...c, position } : c);
						setCards(list);
						onCardsChange?.(list);
					}}
				/>
			)}
		</>
	);
}

function SortableCard({ card, onRemove, onEdit }: { card: PlannerCard; onRemove: (id: string) => void; onEdit: (card: PlannerCard) => void }) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
	const style = { transform: CSS.Transform.toString(transform), transition };

	return (
		<div ref={setNodeRef} {...attributes} {...listeners} className="p-4 rounded-xl border transition-all" style={{...style, borderColor: `${card.color}40`, backgroundColor: `${card.color}10`}}>
			<div className="flex justify-between mb-2">
				<h3 className="text-sm font-bold text-white">{card.title}</h3>
				<div className="flex gap-2">
					<button type="button" onClick={() => onEdit(card)} className="text-gray-400 hover:text-white"><FaEdit size={12}/></button>
					<button type="button" onClick={() => onRemove(card.id)} className="text-gray-400 hover:text-red-500"><FaTrash size={12}/></button>
				</div>
			</div>
			{card.tags.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-2">
					{card.tags.map((tag: string) => (
						<span key={tag} className="text-[10px] bg-white/10 text-gray-300 px-2 py-1 rounded">
							{tag}
						</span>
					))}
				</div>
			)}
			{card.position && <span className="text-[10px] text-emerald-400">📍 Location Set</span>}
		</div>
	);
}

function EditModal({ card, onClose, onSave, onLocationPicked }: { card: PlannerCard; onClose: () => void; onSave: (card: PlannerCard) => void; onLocationPicked?: (position: LatLng) => void }) {
	const [data, setData] = useState(card);
	const [tagInput, setTagInput] = useState("");
	const [isPickingLocation, setIsPickingLocation] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<LatLng | undefined>(card.position);

	const COLOR_OPTIONS = [
		"#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
	];

	const addTag = () => {
		if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
			setData({ ...data, tags: [...data.tags, tagInput.trim()] });
			setTagInput("");
		}
	};

	const removeTag = (tag: string) => {
		setData({ ...data, tags: data.tags.filter((t: string) => t !== tag) });
	};

	const handleLocationPick = () => {
		setIsPickingLocation(true);
	};

	const handleConfirmLocation = () => {
		if (selectedLocation) {
			setData({ ...data, position: selectedLocation });
			onLocationPicked?.(selectedLocation);
		}
		setIsPickingLocation(false);
	};

	const handleMapClick = (position: LatLng) => {
		setSelectedLocation(position);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="bg-[#1e1e1e] rounded-2xl border border-white/10 flex transition-all duration-300 h-3/4" style={{width: isPickingLocation ? '80vw' : '24rem'}}>
				{/* Main Form */}
				<div className="w-96 overflow-y-auto p-6 flex flex-col transition-all duration-300">
					<div className="flex justify-between mb-6">
						<h2 className="text-xl font-bold text-white">Edit Plan</h2>
						<button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes size={20}/></button>
					</div>

					{/* Title Input */}
					<input 
						className="w-full bg-[#2a2a2a] p-3 rounded-lg mb-4 text-white text-sm" 
						placeholder="Plan title"
						value={data.title} 
						onChange={e => setData({...data, title: e.target.value})} 
					/>

					{/* Description Input */}
					<textarea 
						className="w-full bg-[#2a2a2a] p-3 rounded-lg mb-4 text-white text-sm resize-none" 
						placeholder="Plan description"
						rows={3}
						value={data.description} 
						onChange={e => setData({...data, description: e.target.value})} 
					/>

					{/* Color Selection */}
					<div className="mb-4">
						<label htmlFor="plan-color" className="text-xs text-gray-400 mb-2 block">Color</label>
						<div className="grid grid-cols-4 gap-2">
							{COLOR_OPTIONS.map(color => (
								<button
									key={color}
									type="button"
									onClick={() => setData({...data, color})}
									className={`h-8 rounded-lg transition ${data.color === color ? "ring-2 ring-white" : ""}`}
									style={{backgroundColor: color}}
								/>
							))}
						</div>
					</div>

					{/* Tags */}
					<div className="mb-4">
						<label htmlFor="plan-tags" className="text-xs text-gray-400 mb-2 block">Tags</label>
						<div className="flex gap-2 mb-2">
							<input 
								className="flex-1 bg-[#2a2a2a] p-2 rounded-lg text-white text-sm"
								placeholder="Add tag"
								value={tagInput}
								onChange={e => setTagInput(e.target.value)}
								onKeyDown={e => e.key === "Enter" && addTag()}
							/>
							<button type="button" onClick={addTag} className="bg-emerald-500/20 text-emerald-400 px-3 rounded-lg text-sm">+</button>
						</div>
						<div className="flex flex-wrap gap-2">
							{data.tags.map((tag: string) => (
								<div key={tag} className="bg-white/10 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
									{tag}
									<button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">×</button>
								</div>
							))}
						</div>
					</div>

					{/* Location Button */}
					<button 
						type="button" 
						onClick={handleLocationPick} 
						className="w-full bg-blue-500/20 text-blue-400 py-3 rounded-lg mb-6 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/30 transition"
					>
						📍 {data.position ? "Change Location" : "Pick Location"}
					</button>

					{/* Save Button */}
					<button 
						type="button" 
						onClick={() => onSave(data)} 
						className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-600 transition"
					>
						Save Changes
					</button>
				</div>

				{/* Map Side Panel */}
				{isPickingLocation && (
					<div className="w-1/2 bg-[#0f1110] rounded-r-2xl overflow-hidden flex flex-col transition-all duration-300">
						<div className="p-4 border-b border-white/10 flex justify-between items-center">
							<h3 className="text-sm font-bold text-white">Select Location</h3>
							<button type="button" onClick={() => setIsPickingLocation(false)} className="text-gray-400 hover:text-white"><FaTimes/></button>
						</div>
						<div className="flex-1 relative">
							<LocationPickerMap onLocationSelected={handleMapClick} initialPosition={selectedLocation} />
								{selectedLocation && (
									<div className="absolute top-20  right-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 z-4000 text-right w-fit h-fit">
										<p className="text-xs font-medium text-emerald-400">✓ Location Selected</p>
										<p className="text-xs text-gray-300 mt-1">Lat: {selectedLocation.lat.toFixed(4)}, <br/> Lng: {selectedLocation.lng.toFixed(4)}</p>
									</div>
								)}
								<div className="absolute bottom-4 left-4 right-4 flex gap-2 z-400">
									<button
										type="button"
										onClick={handleConfirmLocation}
										disabled={!selectedLocation}
										className="flex-1 bg-emerald-500 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-emerald-600 transition"
									>
										Confirm Location
									</button>
									<button
										type="button"
										onClick={() => {
											setSelectedLocation(undefined);
											setIsPickingLocation(false);
										}}
									className="flex-1 bg-gray-700 text-white py-2 rounded-lg font-semibold text-sm hover:bg-gray-600 transition"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function LocationPickerMap({ onLocationSelected, initialPosition }: { onLocationSelected: (position: LatLng) => void; initialPosition?: LatLng }) {
	const [cursorPosition, setCursorPosition] = useState<LatLng | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchQuery.trim()) return;

		try {
			// Using Nominatim (OpenStreetMap) geocoding API
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
			);
			const results = await response.json();
			
			if (results.length > 0) {
				const { lat, lon } = results[0];
				const position = new (require('leaflet')).LatLng(parseFloat(lat), parseFloat(lon));
				onLocationSelected(position);
			}
		} catch (error) {
			console.error("Search error:", error);
		}
	};

	return (
		<div className="w-full h-full relative">
			<LeafletMap 
				isPickingCardLocation={true} 
				onCardLocationPicked={onLocationSelected}
				onCursorMove={setCursorPosition}
				planCards={[]}
				initialCenter={initialPosition ? [initialPosition.lat, initialPosition.lng] as [number, number] : [10.7725, 106.6980]}
			/>
			{/* Search Bar */}
			<form onSubmit={handleSearch} className="absolute top-4 left-4 right-4 z-500">
				<input 
					type="text"
					placeholder="Search location..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full bg-gray-900/95 border border-gray-700 rounded-lg p-3 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
				/>
			</form>
			{cursorPosition && (
				<div className="absolute top-20 left-4 bg-gray-900/90 border border-gray-700 rounded-lg p-2 text-xs text-gray-300 pointer-events-none z-400">
					<p>Lat: {cursorPosition.lat.toFixed(6)}</p>
					<p>Lng: {cursorPosition.lng.toFixed(6)}</p>
				</div>
			)}
		</div>
	);
}