import {
	BookOpen,
	ChevronLeft,
	ChevronRight,
	Compass,
	Globe,
	Mail,
	Map,
	Menu,
	Sparkles,
	ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import React from "react";

// --- Components ---

const Button = ({
	children,
	variant = "primary",
	className = "",
	icon: Icon,
}: {
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "ghost" | "outline";
	className?: string;
	icon?: React.ElementType;
}) => {
	const baseStyle =
		"px-6 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center gap-2 text-sm";

	const variants = {
		primary:
			"bg-[#00D26A] text-black hover:bg-[#00b058] shadow-lg shadow-green-900/20",
		secondary:
			"bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20",
		ghost: "text-gray-300 hover:text-white",
		outline:
			"border border-gray-600 text-gray-300 hover:border-white hover:text-white",
	};

	return (
		<button
			type="button"
			className={`${baseStyle} ${variants[variant]} ${className}`}
		>
			{Icon && <Icon size={16} />}
			{children}
		</button>
	);
};

const StatCard = ({ count, label }: { count: string; label: string }) => (
	<div className="bg-[#132020] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-w-[200px] flex-1">
		<div className="text-[#00D26A] text-3xl font-bold mb-1">{count}</div>
		<div className="text-gray-400 text-xs tracking-wider uppercase">
			{label}
		</div>
	</div>
);

const FeatureCard = ({
	icon: Icon,
	title,
	desc,
}: {
	icon: React.ElementType;
	title: string;
	desc: string;
}) => (
	<div className="bg-[#132020] p-8 rounded-3xl hover:bg-[#1a2b2b] transition-colors border border-white/5 group">
		<div className="w-12 h-12 rounded-full bg-[#00D26A]/10 flex items-center justify-center text-[#00D26A] mb-6 group-hover:scale-110 transition-transform">
			<Icon size={24} />
		</div>
		<h3 className="text-xl font-bold text-white mb-3">{title}</h3>
		<p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
	</div>
);

const DestinationCard = ({
	title,
	subtitle,
}: {
	image: string;
	title: string;
	subtitle: string;
}) => (
	<div className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer">
		{/* <Image 
      src={image} 
      alt={title} 
      fill 
      className="object-cover group-hover:scale-105 transition-transform duration-500"
    /> */}
		<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
		<div className="absolute bottom-6 left-6">
			<h3 className="text-white text-xl font-bold">{title}</h3>
			<p className="text-[#00D26A] text-sm">{subtitle}</p>
		</div>
	</div>
);

// --- Main Page ---

export default function Home() {
	return (
		<div className="min-h-screen bg-[#081212] text-white font-sans selection:bg-[#00D26A] selection:text-black">
			{/* Navigation */}
			<nav className="container mx-auto px-6 py-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="bg-[#00D26A] p-1.5 rounded-full text-black">
						<Globe size={20} />
					</div>
					<span className="font-bold text-lg tracking-tight">
						Virtual Tour Guide
					</span>
				</div>

				<div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
					<Link href="#" className="hover:text-white transition-colors">
						Destinations
					</Link>
					<Link href="#" className="hover:text-white transition-colors">
						Features
					</Link>
					<Link href="#" className="hover:text-white transition-colors">
						About
					</Link>
				</div>

				<div className="hidden md:flex items-center gap-4">
					<Button variant="ghost">Login</Button>
					<Button variant="primary">Sign Up</Button>
				</div>

				{/* Mobile Menu Icon */}
				<button type="button" className="md:hidden text-white">
					<Menu size={24} />
				</button>
			</nav>

			<main className="container mx-auto px-6 space-y-20 pb-20">
				{/* Hero Section */}
				<section className="relative rounded-[2.5rem] overflow-hidden h-[600px] w-full flex flex-col items-center justify-center text-center px-4">
					{/* Background Image */}
					<div className="absolute inset-0 z-0">
						{/* <Image 
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop" 
              alt="Mountain Landscape" 
              fill
              className="object-cover brightness-75"
              priority
            /> */}
						{/* Dark overlay gradient */}
						<div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#081212]" />
					</div>

					{/* Hero Content */}
					<div className="relative z-10 max-w-3xl mx-auto pt-20">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
							Discover the World <br /> from Your Desktop
						</h1>
						<p className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto">
							Your personal AI-powered guide to the world's most breathtaking
							destinations. Experience travel like never before.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link
								href="/navigation"
								className="flex flex-row items-center gap-2 h-12 px-6 rounded-full w-fit bg-[#00D26A]"
							>
								{" "}
								<Map /> Explore Map
							</Link>
							{/* <Button variant="secondary" icon={Sparkles} className="h-12 px-8">Build Trip</Button> */}
						</div>
					</div>
				</section>

				{/* Stats Section */}
				<section className="flex flex-col md:flex-row gap-6 -mt-10 relative z-20">
					<StatCard count="1+" label="Active Tours" />
					<StatCard count="0+" label="Destinations Mapped" />
					<StatCard count="0+" label="Happy Travelers" />
				</section>

				{/* Core Features */}
				<section className="py-10">
					<div className="text-center mb-16">
						<div className="w-12 h-1 bg-[#00D26A] mx-auto mb-6 rounded-full"></div>
						<h2 className="text-4xl font-bold mb-4">Core Features</h2>
						<p className="text-gray-400 max-w-xl mx-auto">
							Experience travel like never before with our quickly-crafted
							kludge to satisfy urgent needs.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						<FeatureCard
							icon={Compass}
							title="360° Panoramas"
							desc="Immerse yourself in high-definition full surround views of famous landmarks from your couch."
						/>
						<FeatureCard
							icon={BookOpen}
							title="Historical Insights"
							desc="Deep dive into the rich history of every location you visit with curated audio and text guides."
						/>
						<FeatureCard
							icon={Sparkles}
							title="Custom Itineraries"
							desc="Let our smart AI curate the perfect virtual journey tailored specifically to your interests."
						/>
					</div>
				</section>

				{/* Popular Destinations */}
				<section>
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-2xl font-bold mb-2">Popular Destinations</h2>
							<p className="text-gray-400 text-sm">
								Explore our most visited virtual locations.
							</p>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
							>
								<ChevronLeft size={20} />
							</button>
							<button
								type="button"
								className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
							>
								<ChevronRight size={20} />
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						<DestinationCard
							image="https://images.unsplash.com/photo-1511739001486-6bfe10ce7859?q=80&w=800&auto=format&fit=crop"
							title="Paris, France"
							subtitle="The City of Lights"
						/>
						<DestinationCard
							image="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop"
							title="Kyoto, Japan"
							subtitle="Ancient Temples"
						/>
						<DestinationCard
							image="https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop"
							title="Rome, Italy"
							subtitle="The Eternal City"
						/>
						<DestinationCard
							image="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop"
							title="New York, USA"
							subtitle="The Big Apple"
						/>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="border-t border-white/5 py-12">
				<div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="flex items-center gap-2">
						<div className="text-[#00D26A]">
							<Globe size={20} />
						</div>
						<span className="font-bold text-sm tracking-tight text-gray-300">
							Virtual Tour Guide
						</span>
					</div>

					<div className="flex gap-8 text-xs text-gray-500">
						<Link href="#" className="hover:text-white">
							Privacy Policy
						</Link>
						<Link href="#" className="hover:text-white">
							Terms of Service
						</Link>
						<Link href="#" className="hover:text-white">
							Support
						</Link>
					</div>

					<div className="flex gap-4 text-gray-400">
						<Mail size={16} className="hover:text-[#00D26A] cursor-pointer" />
						<ThumbsUp
							size={16}
							className="hover:text-[#00D26A] cursor-pointer"
						/>
					</div>
				</div>
				<div className="text-center text-[10px] text-gray-600 mt-8">
					© 2025 Virtual Tour Guide Inc.
				</div>
			</footer>
		</div>
	);
}
