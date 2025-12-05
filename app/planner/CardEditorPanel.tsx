import { LatLng } from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { FaPalette, FaPlus, FaSearchLocation, FaTimes, FaTrash } from "react-icons/fa"; // Added FaSearchLocation
import { ReactSortable } from "react-sortablejs";
import TextareaAutosize from "react-textarea-autosize";
import type { CardInfo } from "./CardInfo";
import Tag from "./tag";

interface CardEditorPanelProps {
	card: CardInfo;
	onClose: () => void;
	onUpdate: () => void;
}

const LocationPicker = dynamic(() => import("./LocationPicker"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
			Loading Map...
		</div>
	),
});

export default function CardEditorPanel({
	card,
	onClose,
	onUpdate,
}: CardEditorPanelProps) {
	const [localUpdate, setLocalUpdate] = useState(0);
	const [editingTagId, setEditingTagId] = useState<string | null>(null);
	
	// New State: Trigger to send title to map
	const [searchTrigger, setSearchTrigger] = useState<string>("");

	const popupRef = useRef<HTMLDivElement>(null);


	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popupRef.current &&
				!popupRef.current.contains(event.target as Node)
			) {
				setEditingTagId(null);
			}
		};

		if (editingTagId) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [editingTagId]);

	const forceUpdate = () => {
		setLocalUpdate((prev) => prev + 1);
		onUpdate();
	};

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		card.color = e.target.value;
		forceUpdate();
	};

	const handleTagsReorder = (newTags: Tag[]) => {
		card.tagsList = newTags;
		forceUpdate();
	};

	const addTag = () => {
		const newTag = new Tag();
		newTag.name = "New Tag";
		newTag.RGB = "#000000";
		card.addTag(newTag);
		setEditingTagId(newTag.id);
		forceUpdate();
	};

	const updateTag = (tag: Tag, newName: string, newColor: string) => {
		tag.name = newName;
		tag.RGB = newColor;
		forceUpdate();
	};

	const deleteTag = (tagId: string) => {
		card.tagsList = card.tagsList.filter((t) => t.id !== tagId);
		if (editingTagId === tagId) setEditingTagId(null);
		forceUpdate();
	};

	const handleLocationUpdate = (lat: number, lng: number) => {
		card.location = { lat, lng } as LatLng;
		forceUpdate();
	};

	// Handler for the map search button
	const handleSearchTitle = () => {
		if(card.title) {
			setSearchTrigger(card.title);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex flex-row">
			{/* LEFT BLURRED AREA */}
			<div className="grow h-full relative border-r border-gray-300">
				<LocationPicker
					currentLocation={card.location}
					onLocationSelect={handleLocationUpdate}
					// Pass the trigger state to the map
					externalQuery={searchTrigger}
				/>
			</div>

			{/* RIGHT SIDE MENU */}
			<div className="w-1/2 min-w-[400px] h-full bg-white shadow-2xl flex flex-col border-l border-gray-200 animate-slide-in-right overflow-y-auto z-50">
				{/* Header / Toolbar */}
				<div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
					<div className="flex items-center gap-4">
						<div className="text-xs font-mono text-gray-400">
							ID: {card.id.substring(0, 8)}...
						</div>

						<div className="relative group flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-200 transition">
							<FaPalette className="text-gray-500" size={12} />
							<span className="text-xs font-bold text-gray-600">Color</span>
							<input
								type="color"
								className="absolute opacity-0 inset-0 cursor-pointer w-full"
								value={card.color}
								onChange={handleColorChange}
							/>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition"
					>
						<FaTimes size={20} />
					</button>
				</div>

				<div className="p-8 flex flex-col gap-6">
					{/* TITLE WITH SEARCH BUTTON */}
					<div className="flex items-end gap-2 w-full">
						<input
							className="text-4xl font-[Inter] font-black bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-black focus:outline-none transition-colors w-full pb-2"
							value={card.title}
							onChange={(e) => {
								card.title = e.target.value;
								forceUpdate();
							}}
							placeholder="Card Title"
						/>
						{/* NEW BUTTON */}
						<button
							type="button"
							onClick={handleSearchTitle}
							title="Search this title on the map"
							className="mb-2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
						>
							<FaSearchLocation size={24} />
						</button>
					</div>

					{/* TAGS SECTION */}
					<div className="flex flex-col gap-2">
						<div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
							Tags
						</div>

						<div className="flex flex-wrap items-center gap-2">
							<ReactSortable
								list={card.tagsList || []}
								setList={handleTagsReorder}
								animation={200}
								className="flex flex-wrap gap-2 items-center"
								ghostClass="opacity-50"
							>
								{card.tagsList?.map((tag) => (
									<div key={tag.id} className="relative group">
										<button
											type="button"
											className="px-3 py-1 rounded-full text-xs font-bold cursor-pointer border-2 hover:brightness-95 active:scale-95 transition select-none flex items-center gap-2"
											style={{
												backgroundColor: `${tag.RGB}20`,
												color: tag.RGB,
												borderColor: tag.RGB,
											}}
											onClick={(e) => {
												e.stopPropagation(); 
												setEditingTagId(
													editingTagId === tag.id ? null : tag.id,
												);
											}}
										>
											<div
												className="size-2 rounded-full"
												style={{ backgroundColor: tag.RGB }}
											/>
											{tag.name}
										</button>

										{editingTagId === tag.id && (
											<div
												ref={popupRef}
												className="absolute top-full mt-2 left-0 w-64 bg-white shadow-xl rounded-lg p-3 border border-gray-100 z-20 flex flex-col gap-3"
											>
												<div className="text-xs font-bold text-gray-400">
													Edit Tag
												</div>
												<input
													className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-sm focus:outline-black"
													value={tag.name}
													onChange={(e) =>
														updateTag(tag, e.target.value, tag.RGB)
													}
												/>
												<div className="flex items-center gap-2">
													<input
														type="color"
														value={tag.RGB}
														onChange={(e) =>
															updateTag(tag, tag.name, e.target.value)
														}
														className="h-8 w-8 cursor-pointer border-0 p-0 rounded overflow-hidden"
													/>
													<span className="text-xs text-gray-500">
														{tag.RGB}
													</span>
													<button
														type="button"
														onClick={() => deleteTag(tag.id)}
														className="ml-auto text-red-500 hover:bg-red-50 p-1 rounded"
													>
														<FaTrash size={12} />
													</button>
												</div>
											</div>
										)}
									</div>
								))}
							</ReactSortable>

							<button
								type="button"
								onClick={addTag}
								className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
							>
								<FaPlus size={8} /> New Tag
							</button>
						</div>
					</div>

					{/* METADATA */}
					<div className="flex gap-4 text-xs text-gray-400 font-mono border-t border-b border-gray-100 py-3">
						<span>Created: {new Date(card.createdAt).toLocaleString()}</span>
						<span>•</span>
						<span>UUID: {card.id}</span>
					</div>

					{/* CONTENT EDITOR */}
					<div className="flex flex-col gap-2 h-full">
						<div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
							Content
						</div>
						<TextareaAutosize
							className="w-full resize-none bg-transparent text-gray-800 text-lg leading-relaxed focus:outline-none min-h-[200px]"
							value={card.content}
							onChange={(e) => {
								card.content = e.target.value;
								forceUpdate();
							}}
							placeholder="Write your details here..."
						/>
					</div>
				</div>
			</div>
		</div>
	);
}