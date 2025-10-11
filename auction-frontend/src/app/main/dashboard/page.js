'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Heart, DollarSign, TrendingUp, Clock, Gavel, Plus, Search } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Set page title
    document.title = 'Dashboard - Online Auction System';
  }, []);

  // Mock data - in a real app, this would come from your API
  const stats = [
    {
      icon: <Eye className="text-red-800" size={24} />,
      title: "Watching",
      value: "12",
      subtitle: "Items in watchlist"
    },
    {
      icon: <DollarSign className="text-green-600" size={24} />,
      title: "Active Bids",
      value: "5",
      subtitle: "Current bidding"
    },
    {
      icon: <TrendingUp className="text-blue-600" size={24} />,
      title: "Won Auctions",
      value: "8",
      subtitle: "Successfully won"
    },
    {
      icon: <Heart className="text-red-600" size={24} />,
      title: "Success Rate",
      value: "85%",
      subtitle: "Bid success rate"
    }
  ];

  const recentActivities = [
    {
      type: "bid",
      title: "Placed bid on Vintage Watch Collection",
      amount: "$2,450",
      time: "2 hours ago",
      status: "winning"
    },
    {
      type: "won",
      title: "Won Classic Camera Set",
      amount: "$890",
      time: "1 day ago",
      status: "won"
    },
    {
      type: "bid",
      title: "Placed bid on Modern Art Painting",
      amount: "$1,200",
      time: "2 days ago",
      status: "outbid"
    }
  ];

  const watchlist = [
    {
      id: 1,
      title: "Antique Jewelry Set",
      currentBid: "$650",
      timeLeft: "2h 30m",
      image: "💎"
    },
    {
      id: 2,
      title: "Vintage Guitar",
      currentBid: "$1,200",
      timeLeft: "1d 5h",
      image: "🎸"
    },
    {
      id: 3,
      title: "Classic Books Collection",
      currentBid: "$320",
      timeLeft: "4h 15m",
      image: "📚"
    }
  ];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h1>
          <Link href="/login">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.firstName || user.email}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your auctions today.
        </p>
      </div>

      

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/main/auctions">
            <Button variant="ghost" className="w-full justify-start">
              <Search size={20} />
              Browse Auctions
            </Button>
          </Link>
          <Link href="/sell">
            <Button variant="ghost" className="w-full justify-start">
              <Plus size={20} />
              List New Item
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" className="w-full justify-start">
              <TrendingUp size={20} />
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
