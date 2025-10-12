'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Eye, Clock, DollarSign } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getAllAuctions, getCurrentUser, deleteAuction } from '../../lib/api';

export default function MyAuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handleDeleteAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to delete this auction?')) {
      return;
    }

    try {
      await deleteAuction(auctionId);
      setAuctions(auctions.filter(auction => auction.id !== auctionId));
    } catch (error) {
      console.error('Error deleting auction:', error);
      alert('Failed to delete auction. Please try again.');
    }
  };

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
          <p className="text-gray-600">Manage your auction listings</p>
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
            onClick={() => fetchMyAuctions(user)}
            className="ml-4 underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Stats Cards */}
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
                {formatPrice(auctions.reduce((sum, a) => sum + a.currentPrice, 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* No Auctions Message */}
      {auctions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Auctions Created Yet</h3>
            <p className="text-gray-500 mb-6">
              Start by creating your first auction to sell your items.
            </p>
            <Button onClick={() => router.push('/create-auction')}>
              <Plus size={20} className="mr-2" />
              Create Your First Auction
            </Button>
          </div>
        </div>
      )}

      {/* Auctions List */}
      {auctions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Auctions</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {auctions.map((auction) => (
              <div key={auction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {auction.imageUrl ? (
                      <img 
                        src={getImageUrl(auction.imageUrl)} 
                        alt={auction.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`${auction.imageUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full text-gray-400`}>
                      <Eye size={24} />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {auction.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {auction.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Starting: {formatPrice(auction.startingPrice)}</span>
                          <span>Current: {formatPrice(auction.currentPrice)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            auction.isClosed 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {auction.isClosed ? 'Closed' : 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => router.push(`/auction/${auction.id}`)}
                        >
                          <Eye size={16} />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleDeleteAuction(auction.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center mt-8">
        <Button variant="ghost" onClick={() => fetchMyAuctions(user)}>
          Refresh My Auctions
        </Button>
      </div>
    </div>
  );
}
