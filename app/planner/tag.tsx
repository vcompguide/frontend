import { uuidv7 } from "uuidv7"

class Tag {
    RGB: string = ""
    name: string = ""
    id: string

    constructor() {
        this.id = uuidv7()
    }

	setRGB(RGB: string) {
		this.RGB = RGB;
		return this;
	}

	setName(name: string) {
		this.name = name;
		return this;
	}
}

export function tagEqual(tag1: Tag, tag2: Tag) : boolean {
    return tag1.name === tag2.name || tag1.id === tag2.id
}
export default Tag;
