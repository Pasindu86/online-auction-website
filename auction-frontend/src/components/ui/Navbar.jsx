'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Gavel, Search, Home, Hammer, LayoutDashboard, PlusCircle, Package, ChevronDown, LogOut } from 'lucide-react';
import { logoutUser } from '../../lib/api';
import Button from './Button';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        if (userId && userEmail) {
          setUser({
            id: userId,
            email: userEmail,
            name: localStorage.getItem('userName'),
            role: localStorage.getItem('userRole') || 'user'
          });
        }
      }
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push('/');
  };

  const NavLink = ({ href, icon: Icon, children, onClick }) => (
    <Link href={href} onClick={onClick} className="flex items-center gap-2 text-gray-700 hover:text-red-800 font-medium transition-colors">
      {Icon && <Icon size={18} />}
      {children}
    </Link>
  );

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
          <div className="hidden md:flex items-center space-x-8 ml-12">
            <NavLink href="/" icon={Home}>Home</NavLink>
            <NavLink href="/main/auctions" icon={Hammer}>Live Auctions</NavLink>
            {user && <NavLink href="/my-auctions" icon={LayoutDashboard}>My Listings</NavLink>}
            {user && <NavLink href="/create-auction" icon={PlusCircle}>Sell Item</NavLink>}
            {user?.role === 'admin' && <NavLink href="/admin/dashboard" icon={Package}>Admin</NavLink>}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input type="text" placeholder="Search auctions..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" suppressHydrationWarning />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user && <NotificationDropdown userId={user.id} />}
            {user ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 text-gray-700 hover:text-red-800 font-medium transition-colors">
                  <span className="text-sm">Welcome, {user.username || user.name || user.email}</span>
                  <ChevronDown size={16} />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button onClick={() => { handleLogout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-800 flex items-center gap-2">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="small" onClick={() => router.push('/login')} className="text-gray-700 hover:text-red-800">Sign In</Button>
                <Button variant="primary" size="small" onClick={() => router.push('/register')}>Get Started</Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-red-800 hover:bg-gray-100 transition-colors" suppressHydrationWarning>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="relative mb-4">
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" suppressHydrationWarning />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md">
                <Home size={18} />Home
              </Link>
              <Link href="/main/auctions" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md">
                <Hammer size={18} />Live Auctions
              </Link>
              {user && (
                <>
                  <Link href="/my-auctions" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md">
                    <LayoutDashboard size={18} />My Listings
                  </Link>
                  <Link href="/create-auction" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md">
                    <PlusCircle size={18} />Sell Item
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-800 hover:bg-gray-50 rounded-md">
                  <Package size={18} />Admin
                </Link>
              )}
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md">Welcome, {user.username || user.name || user.email}</div>
                    <Button variant="ghost" size="small" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full justify-center text-gray-700 hover:text-red-800">
                      <LogOut size={16} />Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="small" onClick={() => { router.push('/login'); setIsMenuOpen(false); }} className="w-full justify-center text-gray-700 hover:text-red-800">Sign In</Button>
                    <Button variant="primary" size="small" onClick={() => { router.push('/register'); setIsMenuOpen(false); }} className="w-full justify-center">Get Started</Button>
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
