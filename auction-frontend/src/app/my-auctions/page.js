'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Eye, Clock, DollarSign, CreditCard, Package, Gavel } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getAllAuctions, getCurrentUser, deleteAuction, getUserOrders } from '../../lib/api';

export default function MyAuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'won'
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    fetchMyAuctions(currentUser);
    fetchMyOrders(currentUser);
  }, [router]);

  const fetchMyAuctions = async (currentUser) => {
    try {
      setLoading(true);
      const response = await getAllAuctions();
      // Filter auctions to show only user's own auctions
      const myAuctions = response.filter(auction => auction.ownerId === currentUser.id);
      setAuctions(myAuctions);
      setError('');
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Failed to load your auctions. Please try again.');
      setAuctions([]);
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
      // Don't set error here as it might interfere with auctions loading
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your auctions...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Auctions</h1>
          <p className="text-gray-600">Manage your auction listings and orders</p>
        </div>
        <Button onClick={() => router.push('/create-auction')} className="flex items-center gap-2">
          <Plus size={20} />
          Create New Auction
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button 
            onClick={() => {
              fetchMyAuctions(user);
              fetchMyOrders(user);
            }}
            className="ml-4 underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('created')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'created'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Gavel className="inline w-4 h-4 mr-2" />
            My Created Auctions ({auctions.length})
          </button>
          <button
            onClick={() => setActiveTab('won')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'won'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="inline w-4 h-4 mr-2" />
            Won Auctions ({orders.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'created' && (
        <>
          {/* Stats Cards for Created Auctions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Auctions</p>
                  <p className="text-2xl font-bold text-gray-900">{auctions.length}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                  <p className="text-2xl font-bold text-green-600">
                    {auctions.filter(a => !a.isClosed).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(auctions.reduce((sum, auction) => sum + auction.currentPrice, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Created Auctions List */}
          {auctions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Gavel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions yet</h3>
              <p className="text-gray-600 mb-6">You haven't created any auctions. Start by creating your first auction!</p>
              <Button onClick={() => router.push('/create-auction')}>
                <Plus size={20} className="mr-2" />
                Create Your First Auction
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <div key={auction.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Auction Image */}
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
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
                    <div className={`${auction.imageUrl ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center text-gray-400`}>
                      <Gavel size={48} />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        auction.isClosed 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {auction.isClosed ? 'Ended' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Auction Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{auction.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{auction.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Starting Price:</span>
                        <span className="font-medium">{formatPrice(auction.startingPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Price:</span>
                        <span className="font-bold text-green-600">{formatPrice(auction.currentPrice)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="small" 
                        onClick={() => router.push(`/auction/${auction.id}`)}
                        className="flex-1"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      
                      {!auction.isClosed && (
                        <Button 
                          variant="ghost" 
                          size="small" 
                          onClick={() => handleDeleteAuction(auction.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'Paid').length}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(orders.reduce((sum, order) => sum + order.finalPrice, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Won Auctions List */}
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No won auctions yet</h3>
              <p className="text-gray-600 mb-6">You haven't won any auctions yet. Start bidding to win some great items!</p>
              <Button onClick={() => router.push('/main')}>
                Browse Auctions
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{order.auction?.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{order.auction?.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>Order #{order.id}</span>
                        <span>Final Price: {formatPrice(order.finalPrice)}</span>
                        <span>Date: {new Date(order.orderDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Paid' 
                          ? 'bg-green-100 text-green-700' 
                          : order.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="small" 
                          onClick={() => router.push(`/auction/${order.auctionId}`)}
                        >
                          <Eye size={16} className="mr-1" />
                          View Auction
                        </Button>
                        
                        {order.status === 'Pending' && (
                          <Button 
                            size="small"
                            onClick={() => router.push(`/payment?orderId=${order.id}`)}
                            className="bg-green-600 hover:bg-green-700"
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
                          >
                            View Receipt
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
  );
}
