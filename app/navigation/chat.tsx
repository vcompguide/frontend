import { useState } from "react";
import { FaMinus } from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import { uuidv7 } from "uuidv7";

export function BotMessage({ message }: { message: string }) {
	return (
		<div className="flex gap-3">
			<div className="size-6 rounded-full bg-blue-500 shrink-0 mt-1" />
			<div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-gray-200 leading-relaxed">
				{message}
			</div>
		</div>
	);
}

export function UserMessage({ message }: { message: string }) {
	return (
		<div className="flex justify-end">
			<div className="bg-emerald-500 text-black font-semibold text-xs py-2 px-4 rounded-full">
				{message}
			</div>
		</div>
	);
}

interface Message {
	id: string;
	content: string;
	type: string;
}
export function ChatBox() {
	const [showDetail, setShowDetail] = useState<boolean>(false);
	const [messageList, setMessageList] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState<string>("");

	const APICallMessage = (query: string): Message => {
		// Placeholder
		return { id: uuidv7(), content: query, type: "Answer" };
	};

	const handleUserMessage = (message: string) => {
		const newMessageList = [
			...messageList,
			{ id: uuidv7(), content: message, type: "Question" },
		];
		setMessageList(newMessageList);
		const apiMessage = APICallMessage(message);
		setMessageList([...newMessageList, apiMessage]);
	};

	return (
		<div
			className={`absolute bottom-0 left-1/2 ${showDetail ? "translate-y-0" : "translate-y-1/2"} -translate-x-1/2 z-10 w-[380px] transition`}
		>
			<div className="bg-[#1e1e1e]/95 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
				{/* Chat Header */}
				<button
					type="button"
					className="flex justify-between items-center p-3 border-b border-white/5 cursor-pointer w-full"
					onClick={() => {
						setShowDetail(!showDetail);
					}}
				>
					<div className="flex items-center gap-3">
						<div className="size-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
							AI
						</div>
						<div>
							<div className="text-sm font-bold text-white">
								Guide Assistant
							</div>
							<div className="text-[10px] text-emerald-400 flex items-center gap-1">
								● Online • Active now
							</div>
						</div>
					</div>
					<FaMinus className="text-gray-500" />
				</button>
				{/* Chat Content */}
				{showDetail && (
					<div className="p-4 space-y-4 max-h-[250px] overflow-y-auto">
						{/* Bot Msg */}
						{messageList.map((msg, index) =>
							msg.type === "Answer" ? (
								<BotMessage key={msg.id} message={msg.content} />
							) : (
								<UserMessage key={msg.id} message={msg.content} />
							),
						)}
					</div>
				)}

				{/* Chat Input */}
				{showDetail && (
					<div className="p-3 bg-black/20">
						<div className="relative">
							<input
								className="w-full bg-[#2a2a2a] text-xs text-white rounded-full py-3 px-4 pr-10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
								placeholder="Ask anything..."
								value={inputMessage}
								onChange={(e) => setInputMessage(e.target.value)}
							/>
							<button
								type="button"
								className="absolute right-2 top-1/2 -translate-y-1/2 size-7 bg-emerald-500 rounded-full flex items-center justify-center text-black"
								onClick={() => {
									handleUserMessage(inputMessage);
									setInputMessage("");
								}}
							>
								<LuSend size={12} className="ml-0.5" />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
