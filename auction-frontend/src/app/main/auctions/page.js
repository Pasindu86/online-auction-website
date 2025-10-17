'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Clock, Gavel, Heart, Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/ui/Button';
import { getAllAuctions, getCurrentUser } from '../../../lib/api';

export default function AuctionsPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auctions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Auctions</h1>
          <p className="text-gray-600">Discover amazing items from verified sellers</p>
        </div>
        <Button onClick={handleCreateAuction} className="flex items-center gap-2">
          <Plus size={20} />
          Create Auction
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button 
            onClick={fetchAuctions}
            className="ml-4 underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search auctions..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-red-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing {filteredAuctions.length} of {auctions.length} auctions
        </p>
        <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent">
          <option>Sort by: Newest First</option>
          <option>Sort by: Lowest Price</option>
          <option>Sort by: Highest Price</option>
          <option>Sort by: Title A-Z</option>
        </select>
      </div>

      {/* No Auctions Message */}
      {filteredAuctions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Gavel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Auctions Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No auctions match your search criteria.' : 'No auctions have been created yet.'}
            </p>
            <Button onClick={handleCreateAuction}>
              <Plus size={20} className="mr-2" />
              Create Your First Auction
            </Button>
          </div>
        </div>
      )}

      {/* Auctions Grid/List */}
      {filteredAuctions.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredAuctions.map((auction) => (
            <div
              key={auction.id}
              className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Image */}
              <div className={`bg-gray-100 flex items-center justify-center ${
                viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-48'
              }`}>
                {auction.imageUrl ? (
                  <img 
                    src={getImageUrl(auction.imageUrl)} 
                    alt={auction.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`${auction.imageUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full text-gray-400`}>
                  <Gavel size={40} />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{auction.title}</h3>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{auction.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Starting Price</p>
                    <p className="text-xl font-bold text-red-800">{formatPrice(auction.startingPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Current Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(auction.currentPrice)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    <span>Auction ID: {auction.id}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    auction.isClosed 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {auction.isClosed ? 'Closed' : 'Active'}
                  </span>
                </div>

                <div className="flex gap-2">
                  {!auction.isClosed && (
                    <Button 
                      variant="primary" 
                      size="small" 
                      className="flex-1"
                      onClick={() => {
                        router.push(`/auction/${auction.id}`);
                      }}
                    >
                      <Gavel size={16} />
                      Place Bid
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => router.push(`/auction/${auction.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center mt-8">
        <Button variant="ghost" size="large" onClick={fetchAuctions}>
          Refresh Auctions
        </Button>
      </div>
    </div>
  );
}
