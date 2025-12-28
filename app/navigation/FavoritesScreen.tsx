"use client";

import { useState } from "react";
import { FaTrash, FaCopy } from "react-icons/fa";

export interface FavoriteLocation {
	id: string;
	name: string;
	address: string;
	lat: number;
	lng: number;
}

interface FavoritesScreenProps {
	favorites: FavoriteLocation[];
	onRemove: (id: string) => void;
	onCloneToPlan: (favorite: FavoriteLocation) => void;
	onReorder: (fromIndex: number, toIndex: number) => void;
}

export function FavoritesScreen({
	favorites,
	onRemove,
	onCloneToPlan,
	onReorder,
}: FavoritesScreenProps) {
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === dropIndex) return;

		onReorder(draggedIndex, dropIndex);
		setDraggedIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	return (
		<div className="w-full h-full flex flex-col bg-[#1e1e1e]">
			<div className="p-4 border-b border-gray-700">
				<h2 className="text-xl font-bold text-white">Favorite Locations</h2>
				<p className="text-sm text-gray-400 mt-1">
					{favorites.length} location{favorites.length !== 1 ? "s" : ""} saved
				</p>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-2">
				{favorites.length === 0 ? (
					<div className="text-center text-gray-500 mt-8">
						<p>No favorite locations yet</p>
						<p className="text-sm mt-2">
							Right-click on the map to add locations to favorites
						</p>
					</div>
				) : (
					favorites.map((favorite, index) => (
						<div
							key={favorite.id}
							draggable
							onDragStart={(e) => handleDragStart(e, index)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDrop={(e) => handleDrop(e, index)}
							onDragEnd={handleDragEnd}
							className={`bg-[#2a2a2a] rounded-lg p-3 cursor-move hover:bg-[#333333] transition-colors ${
								draggedIndex === index ? "opacity-50" : ""
							}`}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									<h3 className="text-white font-semibold truncate">
										{favorite.name}
									</h3>
									<p className="text-sm text-gray-400 truncate">
										{favorite.address}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										{favorite.lat.toFixed(6)}, {favorite.lng.toFixed(6)}
									</p>
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => onCloneToPlan(favorite)}
										className="p-2 hover:bg-[#444444] rounded transition-colors"
										title="Add to current route"
									>
										<FaCopy className="text-blue-400" size={16} />
									</button>
									<button
										type="button"
										onClick={() => onRemove(favorite.id)}
										className="p-2 hover:bg-[#444444] rounded transition-colors"
										title="Remove from favorites"
									>
										<FaTrash className="text-red-400" size={16} />
									</button>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
