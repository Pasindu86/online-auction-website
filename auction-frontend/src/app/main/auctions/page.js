'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Clock, Gavel, Heart } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function AuctionsPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Set page title
    document.title = 'Auctions - Online Auction System';
  }, []);

  // Mock auction data
  const auctions = [
    {
      id: 1,
      title: "Vintage Rolex Submariner",
      description: "Rare 1960s Rolex Submariner in excellent condition",
      currentBid: "$8,500",
      timeLeft: "2h 15m",
      bids: 23,
      image: "⌚",
      category: "Watches",
      seller: "WatchCollector",
      status: "active"
    },
    {
      id: 2,
      title: "Original Picasso Sketch",
      description: "Authentic Pablo Picasso pencil sketch from 1965",
      currentBid: "$12,000",
      timeLeft: "1d 5h",
      bids: 45,
      image: "🎨",
      category: "Art",
      seller: "ArtDealer",
      status: "active"
    },
    {
      id: 3,
      title: "Antique Persian Rug",
      description: "Hand-woven Persian rug from the 19th century",
      currentBid: "$3,200",
      timeLeft: "3h 42m",
      bids: 18,
      image: "🏺",
      category: "Antiques",
      seller: "RugMaster",
      status: "active"
    },
    {
      id: 4,
      title: "Classic Ferrari Model",
      description: "1/18 scale die-cast Ferrari F40 model",
      currentBid: "$450",
      timeLeft: "5h 20m",
      bids: 12,
      image: "🏎️",
      category: "Collectibles",
      seller: "CarEnthusiast",
      status: "active"
    },
    {
      id: 5,
      title: "Rare Book Collection",
      description: "First edition books from famous authors",
      currentBid: "$1,800",
      timeLeft: "12h 30m",
      bids: 8,
      image: "📚",
      category: "Books",
      seller: "BookWorm",
      status: "active"
    },
    {
      id: 6,
      title: "Diamond Necklace",
      description: "Elegant diamond necklace with certificate",
      currentBid: "$15,500",
      timeLeft: "6h 45m",
      bids: 31,
      image: "💎",
      category: "Jewelry",
      seller: "JewelryExpert",
      status: "active"
    }
  ];

  const categories = ["All", "Art", "Watches", "Jewelry", "Antiques", "Collectibles", "Books"];

  const filteredAuctions = auctions.filter(auction =>
    auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Auctions</h1>
        <p className="text-gray-600">Discover amazing items from verified sellers</p>
      </div>

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

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
              >
                {category}
              </button>
            ))}
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
          <option>Sort by: Ending Soon</option>
          <option>Sort by: Lowest Price</option>
          <option>Sort by: Highest Price</option>
          <option>Sort by: Most Bids</option>
        </select>
      </div>

      {/* Auctions Grid/List */}
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
              viewMode === 'list' ? 'w-32 h-32' : 'h-48'
            }`}>
              <span className="text-5xl">{auction.image}</span>
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
                  <p className="text-sm text-gray-500">Current Bid</p>
                  <p className="text-xl font-bold text-red-800">{auction.currentBid}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Time Left</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                    <Clock size={16} />
                    {auction.timeLeft}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  <span>{auction.bids} bids</span>
                  <span className="mx-2">•</span>
                  <span>by {auction.seller}</span>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {auction.category}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="primary" size="small" className="flex-1">
                  <Gavel size={16} />
                  Place Bid
                </Button>
                <Button variant="ghost" size="small">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="ghost" size="large">
          Load More Auctions
        </Button>
      </div>
    </div>
  );
}
