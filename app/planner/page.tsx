"use client";


import CardHolder, { CardGroupInfo } from "./CardHolder"

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

    var groupInfo = new CardGroupInfo()

	groupInfo.title = "Group1";
	groupInfo.color = "#231245";
	return (
		<div className="flex flex-row">
			<CardHolder info={groupInfo} />
		</div>
	);
}
