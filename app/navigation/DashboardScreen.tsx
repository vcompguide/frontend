"use client";

import React, { useMemo } from "react";
import { FaClock, FaMap, FaRoute } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

interface DashboardProps {
	planCards?: Array<{
		id: string;
		title: string;
		description: string;
		position?: { lat: number; lng: number };
		color: string;
		priority: "low" | "medium" | "high";
		tags: string[];
		finished?: boolean;
		startTime?: number;
		createdAt?: number;
	}>;
	savedRoutes?: Array<{
		id: string;
		name: string;
		distance: string;
		duration: string;
		waypointsList: Array<{
			id: string;
			title: string;
			description?: string;
			position: { lat: number; lng: number };
		}>;
		color: string;
		createdAt: string;
	}>;
	onNavigate?: (tab: string) => void;
}

export function DashboardScreen({
	planCards = [],
	savedRoutes = [],
	onNavigate,
}: DashboardProps) {
	// Calculate statistics from actual data
	const stats = useMemo(() => {
		// Calculate total distance from saved routes
		const totalDistance = savedRoutes.reduce((sum, route) => {
			const distanceNum = parseFloat(route.distance.replace(/[^\d.]/g, ""));
			return sum + (isNaN(distanceNum) ? 0 : distanceNum);
		}, 0);

		// Calculate total time spent from saved routes
		const totalMinutes = savedRoutes.reduce((sum, route) => {
			const durationParts = route.duration
				.toLowerCase()
				.match(/(\d+)\s*([a-z]+)/g) || [];
			let minutes = 0;

			durationParts.forEach((part) => {
				const match = part.match(/(\d+)\s*([a-z]+)/);
				if (match) {
					const value = parseInt(match[1]);
					const unit = match[2];
					if (unit.includes("h")) minutes += value * 60;
					if (unit.includes("min")) minutes += value;
				}
			});

			return sum + minutes;
		}, 0);

		const hours = Math.floor(totalMinutes / 60);
		const mins = totalMinutes % 60;
		const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

		// Count unique visited places (waypoints from routes)
		const totalWaypoints = savedRoutes.reduce(
			(sum, route) => sum + route.waypointsList.length,
			0,
		);

		return [
			{
				icon: <FaRoute />,
				label: "Saved Routes",
				value: savedRoutes.length.toString(),
				color: "emerald",
			},
			// {
			// 	icon: <FaMap />,
			// 	label: "Visited Places",
			// 	value: totalWaypoints.toString(),
			// 	color: "blue",
			// },
			// {
			// 	icon: <FaClock />,
			// 	label: "Total Time Spent",
			// 	value: timeString,
			// 	color: "purple",
			// },
			{
				icon: <FaMap />,
				label: "Active Plans",
				value: planCards.length.toString(),
				color: "yellow",
			},
		];
	}, [savedRoutes, planCards]);

	const colorClasses = {
		emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500",
		blue: "bg-blue-500/20 text-blue-300 border-blue-500",
		purple: "bg-purple-500/20 text-purple-300 border-purple-500",
		yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500",
	};

	return (
		<div className="w-full h-full bg-[#0f1110] p-8 overflow-auto">
			<div className="max-w-6xl">
				{/* Header */}
				<div className="flex items-center gap-3 mb-8">
					<div className="size-12 rounded-full border-2 border-emerald-500 flex items-center justify-center">
						<MdDashboard size={24} className="text-emerald-500" />
					</div>
					<div>
						<h1 className="text-4xl font-bold text-white">Dashboard</h1>
						<p className="text-gray-400 text-sm">Welcome back, Alex!</p>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{stats.map((stat, idx) => (
						<div
							key={idx}
							className={`border rounded-xl p-6 backdrop-blur-sm transition hover:scale-105 ${
								colorClasses[stat.color as keyof typeof colorClasses]
							}`}
						>
							<div className="flex items-center justify-between mb-3">
								<div className="text-2xl">{stat.icon}</div>
								<p className="text-3xl font-bold">{stat.value}</p>
							</div>
							<p className="text-sm opacity-80">{stat.label}</p>
						</div>
					))}
				</div>

				{/* Recent Activity */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Recent Plans */}
					<div className="lg:col-span-2 bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
						<h2 className="text-xl font-bold text-white mb-4">Recent Plans</h2>
						<div className="space-y-3">
							{planCards.length > 0 ? (
								planCards
									.sort((a, b) => {
										// Sort by creation time, most recent first (closest to current time)
										const aTime = a.createdAt || 0;
										const bTime = b.createdAt || 0;
										return bTime - aTime;
									})
									.slice(0, 5)
									.map((card) => (
										<div
											key={card.id}
											className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition"
										>
											<div
												className="size-3 rounded-full flex-shrink-0"
												style={{ backgroundColor: card.color }}
											/>
											<div className="flex-1 min-w-0">
												<p className="text-white text-sm font-medium truncate">
													{card.title}
												</p>
												{card.position && (
													<p className="text-gray-400 text-xs">
														📍{" "}
														{card.position.lat.toFixed(2)},
														{card.position.lng.toFixed(2)}
													</p>
												)}
												{card.startTime && (
													<p className="text-gray-400 text-xs">
														⏰ {new Date(card.startTime).toLocaleDateString()} at {new Date(card.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
													</p>
												)}
											</div>
											<span className="text-gray-400 text-xs whitespace-nowrap">
												{card.createdAt 
													? new Date(card.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
													: 'Today'
												}
											</span>
										</div>
									))
							) : (
								<div className="text-center py-8 text-gray-400">
									<p>No plans yet. Create one to get started!</p>
								</div>
							)}
						</div>
					</div>

					{/* Quick Actions */}
					<div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
						<h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
						<div className="space-y-3">
							<button
								type="button"
								onClick={() => onNavigate?.("Map View")}
								className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition font-medium"
							>
								+ New Plan
							</button>
							<button
								type="button"
								onClick={() => onNavigate?.("Map View")}
								className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition font-medium"
							>
								📍 Explore Map
							</button>
							<button
								type="button"
								onClick={() => onNavigate?.("Saved")}
								className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition font-medium"
							>
								🗺️ Saved Routes
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
