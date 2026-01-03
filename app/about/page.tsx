"use client";
import Link from "next/link";
import { Globe, Users, Target, Heart, ArrowLeft, MapPin, Award, Zap } from "lucide-react";
import React from "react";

export default function AboutPage() {
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
            <Heart className="text-[#00D26A]" size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            About Virtual Trip Consultant
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to provide an insight to explore Ho Chi Minh City. 
            Combining existing technology with local insights to give traveler relevant information about their plan
          </p>
        </section>

        {/* Story Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-1 bg-[#00D26A] rounded-full"></div>
            <h2 className="text-4xl font-bold">Our Story</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Virtual Trip Consultant was born from a simple idea: traveling should be intuitive, 
                personalized, and stress-free. As students passionate about technology and exploration, 
                we recognized the challenges travelers face when navigating unfamiliar cities.
              </p>
              <p>
                What started as a computational thinking project evolved into a comprehensive platform 
                that allows user to plan efficient routes, gain insights and understand features of the Ho Chi Minh City via tinkering with waypoints-all from their browser.
              </p>
              <p>
                Today, we continue to innovate, bringing AI-powered insights and real-time information 
                to travelers worldwide, making every journey more meaningful and memorable.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-linear-to-br from-[#00D26A]/20 to-[#132020] rounded-3xl p-12 border border-white/5">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00D26A]/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-[#00D26A]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Precise location</h3>
                    <p className="text-gray-400 text-sm">
                      Curated insights from community-contributed data 
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00D26A]/10 flex items-center justify-center shrink-0">
                    <Zap className="text-[#00D26A]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">AI-Powered</h3>
                    <p className="text-gray-400 text-sm">
                      Smart advisor serving 24/24
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00D26A]/10 flex items-center justify-center shrink-0">
                    <Award className="text-[#00D26A]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Do it yourself</h3>
                    <p className="text-gray-400 text-sm">
                      Gain insight on your trip with your own hand. Tailor elements to find what you need.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*
         Mission & Values
        <section className="space-y-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-12 h-1 bg-[#00D26A] mx-auto mb-6 rounded-full"></div>
            <h2 className="text-4xl font-bold mb-4">Our Mission & Values</h2>
            <p className="text-gray-400">
              Guiding principles that drive everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#132020] p-8 rounded-3xl border border-white/5 hover:border-[#00D26A]/20 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#00D26A]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-[#00D26A]" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Community First</h3>
              <p className="text-gray-400 leading-relaxed">
                We believe in empowering travelers with authentic local knowledge and 
                building a community of explorers who share their experiences.
              </p>
            </div>

            <div className="bg-[#132020] p-8 rounded-3xl border border-white/5 hover:border-[#00D26A]/20 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#00D26A]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="text-[#00D26A]" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Innovation</h3>
              <p className="text-gray-400 leading-relaxed">
                We constantly push boundaries with cutting-edge technology to make travel 
                planning smarter, faster, and more intuitive.
              </p>
            </div>

            <div className="bg-[#132020] p-8 rounded-3xl border border-white/5 hover:border-[#00D26A]/20 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#00D26A]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="text-[#00D26A]" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Passion</h3>
              <p className="text-gray-400 leading-relaxed">
                We're driven by a genuine love for travel and a commitment to helping 
                others discover the world's wonders.
              </p>
            </div>
          </div>
        </section>
 */}
        {/* Stats Section */}
        <section className="bg-linear-to-br from-[#00D26A]/10 to-[#132020] rounded-3xl p-12 md:p-16 border border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">By the Numbers</h2>
            <p className="text-gray-400">Our journey in numbers</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#00D26A] mb-2">30+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                Locations Mapped
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#00D26A] mb-2">5+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                Happy Travelers
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#00D26A] mb-2">0+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                POIs Available
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#00D26A] mb-2">24/7</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                AI Support
              </div>
            </div>
          </div>
        </section>

        {/* Team Section - Editable Template */}

        {/* CTA Section */}
        <section className="text-center bg-linear-to-br from-[#00D26A]/20 to-[#132020] rounded-3xl p-12 md:p-16 border border-[#00D26A]/20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered Ho Chi Minh City 
            with our innovative platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/navigation"
              className="px-8 py-4 bg-[#00D26A] text-black font-bold rounded-full hover:bg-[#00b058] transition-colors inline-flex items-center justify-center gap-2"
            >
              <Globe size={20} />
              Explore Now
            </Link>
            <Link 
              href="/features"
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2 border border-white/10"
            >
              View Features
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
