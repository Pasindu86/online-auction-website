"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Zap, Users, Trophy, Search, Clock, Award, Target, Heart, TrendingUp, Gavel } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import Button from '../components/ui/Button';
import { getAllAuctions } from '../lib/api';

export default function HomePage() {
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLiveAuctions();
  }, []);

  const fetchLiveAuctions = async () => {
    try {
      const auctions = await getAllAuctions();
      console.log('📦 All fetched auctions:', auctions);
      
      const now = new Date();
      
      // Filter ONLY live/active auctions (not ended, not closed)
      const liveAuctionsFiltered = auctions.filter(auction => {
        const endTime = new Date(auction.endTime);
        const isLive = endTime > now;
        const isNotClosed = !auction.isClosed;
        
        const auctionId = auction.id || auction.auctionId;
        console.log(`Auction ${auctionId}: endTime=${endTime}, now=${now}, isLive=${isLive}, isClosed=${auction.isClosed}`);
        
        return isLive && isNotClosed;
      });
      
      console.log('🔴 Filtered LIVE auctions:', liveAuctionsFiltered);
      
      // Sort by most recent and get top 3
      const recentLiveAuctions = liveAuctionsFiltered
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.startTime || a.endTime);
          const dateB = new Date(b.createdAt || b.startTime || b.endTime);
          return dateB - dateA;
        })
        .slice(0, 3);
      
      console.log('✅ Top 3 recent live auctions to display:', recentLiveAuctions);
      setLiveAuctions(recentLiveAuctions);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching auctions:', error);
      console.error('Error details:', error.message);
      setError(error.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Dark Purple Gradient and Multiple Waves */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-500 min-h-[500px]">
        <Navbar />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-40">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              🎯 #1 Online Auction Platform
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              The best items we have for sale,
              <span className="block mt-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                All in one auction!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover unique treasures, rare collectibles, and exclusive items from verified sellers worldwide.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/main/auctions">
                <Button className="bg-white hover:bg-slate-50 !text-black px-10 py-4 rounded-xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20">
  Browse Auctions
                  <ArrowRight size={22} className="ml-2 !text-black" />
                </Button>
              </Link>
              <Link href="/create-auction">
                <Button className="bg-white hover:bg-slate-50 !text-black px-10 py-4 rounded-xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20">
 Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave Design */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 320" className="w-full h-auto">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-3">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Getting started is easy! Follow these simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-700 text-3xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Create Account</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Sign up in seconds with your email. Verify your account and you're ready to start bidding on amazing items.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-700 text-3xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Browse & Bid</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Explore thousands of live auctions. Place your bids with confidence and track your items in real-time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-700 text-3xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Win & Enjoy</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Win your favorite items, complete secure payment, and get your treasures delivered right to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Live Auctions Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 text-white rounded-full text-sm font-medium mb-4">
              🔥 Live Now
            </div>
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 bg-clip-text text-transparent mb-6">
              Latest Live Auctions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Check out the newest items up for auction. Place your bid before time runs out!
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-800 mb-4"></div>
              <p className="text-slate-600">Loading auctions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="mb-4 text-red-500">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">Auctions Not Found</h3>
              <p className="text-slate-500 mb-2">Unable to load auctions at this time.</p>
              <p className="text-sm text-slate-400 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={fetchLiveAuctions}
                  className="bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg"
                >
                  Try Again
                </Button>
                <Link href="/create-auction">
                  <Button className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-full font-bold">
                    Create Auction
                  </Button>
                </Link>
              </div>
            </div>
          ) : liveAuctions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                {liveAuctions.map((auction) => {
                  const auctionId = auction.id || auction.auctionId;
                  return (
                  <div key={auctionId} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-indigo-400 transform hover:-translate-y-2">
                    <Link href={`/auction/${auctionId}`} className="block">
                      {/* Auction Image */}
                      <div className="relative h-64 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 overflow-hidden">
                        {auction.imageUrl ? (
                          <img
                            src={auction.imageUrl.startsWith('http') ? auction.imageUrl : `http://localhost:7001${auction.imageUrl}`}
                            alt={auction.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="text-indigo-300" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11m-11 0l11-11M21 3l-6 6m-10 4l4 4m-7 4l6-6"/></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gavel className="text-indigo-300" size={80} />
                          </div>
                        )}
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                        {/* Time Remaining */}
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold rounded-lg flex items-center gap-2">
                          <Clock size={16} />
                          {getTimeRemaining(auction.endTime)}
                        </div>
                      </div>

                      {/* Auction Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-800 transition-colors">
                          {auction.title}
                        </h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {auction.description}
                        </p>

                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Current Price</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                              ${(auction.currentPrice || auction.startingPrice || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Starting Price</p>
                            <p className="text-lg font-semibold text-slate-700">
                              ${(auction.startingPrice || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            {auction.bidCount || 0} bid{(auction.bidCount || 0) !== 1 ? 's' : ''}
                          </span>
                          <Button className="bg-gradient-to-r from-blue-800 via-indigo-900 to-blue-700 hover:from-blue-900 hover:via-indigo-950 hover:to-blue-800 text-white px-5 py-2 rounded-full font-semibold text-sm shadow-lg">
                            Place Bid
                            <ArrowRight size={16} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </div>
                  );
                })}
              </div>

              <div className="text-center">
                <Link href="/main/auctions">
                  <Button className="bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 hover:from-blue-900 hover:via-indigo-950 hover:to-blue-800 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300">
                    View All Auctions
                    <ArrowRight size={22} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Gavel className="mx-auto text-slate-300 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No Live Auctions Available</h3>
              <p className="text-slate-500 mb-6">There are currently no active auctions. Check back soon or create your own!</p>
              <div className="flex gap-4 justify-center">
                <Link href="/main/auctions">
                  <Button className="bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg">
                    View All Auctions
                  </Button>
                </Link>
                <Link href="/create-auction">
                  <Button className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-full font-bold">
                    Create Auction
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
