'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Gavel, Search, User, Bell, LogOut } from 'lucide-react';
import { logoutUser } from '../../lib/api';
import Button from './Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check for logged in user
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Fallback to individual keys for backward compatibility
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        
        if (userId && userEmail) {
          setUser({
            id: userId,
            email: userEmail,
            name: userName
          });
        }
      }
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Use centralized logout function
    logoutUser();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-800 rounded-xl flex items-center justify-center">
              <Gavel className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900">AuctionHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/main/auctions" className="text-gray-700 hover:text-red-800 font-medium transition-colors">
              Auctions
            </Link>
            {user && (
              <Link href="/create-auction" className="text-gray-700 hover:text-red-800 font-medium transition-colors">
                Create Auction
              </Link>
            )}
            {user && (
              <Link href="/my-auctions" className="text-gray-700 hover:text-red-800 font-medium transition-colors">
                My Auctions
              </Link>
            )}
            <Link href="/categories" className="text-gray-700 hover:text-red-800 font-medium transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-red-800 font-medium transition-colors">
              About
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search auctions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-red-800 transition-colors">
              <Bell size={20} />
            </button>
            
            {user ? (
              // Logged in user menu
              <>
                <button className="p-2 text-gray-600 hover:text-red-800 transition-colors">
                  <User size={20} />
                </button>
                <span className="text-sm text-gray-700">Welcome, {user.name || user.email}</span>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-800"
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </>
            ) : (
              // Guest user menu
              <>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => router.push('/login')}
                  className="text-gray-700 hover:text-red-800"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => router.push('/register')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-red-800 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search auctions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>

              {/* Mobile Menu Items */}
              <Link 
                href="/main/auctions" 
                className="block px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Auctions
              </Link>
              {user && (
                <Link 
                  href="/create-auction" 
                  className="block px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Auction
                </Link>
              )}
              {user && (
                <Link 
                  href="/my-auctions" 
                  className="block px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Auctions
                </Link>
              )}
              <Link 
                href="/categories" 
                className="block px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              {/* Mobile Actions */}
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                {user ? (
                  // Logged in user mobile menu
                  <>
                    <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md">
                      Welcome, {user.name || user.email}
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-center text-gray-700 hover:text-red-800"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  // Guest user mobile menu
                  <>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => {
                        router.push('/login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-center text-gray-700 hover:text-red-800"
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => {
                        router.push('/register');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-center"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
