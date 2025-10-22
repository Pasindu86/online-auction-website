'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Gavel, User, CreditCard, Clock, Eye, Tag, TrendingUp, Check } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Navbar from '../../../components/ui/Navbar';
import Footer from '../../../components/ui/Footer';
import { getAuctionById, getCurrentUser, placeBid, getBidsForAuction, getUserOrders, createOrderFromAuction } from '../../../lib/api';

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
  const [totalBidsCount, setTotalBidsCount] = useState(0);
  const [isWinner, setIsWinner] = useState(false);
  const [hasExistingOrder, setHasExistingOrder] = useState(false);
  const [existingOrder, setExistingOrder] = useState(null);
  const [imageError, setImageError] = useState(false);

  const fetchAuction = useCallback(async (id, currentUser) => {
    try {
      setLoading(true);
      const [auctionResponse, bidsResponse] = await Promise.all([
        getAuctionById(id),
        getBidsForAuction(id)
      ]);
      
      console.log('Fetched auction:', auctionResponse);
      console.log('Fetched bids:', bidsResponse);
      
      setAuction(auctionResponse);
      setImageError(false);
      setBidAmount((auctionResponse.currentPrice + 1).toString());
      setTotalBidsCount(bidsResponse.length); // Store total count
      setRecentBids(bidsResponse.slice(0, 3)); // Get last 3 bids for display
      
      // Check if current user is the winner (highest bidder when auction is closed)
      if (auctionResponse.isClosed && bidsResponse.length > 0 && currentUser) {
        const isUserWinner = bidsResponse[0].userId === parseInt(currentUser.id);
        setIsWinner(isUserWinner);
        
        // If winner, check if they already have an order for this auction
        if (isUserWinner) {
          try {
            const userOrders = await getUserOrders(currentUser.id);
            const existingAuctionOrder = userOrders.find(order => order.auctionId === parseInt(id));
            if (existingAuctionOrder) {
              setHasExistingOrder(true);
              setExistingOrder(existingAuctionOrder);
            } else {
              setHasExistingOrder(false);
              setExistingOrder(null);
            }
          } catch (orderError) {
            console.error('Error checking existing orders:', orderError);
            setHasExistingOrder(false);
            setExistingOrder(null);
          }
        } else {
          setHasExistingOrder(false);
          setExistingOrder(null);
        }
      } else {
        setIsWinner(false);
        setHasExistingOrder(false);
        setExistingOrder(null);
      }
      
      setError('');
    } catch (error) {
      console.error('Error fetching auction:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to load auction details.');
      setRecentBids([]);
      setTotalBidsCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (params.id) {
      fetchAuction(params.id, currentUser);
    }
  }, [params.id, fetchAuction]);

  // Refresh order status when page regains focus (e.g., returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && auction && isWinner) {
        // Refresh order status and auction data when page becomes visible
        console.log('Page became visible, refreshing order status...');
        fetchAuction(params.id, user);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, auction, isWinner, params.id, fetchAuction]);

  // Poll for order updates every 5 seconds when user is winner but hasn't paid yet
  useEffect(() => {
    if (isWinner && user && !hasExistingOrder) {
      const interval = setInterval(() => {
        getUserOrders(user.id)
          .then(userOrders => {
            const existingAuctionOrder = userOrders.find(order => order.auctionId === parseInt(params.id));
            if (existingAuctionOrder) {
              console.log('Order found for this auction:', existingAuctionOrder);
              setHasExistingOrder(true);
              setExistingOrder(existingAuctionOrder);
            }
          })
          .catch(error => console.error('Error polling order status:', error));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isWinner, user, hasExistingOrder, params.id]);

  // Re-check winner status if user state changes and auction is already loaded
  useEffect(() => {
    if (auction && user && auction.isClosed && recentBids.length > 0) {
      const isUserWinner = recentBids[0].userId === parseInt(user.id);
      setIsWinner(isUserWinner);
      
      if (isUserWinner) {
        // Check for existing orders
        getUserOrders(user.id)
          .then(userOrders => {
            const existingAuctionOrder = userOrders.find(order => order.auctionId === parseInt(params.id));
            if (existingAuctionOrder) {
              setHasExistingOrder(true);
              setExistingOrder(existingAuctionOrder);
            } else {
              setHasExistingOrder(false);
              setExistingOrder(null);
            }
          })
          .catch(orderError => {
            console.error('Error checking existing orders:', orderError);
            setHasExistingOrder(false);
            setExistingOrder(null);
          });
      } else {
        setHasExistingOrder(false);
        setExistingOrder(null);
      }
    }
  }, [user, auction, recentBids, params.id]);

  const formatPrice = (price) => {
    return `Rs. ${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    // Ensure we're working with UTC time from the backend
    const date = new Date(dateString + (dateString.endsWith('Z') ? '' : 'Z'));
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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

      // Backend expects PascalCase properties
      const bidData = {
        AuctionId: parseInt(params.id),
        UserId: parseInt(user.id),
        Amount: parseFloat(bidAmount)
      };

      await placeBid(bidData);
      setBidSuccess('Bid placed successfully!');
      
      // Refresh auction data and bids to show updated current price
      await fetchAuction(params.id, user);
      
      // Clear the bid input
      setBidAmount((auction.currentPrice + 1).toString());
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(error.response?.data || error.response?.data?.message || error.message || 'Failed to place bid');
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
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="mb-6">
            <Gavel className="mx-auto text-slate-300" size={80} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Unable to Load Auction</h2>
          <p className="text-slate-600 mb-2 text-lg">{error || 'The auction you are looking for cannot be loaded at this time.'}</p>
          <p className="text-sm text-slate-500 mb-8">This might be because the auction doesn&apos;t exist or the server is unavailable.</p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => router.push('/main/auctions')}
              className="bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 hover:from-blue-900 hover:via-indigo-950 hover:to-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Auctions
            </Button>
            <Button 
              onClick={() => {
                setError('');
                setLoading(true);
                fetchAuction(params.id, user);
              }}
              className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-full font-bold"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        
        {/* Breadcrumb - Compact */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <button 
              onClick={() => router.push('/main/auctions')}
              className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back to Auctions
            </button>
          </div>
        </div>
<br></br>
        {/* Page Title */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <h1 className="text-3xl font-bold text-gray-800 font-poppins">
  Auction Details
</h1>

        </div>

        {/* Main Content - Centered Card Layout */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Column - Auction Card (3/5 width) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                
                {/* Image Section with Status Badge */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-video flex items-center justify-center">
                  {auction.imageUrl && !imageError ? (
                    <Image
                      src={getImageUrl(auction.imageUrl)}
                      alt={auction.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                      onError={() => setImageError(true)}
                      priority
                    />
                  ) : null}
                  <div className={`${auction.imageUrl && !imageError ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center`}>
                    <Gavel size={48} className="text-gray-300" />
                  </div>
                  
                  {/* Status Badge - Top Right */}
                  <div className="absolute top-4 right-4">
                    {(() => {
                      const now = new Date();
                      const startTime = new Date(auction.startTime + (auction.startTime.endsWith('Z') ? '' : 'Z'));
                      const endTime = new Date(auction.endTime + (auction.endTime.endsWith('Z') ? '' : 'Z'));
                      
                      if (auction.isClosed || endTime <= now) {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-800 text-white shadow-lg">
                            CLOSED
                          </span>
                        );
                      } else if (startTime > now) {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500 text-white shadow-lg">
                            <Clock size={14} />
                            UPCOMING
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            LIVE
                          </span>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{auction.title}</h2>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{auction.description}</p>
                  </div>
                  
                  {/* Price Section */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wide">Current Price</p>
                      <p className="text-4xl font-black text-blue-600">{formatPrice(auction.currentPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wide">Starting Price</p>
                      <p className="text-2xl font-semibold text-gray-700">{formatPrice(auction.startingPrice)}</p>
                    </div>
                  </div>

                  {/* Bids Count */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="font-medium">{totalBidsCount} {totalBidsCount === 1 ? 'bid' : 'bids'}</span>
                    <span className="text-xs text-gray-500">Auction ID: #{auction.id}</span>
                  </div>

                  {/* Upcoming Auction Message */}
                  {(() => {
                    const now = new Date();
                    const startTime = new Date(auction.startTime + (auction.startTime.endsWith('Z') ? '' : 'Z'));
                    return !auction.isClosed && startTime > now;
                  })() && (
                    <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <Clock className="mx-auto text-yellow-600 mb-2" size={32} />
                      <p className="text-gray-900 font-bold text-sm">Auction Not Started Yet</p>
                      <p className="text-xs text-gray-600 mt-1">Starts: <span className="font-bold">{formatDate(auction.startTime)}</span></p>
                    </div>
                  )}

                  {/* Login CTA */}
                  {(() => {
                    const now = new Date();
                    const startTime = new Date(auction.startTime + (auction.startTime.endsWith('Z') ? '' : 'Z'));
                    const endTime = new Date(auction.endTime + (auction.endTime.endsWith('Z') ? '' : 'Z'));
                    return !auction.isClosed && startTime <= now && endTime > now && !user;
                  })() && (
                    <Button 
                      onClick={() => router.push('/login')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all"
                    >
                      Sign In to Bid
                    </Button>
                  )}

                  {/* Closed Auction Message */}
                  {(() => {
                    const now = new Date();
                    const endTime = new Date(auction.endTime + (auction.endTime.endsWith('Z') ? '' : 'Z'));
                    return (auction.isClosed || endTime <= now) && !isWinner;
                  })() && (
                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                      <Clock className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-700 font-bold text-sm">Auction Ended</p>
                      <p className="text-xs text-gray-500">Final price: <span className="font-bold">{formatPrice(auction.currentPrice)}</span></p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar (2/5 width) */}
            <div className="lg:col-span-2">
              <div className="sticky top-6 space-y-6">
                
                {/* Bidding Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100" id="bidForm">
                  
                  {/* Winner Badge */}
                  {isWinner && (
                    <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-center py-3 px-4">
                      <p className="text-gray-900 font-black text-base flex items-center justify-center gap-2">
                        <TrendingUp size={20} />
                        🎉 You Won This Auction!
                      </p>
                    </div>
                  )}

                  {/* Winner Payment Section */}
                  {isWinner && !hasExistingOrder && (
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Complete Your Purchase</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Winning Bid:</span>
                            <span className="text-xl font-bold text-blue-600">{formatPrice(auction.currentPrice)}</span>
                          </div>
                          <p className="text-xs text-gray-600">Congratulations! Proceed to payment to claim your item.</p>
                        </div>
                        
                        <Button
                          onClick={async () => {
                            try {
                              // Create order first, then navigate with orderId
                              const order = await createOrderFromAuction(auction.id);
                              console.log('Order created:', order);
                              setHasExistingOrder(true);
                              setExistingOrder(order);
                              
                              // Dispatch event to trigger immediate notification refresh
                              window.dispatchEvent(new CustomEvent('orderCreated', { detail: order }));
                              
                              router.push(`/payment?orderId=${order.id}`);
                            } catch (error) {
                              console.error('Error creating order:', error);
                              setError('Failed to create order. Please try again.');
                            }
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <CreditCard size={20} />
                          Proceed to Payment
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Order Already Exists Message */}
                  {isWinner && hasExistingOrder && existingOrder && (
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status</h3>
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-sm font-medium text-green-800 mb-2">✓ Order Created</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>Order ID: #{existingOrder.id}</p>
                            <p>Amount: {formatPrice(existingOrder.totalPrice)}</p>
                            <p>Status: <span className="font-semibold capitalize">{existingOrder.status}</span></p>
                          </div>
                        </div>
                        
                        {existingOrder.status === 'Pending' && (
                          <Button
                            onClick={() => router.push(`/payment?orderId=${existingOrder.id}`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <CreditCard size={20} />
                            Complete Payment
                          </Button>
                        )}
                        
                        {existingOrder.status === 'Paid' && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center">
                            <div className="flex justify-center mb-3">
                              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                <Check size={32} className="text-white" />
                              </div>
                            </div>
                            <h4 className="text-lg font-bold text-green-800 mb-2">Payment Completed!</h4>
                            <p className="text-sm text-green-700 mb-3">
                              Your payment has been processed successfully. Thank you for your purchase!
                            </p>
                            <div className="text-xs text-gray-600 space-y-1 bg-white rounded-lg p-3">
                              <p><span className="font-semibold">Order ID:</span> #{existingOrder.id}</p>
                              <p><span className="font-semibold">Amount Paid:</span> {formatPrice(existingOrder.totalPrice)}</p>
                            </div>
                          </div>
                        )}

                        {existingOrder.status !== 'Paid' && existingOrder.status !== 'Pending' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                            <p className="text-sm text-yellow-800">
                              <span className="font-semibold">Order Status:</span> {existingOrder.status}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bid Form Section */}
                  {(() => {
                    const now = new Date();
                    const endTime = new Date(auction.endTime + (auction.endTime.endsWith('Z') ? '' : 'Z'));
                    return !auction.isClosed && endTime > now && user && !isWinner;
                  })() && (
                    <div className="p-6 border-b border-gray-100">
                      {(() => {
                        const now = new Date();
                        const startTime = new Date(auction.startTime + (auction.startTime.endsWith('Z') ? '' : 'Z'));
                        return startTime > now;
                      })() ? (
                        <div className="text-center py-6">
                          <Clock className="mx-auto text-yellow-500 mb-3" size={40} />
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Auction Starts Soon</h3>
                          <p className="text-sm text-gray-600">
                            This auction will begin accepting bids on<br />
                            <span className="font-bold text-gray-900">{formatDate(auction.startTime)}</span>
                          </p>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Place Your Bid</h3>
                          
                          <form onSubmit={handleBidSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bid Amount (Min: {formatPrice(auction.currentPrice + 1)})
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">Rs. </span>
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              min={auction.currentPrice + 1}
                              step="0.01"
                              required
                              className="w-full pl-10 pr-4 py-3 text-lg font-bold text-gray-900 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {bidSuccess && (
                          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm font-medium">
                            ✓ Bid placed successfully!
                          </div>
                        )}

                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-medium">
                            {error}
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={placingBid}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Gavel size={20} />
                          {placingBid ? 'Placing Bid...' : 'Submit Bid'}
                        </Button>
                      </form>
                        </>
                      )}
                    </div>
                  )}

                  {/* Item Details Compact */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Auction Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Starting Price</span>
                        <span className="font-bold text-gray-900">{formatPrice(auction.startingPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Total Bids</span>
                        <span className="font-bold text-gray-900">{totalBidsCount}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Start Time</span>
                        <span className="font-bold text-gray-900">{formatDate(auction.startTime)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">End Time</span>
                        <span className="font-bold text-gray-900">{formatDate(auction.endTime)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Status</span>
                        <span className={`font-bold ${
                          (() => {
                            const now = new Date();
                            const startTime = new Date(auction.startTime + (auction.startTime.endsWith('Z') ? '' : 'Z'));
                            const endTime = new Date(auction.endTime + (auction.endTime.endsWith('Z') ? '' : 'Z'));
                            
                            if (auction.isClosed || endTime <= now) {
                              return 'text-red-600';
                            } else if (startTime > now) {
                              return 'text-yellow-600';
                            } else {
                              return 'text-green-600';
                            }
                          })()
                        }`}>
                          {(() => {
                            const now = new Date();
                            const startTime = new Date(auction.startTime + (auction.startTime.endsWith('Z') ? '' : 'Z'));
                            const endTime = new Date(auction.endTime + (auction.endTime.endsWith('Z') ? '' : 'Z'));
                            
                            if (auction.isClosed || endTime <= now) {
                              return 'Closed';
                            } else if (startTime > now) {
                              return 'Upcoming';
                            } else {
                              return 'Active';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bid History - Compact */}
                  <div className="p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Recent Bids</h3>
                    {recentBids.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {recentBids.map((bid, index) => (
                          <div 
                            key={bid.id} 
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              index === 0 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                              }`}>
                                {index === 0 ? '🥇' : `#${index + 1}`}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{formatPrice(bid.amount)}</p>
                                {bid.userName && (
                                  <p className="text-xs text-gray-500">by {bid.userName}</p>
                                )}
                              </div>
                            </div>
                            <User size={16} className="text-gray-400" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                        <Gavel className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm text-gray-500">No bids placed yet</p>
                        <p className="text-xs text-gray-400 mt-1">Be the first to bid!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
