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
	color?: string;
	title?: string;
	constructor() {
		this.id = uuidv7();
	}
}

export default function CardGroup({ info }: { info: CardGroupInfo }) {
	const [content, setContent] = useState<CardInfo[]>([
		new CardInfo().setTitle("Title1"),
	]);

	var addCard = (event: PointerEvent<HTMLButtonElement>) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;

		const newContent = [...content];
		newContent.push(new CardInfo().setTitle("New Card").setContent("Lorem Ipsum abcdxyz UWUWUWUWUWUWUWUWU").setTagsList([new Tag().setName("Name1").setRGB("#FF00FF"), new Tag().setName("Name1").setRGB("#FF00FF"), new Tag().setName("Name1").setRGB("#FF00FF"), new Tag().setName("Name1").setRGB("#FF00FF")]));
		setContent(newContent);
	};

	var removeCard = (event: PointerEvent<HTMLButtonElement>, uuid: string) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;

		var newContent = [...content];
		var index = newContent.findIndex((value) => {
			return value.id === uuid;
		});
		console.log(newContent);
		newContent.splice(index, 1);
		console.log(newContent);
		setContent(newContent);
	};

	console.log(info.color);
	return (
		<div
			className={`rounded p-1 flex flex-col align-middle w-fit h-fit max-h-full py-2 outline-2 overflow-scroll shrink-0`}
			style={{ backgroundColor: `${info.color}BE`, outlineColor: `${info.color}FF`}}
		>
			<div
				className={`flex flex-row justify-center bg-transparent m-1 rounded font-bold font-[Inter] ${getContrastColor(info.color)} grow-0`}
			>
				{info.title}
			</div>
			<div className="flex flex-col overflow-y-auto">
				<ReactSortable
					list={content}
					setList={setContent}
					className="flex flex-col grow-0 shrink-0"
					animation={150}
					group={{
						name: "CardHolder",
						pull: true,
						put: true,
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
				<button
					type="button"
					className="relative bg-cream-50 h-6 m-1 p-2 hover:bg-cream-50  rounded hover:brightness-90 active:brightness-75 outline-1 hover:outline-2"
					onPointerDown={addCard}
				>
					<FaCirclePlus className="absolute -translate-1/2 left-1/2 top-1/2 fill-black cursor-pointer" />
				</button>
			</div>
		</div>
	);
}
