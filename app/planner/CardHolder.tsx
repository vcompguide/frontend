import { useState } from "react"
import { FaCirclePlus } from "react-icons/fa6"
import { ReactSortable } from "react-sortablejs"
import { uuidv7 } from "uuidv7"
import { Button } from "@/components/ui/button"
import { getContrastColor } from "@/src/utils/getConstrastColors"
import { CardInfo } from "./CardInfo"
import CardPreview from "./CardPreview"
export class CardGroupInfo {
    id: string
    color?: string
    title?: string
    constructor() {
        this.id = uuidv7()
    }
}

export default function CardGroup({ info }: { info: CardGroupInfo }) {

    const [content, setContent] = useState<CardInfo[]>([
        new CardInfo().setTitle("Title1"),
    ])

    var addCard = () => {
        var newContent = [...content]
        newContent.push(new CardInfo().setTitle("New Card"));
        setContent(newContent)
    }

    var removeCard = (uuid: string) => {
        var newContent = [...content]
        var index = newContent.findIndex((value) => {
            return (value.id === uuid);
        })
        console.log(newContent)
        newContent.splice(index, 1)
        console.log(newContent)
        setContent(newContent)
    }

    console.log(info.color)
    return <div className={`rounded p-1 flex flex-col align-middle`} style= {{ backgroundColor: info.color
}}>
        <div className={`flex flex-row justify-center bg-transparent m-1 rounded font-bold font-[Inter] ${getContrastColor(info.color)} grow-0`}>
            {info.title}
        </div>
        <ReactSortable list={content} setList={setContent} className="flex flex-col grow shrink-0" animation={150} group={{
            name: "CardHolder",
            pull: true,
            put: true
        }}>
            {content.map((value) => <CardPreview key={value.id} cardData={value} removeCall={removeCard} />)}
        </ReactSortable>
        <Button className="bg-cream-50 h-5 m-2 p-2 hover:bg-cream-50 hover:brightness-90 active:brightness-75" onMouseDown={addCard}>
            <FaCirclePlus className= "fill-black cursor-pointer"/>
        </Button>
    </div>
} 