import { useEffect, useRef, useState } from "react";
import { CardInfo } from "./CardInfo";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import invariant from 'tiny-invariant';
export default function CardPreview({ cardData }: {
    cardData: CardInfo;
}) {
    const [isDragging, setDragging] = useState<boolean>(false)
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        invariant(el);

        return draggable({
            element: el,
            onDragStart: () => setDragging(true),
            onDrop: () => setDragging(false)
        });
    }, []);

    return <div className={`bg-grey-100 flex outline-2 flex-col w-50 rounded font-[Inter] p-1 m-1 gap-1  opacity-${isDragging ? 50 : 100} hover:outline-4`} ref={ref}>
        <div className="text-[1.2rem] font-bold">

            {cardData.title}
        </div>
        <div className="flex flex-row text-[0.7rem] overflow-hidden text-nowrap mask-r-from-80%">

            {cardData.content}
        </div>
        <div className={`flex flex-row overflow-auto gap-1 p-1 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-sky-100 `}>
            {cardData.tagsList && cardData.tagsList.map((value, index, array) => {
                return <div
                    className="flex flex-row rounded-full items-center text-[#0000007F] hover:text-[#000000FF] outline-1 text-[0.5rem] px-1 py-1 gap-0 content-center justify-end overflow-auto shrink-0 grow-0"
                    style={{ backgroundColor: value.RGB + "7F", outlineColor: value.RGB + "FF" }} key= {index}>
                    <div
                        className="rounded-full size-3"
                        style={{ backgroundColor: value.RGB + "FF" }}>
                    </div>
                    <div className="flex flex-row justify-center mx-1">
                        {value.name}
                    </div>
                </div>;
            })}
        </div>
    </div>;
}
