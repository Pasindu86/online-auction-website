'use client';

import { useState } from 'react';
import { Gavel, DollarSign, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';
import { placeBid } from '../../lib/api';

export default function QuickBidComponent({ auction, user, onBidSuccess, onError }) {
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuickBid = async (e) => {
    e.preventDefault();
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      onError('Please enter a valid bid amount');
      return;
    }

    if (parseFloat(bidAmount) <= auction.currentPrice) {
      onError(`Bid must be higher than current price of ${formatPrice(auction.currentPrice)}`);
      return;
    }

    try {
      setPlacingBid(true);

      const bidData = {
        auctionId: auction.id,
        userId: user.id,
        amount: parseFloat(bidAmount)
      };

      await placeBid(bidData);
      setBidAmount('');
      onBidSuccess('Bid placed successfully!');
      
    } catch (error) {
      console.error('Error placing bid:', error);
      onError(error.response?.data?.message || error.response?.data || 'Failed to place bid');
    } finally {
      setPlacingBid(false);
    }
  };

  if (!user || auction.isClosed) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
        <Gavel className="mr-2" size={20} />
        Quick Bid
      </h3>

      <form onSubmit={handleQuickBid} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bid Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="number"
              step="0.01"
              min={auction.currentPrice + 0.01}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Min: ${formatPrice(auction.currentPrice + 0.01)}`}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              disabled={placingBid}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            size="small"
            disabled={placingBid || !bidAmount}
            className="flex-1"
          >
            {placingBid ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                Bidding...
              </>
            ) : (
              <>
                <TrendingUp size={16} />
                Bid Now
              </>
            )}
          </Button>
          
          {/* Quick bid buttons */}
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={() => setBidAmount((auction.currentPrice + 5).toFixed(2))}
            className="text-xs px-2"
          >
            +$5
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={() => setBidAmount((auction.currentPrice + 10).toFixed(2))}
            className="text-xs px-2"
          >
            +$10
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Current price: {formatPrice(auction.currentPrice)}
        </p>
      </form>
    </div>
  );
}
