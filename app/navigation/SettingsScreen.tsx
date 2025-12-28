"use client";

import React, { useState } from "react";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "./AuthContext";

export function SettingsScreen() {
	const { user, logout } = useAuth();
	const [theme, setTheme] = useState("dark");
	const [notifications, setNotifications] = useState(true);
	const [mapLabels, setMapLabels] = useState(true);

	const handleLogout = () => {
		if (confirm("Are you sure you want to logout?")) {
			logout();
		}
	};

	return (
		<div className="w-full h-full bg-[#0f1110] p-8 overflow-auto">
			<div className="max-w-2xl">
				{/* Header */}
				<div className="flex items-center gap-3 mb-8">
					<div className="size-12 rounded-full border-2 border-emerald-500 flex items-center justify-center">
						<FaCog size={24} className="text-emerald-500" />
					</div>
					<h1 className="text-4xl font-bold text-white">Settings</h1>
				</div>

				{/* Settings Sections */}
				<div className="space-y-8">
					{/* Account */}
					<div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
						<h2 className="text-xl font-bold text-white mb-6">Account</h2>
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								{user?.avatarUrl ? (
									<img src={user.avatarUrl} alt={user.name} className="size-16 rounded-full object-cover" />
								) : (
									<div className="size-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
										{user?.name?.charAt(0).toUpperCase() || "U"}
									</div>
								)}
								<div className="flex-1">
									<p className="text-lg font-medium text-white">{user?.name || "User"}</p>
									<p className="text-sm text-gray-400">{user?.email || "No email"}</p>
									{user?.description && (
										<p className="text-sm text-gray-500 mt-1">{user.description}</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Logout */}
					<div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-6">
						<button
							type="button"
							onClick={handleLogout}
							className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500 text-emerald-300 py-3 px-4 rounded-lg transition font-medium flex items-center justify-center gap-2"
						>
							<FaSignOutAlt />
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
