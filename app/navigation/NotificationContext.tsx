"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

export interface Notification {
	id: string;
	message: string;
	type: "success" | "error" | "info" | "warning";
	duration?: number;
}

interface NotificationContextType {
	notifications: Notification[];
	addNotification: (notification: Omit<Notification, "id">) => void;
	removeNotification: (id: string) => void;
	clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined,
);

export function NotificationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const addNotification = useCallback(
		(notification: Omit<Notification, "id">) => {
			const id = Math.random().toString(36).substr(2, 9);
			const newNotification: Notification = { ...notification, id };

			setNotifications((prev) => [...prev, newNotification]);

			// Auto-remove notification after duration
			if (notification.duration !== undefined && notification.duration > 0) {
				setTimeout(() => {
					removeNotification(id);
				}, notification.duration);
			}
		},
		[],
	);

	const removeNotification = useCallback((id: string) => {
		setNotifications((prev) => prev.filter((notif) => notif.id !== id));
	}, []);

	const clearNotifications = useCallback(() => {
		setNotifications([]);
	}, []);

	return (
		<NotificationContext.Provider
			value={{ notifications, addNotification, removeNotification, clearNotifications }}
		>
			{children}
			<NotificationDisplay />
		</NotificationContext.Provider>
	);
}

export function useNotification() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error("useNotification must be used within NotificationProvider");
	}
	return context;
}

function NotificationDisplay() {
	const { notifications, removeNotification, clearNotifications } =
		useNotification();

	if (notifications.length === 0) {
		return null;
	}

	const typeStyles = {
		success:
			"bg-green-500/20 border-green-500 text-green-300 hover:bg-green-500/30",
		error: "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30",
		info: "bg-blue-500/20 border-blue-500 text-blue-300 hover:bg-blue-500/30",
		warning:
			"bg-yellow-500/20 border-yellow-500 text-yellow-300 hover:bg-yellow-500/30",
	};

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
			{notifications.map((notif) => (
				<div
					key={notif.id}
					className={`px-4 py-3 rounded-lg border backdrop-blur-sm transition-all animate-slide-in ${typeStyles[notif.type]}`}
				>
					<div className="flex items-start justify-between gap-3">
						<p className="text-sm font-medium">{notif.message}</p>
						<button type = "button"
							onClick={() => removeNotification(notif.id)}
							className="text-lg leading-none opacity-70 hover:opacity-100 transition"
						>
							✕
						</button>
					</div>
				</div>
			))}

			{notifications.length > 0 && (
				<button type = "button"
					onClick={clearNotifications}
					className="text-xs text-gray-400 hover:text-gray-300 transition text-center mt-2"
				>
					Clear all
				</button>
			)}
		</div>
	);
}
