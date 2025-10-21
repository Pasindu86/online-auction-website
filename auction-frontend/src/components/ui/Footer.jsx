import Link from 'next/link';
import Image from 'next/image';
import { Gavel, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-36" style={{ transform: 'scale(1.05)', transformOrigin: 'left center' }}>
                <Image src="/logo3.png" alt="nexBID" fill className="object-contain" priority />
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your premier destination for online auctions. Discover unique items, 
              bid with confidence, and find treasures from around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auctions" className="text-slate-400 hover:text-blue-300 transition-colors">
                  Browse Auctions
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-slate-400 hover:text-blue-300 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-slate-400 hover:text-blue-300 transition-colors">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="text-slate-400 hover:text-blue-300 transition-colors">
                  My Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-slate-400 hover:text-blue-300 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-blue-300 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-blue-300 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-blue-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-blue-400" />
                <span className="text-slate-400 text-sm">support@nexbid.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-blue-400" />
                <span className="text-slate-400 text-sm">076-4304391</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-blue-400 mt-1" />
                <span className="text-slate-400 text-sm">
                  123 New Street<br />
                  Colombo 3, Sri Lanka
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2 text-blue-300">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Subscribe to get notified about new auctions and exclusive deals
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                suppressHydrationWarning
              />
              <button
                suppressHydrationWarning
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all font-medium shadow-lg shadow-blue-600/30"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2024 nexBID. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-slate-400 hover:text-blue-300 text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-blue-300 text-sm transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-slate-400 hover:text-blue-300 text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
