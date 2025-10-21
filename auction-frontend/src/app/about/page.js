"use client";
import Link from 'next/link';
import { ArrowRight, Award, Shield, TrendingUp, Heart, Users, Clock, Target, CheckCircle } from 'lucide-react';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import Button from '../../components/ui/Button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-500 text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              About nexBID
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
              Your Trusted Online
              <span className="block mt-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Auction Marketplace
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-4xl mx-auto leading-relaxed">
              nexBID is a premier online auction platform connecting buyers and sellers from around the world. We provide a secure, transparent, and exciting marketplace for discovering unique items and rare collectibles. All registered users can sell items and place bids on auctions through nexBID.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-slate-700 mb-6 leading-relaxed">
                Founded with a vision to revolutionize online auctions, we combine cutting-edge technology with 
                user-friendly design to create an unparalleled bidding experience.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Whether you&apos;re a seasoned collector or a first-time bidder, nexBID is your gateway to extraordinary finds. 
                Our platform ensures every transaction is secure, transparent, and fair for all parties involved.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Secure Transactions</h4>
                    <p className="text-slate-600">Bank-level encryption and buyer protection on every purchase</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Global Reach</h4>
                    <p className="text-slate-600">Connect with buyers and sellers from every corner of the world</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Fair & Transparent</h4>
                    <p className="text-slate-600">Open bidding process with real-time updates and clear policies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
                <Users className="text-blue-600 mb-4" size={40} />
                <div className="text-5xl font-extrabold text-blue-700 mb-3">50K+</div>
                <div className="text-lg font-semibold text-slate-800 mb-2">Active Users</div>
                <p className="text-slate-600 text-sm">Worldwide community</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-200">
                <Clock className="text-indigo-600 mb-4" size={40} />
                <div className="text-5xl font-extrabold text-indigo-700 mb-3">10K+</div>
                <div className="text-lg font-semibold text-slate-800 mb-2">Live Auctions</div>
                <p className="text-slate-600 text-sm">Every single day</p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-2xl border border-blue-300">
                <Target className="text-blue-700 mb-4" size={40} />
                <div className="text-5xl font-extrabold text-blue-800 mb-3">$2M+</div>
                <div className="text-lg font-semibold text-slate-800 mb-2">Items Sold</div>
                <p className="text-slate-600 text-sm">Successfully traded</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-8 rounded-2xl border border-indigo-300">
                <Award className="text-indigo-700 mb-4" size={40} />
                <div className="text-5xl font-extrabold text-indigo-800 mb-3">99%</div>
                <div className="text-lg font-semibold text-slate-800 mb-2">Satisfaction</div>
                <p className="text-slate-600 text-sm">Happy customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-slate-900 mb-6">
              Why Choose nexBID?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We&apos;re committed to providing the best auction experience with top-tier features and support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Sellers</h3>
              <p className="text-slate-600 leading-relaxed">
                All sellers are thoroughly vetted and verified to ensure authenticity and trust
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Buyer Protection</h3>
              <p className="text-slate-600 leading-relaxed">
                Safe and secure transactions with comprehensive buyer protection policies
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="text-blue-700" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Bidding</h3>
              <p className="text-slate-600 leading-relaxed">
                Live auction updates instantly so you never miss a bidding opportunity
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="text-indigo-700" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Support</h3>
              <p className="text-slate-600 leading-relaxed">
                Our dedicated support team is here to help you anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-600 text-white">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
            Ready to Join nexBID?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Start your journey today and discover amazing items or sell your treasures to a global audience
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/main/auctions">
              <button className="bg-white !text-blue-700 hover:bg-blue-50 hover:!text-blue-800 px-10 py-4 rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center">
                Browse Auctions
                <ArrowRight size={22} className="ml-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
