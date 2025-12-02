import { Newsreader } from "next/font/google";
import Tag, { tagEqual } from "./tag";
import { CardAction } from "@/components/ui/card";
import { uuidv7 } from "uuidv7";
import { LatLng } from "leaflet";
export class CardInfo {
	id: string;
	title?: string;
	content?: string;
	tagsList?: Array<Tag>;
	location?: LatLng;
	constructor() {
		this.id = uuidv7();
	}

	setTitle(title?: string): this {
		this.title = title;
		return this;
	}

	setContent(content?: string): this {
		this.content = content;
		return this;
	}

	setTagsList(tags?: Array<Tag>): this {
		this.tagsList = tags ? [...tags] : undefined;
		return this;
	}

	addTag(tag: Tag): this {
		if (!this.tagsList) this.tagsList = [];
		this.tagsList.push(tag);
		return this;
	}

	removeTag(tag: Tag): this {
		if (!this.tagsList) return this;
		this.tagsList = this.tagsList.filter((t) => !tagEqual(t, tag));
		return this;
	}
}
