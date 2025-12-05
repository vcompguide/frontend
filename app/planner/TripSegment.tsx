import type { PointerEvent } from "react";
import { FaTrash } from "react-icons/fa";
import { ReactSortable } from "react-sortablejs";
import { uuidv7 } from "uuidv7";
import { CardInfo } from "./CardInfo";
import CardPreview from "./CardPreview";
import Tag from "./tag";

// Styles to hide arrows during drag
const styles = `
  .sortable-drag .arrow-container { opacity: 0; }
`;

interface TripSegmentProps {
	id: string;
	title: string;
	cards: CardInfo[];
	setCards: (cards: CardInfo[]) => void;
	removeSegment: (id: string) => void;
	updateTitle: (id: string, title: string) => void;
	onCardClick: (card: any) => void;
}

export default function TripSegment({
	id,
	title,
	cards,
	setCards,
	removeSegment,
	updateTitle,
	onCardClick,
}: TripSegmentProps) {
	const removeCard = (event: PointerEvent<HTMLButtonElement>, uuid: string) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;
		const newContent = cards.filter((card) => card.id !== uuid);
		setCards(newContent);
	};

	const cloneCard = (event: PointerEvent<HTMLButtonElement>, uuid: string) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;

		const index = cards.findIndex((item) => item.id === uuid);
		if (index === -1) return;

		const original = cards[index];
		const clone = new CardInfo(); // Assuming CardInfo handles basic defaults

		// Deep copy data
		const serialized = JSON.parse(JSON.stringify(original));
		Object.assign(clone, serialized);

		// Rehydrate tags
		if (serialized.tagsList) {
			clone.tagsList = serialized.tagsList.map((t: any) => {
				const newTag = new Tag();
				Object.assign(newTag, t);
				return newTag;
			});
		}

		// New ID
		clone.id = uuidv7();

		const newContent = [...cards];
		newContent.splice(index + 1, 0, clone);
		setCards(newContent);
	};
	return (
		<div className="flex flex-col h-full bg-white/50 rounded-xl p-2 outline-dashed outline-2 outline-gray-300 min-w-[300px] max-w-[80vw]">
			<style>{styles}</style>

			{/* Header */}
			<div className="flex justify-between items-center mb-2 px-2 cursor-grab active:cursor-grabbing handle-segment">
				<input
					className="font-bold bg-transparent border-b border-transparent hover:border-gray-400 focus:border-black outline-none w-full mr-2"
					value={title}
					onChange={(e) => updateTitle(id, e.target.value)}
					onMouseDown={(e) => e.stopPropagation()} // Allow typing without dragging
				/>
				<button
					type="button"
					onClick={() => removeSegment(id)}
					className="text-gray-400 hover:text-red-500 transition p-1 no-drag"
				>
					<FaTrash size={12} />
				</button>
			</div>

			<div className="grow overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 rounded-lg bg-gray-50/50">
				<ReactSortable
					list={cards}
					setList={setCards}
					group={{
						name: "PLANNER_GROUP",
						pull: true, // Allow moving items (was "clone")
						put: ["PLANNER_GROUP"],
					}}
					filter=".no-drag"
					animation={200}
					forceFallback={true}
					fallbackOnBody={true}
					swapThreshold={0.65}
					className="flex flex-col items-center h-full p-2 min-w-full gap-2"
				>
					{cards.map((card) => (
						<div
							key={card.id}
							data-id={card.id}
							className="flex flex-row items-center shrink-0 group relative"
						>
							<div className="relative hover:-translate-y-1 transition-transform duration-200">
								<CardPreview
									cardData={card}
									removeCall={removeCard}
									onClick={() => onCardClick(card)}
                                    cloneCall={cloneCard}
								/>
							</div>
						</div>
					))}
				</ReactSortable>
			</div>
		</div>
	);
}
