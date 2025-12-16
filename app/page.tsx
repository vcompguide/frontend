"use client";

import { LoremIpsum } from "lorem-ipsum";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const lorem = new LoremIpsum({
	sentencesPerParagraph: {
		max: 8,
		min: 4,
	},
	wordsPerSentence: {
		max: 16,
		min: 4,
	},
});

const text = lorem.generateParagraphs(2);

interface Preview {
	imagePath: string;
	targetSite: string;
	text: string;
}
function Preview({ imagePath, targetSite, text = "" }: Preview) {
	return (
		<Link
			href={targetSite}
			className="flex h-full w-full bg-transparent rounded-2xl content-center justify-center items-center relative overflow-hidden bg-contain bg-no-repeat"
			style={{ backgroundImage: `url(${imagePath})` }}
		>
			<div
				className={`flex content-center justify-center items-center w-full h-full hover:text-white transition hover:backdrop-blur-sm text-2xl hover:text-2xl absolute inset-0 font-[Inter] text-wrap  opacity-50 bg-transparent`}
			>
				{text}
			</div>
		</Link>
	);
}

export default function Page() {
	var mainPageElement = (
		<div className="flex flex-row flex-wrap items-center justify-center bg-cream-100 relative">
			<div className="absolute top-0 right-0 flex flex-row bg-transparent rounded justify-center gap-10 px-5 h-30 items-center z-10 w-[1/2]">
				{/* The top bar */}
				<Button className="flex-auto font-[Inter] bg-cerulean-100  text-center hover:bg-cerulean-50 hover:text-gray-800 content-center transition text-oxford-900">
					Features
				</Button>
				<Button className="flex-auto font-[Inter] bg-cerulean-100 text-center  hover:bg-cerulean-50 hover:text-gray-800 content-center transition text-oxford-900">
					Account
				</Button>
				<Link href="/planner">
					<Button className="flex-auto font-[Inter] bg-cerulean-100 text-center  hover:bg-cerulean-50 hover:text-gray-800 content-center transition text-oxford-900">
						Planner
					</Button>
				</Link>
			</div>
			<div className="flex flex-col h-screen w-full bg-linear-to-b from-blue-100 from-80% to-cream-100 to-100% items-center">
				{/* The top front */}
				<div className="flex flex-col w-[80vw] h-full content-center text-center gap text-base font-[Inter] items-center bg-transparent gap-10">
					<div className="flex flex-row h-[50vh] w-full bg-transparent mt-30 overflow-wrap align-center justify-center ml-[10vw]">
						<div className="h-full bg-transparent bg-[url('/HomepageNavigation.jpg')] border-black border-2 aspect-square"></div>
						<div className="w-100 inline-flex flex-col bg-transparent text-wrap text-2xl text-left p-8 font-[Roboto]">
							<div className=" w-full text-3xl ">Virtual Companion Guide</div>
							<div className="w-full text-sm overflow-hidden">{text}</div>
						</div>
					</div>
					A demonstration of how five vibe coders can create a functional city
					navigator in just 2 months
					<br />
					(We are finding bugs in the UI. I don't know what I am cooking)
					<br />
					<div className="flex gap-5 content-center text-center bg-transparent justify-center">
						<Button className="">See our product</Button>

						<Button> Learn more</Button>
					</div>
				</div>
			</div>
			<div className=" flex flex-col gap-10 w-3/5 items-center justify-center h-screen">
				{/* <div className="flex flex-row h-60 w-full  rounded-2xl">
					<Preview imagePath="Navigation_Preview.png" targetSite="navigation" text="Navigation" />
				</div> */}
				<div className="flex flex-row w-full h-60 justify-between p-4 gap-10">
					<Preview imagePath="sample.png" targetSite="" text="IDK" />
					<Preview imagePath="Navigation_Preview.png" targetSite="navigation" text="" />
					<Preview imagePath="" targetSite="" text="IDK" />
				</div>
			</div>
		</div>
	);
	return mainPageElement;
}
