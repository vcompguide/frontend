import type { PointerEvent } from "react";
import { FaTrashAlt } from "react-icons/fa";
import type { CardInfo } from "./CardInfo";
export default function CardPreview({
	cardData,
	removeCall,
}: {
	cardData: CardInfo;
	removeCall: (event: PointerEvent<HTMLButtonElement>, uuid: string) => void;
}) {
	return (
		<div
			className={`relative bg-cream-200 flex outline-1 flex-col w-50 rounded font-[Inter] p-1 m-1 gap-1   hover:outline-2 cursor-grab active:cursor-grabbing`}
		>
			<button
				type="button"
				className="absolute flex p-0.75 items-center  transition opacity-25 hover:opacity-75 justify-center right-1 top-1 bg-transparent size-4 rounded-full cursor-auto  "
				onPointerDown={(event) => removeCall(event, cardData.id)}
			>
				<FaTrashAlt className="size-3" />
			</button>
			<div className="text-[1.2rem] font-bold">{cardData.title}</div>
			<div className="flex flex-row text-[0.7rem] overflow-hidden text-nowrap mask-r-from-80%">
				{cardData.content}
			</div>
			<div
				className={`flex flex-row overflow-auto gap-1 p-1 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-sky-100 `}
			>
				{cardData.tagsList?.map((value) => {
					return (
						<div
							className="flex flex-row rounded-full items-center text-[#4949497f] hover:text-[#000000FF] outline-1 text-[0.5rem] px-1 py-1 gap-0 content-center justify-end overflow-auto shrink-0 grow-0"
							style={{
								backgroundColor: `${value.RGB}7F`,
								outlineColor: `${value.RGB}FF`,
							}}
							key={value.id}
						>
							<div
								className="rounded-full size-3"
								style={{ backgroundColor: `${value.RGB}FF` }}
							></div>
							<div className="flex flex-row justify-center mx-1">
								{value.name}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
