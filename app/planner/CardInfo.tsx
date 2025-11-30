import { Newsreader } from "next/font/google"
import Tag, { tagEqual } from "./tag"
import { CardAction } from "@/components/ui/card"
export interface CardInfo {
    id: number;
    title?: string;
    content?: string;
    tagsList?: Array<Tag>;
    createdAt?: Date | null;
    deadline?: Date | null;

}

