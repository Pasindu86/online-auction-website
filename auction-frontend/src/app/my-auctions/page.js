'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2, Eye, Clock, DollarSign, CreditCard, Package, Gavel, ArrowLeft, TrendingUp } from 'lucide-react';
import Button from '../../components/ui/Button';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import { getAllAuctions, getCurrentUser, deleteAuction, getUserOrders } from '../../lib/api';

export default function MyAuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('created');
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchMyAuctions(currentUser);
    fetchMyOrders(currentUser);

    // Listen for order creation events to immediately refresh
    const handleOrderCreated = () => {
      console.log('Order created event received, refreshing won auctions...');
      fetchMyOrders(currentUser);
    };
    
    window.addEventListener('orderCreated', handleOrderCreated);

    // Poll for new orders every 10 seconds
    const interval = setInterval(() => {
      fetchMyOrders(currentUser);
    }, 10000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('orderCreated', handleOrderCreated);
    };
  }, [router]);

  const fetchMyAuctions = async (currentUser) => {
    try {
      setLoading(true);
      const response = await getAllAuctions();
      const myAuctions = response.filter(auction => auction.ownerId === currentUser.id);
      setAuctions(myAuctions);
      setError('');
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Failed to load your auctions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async (currentUser) => {
    try {
      const response = await getUserOrders(currentUser.id);
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Refresh data when switching to won auctions tab
    if (tab === 'won') {
      const currentUser = getCurrentUser();
      if (currentUser) {
        fetchMyOrders(currentUser);
      }
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to delete this auction?')) {
      return;
    }

    try {
      await deleteAuction(auctionId);
      setAuctions(auctions.filter(auction => auction.id !== auctionId));
    } catch (error) {
      console.error('Error deleting auction:', error);
      setError('Failed to delete auction. Please try again.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001'}${imageUrl}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 pt-24 pb-12">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-800 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading your auctions...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 pt-24 pb-12">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-800 font-medium mb-6 transition-all hover:gap-3"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Gavel size={36} />
                    My Auctions
                  </h1>
                  <p className="text-blue-100 text-lg">Manage your auction listings and orders</p>
                </div>
                <button 
                  onClick={() => router.push('/create-auction')} 
                  className="flex items-center gap-2 bg-white text-blue-800 hover:bg-blue-50 hover:text-blue-900 font-bold shadow-lg transition-all duration-300 hover:shadow-xl px-6 py-3 rounded-xl border-2 border-white hover:border-blue-200"
                >
                  <Plus size={20} />
                  Create New Auction
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-red-800 font-medium">{error}</p>
                <button 
                  onClick={() => {
                    const currentUser = getCurrentUser();
                    if (currentUser) {
                      fetchMyAuctions(currentUser);
                      fetchMyOrders(currentUser);
                    }
                  }}
                  className="text-red-700 underline hover:no-underline font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-2 bg-white rounded-xl p-2 shadow-md">
              <button
                onClick={() => handleTabChange('created')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'created'
                    ? 'bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Gavel className="inline w-5 h-5 mr-2" />
                My Created Auctions ({auctions.length})
              </button>
              <button
                onClick={() => handleTabChange('won')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'won'
                    ? 'bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="inline w-5 h-5 mr-2" />
                Won Auctions ({orders.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'created' && (
            <>
              {/* Stats Cards for Created Auctions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Auctions</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{auctions.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="h-7 w-7 text-blue-800" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Active Auctions</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {auctions.filter(a => !a.isClosed).length}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="h-7 w-7 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Value</p>
                      <p className="text-3xl font-bold text-purple-600 mt-1">
                        {formatPrice(auctions.reduce((sum, auction) => sum + auction.currentPrice, 0))}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-7 w-7 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Created Auctions List */}
              {auctions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gavel className="h-10 w-10 text-blue-800" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No auctions yet</h3>
                  <p className="text-gray-600 mb-6">You haven&apos;t created any auctions. Start by creating your first auction!</p>
                  <Button 
                    onClick={() => router.push('/create-auction')}
                    className="bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 hover:from-blue-900 hover:via-indigo-900 hover:to-blue-700"
                  >
                    <Plus size={20} className="mr-2" />
                    Create Your First Auction
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions.map((auction) => (
                    <div key={auction.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all transform hover:-translate-y-1">
                      {/* Auction Image */}
                      <div className="h-48 bg-gray-100 relative overflow-hidden">
                        {auction.imageUrl ? (
                          <Image
                            src={getImageUrl(auction.imageUrl)}
                            alt={auction.title}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
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
                        <div data-fallback className={`${auction.imageUrl ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center text-gray-400`}>
                          <Gavel size={48} />
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                            auction.isClosed ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                          }`}>
                            {auction.isClosed ? 'Ended' : 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Auction Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">{auction.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{auction.description}</p>
                        
                        <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Starting Price:</span>
                            <span className="font-semibold text-gray-900">{formatPrice(auction.startingPrice)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Current Price:</span>
                            <span className="font-bold text-green-600 text-lg">{formatPrice(auction.currentPrice)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="small" 
                            onClick={() => router.push(`/auction/${auction.id}`)}
                            className="flex-1 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 font-semibold"
                          >
                            <Eye size={16} className="mr-1" />
                            View
                          </Button>
                          
                          {!auction.isClosed && (
                            <Button 
                              variant="ghost" 
                              size="small" 
                              onClick={() => handleDeleteAuction(auction.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Won Auctions Tab */}
          {activeTab === 'won' && (
            <>
              {/* Stats Cards for Won Auctions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="h-7 w-7 text-blue-800" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Paid Orders</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {orders.filter(o => o.status === 'Paid').length}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-7 w-7 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Spent</p>
                      <p className="text-3xl font-bold text-purple-600 mt-1">
                        {formatPrice(orders.reduce((sum, order) => sum + order.finalPrice, 0))}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-7 w-7 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Won Auctions List */}
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-blue-800" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No won auctions yet</h3>
                  <p className="text-gray-600 mb-6">You haven&apos;t won any auctions yet. Start bidding to win some great items!</p>
                  <Button 
                    onClick={() => router.push('/main')}
                    className="bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 hover:from-blue-900 hover:via-indigo-900 hover:to-blue-700"
                  >
                    Browse Auctions
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2 text-lg">{order.auction?.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{order.auction?.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium">
                              Order #{order.id}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                              {formatPrice(order.finalPrice)}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium">
                              {formatDate(order.orderDate)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-md ${
                            order.status === 'Paid' ? 'bg-green-500 text-white' : 
                            order.status === 'Pending' ? 'bg-yellow-500 text-white' : 
                            'bg-gray-500 text-white'
                          }`}>
                            {order.status}
                          </span>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="small" 
                              onClick={() => router.push(`/auction/${order.auctionId}`)}
                              className="bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                            >
                              <Eye size={16} className="mr-1" />
                              View
                            </Button>
                            
                            {order.status === 'Pending' && (
                              <Button 
                                size="small"
                                onClick={() => router.push(`/payment?orderId=${order.id}`)}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                              >
                                <CreditCard size={16} className="mr-1" />
                                Pay Now
                              </Button>
                            )}
                            
                            {order.status === 'Paid' && order.paymentReference && (
                              <Button 
                                variant="ghost" 
                                size="small" 
                                onClick={() => alert(`Transaction ID: ${order.paymentReference}`)}
                                className="bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
                              >
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
