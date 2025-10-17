'use client';

import { useState, useEffect } from 'react';
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading auctions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">Auctions</h1>
                <Sparkles className="text-blue-500" size={28} />
              </div>
              <p className="text-base text-gray-500">Discover unique items and place your bids</p>
            </div>
            <button 
              onClick={handleCreateAuction} 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105"
            >
              <Plus size={20} />
              Create Auction
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-3xl mb-6 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={fetchAuctions}
              className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-full font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
            <input
              type="text"
              placeholder="Search auctions..."
              className="w-full pl-14 pr-5 py-4 bg-gray-50 border-0 text-gray-900 placeholder-gray-400 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">
              {sortedAuctions.length} {sortedAuctions.length === 1 ? 'Auction' : 'Auctions'}
            </p>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            <p className="text-sm text-gray-500">
              {sortedAuctions.filter(a => !a.isClosed).length} Live
            </p>
          </div>
        </div>

        {/* No Auctions Message */}
        {sortedAuctions.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="text-gray-400" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Auctions Found</h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create an auction'}
              </p>
              <button 
                onClick={handleCreateAuction}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Create Auction
              </button>
            </div>
          </div>
        )}

        {/* No Auctions Message */}
        {sortedAuctions.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Gavel className="text-blue-600" size={36} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Auctions Found</h3>
              <p className="text-sm text-gray-500 mb-8">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create an auction'}
              </p>
              <button 
                onClick={handleCreateAuction}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
              >
                <Plus size={20} />
                Create Auction
              </button>
            </div>
          </div>
        )}

        {/* Auctions Grid */}
        {sortedAuctions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAuctions.map((auction) => (
              <div
                key={auction.id}
                onClick={() => router.push(`/auction/${auction.id}`)}
                className="group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-64 flex items-center justify-center overflow-hidden">
                  {auction.imageUrl ? (
                    <img 
                      src={getImageUrl(auction.imageUrl)} 
                      alt={auction.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${auction.imageUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                    <Gavel className="text-gray-300" size={64} />
                  </div>
                  
                  {/* Live Badge with Green Color */}
                  {!auction.isClosed && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-xl backdrop-blur-sm">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </div>
                  )}
                  
                  {/* Closed Badge */}
                  {auction.isClosed && (
                    <div className="absolute top-4 left-4 px-4 py-2 bg-gray-900/80 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                      CLOSED
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1 pr-2 group-hover:text-blue-600 transition-colors">{auction.title}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">{auction.description}</p>
                  
                  {/* Price Section */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-4 mb-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Current Bid</p>
                        <p className="text-3xl font-bold text-gray-900">{formatPrice(auction.currentPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Starting</p>
                        <p className="text-sm text-gray-500 font-semibold">{formatPrice(auction.startingPrice)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & ID */}
                  <div className="flex items-center justify-between mb-5">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                      auction.isClosed 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {auction.isClosed ? (
                        <>
                          <Timer size={14} />
                          Ended
                        </>
                      ) : (
                        <>
                          <TrendingUp size={14} />
                          Active
                        </>
                      )}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">#{auction.id}</span>
                  </div>

                  {/* Action Button */}
                  {!auction.isClosed ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/auction/${auction.id}`);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105"
                    >
                      <Gavel size={18} />
                      Place Bid Now
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/auction/${auction.id}`);
                      }}
                      className="w-full px-5 py-3.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-full hover:bg-gray-200 transition-all"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
