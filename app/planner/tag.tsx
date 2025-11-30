class Tag {
    RGB: string = ""
    name: string = ""

    constructor(RGB: string, name: string) {
        this.RGB = RGB
        this.name = name
    }

    setRGB(RGB: string) {
        this.RGB = RGB
        return this
    }

    setName(name: string) {
        this.name = name
        return this
    }
}

export function tagEqual(tag1: Tag, tag2: Tag) : boolean {
    return tag1.name == tag2.name
}
export default Tag