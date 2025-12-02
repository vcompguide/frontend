"use client";

import { CardGroupInfo } from "./CardGroup";
import TripPlanner from "./TripPlanner";

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

	var groupInfo = new CardGroupInfo();

	groupInfo.title = "Group1";
	groupInfo.color = "#231245";
	return (
		<div className="flex flex-col h-screen items-center">
				<div className="flex flex-col outline-gray-100 w-screen bg-white shrink-0 grow-0 h-1/2 max-h-1/2 ring-4 rounded ring-gray-100 ring-inset overflow-y-hidden">
					<div className="flex flex-row justify-center font-[Inter] font-black text-2xl mt-2">
						Planner
					</div>

					<div className="flex overflow-y-hidden ">
						<TripPlanner />
					</div>
				</div>
			{/* <div className="outline-0 w-screen bg-gray-100 shrink-0 grow-0 h-1/2 ring-4 ring-inset ring-gray-200 rounded"> */}
			{/* <div className = "flex flex-row justify-center font-[Inter] font-black text-2xl mt-2"> */}
			{/* Trip builder */}
			{/* </div> */}
			{/* </div> */}
		</div>
	);
}
