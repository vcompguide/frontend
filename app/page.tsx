"use client";
import {
  BookOpen,
  Compass,
  Globe,
  Mail,
  Map,
  Menu,
  Sparkles,
  ThumbsUp,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "./navigation/AuthContext";
import { AuthScreen } from "./navigation/AuthScreen";

// --- Components ---

const Button = ({
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  icon?: React.ElementType;
  onClick?: () => void;
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
      onClick={onClick}
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
    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90" />
    <div className="absolute bottom-6 left-6">
      <h3 className="text-white text-xl font-bold">{title}</h3>
      <p className="text-[#00D26A] text-sm">{subtitle}</p>
    </div>
  </div>
);

// --- Main Page ---

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-[#081212] text-white font-sans selection:bg-[#00D26A] selection:text-black" onContextMenu={(e) => e.preventDefault()}>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AuthScreen onSuccess={handleAuthSuccess} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#00D26A] p-1.5 rounded-full text-black">
            <Globe size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Virtual Trip Consultant
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <Link href="/navigation" className="hover:text-white transition-colors">
            Destinations
          </Link>
          <Link href="/features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="w-20 h-10 bg-white/5 rounded-full animate-pulse"></div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D26A]/10 border border-[#00D26A]/20 hover:bg-[#00D26A]/20 transition-all"
              >
                <User size={16} className="text-[#00D26A]" />
                <span className="text-white text-sm font-medium">{user.name}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#132020] border border-white/10 rounded-xl shadow-xl py-2 z-50">
                  <Link
                    href="/navigation"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-sm"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-sm w-full text-left text-red-400"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setShowAuthModal(true)}>Login</Button>
              <Button variant="primary" onClick={() => setShowAuthModal(true)}>Sign Up</Button>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button type="button" className="md:hidden text-white">
          <Menu size={24} />
        </button>
      </nav>

      <main className="container mx-auto px-6 space-y-20 pb-20">
        {/* Hero Section */}
        <section className="relative rounded-[2.5rem] overflow-hidden h-fit w-full flex flex-col items-center justify-center text-center px-4">
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
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-[#081212]" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto pt-20">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Plan your discovery of <br /> Ho Chi Minh city <br /> from your browser
            </h1>
            <p className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto">
              Your personal trip planner with AI-assistant that does not hold responsibility to your choice. Experience travelling with great aware of your surrounding
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/navigation"
                className="flex flex-row items-center gap-2 h-12 px-6 rounded-full w-fit bg-[#00D26A]"
              >
                {" "}
                <Map /> Explore Map
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="flex flex-col md:flex-row gap-6 -mt-10 relative z-20">
          <StatCard count="0+" label="Active Tours" />
          <StatCard count="30+" label="Destinations Mapped" />
          <StatCard count="5+" label="Happy Travelers" />
        </section>

        {/* Core Features */}
        <section className="py-10">
          <div className="text-center mb-16">
            <div className="w-12 h-1 bg-[#00D26A] mx-auto mb-6 rounded-full"></div>
            <h2 className="text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Augment your planning with our quickly-crafted kludge to satisfy urgent needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Compass}
              title="Stops and conveniences"
              desc="Have you ever think of what would be around your travel path?"
            />
            <FeatureCard
              icon={BookOpen}
              title="AI-powered tour guide"
              desc="Featuring 24/24 tour guide that can answer all of your question. (The correctness is not assured)"
            />
            <FeatureCard
              icon={Sparkles}
              title="POI"
              desc="See our curated(?) list of points of interest"
            />
          </div>
        </section>

        {/* Popular Destinations */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Popular Destinations</h2>
              <p className="text-gray-400 text-sm">
                Consider your intent to visit those places
              </p>
            </div>
            {/*<div className="flex gap-2">
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
						</div>*/}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DestinationCard
              image="https://images.unsplash.com/photo-1511739001486-6bfe10ce7859?q=80&w=800&auto=format&fit=crop"
              title="Ben Thanh Market"
              subtitle="Where overpriced goods for locals are sold"
            />
            <DestinationCard
              image="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop"
              title="Notre Dame Cathedral"
              subtitle="A big church"
            />
            <DestinationCard
              image="https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop"
              title="War Remnant Museum"
              subtitle="Display of our struggle against invaders"
            />
            <DestinationCard
              image="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop"
              title="Nguyen Hue walking street"
              subtitle="A plaze for hanging out and events (with pricey parking fee)"
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
              Virtual Trip Consultant
            </span>
          </div>
          {/*
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
          */}
          {/*
          <div className="flex gap-4 text-gray-400">
            <Mail size={16} className="hover:text-[#00D26A] cursor-pointer" />
            <ThumbsUp
              size={16}
              className="hover:text-[#00D26A] cursor-pointer"
            />
          </div>*/}
        </div>
          <div className="text-center text-[10px] text-gray-600 mt-8">
            © 2025 Virtual Trip Consultant Inc.
          </div>
      </footer>
    </div>
  );
}
