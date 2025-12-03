import { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import CardGroup, { CardGroupInfo } from "./CardGroup";
export default function TripPlanner() {
	const [groupInfos, setListOfGroup] = useState<CardGroupInfo[]>([]);

	var addGroup = () => {
		var newGroupInfos = [...groupInfos];
		newGroupInfos.push(new CardGroupInfo());
        newGroupInfos[newGroupInfos.length - 1].color = "#0FF110"
        newGroupInfos[newGroupInfos.length - 1].title = "Loerm Ipsum"
		setListOfGroup(newGroupInfos);
	};

	return (
		<div className="rounded bg-cream-300 flex flex-row gap-2 h-full overflow-crip p-2">
			{groupInfos.map((value) => {
				return (
						<CardGroup info={value} key={value.id} />
				);
			})}
			<button
				type="button"
				className="relative w-6 min-h-30 flex grow bg-cream-100 hover:brightness-90 transition rounded outline-2 shrink-0"
				onMouseDown={addGroup}
			>
                <FaPlusCircle className="absolute -translate-1/2 left-1/2 top-1/2 size-4 "/>
            </button>
		</div>
	);
}
