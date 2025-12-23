"use client";

import React, { useState } from "react";
import { FaCog } from "react-icons/fa";

export function SettingsScreen() {
	const [theme, setTheme] = useState("dark");
	const [notifications, setNotifications] = useState(true);
	const [mapLabels, setMapLabels] = useState(true);

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
					{/* Appearance */}
					{/* <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
						<h2 className="text-xl font-bold text-white mb-6">Appearance</h2>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-300 font-medium">Theme</p>
									<p className="text-sm text-gray-500">Choose your preferred theme</p>
								</div>
								<select
									value={theme}
									onChange={(e) => setTheme(e.target.value)}
									className="bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-emerald-500 outline-none"
								>
									<option value="dark">Dark</option>
									<option value="light">Light</option>
									<option value="auto">Auto</option>
								</select>
							</div>
						</div>
					</div> */}

					{/* Notifications */}
					{/* <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
						<h2 className="text-xl font-bold text-white mb-6">Notifications</h2>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-300 font-medium">Enable Notifications</p>
									<p className="text-sm text-gray-500">
										Receive updates about your trips
									</p>
								</div>
								<button type = "button"
									onClick={() => setNotifications(!notifications)}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
										notifications ? "bg-emerald-500" : "bg-gray-700"
									}`}
								>
									<span
										className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
											notifications ? "translate-x-6" : "translate-x-1"
										}`}
									/>
								</button>
							</div>
						</div>
					</div> */}

					{/* Map Settings
					<div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
						<h2 className="text-xl font-bold text-white mb-6">Map Settings</h2>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-300 font-medium">Show Location Labels</p>
									<p className="text-sm text-gray-500">
										Display names and information on map
									</p>
								</div>
								<button type = "button"
									onClick={() => setMapLabels(!mapLabels)}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
										mapLabels ? "bg-emerald-500" : "bg-gray-700"
									}`}
								>
									<span
										className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
											mapLabels ? "translate-x-6" : "translate-x-1"
										}`}
									/>
								</button>
							</div>
						</div>
					</div> */}

					{/* Account */}
					<div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
						<h2 className="text-xl font-bold text-white mb-6">Account</h2>
						<div className="space-y-4">
							<div className="flex items-center justify-between pb-4 border-b border-gray-700">
								<div>
									<p className="text-gray-300 font-medium">Account Email</p>
									<p className="text-sm text-gray-500">alex.morgan@example.com</p>
								</div>
								<button type = "button" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition">
									Change
								</button>
							</div>
							<div className="flex items-center justify-between pt-4">
								<div>
									<p className="text-gray-300 font-medium">Password</p>
									<p className="text-sm text-gray-500">Last changed 90 days ago</p>
								</div>
								<button type = "button" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition">
									Update
								</button>
							</div>
						</div>
					</div>

					{/* Danger Zone */}
					<div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
						<h2 className="text-xl font-bold text-red-300 mb-6">Danger Zone</h2>
						<button type = "button" className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-300 py-2 px-4 rounded-lg transition font-medium">
							Delete Account
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
