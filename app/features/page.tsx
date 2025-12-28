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
                "Multi-stop route optimization",
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
                "Distance and radius filters",
                "Price range filtering",
                "Rating and review filters",
                "Opening hours filter"
              ]}
            />

            <FeatureCard
              icon={Bookmark}
              title="Saved Routes"
              description="Save and manage your favorite routes for quick access anytime."
              features={[
                "Unlimited route storage",
                "Route sharing with friends",
                "Edit saved routes easily",
                "Route history tracking",
                "Export routes to other apps"
              ]}
            />

            <FeatureCard
              icon={MapPin}
              title="POI Discovery"
              description="Discover curated points of interest throughout the city."
              features={[
                "100+ handpicked locations",
                "Detailed POI information",
                "User reviews and ratings",
                "Photo galleries",
                "Insider tips and tricks"
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
              description="Find locations, restaurants, attractions, and more with powerful search capabilities"
            />
            <QuickFeature
              icon={Navigation}
              title="Turn-by-Turn Navigation"
              description="Get real-time directions with voice guidance and visual cues"
            />
            <QuickFeature
              icon={Share2}
              title="Social Sharing"
              description="Share your routes, discoveries, and experiences with friends and family"
            />
            <QuickFeature
              icon={Star}
              title="Favorites System"
              description="Mark your favorite places and create custom collections"
            />
            <QuickFeature
              icon={Bell}
              title="Smart Notifications"
              description="Receive timely updates about events, offers, and nearby attractions"
            />
            <QuickFeature
              icon={Clock}
              title="Opening Hours"
              description="Real-time information about business hours and availability"
            />
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="bg-linear-to-br from-[#00D26A]/10 to-[#132020] rounded-3xl p-12 md:p-16 border border-[#00D26A]/20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-12 h-1 bg-[#00D26A] rounded-full"></div>
              <h2 className="text-4xl font-bold">Why Choose Our Platform?</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00D26A] flex items-center justify-center shrink-0">
                    <Shield size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Reliable & Secure</h3>
                    <p className="text-gray-400">
                      Your data is protected with enterprise-grade security. Travel with confidence 
                      knowing your information is safe.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00D26A] flex items-center justify-center shrink-0">
                    <TrendingUp size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Constantly Improving</h3>
                    <p className="text-gray-400">
                      We regularly update our platform with new features, locations, and improvements 
                      based on user feedback.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00D26A] flex items-center justify-center shrink-0">
                    <Users size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Community Driven</h3>
                    <p className="text-gray-400">
                      Benefit from insights shared by thousands of travelers and local experts who 
                      know the city best.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#132020] rounded-2xl p-8 border border-white/5">
                <h3 className="text-2xl font-bold mb-6">Feature Statistics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Map Accuracy</span>
                      <span className="text-[#00D26A] font-bold">99%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-[#00D26A] h-2 rounded-full" style={{ width: "99%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">User Satisfaction</span>
                      <span className="text-[#00D26A] font-bold">95%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-[#00D26A] h-2 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">AI Response Quality</span>
                      <span className="text-[#00D26A] font-bold">92%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-[#00D26A] h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Feature Completeness</span>
                      <span className="text-[#00D26A] font-bold">88%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-[#00D26A] h-2 rounded-full" style={{ width: "88%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Features */}
        <section className="space-y-12">
          <div className="text-center">
            <div className="w-12 h-1 bg-[#00D26A] mx-auto mb-6 rounded-full"></div>
            <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Exciting new features we're working on to make your experience even better
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#132020] p-8 rounded-3xl border border-white/5 opacity-80">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Calendar className="text-gray-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Event Calendar</h3>
              <p className="text-gray-400 text-sm">
                Stay updated with local events, festivals, and special occasions happening around the city.
              </p>
              <div className="mt-4 inline-block px-3 py-1 bg-[#00D26A]/10 text-[#00D26A] rounded-full text-xs font-medium">
                Q2 2025
              </div>
            </div>

            <div className="bg-[#132020] p-8 rounded-3xl border border-white/5 opacity-80">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Heart className="text-gray-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Recommendations</h3>
              <p className="text-gray-400 text-sm">
                Get AI-powered suggestions based on your preferences, past trips, and travel style.
              </p>
              <div className="mt-4 inline-block px-3 py-1 bg-[#00D26A]/10 text-[#00D26A] rounded-full text-xs font-medium">
                Q3 2025
              </div>
            </div>

            <div className="bg-[#132020] p-8 rounded-3xl border border-white/5 opacity-80">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Users className="text-gray-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Group Planning</h3>
              <p className="text-gray-400 text-sm">
                Collaborate with friends and family to plan trips together in real-time.
              </p>
              <div className="mt-4 inline-block px-3 py-1 bg-[#00D26A]/10 text-[#00D26A] rounded-full text-xs font-medium">
                Q4 2025
              </div>
            </div>
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
