import { useEffect, useRef, useState } from "react";
import { FaChevronRight, FaPlay, FaPlus } from "react-icons/fa";
import { ReactSortable } from "react-sortablejs";
import { uuidv7 } from "uuidv7";
import type { CardInfo } from "./CardInfo";
import TripSegment from "./TripSegment";

// Data structure for a segment (group) in the builder
export interface TripSegmentInfo {
    id: string;
    title: string;
    cards: CardInfo[];
}

export default function TripBuilder( {onCardClick} : {
    onCardClick: (card: any) => void
}) {
    const [segments, setSegments] = useState<TripSegmentInfo[]>([
        { id: uuidv7(), title: "Day 1: Arrival", cards: [] }
    ]);
    const [isAnimating, setIsAnimating] = useState(false);

    // Refs for auto-scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevSegmentsLength = useRef(segments.length);

    // --- Auto-scroll Effect ---
    useEffect(() => {
        // Only scroll if the number of segments has increased
        if (segments.length > prevSegmentsLength.current && scrollContainerRef.current) {
            // Use a small timeout to ensure React/SortableJS has finished rendering the new DOM node
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        left: scrollContainerRef.current.scrollWidth,
                        behavior: "smooth"
                    });
                }
            }, 100);
        }
        // Update the ref for the next render
        prevSegmentsLength.current = segments.length;
    }, [segments]);

    // --- Actions ---

    const addSegment = () => {
        setSegments([...segments, { 
            id: uuidv7(), 
            title: `Segment ${segments.length + 1}`, 
            cards: [] 
        }]);
    };

    const removeSegment = (id: string) => {
        setSegments(segments.filter(s => s.id !== id));
    };

    const updateSegmentTitle = (id: string, newTitle: string) => {
        setSegments(segments.map(s => s.id === id ? { ...s, title: newTitle } : s));
    };

    // Helper to update cards inside a specific segment
    const setSegmentCards = (segmentId: string, newCards: CardInfo[]) => {
        setSegments(prev => prev.map(s => 
            s.id === segmentId ? { ...s, cards: newCards } : s
        ));
    };

    // --- Serialization ---
    const handleSerialize = () => {
        setIsAnimating(true);
        
        // 1. Create a clean object (stripping UI-specific stuff if needed)
        const exportData = segments.map(seg => ({
            segmentId: seg.id,
            segmentTitle: seg.title,
            cards: seg.cards.map(c => ({
                id: c.id,
                title: c.title,
                content: c.content,
                tags: c.tagsList,
                location: c.location ? {lat: c.location.lat, lng: c.location.lng} : null
            }))
        }));

        console.log("SERIALIZED TRIP DATA:", JSON.stringify(exportData, null, 2));
        
        setTimeout(() => setIsAnimating(false), 1000);
        return exportData;
    };

    return (
        <div className="relative w-full h-full flex flex-col bg-gray-50 overflow-hidden">
            
            {/* Toolbar */}
            <div className="absolute top-0 right-4 z-20 flex gap-2">
                <button
                    type="button"
                    onClick={addSegment}
                    className="flex items-center gap-2 px-2 py-1 rounded-full font-bold bg-white text-black shadow-md hover:bg-gray-100 transition border border-gray-200"
                >
                    <FaPlus size={12} />
                    <span>Add Segment</span>
                </button>
                <button
                    type="button"
                    onClick={handleSerialize}
                    className={`flex items-center gap-2 px-2 py-1 rounded-full font-bold shadow-lg transition-all 
                        ${isAnimating ? "bg-green-500 text-white scale-105" : "bg-black text-white hover:bg-gray-800 active:scale-95"}`}
                >
                    {isAnimating ? <span>Saved!</span> : <><FaPlay size={12} /><span>Build Route</span></>}
                </button>
            </div>

            {/* Horizontal Segments Container */}
            <div 
                ref={scrollContainerRef}
                className="grow flex items-center overflow-x-auto overflow-y-hidden p-8 scrollbar-thin scrollbar-thumb-gray-300"
            >
                <ReactSortable
                    list={segments}
                    setList={setSegments}
                    group="BUILDER_SEGMENTS" 
                    handle=".handle-segment"
                    animation={200}
                    className="flex flex-row h-full gap-4 min-w-fit"
                    ghostClass="opacity-50"
                    dragClass="cursor-grabbing"
                    direction="horizontal"
                >
                    {segments.map((segment, index) => (
                        <div key={segment.id} className="h-full flex flex-row items-center">
                            
                            {/* The Segment Group */}
                            <TripSegment 
                                id={segment.id}
                                title={segment.title}
                                cards={segment.cards}
                                setCards={(newCards) => setSegmentCards(segment.id, newCards)}
                                removeSegment={removeSegment}
                                updateTitle={updateSegmentTitle}
                                onCardClick={onCardClick}
                            />

                            {index < segments.length - 1 && (
                                <div className="ml-4 text-gray-300">
                                    <FaChevronRight size={24} />
                                </div>
                            )}
                        </div>
                    ))}
                </ReactSortable>
            </div>
        </div>
    );
}