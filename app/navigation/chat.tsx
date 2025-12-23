import { useEffect, useRef, useState } from "react";
import { FaMinus, FaTrash } from "react-icons/fa";
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

export function LoadingMessage() {
	return (
		<div className="flex gap-3">
			<div className="size-6 rounded-full bg-blue-500 shrink-0 mt-1" />
			<div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-gray-200 leading-relaxed animate-pulse">
				Loading...
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
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
	const chatContentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (chatContentRef.current) {
			chatContentRef.current.scrollTo({
				top: chatContentRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [messageList, isLoading]);

	const APICallMessage = async (query: string): Promise<Message> => {
		// Placeholder - wait 3000ms before returning
		let apiSendString: string = `You are an AI travel guide assistant. Answer the user's question based on the following context:\n\n`;
		apiSendString += `Context:\n`;
		apiSendString += `- The user is planning a trip and may ask questions about destinations, activities, accommodations, and travel tips.\n`;
		apiSendString += `- Provide concise and relevant information to help the user plan their trip effectively.\n\n`;
		apiSendString += `User Question: ${query}\n\n`;
		await new Promise((resolve) => setTimeout(resolve, 3000));
		console.log("Simulated API call for query:", query);
		return { id: uuidv7(), content: apiSendString, type: "Answer" };
	};

	const handleUserMessage = async (message: string) => {
		const newMessageList = [
			...messageList,
			{ id: uuidv7(), content: message, type: "Question" },
		];
		setMessageList(newMessageList);
		setIsLoading(true);

		const apiMessage = await APICallMessage(message);
		setMessageList([...newMessageList, apiMessage]);
		setIsLoading(false);
	};

	const clearMessages = () => {
		setShowClearConfirm(true);
	};

	const confirmClear = () => {
		setMessageList([]);
		setShowClearConfirm(false);
	};

	const cancelClear = () => {
		setShowClearConfirm(false);
	};

	return (
		<>
			{showClearConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
					<div className="bg-[#1e1e1e]/95 backdrop-blur-md border border-white/5 rounded-2xl p-6 w-80 shadow-2xl">
						<h3 className="text-lg font-bold text-white mb-2">Clear All Messages?</h3>
						<p className="text-xs text-gray-300 mb-6">
							Are you sure you want to clear all messages? This action cannot be undone.
						</p>
						<div className="flex gap-3 justify-end">
							<button
								type="button"
								className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold transition"
								onClick={cancelClear}
							>
								Cancel
							</button>
							<button
								type="button"
								className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
								onClick={confirmClear}
							>
								Clear
							</button>
						</div>
					</div>
				</div>
			)}
		<div
			className={`absolute bottom-0 left-1/2 ${showDetail ? "translate-y-0" : "translate-y-1/2"} -translate-x-1/2 z-10 w-[380px] transition`}
		>
			<div className="bg-[#1e1e1e]/95 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[450px]">
				{/* Chat Header */}
				<div className="flex justify-between items-center border-b border-white/5 w-full h-full shrink-0">
					<button
						type="button"
						className="flex justify-start items-center flex-1 p-3 cursor-pointer hover:opacity-80 transition"
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
					</button>
					<div className="flex gap-2">
						{
							messageList.length > 0 &&
							<button
							type="button"
							className="text-red-500 hover:text-red-400 transition p-3"
							onClick={clearMessages}
							title="Clear all messages"
							>
							<FaTrash size={14} />
						</button>
						}
						{/* <button
							type="button"
							className="text-gray-500 p-3 hover:text-gray-400 transition"
							onClick={() => {
								setShowDetail(!showDetail);
							}}
						>
							<FaMinus />
						</button> */}
					</div>
				</div>
				{/* Chat Content */}
				{showDetail && (
					<div
						ref={chatContentRef}
						className={`${messageList.length > 0 ? "p-4" : "p-0" } space-y-4 overflow-y-auto flex-1`}
					>
						{/* Bot Msg */}
						{messageList.map((msg, index) =>
							msg.type === "Answer" ? (
								<BotMessage key={msg.id} message={msg.content} />
							) : (
								<UserMessage key={msg.id} message={msg.content} />
							),
						)}
						{isLoading && <LoadingMessage />}
					</div>
				)}

				{/* Chat Input */}
				{showDetail && (
					<div className="p-3 bg-black/20 shrink-0 border-t border-white/5">
						<div className="relative">
							<input
								className="w-full bg-[#2a2a2a] text-xs text-white rounded-full py-3 px-4 pr-10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
								placeholder="Ask anything..."
								value={inputMessage}
								onChange={(e) => setInputMessage(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && inputMessage.trim() !== "") {
										if (isLoading) return;
										handleUserMessage(inputMessage);
										setInputMessage("");
									}
								}}
							/>
							<button
								type="button"
								className={`absolute right-2 top-1/2 -translate-y-1/2 size-7 bg-emerald-500 rounded-full flex items-center justify-center text-black ${isLoading || inputMessage.trim() === "" ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-600"} transition`}
								onClick={() => {
									if (isLoading || inputMessage.trim() === "") return;
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
		</>
	);
}
