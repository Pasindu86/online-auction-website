'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Gavel, Search, Home, Hammer, LayoutDashboard, PlusCircle, Package, ChevronDown, LogOut } from 'lucide-react';
import { logoutUser } from '../../lib/api';
import Button from './Button';
import NotificationDropdown from './NotificationDropdown';

// LogoImage: attempts to load an image from the public folder (/bid-logo.png).
// If the image fails to load, renders a simple fallback badge with the text "BID".
const LogoImage = () => {
  const [errored, setErrored] = useState(false);
  return (
    <div className="flex items-center">
      {/* Single logo3 with layered 3D-like background */}
      <div className="relative h-24 w-24" style={{ transform: 'scale(0.98)', transformOrigin: 'center' }}>
        <div className="relative h-full w-full rounded-xl overflow-hidden">
          {!errored ? (
            <Image
              src="/logo3.png"
              alt="BID logo"
              fill
              priority
              sizes="96px"
              className="object-cover"
              onError={() => setErrored(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-white/30 bg-white/20 text-sm font-bold text-white shadow-lg backdrop-blur-md">
              BID
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

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

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const NavLink = ({ href, icon: Icon, children, onClick }) => {
    const active = isActive(href);
    return (
      <Link 
        href={href} 
        onClick={onClick} 
        className={`flex items-center gap-2 font-medium transition-all duration-200 ${
          active 
            ? 'text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]' 
            : 'text-white hover:text-blue-200'
        }`}
      >
        {Icon && <Icon size={18} className={active ? 'stroke-[2.5]' : ''} />}
        {children}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/70 via-slate-800/60 to-slate-900/70 backdrop-blur-md backdrop-saturate-150 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
              <LogoImage />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-12">
            <NavLink href="/" icon={Home}>Home</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/main/auctions" icon={Hammer}>Auctions</NavLink>
            {user && <NavLink href="/my-auctions" icon={LayoutDashboard}>My Listings</NavLink>}
            {user && <NavLink href="/create-auction" icon={PlusCircle}>Sell Item</NavLink>}
            {user?.role === 'admin' && <NavLink href="/admin/dashboard" icon={Package}>Admin</NavLink>}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user && <NotificationDropdown userId={user.id} />}
            {user ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 text-white hover:text-white/80 font-medium transition-colors">
                  <span className="text-sm">Welcome, {user.username || user.name || user.email}</span>
                  <ChevronDown size={16} />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 py-2">
                    <button onClick={() => { handleLogout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-slate-700 hover:bg-gray-100/70 hover:text-blue-600 flex items-center gap-2 rounded-xl mx-1">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="small" onClick={() => router.push('/login')} className="text-white hover:text-white/80 border-white/30 hover:border-white/50 hover:bg-white/10">Sign In</Button>
                <Button variant="primary" size="small" onClick={() => router.push('/register')} className="!bg-blue-600 hover:!bg-blue-700 !text-white shadow-lg rounded-full px-6 font-bold">Register</Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full text-white hover:text-white/80 hover:bg-white/10 transition-colors" suppressHydrationWarning>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-slate-900/80 backdrop-blur-md backdrop-saturate-150 rounded-b-2xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  isActive('/') 
                    ? 'text-blue-300 bg-blue-500/20 border border-blue-400/30' 
                    : 'text-white hover:text-white/80 hover:bg-white/10'
                }`}
              >
                <Home size={18} className={isActive('/') ? 'stroke-[2.5]' : ''} />Home
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsMenuOpen(false)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  isActive('/about') 
                    ? 'text-blue-300 bg-blue-500/20 border border-blue-400/30' 
                    : 'text-white hover:text-white/80 hover:bg-white/10'
                }`}
              >
                About
              </Link>
              <Link 
                href="/main/auctions" 
                onClick={() => setIsMenuOpen(false)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  isActive('/main/auctions') 
                    ? 'text-blue-300 bg-blue-500/20 border border-blue-400/30' 
                    : 'text-white hover:text-white/80 hover:bg-white/10'
                }`}
              >
                <Hammer size={18} className={isActive('/main/auctions') ? 'stroke-[2.5]' : ''} />Auctions
              </Link>
              {user && (
                <>
                  <Link 
                    href="/my-auctions" 
                    onClick={() => setIsMenuOpen(false)} 
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      isActive('/my-auctions') 
                        ? 'text-blue-300 bg-blue-500/20 border border-blue-400/30' 
                        : 'text-white hover:text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <LayoutDashboard size={18} className={isActive('/my-auctions') ? 'stroke-[2.5]' : ''} />My Listings
                  </Link>
                  <Link 
                    href="/create-auction" 
                    onClick={() => setIsMenuOpen(false)} 
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      isActive('/create-auction') 
                        ? 'text-blue-300 bg-blue-500/20 border border-blue-400/30' 
                        : 'text-white hover:text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <PlusCircle size={18} className={isActive('/create-auction') ? 'stroke-[2.5]' : ''} />Sell Item
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link 
                  href="/admin/dashboard" 
                  onClick={() => setIsMenuOpen(false)} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    isActive('/admin/dashboard') 
                      ? 'text-blue-300 bg-blue-500/20 border border-blue-400/30' 
                      : 'text-white hover:text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Package size={18} className={isActive('/admin/dashboard') ? 'stroke-[2.5]' : ''} />Admin
                </Link>
              )}
              <div className="border-t border-white/20 pt-4 mt-4 space-y-3">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">Welcome, {user.username || user.name || user.email}</div>
                    <Button variant="ghost" size="small" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full justify-center text-white hover:text-white/80 border-white/30 hover:border-white/50 hover:bg-white/10">
                      <LogOut size={16} />Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="small" onClick={() => { router.push('/login'); setIsMenuOpen(false); }} className="w-full justify-center text-white hover:text-white/80 border-white/30 hover:border-white/50 hover:bg-white/10">Sign In</Button>
                    <Button variant="primary" size="small" onClick={() => { router.push('/register'); setIsMenuOpen(false); }} className="w-full justify-center !bg-blue-600 hover:!bg-blue-700 !text-white rounded-full font-bold">Register</Button>
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
