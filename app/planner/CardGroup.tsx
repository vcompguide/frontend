import type { PointerEvent } from "react";
import { useState } from "react";
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
}: {
	info: CardGroupInfo;
	onUpdate: (id: string, title: string, color: string) => void;
}) {
	const [content, setContent] = useState<CardInfo[]>([]);

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

	var onUnFocus = () => {
		onUpdate(info.id, info.title, info.color);
	};

	const [title, setTitle] = useState<string>(info.title);

	console.log(info.color);
	return (
		<div
			className={`rounded p-1 flex flex-col align-middle w-fit h-fit max-h-full py-0 outline-2 overflow-scroll shrink-0`}
			style={{
				backgroundColor: `${info.color}BE`,
				outlineColor: `${info.color}FF`,
			}}
		>
				<input
					className={`w-50 flex flex-row justify-center bg-transparent m-1 rounded font-bold font-[Inter]  text-center max-w-full ${getContrastColor(info.color)} grow-0 border-0 focus:outline-2`}
					value={title}
					onBlur={() => {
						onUnFocus();
					}}
					onChange={(e) => {
						setTitle(e.target.value);
					}}
				/>
			<div className="flex flex-col overflow-y-auto">
				<ReactSortable
					list={content}
					setList={setContent}
					className="flex flex-col grow-0 shrink-0"
					animation={150}
					group={{
						name: "CardHolder",
						pull: ["CardHolder"],
						put: ["CardHolder"],
					}}
				>
					{content.map((value) => (
						<CardPreview
							key={value.id}
							cardData={value}
							removeCall={removeCard}
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
