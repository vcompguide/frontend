export function PositivePopup() {
	return (
		<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
			{/* Positioned relatively near the map point in design */}
			<div className="pointer-events-auto bg-[#1e1e1e] p-4 rounded-xl shadow-2xl border border-gray-700 w-64 transform translate-x-[-150px] translate-y-[-50px]">
				<div className="flex justify-between items-start mb-2">
					<span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded uppercase">
						Suggested
					</span>
					<IoMdClose className="text-gray-500 cursor-pointer" />
				</div>
				<h4 className="font-bold text-sm text-white mb-1">
					Hidden Courtyard Challenge
				</h4>
				<p className="text-[10px] text-gray-400 mb-3">
					Find the statue of Louis XIV to unlock a badge.
				</p>
				<button type = "button" className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg">
					Accept Challenge
				</button>

				{/* Dotted Line connector mock */}
				<div className="absolute -bottom-10 right-10 w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-[#1e1e1e] border-r-[6px] border-r-transparent"></div>
			</div>
		</div>
	);
}
