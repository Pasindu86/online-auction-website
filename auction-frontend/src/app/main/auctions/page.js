'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Clock, Gavel, Plus, TrendingUp, Sparkles, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/ui/Button';
import { getAllAuctions, getCurrentUser } from '../../../lib/api';

export default function AuctionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const categories = ["All", "Art", "Watches", "Jewelry", "Antiques", "Collectibles", "Books", "Electronics", "Other"];

  useEffect(() => {
    document.title = 'Auctions - Online Auction System';
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await getAllAuctions();
      setAuctions(response || []);
      setError('');
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Failed to load auctions. Please try again.');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Sort auctions: Live auctions first, then by most recent (newest first)
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    // First priority: Live auctions come first
    if (a.isClosed !== b.isClosed) {
      return a.isClosed ? 1 : -1;
    }
    // Second priority: Most recent first (by ID, assuming higher ID = newer)
    return b.id - a.id;
  });

  const formatPrice = (price) => {
    return `Rs. ${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001';
    // Remove 'api' from the base URL for static files and ensure proper path construction
    const staticBaseUrl = baseUrl.replace('/api', '');
    // If imageUrl already starts with /uploads, use it directly, otherwise prepend /uploads/
    if (imageUrl.startsWith('/uploads/')) {
      return `${staticBaseUrl}${imageUrl}`;
    } else if (imageUrl.startsWith('uploads/')) {
      return `${staticBaseUrl}/${imageUrl}`;
    } else {
      return `${staticBaseUrl}/uploads/${imageUrl}`;
    }
  };

  const handleCreateAuction = () => {
    router.push('/create-auction');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="pt-28 py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="text-center bg-gray-50 rounded-3xl p-12 border border-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                <p className="mt-6 text-base font-medium text-gray-600">Loading auctions...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-500">
      {/* Hero Section for Auctions */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-500 min-h-[320px] flex flex-col justify-center items-center pt-28 pb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg text-center">Browse All Auctions</h1>
        <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl text-center">Find the best items, place your bids, and win exclusive treasures!</p>
        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#fff" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,53.3C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>
      {/* Main Content Section */}
      <section className="-mt-10 pb-16 bg-white rounded-t-3xl shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl mb-6 text-sm flex items-center justify-between shadow-sm">
              <span className="font-medium">{error}</span>
              <button 
                onClick={fetchAuctions}
                className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl font-medium transition-all active:scale-95"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Clean Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-indigo-400" size={20} />
              <input
                type="text"
                placeholder="Search for auctions by title or description..."
                className="w-full pl-14 pr-5 py-4 bg-white border border-indigo-200 text-gray-900 placeholder-indigo-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 focus:bg-white transition-all text-sm shadow-lg hover:shadow-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center items-center mb-10">
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 px-8 py-4 rounded-2xl border border-indigo-200 shadow-lg">
              <p className="text-base font-bold text-white">
                {sortedAuctions.length} {sortedAuctions.length === 1 ? 'Auction' : 'Auctions'}
              </p>
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
              <p className="text-base text-blue-100 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse block"></span>
                {sortedAuctions.filter(a => !a.isClosed).length} Live
              </p>
            </div>
          </div>

          {/* No Auctions Message */}
          {sortedAuctions.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="max-w-sm mx-auto bg-gray-50 rounded-3xl p-12 border border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gavel className="text-blue-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Auctions Found</h3>
                <p className="text-base text-gray-600 mb-8 leading-relaxed">
                  {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create an auction'}
                </p>
                <button 
                  onClick={handleCreateAuction}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-bold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus size={20} />
                  Create Auction
                </button>
              </div>
            </div>
          )}

          {/* Auctions Grid - Balanced Medium-Sized Cards */}
          {sortedAuctions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedAuctions.map((auction) => (
                <div
                  key={auction.id}
                  onClick={() => router.push(`/auction/${auction.id}`)}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-400 transform hover:-translate-y-2 overflow-hidden relative"
                >
                  {/* Image Container - Slightly Reduced Height */}
                  <div className="relative h-52 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                    {auction.imageUrl ? (
                      <Image
                        src={getImageUrl(auction.imageUrl)}
                        alt={auction.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(event) => {
                          const img = event.currentTarget;
                          img.style.display = 'none';
                          const fallback = img.parentElement?.querySelector('[data-fallback]');
                          if (fallback) {
                            fallback.classList.remove('hidden');
                          }
                        }}
                      />
                    ) : null}
                    <div data-fallback className={`${auction.imageUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                      <Gavel className="text-indigo-200" size={56} />
                    </div>
                    
                    {/* Status Badge - Top Right */}
                    {!auction.isClosed && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </div>
                    )}
                    {auction.isClosed && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                        CLOSED
                      </div>
                    )}
                  </div>
                  
                  {/* Content Container - Slightly Reduced Padding */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors leading-snug min-h-[3rem]">
                      {auction.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {auction.description}
                    </p>
                    
                    {/* Price Section - Compact but Clear */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-3">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Current Bid</p>
                          <p className="text-3xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                            {formatPrice(auction.currentPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer - Bids and Action Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={16} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-600">
                          {auction.bidCount || 0} {(auction.bidCount || 0) === 1 ? 'Bid' : 'Bids'}
                        </span>
                      </div>
                      
                      {!auction.isClosed ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/auction/${auction.id}`);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 transform hover:scale-105"
                        >
                          <Gavel size={14} /> 
                          Bid
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/auction/${auction.id}`);
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
