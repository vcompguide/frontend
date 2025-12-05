import type { LatLng } from "leaflet";
import { uuidv7 } from "uuidv7";
import type Tag from "./tag";
import { tagEqual } from "./tag";

export class CardInfo {
	id: string;
	title: string;
	content: string;
	tagsList: Array<Tag>;
	location?: LatLng;
    // New properties
    color: string; 
    createdAt: number;

	constructor() {
		this.id = uuidv7();
        this.title = "New Card";
        this.content = "Card content...";
        this.tagsList = [];
        this.color = "#FFF8E7"; // Default cream color
        this.createdAt = Date.now();
	}

	setTitle(title: string): this {
		this.title = title;
		return this;
	}

	setContent(content: string): this {
		this.content = content;
		return this;
	}

    setColor(color: string): this {
        this.color = color;
        return this;
    }

	setTagsList(tags?: Array<Tag>): this {
		this.tagsList = tags ? [...tags] : [];
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