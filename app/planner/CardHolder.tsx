import React, { ReactNode, useEffect, useRef, useState } from "react"
import CardPreview from "./CardPreview"
import invariant from "tiny-invariant";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/dist/types/adapter/element-adapter";
import { setFlagsFromString } from "v8";

export default function CardHolder({ order, Card }:
    {
        order: number,
        Card: null | ReactNode
    }) {
    const ref = useRef(null);
    const [isDraggedOver, setDraggedOver] = useState(false);

    useEffect(() => {
        const el = ref.current
        invariant(el)

        return dropTargetForElements({
            element: el,
            onDragEnter: () => setDraggedOver(true),
            onDragLeave: () => setDraggedOver(false),
            onDrop: () => setDraggedOver(false)
        })
    }, [])

    return <div ref = {ref}>
        {Card}
    </div>
}

