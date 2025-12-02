import { uuidv7 } from "uuidv7"
import CardPreview from "./CardPreview"
import { useState } from "react"
import { CardInfo } from "./CardInfo"
import { ReactSortable } from "react-sortablejs"
import { getContrastColor } from "@/src/utils/getConstrastColors"
import { Button } from "@/components/ui/button"
import { FaCirclePlus } from "react-icons/fa6"
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

    let addCard = () => {
        let newContent = [...content]
        newContent.push(new CardInfo().setTitle("New Card"));
        setContent(newContent)
    }

    let removeCard = (uuid: string) => {
        let newContent = [...content]
        let index = newContent.findIndex((value, index, newContent) => {
            return (value.id === uuid);
        })
        console.log(newContent)
        newContent.splice(index, 1)
        console.log(newContent)
        setContent(newContent)
    }
    return <div className={`bg-[${info.color}] rounded p-1 flex flex-col align-middle`}>
        <div className={`flex flex-row justify-center bg-transparent m-1 rounded font-bold font-[Inter] ${getContrastColor(info.color)} grow-0`}>
            {info.title}
        </div>
        <ReactSortable list={content} setList={setContent} className="flex flex-col grow shrink-0" animation={150} group={{
            name: "CardHolder",
            pull: true,
            put: true
        }}>
            {content.map((value, index, array) => <CardPreview key={value.id} cardData={value} removeCall={removeCard} />)}
        </ReactSortable>
        <Button className="bg-cream-50 h-5 m-2 p-2 hover:bg-cream-50 hover:brightness-90 active:brightness-75" onClick={addCard}>
            <FaCirclePlus className= "fill-black cursor-pointer"/>
        </Button>
    </div>
} 