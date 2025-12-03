import { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { ReactSortable } from "react-sortablejs";
import CardGroup, { CardGroupInfo } from "./CardGroup";
export default function TripPlanner() {
	const [groupInfos, setListOfGroup] = useState<CardGroupInfo[]>([]);

	var addGroup = () => {
		var newGroupInfos = [...groupInfos];
		newGroupInfos.push(new CardGroupInfo());
		newGroupInfos[newGroupInfos.length - 1].color = "#0FF110";
		newGroupInfos[newGroupInfos.length - 1].title = "Loerm Ipsum";
		setListOfGroup(newGroupInfos);
	};

	var addGroupAt = (id: string) => {
		var newGroup = [...groupInfos];
		var insertPosition = newGroup.findIndex((value) => {
			return value.id === id;
		});
		newGroup.splice(insertPosition, 0, new CardGroupInfo());
		setListOfGroup(newGroup);
	};

	var updateGroupInfo = (id: string, title: string, color: string) => {
		var newGroup = [...groupInfos]
		var foundPosition = newGroup.findIndex((value) => {
			return value.id === id
		})
		if (foundPosition !== -1) {
			newGroup[foundPosition].title = title
			newGroup[foundPosition].color = color
		}
		setListOfGroup(newGroup)
	}
	return (
		<div className="rounded bg-cream-300 flex h-full w-fit max-w-full overflow-clip p-2">
		<div className = "flex flex-row overflow-scroll">

			<ReactSortable
				list={groupInfos}
				setList={setListOfGroup}
				className="flex flex-row gap-2 h-full overflow-clip p-2"
				animation={150}
				filter=".no-drag"
				preventOnFilter={false}
				forceFallback={true}
				dragClass="cursor-grabbing"
				group={{
					name: "Kanban",
					pull: ["Kanban"],
					put: ["Kanban"],
				}}
				>
				{groupInfos.map((value) => {
					return (
						<div key={value.id} className="flex flex-row h-full gap-2 m">
							{/* Key removed from here, it is now on the parent div above */}

							<button
								type="button"
								className="no-drag relative w-1 h-full opacity-0 hover:opacity-75 bg-black transition rounded-full cursor-pointer z-0"
								onMouseDown={(e) => {
									e.stopPropagation();
									addGroupAt(value.id);
								}}
							>
								<FaPlusCircle className="absolute  -translate-1/2 top-1/2 left-1/2 z-1000000 bg-white" />
							</button>
							<CardGroup info={value} onUpdate={updateGroupInfo} />
						</div>
					);
				})}
			</ReactSortable>
		</div>

			<button
				type="button"
				className="relative w-6 min-h-30 flex grow bg-cream-100 hover:brightness-90 transition rounded outline-2 shrink-0 z-0"
				onMouseDown={addGroup}
			>
				<FaPlusCircle className="absolute -translate-1/2 left-1/2 top-1/2 size-4 z-10" />
			</button>
		</div>
	);
}
