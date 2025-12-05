"use client";

import { useState } from "react";
import CardEditorPanel from "./CardEditorPanel";
import type { CardInfo } from "./CardInfo";
import TripBuilder from "./TripBuilder";
import TripPlanner from "./TripPlanner";

export default function Page() {
	const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null);
	const [dummyState, setDummyState] = useState(0);

	// NEW STATE: Holds the title to search for

	const handleCardClick = (card: CardInfo) => {
		setSelectedCard(card);
	};

	const handleDataUpdate = () => {
		setDummyState((prev) => prev + 1);
	};

	// NEW HANDLER: Passed down to cards

	return (
		<div className="relative flex flex-col h-screen items-center bg-gray-50">


			{/* Editor Overlay */}
			{selectedCard && (
				<CardEditorPanel
					card={selectedCard}
					onClose={() => setSelectedCard(null)}
					onUpdate={handleDataUpdate}
				/>
			)}

			{/* PLANNER */}
			<div className="flex flex-col outline-gray-100 w-screen bg-white shrink-0 grow-0 h-1/2 max-h-1/2 ring-4 rounded ring-gray-100 ring-inset overflow-y-hidden gap-2 z-10 pt-6">
				{/* Added pt-12 above to make room for Search Bar */}
				<div className="flex flex-row justify-center font-[Inter] font-black text-2xl select-none">
					Planner
				</div>

				<div className="flex overflow-y-hidden grow">
					<TripPlanner
						onCardClick={handleCardClick}
					/>
				</div>
			</div>

			{/* TRIP BUILDER */}
			<div className="outline-0 w-screen bg-gray-100 shrink-0 grow-0 h-1/2 ring-4 ring-inset ring-gray-200 rounded flex flex-col gap-3 p-3">
				<div className="flex flex-row justify-center font-[Inter] font-black text-2xl mt-2 bg-gray-100 z-10 select-none">
					Trip builder
				</div>

				<div className="grow overflow-hidden relative">
					<TripBuilder
						onCardClick={handleCardClick}
					/>
				</div>
			</div>
		</div>
	);
}
