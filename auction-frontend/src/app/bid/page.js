'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Gavel, DollarSign, Clock, User, TrendingUp, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getAuctionById, placeBid, getBidsForAuction, getCurrentUser } from '../../lib/api';

export default function BidPage() {
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const auctionId = searchParams.get('auctionId');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    if (auctionId) {
      fetchAuctionAndBids();
    } else {
      setError('No auction ID provided');
      setLoading(false);
    }
  }, [auctionId, router]);

  const fetchAuctionAndBids = async () => {
    try {
      setLoading(true);
      const [auctionData, bidsData] = await Promise.all([
        getAuctionById(auctionId),
        getBidsForAuction(auctionId)
      ]);
      
      setAuction(auctionData);
      setBids(bidsData);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load auction data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (parseFloat(bidAmount) <= auction.currentPrice) {
      setError(`Bid must be higher than current price of $${auction.currentPrice}`);
      return;
    }

    try {
      setPlacingBid(true);
      setError('');
      setSuccess('');

      const bidData = {
        auctionId: parseInt(auctionId),
        userId: user.id,
        amount: parseFloat(bidAmount)
      };

      await placeBid(bidData);
      setSuccess('Bid placed successfully!');
      setBidAmount('');
      
      // Refresh auction and bids data
      await fetchAuctionAndBids();
      
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(error.response?.data?.message || error.response?.data || 'Failed to place bid');
    } finally {
      setPlacingBid(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001';
    const staticBaseUrl = baseUrl.replace('/api', '');
    if (imageUrl.startsWith('/uploads/')) {
      return `${staticBaseUrl}${imageUrl}`;
    } else if (imageUrl.startsWith('uploads/')) {
      return `${staticBaseUrl}/${imageUrl}`;
    } else {
      return `${staticBaseUrl}/uploads/${imageUrl}`;
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

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Auction Not Found</h2>
          <p className="text-gray-600 mb-6">The auction you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/main/auctions')}>
            <ArrowLeft size={20} />
            Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/auction/${auctionId}`)}
          className="mb-4"
        >
          <ArrowLeft size={20} />
          Back to Auction
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Place Your Bid</h1>
        <p className="text-gray-600">Bid on "{auction.title}"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Auction Info */}
        <div className="space-y-6">
          {/* Auction Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
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
                <Gavel size={48} />
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{auction.title}</h2>
              <p className="text-gray-600 mb-4">{auction.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Starting Price</p>
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(auction.startingPrice)}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-600">Current Price</p>
                  <p className="text-lg font-semibold text-red-800">{formatPrice(auction.currentPrice)}</p>
                </div>
              </div>

              <div className={`mt-4 px-3 py-2 rounded-lg text-center ${
                auction.isClosed 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                <Clock size={16} className="inline mr-2" />
                {auction.isClosed ? 'Auction Closed' : 'Auction Active'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Bidding */}
        <div className="space-y-6">
          {/* Place Bid Form */}
          {!auction.isClosed && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Gavel className="mr-2 text-red-800" size={24} />
                Place Your Bid
              </h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handlePlaceBid}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      step="0.01"
                      min={auction.currentPrice + 0.01}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum: ${auction.currentPrice + 0.01}`}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                      disabled={placingBid}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Must be higher than current price: {formatPrice(auction.currentPrice)}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={placingBid || !bidAmount}
                  size="large"
                  className="w-full"
                >
                  {placingBid ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Placing Bid...
                    </>
                  ) : (
                    <>
                      <TrendingUp size={20} />
                      Place Bid
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {auction.isClosed && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Auction Closed</h3>
              <p className="text-gray-600">This auction has ended and is no longer accepting bids.</p>
            </div>
          )}

          {/* Bid History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="mr-2 text-blue-600" size={24} />
              Bid History
            </h3>

            {bids.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bids placed yet</p>
                <p className="text-sm text-gray-400">Be the first to bid!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bids.map((bid, index) => (
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
                              Leading Bid
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          User ID: {bid.userId}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
