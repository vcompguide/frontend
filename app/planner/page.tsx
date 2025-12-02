"use client"

import CardPreview from "./CardPreview"
import { CardInfo } from "./CardInfo"
import Tag from "./tag"
import CardHolder, { CardGroupInfo } from "./CardHolder"

import { useState } from "react"
import { ReactSortable } from "react-sortablejs"

export default function Page() {

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
    var groupInfo = new CardGroupInfo()

    groupInfo.title = "Group1"
    groupInfo.color = "#231245"
    return (
        <div className="flex flex-row">

            <CardHolder info={groupInfo} />
        </div >
    );
};