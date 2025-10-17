import Link from 'next/link';
import { ArrowRight, Shield, Zap, Users, Trophy, Star, Clock, Gavel, Search, TrendingUp } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import Button from '../components/ui/Button';

export default function HomePage() {
  const features = [
    {
      icon: <Shield className="text-blue-600" size={24} />,
      title: "Secure Bidding",
      description: "Safe and secure transactions with buyer protection"
    },
    {
      icon: <Zap className="text-blue-600" size={24} />,
      title: "Real-time Updates",
      description: "Get instant notifications on bid updates and auction status"
    },
    {
      icon: <Users className="text-blue-600" size={24} />,
      title: "Global Community",
      description: "Connect with buyers and sellers from around the world"
    },
    {
      icon: <Trophy className="text-blue-600" size={24} />,
      title: "Premium Items",
      description: "Discover rare and unique items from verified sellers"
    }
  ];

  const categories = [
    { name: "Electronics", count: "1,234", image: "📱" },
    { name: "Art & Collectibles", count: "856", image: "🎨" },
    { name: "Jewelry", count: "642", image: "💎" },
    { name: "Vehicles", count: "398", image: "🚗" },
    { name: "Sports", count: "567", image: "⚽" },
    { name: "Fashion", count: "923", image: "👗" }
  ];

  const featuredAuctions = [
    {
      title: "Vintage Watch Collection",
      currentBid: "$2,450",
      timeLeft: "2h 15m",
      bids: 23,
      image: "⌚"
    },
    {
      title: "Modern Art Painting",
      currentBid: "$1,200",
      timeLeft: "1d 5h",
      bids: 12,
      image: "🖼️"
    },
    {
      title: "Antique Furniture Set",
      currentBid: "$890",
      timeLeft: "3h 42m",
      bids: 8,
      image: "🪑"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Amazing
              <span className="block text-blue-300">Auction Deals</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto">
              Join thousands of buyers and sellers in the world's most trusted online auction platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="secondary"
                size="large"
                className="bg-white text-slate-900 hover:bg-slate-100 border-white"
              >
                <Search size={20} />
                Browse Auctions
              </Button>
              <Button
                variant="ghost"
                size="large"
                className="text-white border-white hover:bg-slate-800/50 backdrop-blur-sm"
              >
                Start Selling
                <ArrowRight size={20} />
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-blue-300">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-blue-300">Live Auctions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">$2M+</div>
              <div className="text-blue-300">Items Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">99%</div>
              <div className="text-blue-300">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose AuctionHub?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Experience the future of online auctions with our cutting-edge platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl hover:shadow-xl transition-shadow border border-slate-100">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Auction Journey?
          </h2>
          <p className="text-xl text-slate-200 mb-8">
            Join thousands of satisfied users who trust AuctionHub for their buying and selling needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="large"
              className="bg-white text-slate-900 hover:bg-slate-100 border-white"
            >
              <Gavel size={20} />
              Start Bidding
            </Button>
            <Button
              variant="ghost"
              size="large"
              className="text-white border-white hover:bg-slate-800/50 backdrop-blur-sm"
            >
              <TrendingUp size={20} />
              Sell Your Items
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
