import { useState } from "react";
import { FaDirections, FaTicketAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";

export interface LocationDisplayInfo {
	id: string | number;
	name: string;
	imagePath: string;
	description: string;
	gallery: string[];
}

interface LocationInfoBoxProps {
	location: LocationDisplayInfo | null;
	onClose: () => void;
}
export function LocationInfoBox({ location, onClose }: LocationInfoBoxProps) {
	return (
		location != null ? (
			<div className="absolute top-24 right-6 w-[400px] z-10 flex flex-col gap-4 pointer-events-none">
				{/* Card */}
				<div className="pointer-events-auto bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl text-white">
					{/* Header Image Area */}
					<div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-700 group">
						{/* Close Button */}
						<button
							type="button"
							className="absolute top-3 right-3 size-8 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition hover:cursor-grab z-10"
							onClick={() => {
								onClose();
							}}
						>
							<IoMdClose />
						</button>
						{/* Fake Image Placeholder since we don't have the file */}
						<img
							src="https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=2532&auto=format&fit=crop"
							alt="Louvre"
							className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
						/>
						<div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
							<div className="flex justify-between items-end">
								<h2 className="text-xl font-bold">{location.name}</h2>
								<div className="flex items-center gap-1 text-xs bg-black/60 px-2 py-1 rounded-lg text-yellow-400">
									★ 4.8
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 mb-6">
						<button
							type="button"
							className="flex grow-1 flex-row justify-center items-center bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-full h-10"
						>
							<FaTicketAlt className="mr-2" /> Tickets
						</button>
						<button
							type="button"
							className="flex justify-center items-center grow-1 bg-transparent border border-gray-600 hover:bg-white/10 text-white rounded-full h-10"
						>
							<FaDirections className="mr-2" /> Directions
						</button>
					</div>

					{/* Info Grid */}
					<div className="grid grid-cols-2 gap-4 mb-6">
						<div className="bg-white/5 p-3 rounded-2xl">
							<p className="text-xs text-gray-400 mb-1">Open Today</p>
							<p className="text-sm font-semibold">9:00 AM - 6:00 PM</p>
						</div>
						<div className="bg-white/5 p-3 rounded-2xl">
							<p className="text-xs text-gray-400 mb-1">Distance</p>
							<p className="text-sm font-semibold">2.4 km away</p>
						</div>
					</div>

					{/* About */}
					<div className="mb-4">
						<h3 className="font-bold mb-2">About</h3>
						<p className="text-xs text-gray-400 leading-relaxed">
							{location.description}<span className="text-emerald-400 cursor-pointer">Read more</span>
						</p>
					</div>

					{/* Gallery (Small preview) */}
					<div>
						<h3 className="font-bold mb-2">Gallery</h3>
						<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
							<div className="size-16 rounded-xl bg-gray-700 shrink-0 overflow-hidden">
								{/* <Image
										// src="https://images.unsplash.com/photo-1544264661-897c458d3436?w=200&h=200&fit=crop"
										className="w-full h-full object-cover"
										fill={true}
									/> */}
							</div>
							<div className="size-16 rounded-xl bg-gray-700 shrink-0 overflow-hidden">
								{/* <Image
										src="https://images.unsplash.com/photo-1584918231269-80880315d18d?w=200&h=200&fit=crop"
										className="w-full h-full object-cover"
										fill={true}
									/> */}
							</div>
							<div className="size-16 rounded-xl bg-gray-700 shrink-0 overflow-hidden">
								{/* <Image
										// src="https://images.unsplash.com/photo-1565060169194-1372605b0a68?w=200&h=200&fit=crop"
										className="w-full h-full object-cover"
										fill={true}
									/> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		) : null
	);
}
