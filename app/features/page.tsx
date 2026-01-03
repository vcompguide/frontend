"use client";
import Link from "next/link";
import { 
  Globe, 
  ArrowLeft, 
  Map, 
  MessageSquare, 
  Filter, 
  Route, 
  Bookmark, 
  Bell,
  Search,
  MapPin,
  Navigation,
  Share2,
  Star,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Heart,
  Calendar,
  Clock
} from "lucide-react";
import React from "react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  features,
  highlight = false
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  highlight?: boolean;
}) => (
  <div className={`bg-[#132020] p-8 rounded-3xl border transition-all group ${
    highlight 
      ? "border-[#00D26A]/30 shadow-lg shadow-[#00D26A]/10" 
      : "border-white/5 hover:border-[#00D26A]/20"
  }`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
      highlight ? "bg-[#00D26A]" : "bg-[#00D26A]/10"
    }`}>
      <Icon className={highlight ? "text-black" : "text-[#00D26A]"} size={28} />
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D26A] mt-2 shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const QuickFeature = ({
  icon: Icon,
  title,
  description
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-4 p-6 bg-[#132020] rounded-2xl border border-white/5 hover:border-[#00D26A]/20 transition-all">
    <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center shrink-0">
      <Icon className="text-[#00D26A]" size={20} />
    </div>
    <div>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#081212] text-white font-sans">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-[#00D26A] p-1.5 rounded-full text-black">
            <Globe size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Virtual Trip Consultant
          </span>
        </Link>

        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </nav>

      <main className="container mx-auto px-6 py-16 space-y-24">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#00D26A]/10 border border-[#00D26A]/20 mb-4">
            <Zap className="text-[#00D26A]" size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Powerful Features for <br /> Your Perfect Trip
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to plan, navigate, and experience Ho Chi Minh City 
            like a local—all in one intelligent platform.
          </p>
        </section>

        {/* Core Features Grid */}
        <section className="space-y-12">
          <div className="text-center">
            <div className="w-12 h-1 bg-[#00D26A] mx-auto mb-6 rounded-full"></div>
            <h2 className="text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover the tools that make your travel planning effortless and enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Map}
              title="Interactive Map"
              description="Explore Ho Chi Minh City with our detailed, interactive map interface."
              features={[
                "Real-time location tracking",
                "Dark mode",
                "Custom markers",
              ]}
              highlight={true}
            />

            <FeatureCard
              icon={MessageSquare}
              title="AI Tour Guide"
              description="Get instant answers and recommendations from our intelligent chatbot."
              features={[
                "24/7 availability",
                "Context-aware responses",
                "Multi-language support",
                "Cultural insights and tips",
                "Generalized suggestions"
              ]}
              highlight={true}
            />

            <FeatureCard
              icon={Route}
              title="Route Planning"
              description="Create optimized routes that save time and enhance your experience."
              features={[
                "Tinkering with orders",
                "Travel time estimates",
                "Alternative between routes",
                "Customize your travel",
              ]}
            />

            <FeatureCard
              icon={Filter}
              title="Smart Filters"
              description="Find exactly what you're looking for with advanced filtering options."
              features={[
                "Filter by category and type",
                "Multiple selection",
                "Proximity or along routes",
              ]}
            />

            <FeatureCard
              icon={Bookmark}
              title="Favourite"
              description="Save and manage your favorite locations for quick access anytime."
              features={[
                "Unlimited location storage",
                "History tracking",
                "Infintely reusable in planning"
              ]}
            />

            <FeatureCard
              icon={MapPin}
              title="POI Discovery"
              description="Discover curated points of interest throughout the city."
              features={[
                "30+ handpicked locations",
              ]}
            />
          </div>
        </section>

        {/* Additional Features */}
        <section className="space-y-12">
          <div className="text-center">
            <div className="w-12 h-1 bg-[#00D26A] mx-auto mb-6 rounded-full"></div>
            <h2 className="text-4xl font-bold mb-4">Additional Capabilities</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Even more tools to enhance your travel experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <QuickFeature
              icon={Search}
              title="Advanced Search"
              description="LLM powered chatbot and recommendation engine"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-linear-to-br from-[#00D26A]/20 to-[#132020] rounded-3xl p-12 md:p-16 border border-[#00D26A]/20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Start exploring Ho Chi Minh City with all these powerful tools at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/navigation"
              className="px-8 py-4 bg-[#00D26A] text-black font-bold rounded-full hover:bg-[#00b058] transition-colors inline-flex items-center justify-center gap-2"
            >
              <Map size={20} />
              Start Exploring
            </Link>
            <Link 
              href="/about"
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2 border border-white/10"
            >
              Learn More
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-[#00D26A]">
              <Globe size={20} />
            </div>
            <span className="font-bold text-sm tracking-tight text-gray-300">
              Virtual Trip Consultant
            </span>
          </div>
          <p className="text-xs text-gray-600">
            © 2025 Virtual Trip Consultant Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
