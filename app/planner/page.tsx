"use client"

import CardPreview from "./CardPreview"
import { CardInfo } from "./CardInfo"
import Tag from "./tag"
import CardHolder from "./CardHolder"

import { useState } from "react"
import { ReactSortable } from "react-sortablejs"
export default function Page() {
    let dummyCardInfo: CardInfo = {
        id: 12,
        title: "This is title",
        content: "Content",
        tagsList: []

    }

    const preview = <CardPreview cardData={dummyCardInfo} />
    // return (<div className="flex flex-col">
    //     <h1 className="text-9xl">
    //         This is just a testing. Ty
    //     </h1>
    //     <CardPreview cardData={dummyCardInfo} />
    //     <CardPreview cardData={dummyCardInfo2} />
    //     <CardPreview cardData={dummyCardInfo} />
    //     {/* <CardHolder Card={preview} order = {1}/> */}

    // </div>)


    interface ItemType {
        id: number;
        name: string;
    }

    const [list1, setList1] = useState<CardInfo[]>([
        { id: 3, title: "Title1", content: "209483", tagsList: [new Tag("#123456", "UwU")] },
        { id: 4, title: "Title2" }
    ]);
    const [list2, setList2] = useState<CardInfo[]>([
        { id: 1, title: "Title1", content: "209483", tagsList: [new Tag("#123456", "UwU")] },
        { id: 2, title: "Title2" }
    ]);

    return (
        <div className="flex flex-row gap-20">

            <ReactSortable list={list1} setList={setList1} className=" flex-col flex align-middle w-fit" group={{
                name: 'group1',
                pull: true,
                put: true
            }}>
                {list1.map((item) => (
                    <CardPreview key={item.id} cardData={item} />
                ))}
            </ReactSortable>
            <ReactSortable list={list2} setList={setList2} className="w-40 flex-col flex align-middle" group={{
                name: 'group1',
                pull: true,
                put: true
            }}>
                {list2.map((item) => (
                    <CardPreview key={item.id} cardData={item} />
                ))}
            </ReactSortable>
        </div >
    );
};