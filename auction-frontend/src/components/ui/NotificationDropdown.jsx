'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellDot, Trophy, X, DollarSign } from 'lucide-react';
import { getUserNotifications, getUnreadNotificationsCount } from '../../lib/api';

const NotificationDropdown = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications and unread count
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const [notifData, countData] = await Promise.all([
        getUserNotifications(userId),
        getUnreadNotificationsCount(userId)
      ]);
      
      setNotifications(notifData.notifications || []);
      setUnreadCount(countData.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch on mount and set up polling
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Listen for order creation events to immediately refresh
      const handleOrderCreated = () => {
        console.log('Order created event received, refreshing notifications...');
        fetchNotifications();
      };
      
      window.addEventListener('orderCreated', handleOrderCreated);
      
      // Poll for new notifications every 10 seconds for faster updates
      const interval = setInterval(() => {
        // Only fetch if dropdown is not open to avoid flickering
        if (!isOpen) {
          fetchNotifications();
        }
      }, 10000);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('orderCreated', handleOrderCreated);
      };
    }
  }, [userId, isOpen, fetchNotifications]);

  const handleNotificationClick = (notification) => {
    // Navigate to payment page for the won auction using the shared query-based route
    setIsOpen(false);
    router.push(`/payment?orderId=${notification.id}`);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications(); // Refresh when opening
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-white hover:text-blue-200 transition-colors rounded-full hover:bg-white/10"
        suppressHydrationWarning
      >
        {unreadCount > 0 ? (
          <>
            <BellDot size={20} className="text-blue-300" />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        ) : (
          <Bell size={20} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-blue-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-blue-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-3 text-blue-200" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1 text-gray-400">You&apos;ll be notified when you win an auction</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
                      !notification.isPaid ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.isPaid ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {notification.isPaid ? (
                          <Trophy size={20} className="text-green-600" />
                        ) : (
                          <DollarSign size={20} className="text-yellow-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          🎉 You won an auction!
                        </p>
                        <p className="text-sm text-gray-700 font-semibold truncate">
                          {notification.auctionTitle}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Final Price: <span className="font-semibold text-blue-600">
                            Rs. {notification.finalPrice.toFixed(2)}
                          </span>
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.orderDate)}
                          </span>
                          {!notification.isPaid ? (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                              Payment Pending
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                              Paid
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/my-auctions');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold w-full text-center"
              >
                View all your auctions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
