import { useEffect, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { ReactSortable } from "react-sortablejs";
import CardGroup, { CardGroupInfo } from "./CardGroup";

// You can keep this style block here or move the CSS to your global stylesheet
const styles = `
  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
  .animate-pop-in {
    animation: popIn 0.3s ease-out forwards;
  }
`;

export default function TripPlanner() {
  const [groupInfos, setListOfGroup] = useState<CardGroupInfo[]>([]);
  const [scrollToId, setScrollToId] = useState<string | null>(null);

  // Scroll Logic
  useEffect(() => {
    if (scrollToId) {
      const element = document.getElementById(`group-container-${scrollToId}`);
      if (element) {
        // Small timeout ensures the animation has started and DOM is painted
        setTimeout(() => {
            element.scrollIntoView({ 
                behavior: "smooth", 
                block: "nearest", 
                inline: "center" 
            });
        }, 50); 
        setScrollToId(null);
      }
    }
  }, [groupInfos, scrollToId]);

  var addGroup = () => {
    var newGroupInfos = [...groupInfos];
    const newGroup = new CardGroupInfo();
    newGroup.color = "#0FF110";
    newGroup.title = "Lorem Ipsum";
    
    newGroupInfos.push(newGroup);
    setListOfGroup(newGroupInfos);
    setScrollToId(newGroup.id);
  };

  var addGroupAt = (id: string) => {
    var newGroupInfos = [...groupInfos];
    var insertPosition = newGroupInfos.findIndex((value) => value.id === id);
    const newGroup = new CardGroupInfo();
    
    newGroupInfos.splice(insertPosition, 0, newGroup);
    setListOfGroup(newGroupInfos);
    setScrollToId(newGroup.id);
  };

  var updateGroupInfo = (id: string, title: string, color: string) => {
    var newGroup = [...groupInfos];
    var foundPosition = newGroup.findIndex((value) => value.id === id);
    if (foundPosition !== -1) {
      newGroup[foundPosition].title = title;
      newGroup[foundPosition].color = color;
    }
    setListOfGroup(newGroup);
  };

  return (
    <>
      {/* Inject styles for the animation */}
      <style>{styles}</style>

      <div className="rounded bg-cream-300 flex h-full w-fit max-w-full overflow-clip p-2">
        <div className="flex flex-row overflow-scroll scroll-smooth">
          <ReactSortable
            list={groupInfos}
            setList={setListOfGroup}
            className="flex flex-row gap-2 h-full overflow-clip p-2"
            animation={150}
            filter=".no-drag"
            preventOnFilter={false}
            forceFallback={true}
            dragClass="cursor-grabbing"
            group={{ name: "Kanban", pull: ["Kanban"], put: ["Kanban"] }}
          >
            {groupInfos.map((value) => {
              return (
                <div
                  key={value.id}
                  id={`group-container-${value.id}`}
                  className="flex flex-row h-full gap-2 m"
                >
                  <button
                    type="button"
                    className="no-drag relative w-2 h-full opacity-0 hover:opacity-75 bg-black transition rounded-full cursor-pointer z-0"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      addGroupAt(value.id);
                    }}
                  >
                    <FaPlusCircle className="absolute -translate-1/2 top-1/2 left-1/2 text-white" />
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
    </>
  );
}