export default function isScrollable(scrollTop: number, scrollHeight: number, clientHeight: number) {
    return scrollTop + clientHeight <= scrollHeight
}