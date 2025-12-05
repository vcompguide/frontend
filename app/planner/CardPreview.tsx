import type { PointerEvent } from "react";
import { FaPen, FaRegCopy, FaTrashAlt } from "react-icons/fa"; // Added FaRegCopy
import type { CardInfo } from "./CardInfo";

export default function CardPreview({
	cardData,
	removeCall,
    cloneCall, // New Prop
    onClick 
}: {
	cardData: CardInfo;
	removeCall: (event: PointerEvent<HTMLButtonElement>, uuid: string) => void;
    cloneCall?: (event: PointerEvent<HTMLButtonElement>, uuid: string) => void; // New Prop Type
    onClick?: () => void;
}) {
	return (
		<div 
			className={`
                group relative flex flex-col w-50 rounded font-[Inter] p-1 pl-2 m-1 gap-1 
                outline-1 hover:outline-2 
                transition-colors duration-200
            `}
            style={{ 
                backgroundColor: cardData.color, 
                borderColor: `${cardData.color}AA` 
            }}
		>
            <div className="absolute right-1 top-1 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               
                {/* Edit Button */}
                <button
                    type="button"
                    className="flex p-1 items-center justify-center bg-black/10 hover:bg-black/20 text-black/50 hover:text-black size-5 rounded-full cursor-pointer transition"
                    onClick={(e) => {
                        e.stopPropagation();
                        if(onClick) onClick();
                    }}
                    title="Edit Card"
                >
                    <FaPen className="size-2.5" />
                </button>

                {/* Clone Button (NEW) */}
                <button
                    type="button"
                    className="flex p-1 items-center justify-center bg-black/10 hover:bg-blue-500 text-black/50 hover:text-white size-5 rounded-full cursor-pointer transition"
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        if(cloneCall) cloneCall(event, cardData.id);
                    }}
                    title="Clone Card"
                >
                    <FaRegCopy className="size-2.5" />
                </button>

                {/* Delete Button */}
                <button
                    type="button"
                    className="flex p-1 items-center justify-center bg-black/10 hover:bg-red-500 text-black/50 hover:text-white size-5 rounded-full cursor-pointer no-drag transition"
                    onPointerDown={(event) => {
                        event.stopPropagation(); // Stop click from bubbling
                        removeCall(event, cardData.id)
                    }}
                    title="Delete Card"
                >
                    <FaTrashAlt className="size-2.5" />
                </button>
            </div>

			<div className="text-[1.2rem] font-bold select-none pr-12">{cardData.title}</div>
			
            <div className="flex flex-row text-[0.7rem] overflow-hidden text-nowrap mask-r-from-80% opacity-70 select-none">
				{cardData.content}
			</div>
			
            <div className={`flex flex-row overflow-auto gap-3 p-1 scrollbar-none`}>
				{cardData.tagsList?.map((value) => {
					return (
						<div
							className="flex flex-row rounded-full items-center outline-1 text-[0.7rem] px-1 py-[0.5] gap-0 content-center justify-end overflow-auto shrink-0 grow-0 font-bold brightness-90 hover:brightness-100 tracking-widest"
							style={{
								backgroundColor: `${value.RGB}7F`,
								outlineColor: `${value.RGB}FF`,
								color: value.RGB
							}}
							key={value.id}
						>
							<div
								className="rounded-full size-2"
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