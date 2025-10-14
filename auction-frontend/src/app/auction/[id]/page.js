'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Share2, Flag, Gavel, Clock, User, Eye, TrendingUp } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { getAuctionById, getCurrentUser, placeBid, getBidsForAuction } from '../../../lib/api';

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [user, setUser] = useState(null);
  const [placingBid, setPlacingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState('');
  const [recentBids, setRecentBids] = useState([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser); // Debug log
    setUser(currentUser);
    
    if (params.id) {
      console.log('Fetching auction with ID:', params.id); // Debug log
      fetchAuction(params.id);
    }
  }, [params.id]);

  const fetchAuction = async (id) => {
    try {
      setLoading(true);
      const [auctionResponse, bidsResponse] = await Promise.all([
        getAuctionById(id),
        getBidsForAuction(id)
      ]);
      
      setAuction(auctionResponse);
      setBidAmount((auctionResponse.currentPrice + 1).toString());
      setRecentBids(bidsResponse.slice(0, 3)); // Get last 3 bids
      setError('');
    } catch (error) {
      console.error('Error fetching auction:', error);
      setError('Failed to load auction details.');
      setRecentBids([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      setBidSuccess('');
      return;
    }

    if (parseFloat(bidAmount) <= auction.currentPrice) {
      setError(`Bid must be higher than current price of ${formatPrice(auction.currentPrice)}`);
      setBidSuccess('');
      return;
    }

    try {
      setPlacingBid(true);
      setError('');
      setBidSuccess('');

      const bidData = {
        auctionId: parseInt(params.id),
        userId: parseInt(user.id),
        amount: parseFloat(bidAmount)
      };

      console.log('Placing bid:', bidData); // Debug log

      await placeBid(bidData);
      setBidSuccess('Bid placed successfully!');
      setBidAmount(''); // Clear the input
      
      // Refresh auction data and bids to show updated current price
      await fetchAuction(params.id);
      
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data || 
        error.message ||
        'Failed to place bid'
      );
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auction details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Auction Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The auction you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/main/auctions')}>
            <ArrowLeft size={20} className="mr-2" />
            Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button 
          onClick={() => router.push('/main/auctions')}
          className="hover:text-red-600 transition-colors"
        >
          Auctions
        </button>
        <span>/</span>
        <span className="text-gray-900">{auction.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image and Gallery */}
        <div className="lg:col-span-2">
          {/* Main Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
            <div className="aspect-square flex items-center justify-center">
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
                <Gavel size={80} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {auction.description}
            </p>
          </div>
        </div>

        {/* Right Column - Auction Info and Bidding */}
        <div className="space-y-6">
          {/* Auction Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{auction.title}</h1>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Share2 size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Flag size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1">
                <User size={16} />
                Auction ID: {auction.id}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={16} />
                Owner ID: {auction.ownerId}
              </span>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                auction.isClosed 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {auction.isClosed ? 'Auction Closed' : 'Active Auction'}
              </span>
            </div>

            {/* Price Information */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Starting Price:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(auction.startingPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-gray-600">Current Price:</span>
                <span className="text-2xl font-bold text-red-800">
                  {formatPrice(auction.currentPrice)}
                </span>
              </div>
            </div>

            {/* Bidding Section */}
            {!auction.isClosed && user && (
              <div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {bidSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{bidSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleBidSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Bid Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="bidAmount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={auction.currentPrice + 1}
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="0.00"
                        disabled={placingBid}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum bid: {formatPrice(auction.currentPrice + 1)}
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={placingBid}>
                    {placingBid ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Placing Bid...
                      </>
                    ) : (
                      <>
                        <Gavel size={20} className="mr-2" />
                        Place Bid
                      </>
                    )}
                  </Button>
                </form>

                {/* Advanced Bidding Link */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push(`/bid?auctionId=${params.id}`)}
                    className="w-full"
                  >
                    <TrendingUp size={20} className="mr-2" />
                    View Bid History & Advanced Bidding
                  </Button>
                </div>
              </div>
            )}

            {auction.isClosed && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Auction Finished</h3>
                <p className="text-yellow-700 text-sm mb-4">
                  This auction is closed. If you were the highest bidder, please proceed to the payment section to finalize your order.
                </p>
                <Button className="w-full" onClick={() => router.push(`/payment?auctionId=${auction.id}`)}>
                  Go to Payment
                </Button>
              </div>
            )}

            {/* Recent Bids Display */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="mr-2 text-blue-600" size={20} />
                Recent Bids
              </h3>
              
              {recentBids.length > 0 ? (
                <div className="space-y-2">
                  {recentBids.map((bid, index) => (
                    <div 
                      key={bid.id} 
                      className={`p-3 rounded-lg border ${
                        index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-semibold ${
                            index === 0 ? 'text-green-800' : 'text-gray-900'
                          }`}>
                            {formatPrice(bid.amount)}
                            {index === 0 && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Leading
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            User #{bid.userId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {formatDate(bid.placedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Gavel className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No bids placed yet</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to bid!</p>
                </div>
              )}
              
              {/* View All Bids Link */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => router.push(`/bid?auctionId=${params.id}`)}
                  className="w-full text-sm"
                >
                  View All Bids & Advanced Bidding
                </Button>
              </div>
            </div>

            {/* Login Required Message */}
            {!auction.isClosed && !user && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-3">Please log in to place a bid</p>
                <Button onClick={() => router.push('/login')} className="w-full">
                  Login to Bid
                </Button>
              </div>
            )}

            {/* Closed Auction Message */}
            {auction.isClosed && (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-red-700 font-medium">This auction has ended</p>
                <p className="text-sm text-red-600 mt-1">
                  Final price: {formatPrice(auction.currentPrice)}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <Heart size={20} className="mr-2" />
                Add to Watchlist
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Share2 size={20} className="mr-2" />
                Share Auction
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Flag size={20} className="mr-2" />
                Report Issue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <Button variant="ghost" onClick={() => router.push('/main/auctions')}>
          <ArrowLeft size={20} className="mr-2" />
          Back to All Auctions
        </Button>
      </div>
    </div>
  );
}
