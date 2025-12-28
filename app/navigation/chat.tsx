import { Sdk, MessageDtoRoleEnum, LocationRecommendationDtoCategoryEnum } from "@/src/backend/RESTful/BackendRESTfulSDK";
import { useEffect, useRef, useState } from "react";
import { FaTrash, FaUpload, FaImage } from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import { uuidv7 } from "uuidv7";

export function BotMessage({ message }: { message: string }) {
	return (
		<div className="flex gap-3">
			<div className="size-6 rounded-full bg-blue-500 shrink-0 mt-1" />
			<div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
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
	role?: "user" | "chatbot";
}

interface ConversationHistoryItem {
	role: MessageDtoRoleEnum;
	content: string;
}

interface ImageResult {
	locationName: string;
	description: string;
	coordinates: { lat: number; lon: number };
	imageUrl: string;
}

type TabType = "chat" | "recommendation" | "image";
export function ChatBox() {
	const [showDetail, setShowDetail] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<TabType>("chat");
	
	// Chat tab states
	const [messageList, setMessageList] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState<string>("");
	const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);
	
	// Recommendation tab states
	const [location, setLocation] = useState<string>("");
	const [category, setCategory] = useState<string>("restaurants");
	const [recommendation, setRecommendation] = useState<string>("");
	
	// Image search tab states
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [imageContext, setImageContext] = useState<string>("");
	const [imageResult, setImageResult] = useState<ImageResult | null>(null);
	
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
	const chatContentRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (chatContentRef.current) {
			chatContentRef.current.scrollTo({
				top: chatContentRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [messageList, isLoading, recommendation, imageResult]);

	// Chat API call
	const handleChatMessage = async (message: string) => {
		const newMessageList = [
			...messageList,
			{ id: uuidv7(), content: message, type: "Question", role: "user" as const },
		];
		setMessageList(newMessageList);
		setIsLoading(true);

		try {
			const api = new Sdk({
				baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
				securityWorker: async () => ({
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
					},
				}),
			});
			console.log("Sending chat message:", message);
			const { data } = await api.chatbot.chatbotControllerChat({
				message,
				conversationHistory,
			});
			console.log("Chat API response:", data);
			
			if (data.success) {
				const botMessage: Message = {
					id: uuidv7(),
					content: data.response,
					type: "Answer",
					role: "chatbot" as const,
				};
				setMessageList([...newMessageList, botMessage]);
				
				// Update conversation history
				setConversationHistory([
					...conversationHistory,
					{ role: MessageDtoRoleEnum.User, content: message },
					{ role: MessageDtoRoleEnum.Chatbot, content: data.response },
				]);
			} else {
				throw new Error("Failed to get response");
			}
		} catch (error) {
			console.error("Chat error:", error);
			const errorMessage: Message = {
				id: uuidv7(),
				content: "Sorry, I encountered an error. Please try again.",
				type: "Answer",
				role: "chatbot" as const,
			};
			setMessageList([...newMessageList, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	// Recommendation API call
	const handleRecommendation = async () => {
		if (!location.trim()) return;
		
		setIsLoading(true);
		setRecommendation("");

		try {
			const api = new Sdk({
				baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
				securityWorker: async () => ({
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
					},
				}),
			});

			const { data } = await api.chatbot.chatbotControllerGetLocationRecommendations({
				location,
				category: category as LocationRecommendationDtoCategoryEnum,
			});
			
			if (data.success) {
				setRecommendation(data.response);
			} else {
				throw new Error("Failed to get recommendations");
			}
		} catch (error) {
			console.error("Recommendation error:", error);
			setRecommendation("Sorry, I encountered an error getting recommendations. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Image search API call
	const handleImageSearch = async () => {
		if (!selectedImage) return;
		
		setIsLoading(true);
		setImageResult(null);

		try {
			const api = new Sdk({
				baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
				securityWorker: async () => ({
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
					},
				}),
			});

			const { data } = await api.chatbot.chatbotControllerAnalyzeImageLocation({
				file: selectedImage,
				additionalContext: imageContext.trim() || undefined,
			});
			console.log("Image Search API response:", data);
			if (data.success) {
				setImageResult({
					locationName: data.locationName,
					description: data.description,
					coordinates: data.coordinates || { lat: 0, lon: 0 },
					imageUrl: data.imageUrl || "",
				});
			} else {
				throw new Error("Failed to analyze image");
			}
		} catch (error) {
			console.error("Image search error:", error);
			setImageResult({
				locationName: "Error",
				description: "Sorry, I encountered an error analyzing the image. Please try again.",
				coordinates: { lat: 0, lon: 0 },
				imageUrl: "",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && file.type.startsWith("image/")) {
			setSelectedImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const clearMessages = () => {
		setShowClearConfirm(true);
	};

	const confirmClear = () => {
		if (activeTab === "chat") {
			setMessageList([]);
			setConversationHistory([]);
		} else if (activeTab === "recommendation") {
			setLocation("");
			setCategory("restaurants");
			setRecommendation("");
		} else if (activeTab === "image") {
			setSelectedImage(null);
			setImagePreview("");
			setImageContext("");
			setImageResult(null);
		}
		setShowClearConfirm(false);
	};

	const cancelClear = () => {
		setShowClearConfirm(false);
	};

	const hasContent = () => {
		if (activeTab === "chat") return messageList.length > 0;
		if (activeTab === "recommendation") return recommendation !== "";
		if (activeTab === "image") return imageResult !== null;
		return false;
	};

	return (
		<>
			{showClearConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
					<div className="bg-[#1e1e1e]/95 backdrop-blur-md border border-white/5 rounded-2xl p-6 w-80 shadow-2xl">
						<h3 className="text-lg font-bold text-white mb-2">Clear Content?</h3>
						<p className="text-xs text-gray-300 mb-6">
							Are you sure you want to clear the current content? This action cannot be undone.
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
			<div className="bg-[#1e1e1e]/95 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[550px]">
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
						{hasContent() && (
							<button
								type="button"
								className="text-red-500 hover:text-red-400 transition p-3"
								onClick={clearMessages}
								title="Clear content"
							>
								<FaTrash size={14} />
							</button>
						)}
					</div>
				</div>

				{/* Tabs */}
				{showDetail && (
					<div className="flex border-b border-white/5 bg-black/20">
						<button
							type="button"
							className={`flex-1 py-2.5 text-xs font-semibold transition ${
								activeTab === "chat"
									? "text-emerald-400 border-b-2 border-emerald-400"
									: "text-gray-400 hover:text-gray-300"
							}`}
							onClick={() => setActiveTab("chat")}
						>
							Chat
						</button>
						<button
							type="button"
							className={`flex-1 py-2.5 text-xs font-semibold transition ${
								activeTab === "recommendation"
									? "text-emerald-400 border-b-2 border-emerald-400"
									: "text-gray-400 hover:text-gray-300"
							}`}
							onClick={() => setActiveTab("recommendation")}
						>
							Recommendation
						</button>
						<button
							type="button"
							className={`flex-1 py-2.5 text-xs font-semibold transition ${
								activeTab === "image"
									? "text-emerald-400 border-b-2 border-emerald-400"
									: "text-gray-400 hover:text-gray-300"
							}`}
							onClick={() => setActiveTab("image")}
						>
							Search Image
						</button>
					</div>
				)}

				{/* Chat Tab Content */}
				{showDetail && activeTab === "chat" && (
					<>
						<div
							ref={chatContentRef}
							className={`${messageList.length > 0 ? "p-4" : "p-0"} space-y-4 overflow-y-auto flex-1`}
						>
							{messageList.map((msg) =>
								msg.type === "Answer" ? (
									<BotMessage key={msg.id} message={msg.content} />
								) : (
									<UserMessage key={msg.id} message={msg.content} />
								),
							)}
							{isLoading && <LoadingMessage />}
						</div>

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
											handleChatMessage(inputMessage);
											setInputMessage("");
										}
									}}
								/>
								<button
									type="button"
									className={`absolute right-2 top-1/2 -translate-y-1/2 size-7 bg-emerald-500 rounded-full flex items-center justify-center text-black ${
										isLoading || inputMessage.trim() === ""
											? "opacity-50 cursor-not-allowed"
											: "hover:bg-emerald-600"
									} transition`}
									onClick={() => {
										if (isLoading || inputMessage.trim() === "") return;
										handleChatMessage(inputMessage);
										setInputMessage("");
									}}
								>
									<LuSend size={12} className="ml-0.5" />
								</button>
							</div>
						</div>
					</>
				)}

				{/* Recommendation Tab Content */}
				{showDetail && activeTab === "recommendation" && (
					<>
						<div ref={chatContentRef} className="p-4 space-y-4 overflow-y-auto flex-1">
							<div className="space-y-3">
								<div>
									<label className="text-xs font-semibold text-gray-300 mb-1.5 block">
										Location
									</label>
									<input
										className="w-full bg-[#2a2a2a] text-xs text-white rounded-lg py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
										placeholder="e.g., Da Nang, Paris, Tokyo..."
										value={location}
										onChange={(e) => setLocation(e.target.value)}
									/>
								</div>
								<div>
									<label className="text-xs font-semibold text-gray-300 mb-1.5 block">
										Category
									</label>
									<select
										className="w-full bg-[#2a2a2a] text-xs text-white rounded-lg py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
										value={category}
										onChange={(e) => setCategory(e.target.value)}
									>
										<option value="restaurants">Restaurants</option>
										<option value="hotels">Hotels</option>
										<option value="attractions">Attractions</option>
										<option value="activities">Activities</option>
									</select>
								</div>
								<button
									type="button"
									className={`w-full py-2.5 rounded-lg font-semibold text-xs transition ${
										isLoading || !location.trim()
											? "bg-gray-700 text-gray-400 cursor-not-allowed"
											: "bg-emerald-500 text-black hover:bg-emerald-600"
									}`}
									onClick={handleRecommendation}
									disabled={isLoading || !location.trim()}
								>
									{isLoading ? "Getting Recommendations..." : "Get Recommendations"}
								</button>
							</div>

							{recommendation && (
								<div className="mt-4">
									<BotMessage message={recommendation} />
								</div>
							)}
							{isLoading && <LoadingMessage />}
						</div>
					</>
				)}

				{/* Image Search Tab Content */}
				{showDetail && activeTab === "image" && (
					<>
						<div ref={chatContentRef} className="p-4 space-y-4 overflow-y-auto flex-1">
							<div className="space-y-3">
								<div>
									<label className="text-xs font-semibold text-gray-300 mb-1.5 block">
										Upload Image
									</label>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handleFileSelect}
									/>
									<button
										type="button"
										className="w-full bg-[#2a2a2a] text-gray-300 rounded-lg py-8 px-3 border-2 border-dashed border-gray-600 hover:border-emerald-500 transition flex flex-col items-center gap-2"
										onClick={() => fileInputRef.current?.click()}
									>
										{imagePreview ? (
											<>
												<img
													src={imagePreview}
													alt="Preview"
													className="max-h-32 rounded-lg object-contain"
												/>
												<span className="text-xs text-emerald-400">Click to change image</span>
											</>
										) : (
											<>
												<FaUpload size={24} className="text-gray-500" />
												<span className="text-xs">Click to upload image</span>
											</>
										)}
									</button>
								</div>

								{selectedImage && (
									<>
										<div>
											<label className="text-xs font-semibold text-gray-300 mb-1.5 block">
												Additional Context (Optional)
											</label>
											<input
												className="w-full bg-[#2a2a2a] text-xs text-white rounded-lg py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
												placeholder="Any specific questions about the image?"
												value={imageContext}
												onChange={(e) => setImageContext(e.target.value)}
											/>
										</div>
										<button
											type="button"
											className={`w-full py-2.5 rounded-lg font-semibold text-xs transition ${
												isLoading
													? "bg-gray-700 text-gray-400 cursor-not-allowed"
													: "bg-emerald-500 text-black hover:bg-emerald-600"
											}`}
											onClick={handleImageSearch}
											disabled={isLoading}
										>
											{isLoading ? "Analyzing Image..." : "Identify Location"}
										</button>
									</>
								)}
							</div>

							{isLoading && <LoadingMessage />}
							
							{imageResult && (
								<div className="space-y-3">
									<div className="bg-white/10 p-3 rounded-xl space-y-2">
										<h4 className="text-sm font-bold text-emerald-400">
											{imageResult.locationName}
										</h4>
										<p className="text-xs text-gray-200 leading-relaxed">
											{imageResult.description}
										</p>
										{imageResult.coordinates.lat !== 0 && (
											<p className="text-xs text-gray-400">
												📍 Coordinates: {imageResult.coordinates.lat.toFixed(6)}, {imageResult.coordinates.lon.toFixed(6)}
											</p>
										)}
									</div>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
		</>
	);
}
