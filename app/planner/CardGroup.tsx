import type { PointerEvent } from "react";
import { useState } from "react";
import { FaPalette } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { ReactSortable } from "react-sortablejs";
import { uuidv7 } from "uuidv7";
import { getContrastColor } from "@/src/utils/getConstrastColors";
import { CardInfo } from "./CardInfo";
import CardPreview from "./CardPreview";
import Tag from "./tag";

export class CardGroupInfo {
	id: string;
	color: string;
	title: string;
	constructor() {
		this.id = uuidv7();
		this.title = "New Group";
		this.color = "#FFFFFF";
	}
}

export default function CardGroup({
	info,
	onUpdate,
	onCardClick,
}: {
	info: CardGroupInfo;
	onUpdate: (id: string, title: string, color: string) => void;
	onCardClick: (card: CardInfo) => void;
}) {
	const [content, setContent] = useState<CardInfo[]>([]);
	const [title, setTitle] = useState<string>(info.title);

	var addCard = (event: PointerEvent<HTMLButtonElement>) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;

		const newContent = [...content];
		newContent.push(new CardInfo());
		setContent(newContent);
	};

	var removeCard = (event: PointerEvent<HTMLButtonElement>, uuid: string) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;

		var newContent = [...content];
		var index = newContent.findIndex((value) => {
			return value.id === uuid;
		});
		newContent.splice(index, 1);
		setContent(newContent);
	};

	var cloneCard = (event: PointerEvent<HTMLButtonElement>, uuid: string) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;

		const index = content.findIndex((item) => item.id === uuid);
		if (index === -1) return;

		const original = content[index];
		const clone = new CardInfo();

		// Deep copy properties
		const serialized = JSON.parse(JSON.stringify(original));
		Object.assign(clone, serialized);

		// Reconstruct Tags to ensure they are valid class instances
		if (serialized.tagsList) {
			clone.tagsList = serialized.tagsList.map((t: any) => {
				const newTag = new Tag();
				Object.assign(newTag, t);
				return newTag;
			});
		}

		// Assign NEW UUID
		clone.id = uuidv7();

		const newContent = [...content];
		// Insert clone immediately after the original
		newContent.splice(index + 1, 0, clone);
		setContent(newContent);
	};
	var onUnFocus = () => {
		// Use local 'title' state, not info.title, to ensure edits are saved
		onUpdate(info.id, title, info.color);
	};

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Trigger update immediately with new color
		onUpdate(info.id, title, e.target.value);
	};

	return (
		<div
			className={`rounded p-1 flex flex-col align-middle w-fit h-fit max-h-full py-0 outline-2 overflow-hidden shrink-0 hover:cursor-grab active:cursor-grabbing focus:cursor-grabbing pt-2 rounded-t-2xl`}
			style={{
				backgroundColor: `${info.color}BE`,
				outlineColor: `${info.color}FF`,
			}}
		>
			{/* Header: Title and Color Picker */}
			<div className="relative flex flex-row it`ems-center justify-between pr-1 gap-2">
				<input
					className={`
						relative
                        m-1 w-50 max-w-full grow-0
                        bg-transparent
                        font-[Inter] font-bold text-left
                        border-b-2 border-transparent
                        hover:border-white/50
                        focus:border-white focus:outline-none
                        transition-colors duration-200
                        no-drag
                        ${getContrastColor(info.color)}
                    `}
					value={title}
					onBlur={() => {
						onUnFocus();
					}}
					onChange={(e) => {
						setTitle(e.target.value);
					}}
				/>

				{/* Color Picker Button */}
				<div
					className={`
                        absolute group flex items-center justify-center 
                        p-1.5 rounded-full right-0 top-0 
                        hover:bg-black/10 cursor-pointer transition no-drag
                        ${getContrastColor(info.color)}
                    `}
					title="Change Group Color"
				>
					<FaPalette className="size-3 opacity-50 group-hover:opacity-100" />
					<input
						type="color"
						className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
						value={info.color}
						onChange={handleColorChange}
					/>
				</div>
			</div>

			<div className="flex flex-col overflow-y-auto grow">
				<ReactSortable
					list={content}
					setList={setContent}
					animation={200}
					forceFallback={true}
					fallbackOnBody={true}
					swapThreshold={0.65}
					group={{
						name: "PLANNER_GROUP",
						pull: true, // Change this to "clone" (was true)
						put: ["PLANNER_GROUP"],
					}}
					// Your existing clone function handles the ID regeneration perfectly
					clone={(item) => {
						const clone = new CardInfo();

						const serialized = JSON.parse(JSON.stringify(item));
						Object.assign(clone, serialized);

						// 3. Re-instantiate Tags (since JSON turns them into plain objects)
						if (serialized.tagsList) {
							clone.tagsList = serialized.tagsList.map((t: any) => {
								const newTag = new Tag();
								// Copy tag properties (RGB, name, etc.)
								Object.assign(newTag, t);
								// Important: Tag usually needs a new ID too if you want them independent
								// If you want them to remain "the same tag", keep t.id.
								// Usually for a copy, we want a fresh ID:
								// newTag.id = uuidv7();
								return newTag;
							});
						}

						// 4. ESSENTIAL: Generate a new ID for the Card itself
						clone.id = uuidv7();

						return clone;
					}}
				>
					{content.map((value) => (
						<CardPreview
							key={value.id}
							cardData={value}
							removeCall={removeCard}
							cloneCall={cloneCard}
							onClick={() => onCardClick(value)}
						/>
					))}
				</ReactSortable>
			</div>
			<button
				type="button"
				className="relative bg-cream-50 h-6 m-1 p-2 hover:bg-cream-50  rounded hover:brightness-90 active:brightness-75 outline-1 hover:outline-2 shrink-0"
				onPointerDown={addCard}
			>
				<FaCirclePlus className="absolute -translate-1/2 left-1/2 top-1/2 fill-black cursor-pointer" />
			</button>
		</div>
	);
}
