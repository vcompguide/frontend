"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import {
	FaBell,
	FaCog,
	FaComments,
	FaDirections,
	FaLocationArrow,
	FaMap,
	FaMicrophone,
	FaMinus,
	FaPlus,
	FaRoute,
	FaSearch,
	FaTicketAlt,
} from "react-icons/fa";

import { IoMdClose } from "react-icons/io";
import { LuLocateFixed, LuSend } from "react-icons/lu";
import { MdDashboard, MdRestaurant } from "react-icons/md";
import { PiBankFill, PiParkFill } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BotMessage, ChatBox, UserMessage } from "./chat";
import { LocationDisplayInfo, LocationInfoBox } from "./InfoBox";

// Dynamic import for the map
const LeafletMap = dynamic(() => import("./map"), {
	ssr: false,
	loading: () => <div className="w-full h-full bg-[#1e1e1e] animate-pulse" />,
});

export default function Page() {
	const [searchValue, setSearchValue] = useState<string>("");
	const [activeTab, setActiveTab] = useState("Dashboard");
	let mockLocation: LocationDisplayInfo = {
		description: "Lorem Ipsum",
		id: "mock",
		name: "Musue",
		imagePath: "",
		gallery: []
	}
	const [selectedLocation, setSelectedLocation] =
		useState<LocationDisplayInfo | null>(mockLocation);
	
	return (
		<div className="flex flex-row w-full h-screen bg-[#0f1110] overflow-hidden font-sans text-gray-200">
			{/* --- SIDEBAR --- */}
			<aside className="w-64 h-full flex flex-col justify-between border-r border-gray-800 bg-[#0f1110] z-20 shrink-0">
				<div className="p-6">
					{/* Logo */}
					<div className="flex items-center gap-3 mb-10">
						<div className="size-8 rounded-full border-2 border-emerald-500 flex items-center justify-center">
							<FaSearch className="text-emerald-500 size-4" />
						</div>
						<h1 className="text-xl font-bold tracking-wide text-white">
							V-Tour
						</h1>
					</div>

					{/* Menu */}
					<div className="space-y-6">
						<div className="text-xs font-semibold text-gray-500 tracking-wider">
							MENU
						</div>
						<nav className="flex flex-col gap-2">
							<SidebarItem
								icon={<MdDashboard />}
								label="Dashboard"
								active={activeTab === "Dashboard"}
								onClick={() => setActiveTab("Dashboard")}
							/>
							<SidebarItem
								icon={<FaMap />}
								label="Map View"
								active={activeTab === "Map View"}
								onClick={() => setActiveTab("Map View")}
							/>
							<SidebarItem
								icon={<FaRoute />}
								label="Saved Routes"
								active={activeTab === "Saved"}
								onClick={() => setActiveTab("Saved")}
							/>
							<SidebarItem
								icon={<FaComments />}
								label="Guide Chat"
								active={activeTab === "Chat"}
								onClick={() => setActiveTab("Chat")}
							/>
						</nav>
					</div>

					{/* Filters */}
					<div className="mt-8 space-y-4">
						<div className="text-xs font-semibold text-gray-500 tracking-wider">
							FILTERS
						</div>
						<div className="flex flex-wrap gap-2">
							<FilterPill label="Museums" active />
							<FilterPill label="Parks" />
							<FilterPill label="Historical" />
							<FilterPill label="Food" />
						</div>
					</div>
				</div>

				{/* User Profile */}
				<div className="p-6 border-t border-gray-800 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition">
					<div className="size-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold">
						AM
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium text-white">Alex Morgan</span>
						<span className="text-xs text-gray-500">Pro Traveler</span>
					</div>
				</div>
			</aside>

			{/* --- MAIN CONTENT (MAP + OVERLAYS) --- */}
			<main className="relative flex-1 h-full">
				{/* Map Background */}
				<div className="absolute inset-0 z-0">
					<LeafletMap />
				</div>

				{/* --- OVERLAYS --- */}

				{/* 1. Top Bar */}
				<div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
					{/* Search */}
					<div className="pointer-events-auto flex items-center gap-4 w-1/3">
						<div className="relative w-full">
							<FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
							<Input
								className="w-full h-12 bg-[#1e1e1e]/90 backdrop-blur-md border-none text-white pl-12 rounded-full focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-500 shadow-xl"
								placeholder="Search for places, tours..."
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
							/>
							<Button className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-emerald-500 hover:bg-emerald-600 p-0">
								<span className="text-black font-bold">→</span>
							</Button>
						</div>
					</div>

					{/* Top Right Actions */}
					<div className="pointer-events-auto flex gap-3">
						<CircleButton icon={<FaBell />} />
						<CircleButton icon={<FaCog />} />
					</div>
				</div>

				{/* 2. Right Detail Panel (The Louvre) */}
				{/* <LocationInfoBox/> */}
				<LocationInfoBox
					location={selectedLocation}
					onClose={() => setSelectedLocation(null)}
				/>
				{/* 3. Center Suggested Challenge (Floating) */}
				<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
					{/* Positioned relatively near the map point in design */}
					<div className="pointer-events-auto bg-[#1e1e1e] p-4 rounded-xl shadow-2xl border border-gray-700 w-64 transform translate-x-[-150px] translate-y-[-50px]">
						<div className="flex justify-between items-start mb-2">
							<span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded uppercase">
								Suggested
							</span>
							<IoMdClose className="text-gray-500 cursor-pointer" />
						</div>
						<h4 className="font-bold text-sm text-white mb-1">
							Hidden Courtyard Challenge
						</h4>
						<p className="text-[10px] text-gray-400 mb-3">
							Find the statue of Louis XIV to unlock a badge.
						</p>
						<Button className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg">
							Accept Challenge
						</Button>

						{/* Dotted Line connector mock */}
						<div className="absolute -bottom-10 right-10 w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-[#1e1e1e] border-r-[6px] border-r-transparent"></div>
					</div>
				</div>

				{/* 4. Bottom Center Chat Widget */}
				<ChatBox />
			</main>
		</div>
	);
}

// --- SUB COMPONENTS ---

function SidebarItem({
	icon,
	label,
	active,
	onClick,
}: {
	icon: any;
	label: string;
	active?: boolean;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`
        flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200
        ${active ? "bg-[#00c853]/10 text-[#00c853]" : "text-gray-400 hover:text-white hover:bg-white/5"}
      `}
		>
			<div className="text-lg">{icon}</div>
			<span className="text-sm font-medium">{label}</span>
		</button>
	);
}

function FilterPill({ label, active }: { label: string; active?: boolean }) {
	return (
		<button
			type="button"
			className={`
         px-4 py-1.5 rounded-full text-xs font-medium border transition-all
         ${
						active
							? "bg-transparent border-emerald-500 text-white"
							: "bg-transparent border-gray-700 text-gray-500 hover:border-gray-500"
					}
      `}
		>
			{label}
		</button>
	);
}

function CircleButton({ icon }: { icon: any }) {
	return (
		<button
			className="size-10 rounded-full bg-[#1e1e1e] border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition shadow-lg"
			type="button"
		>
			{icon}
		</button>
	);
}
