'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Gavel,
  BarChart2,
  RefreshCw,
  AlertTriangle,
  Trash2,
  XCircle,
  UserMinus,
  TrendingUp,
  DollarSign,
  Activity,
  Award,
  Crown,
  FileText
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import {
  getCurrentUser,
  getAdminDashboard,
  getAdminAuctions,
  getAdminUsers,
  closeAuctionAsAdmin,
  deleteAuctionAsAdmin,
  updateUserRole,
  deleteUserAsAdmin
} from '../../../lib/api';

const AdminDashboardPage = () => {
  const router = useRouter();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [summary, setSummary] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('auctions'); // auctions, users, reports

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardData, auctionsData, usersData] = await Promise.all([
        getAdminDashboard(),
        getAdminAuctions(),
        getAdminUsers()
      ]);
      setSummary(dashboardData);
      
      // Sort auctions: Active auctions first, then closed auctions
      const sortedAuctions = auctionsData.sort((a, b) => {
        // If one is closed and the other isn't, put the active one first
        if (a.isClosed !== b.isClosed) {
          return a.isClosed ? 1 : -1;
        }
        // If both have the same status, sort by end time (newest first for active, newest first for closed)
        return new Date(b.endTime) - new Date(a.endTime);
      });
      
      setAuctions(sortedAuctions);
      setUsers(usersData);
      setError('');
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err?.response?.data || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const current = getCurrentUser();

    if (!current) {
      router.replace('/login');
      return;
    }

    if (current.role !== 'admin') {
      router.replace('/');
      return;
    }

    setCurrentAdmin(current);
    loadDashboard();
  }, [router, loadDashboard]);

  const formatCurrency = (value) => {
    return `Rs. ${Number(value || 0).toFixed(2)}`;
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    // Ensure we're working with UTC time from the backend
    const date = new Date(value + (value.endsWith('Z') ? '' : 'Z'));
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCloseAuction = async (auctionId) => {
    try {
      setError('');
      await closeAuctionAsAdmin(auctionId);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to close auction:', err);
      setError(err?.response?.data || 'Failed to end auction.');
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('Delete this auction? This cannot be undone.')) return;
    try {
      setError('');
      await deleteAuctionAsAdmin(auctionId);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to delete auction:', err);
      setError(err?.response?.data || 'Failed to delete auction.');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      setError('');
      await updateUserRole(userId, role);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to update role:', err);
      setError(err?.response?.data || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (currentAdmin && currentAdmin.id === userId) {
      setError('You cannot delete your own account.');
      return;
    }

    if (!window.confirm('Delete this user account?')) return;

    try {
      setError('');
      await deleteUserAsAdmin(userId);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err?.response?.data || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = summary
    ? [
        {
          label: 'Total Users',
          value: summary.totals?.users ?? 0,
          icon: <Users className="text-white" size={28} />,
          gradient: 'from-blue-500 to-blue-600'
        },
        {
          label: 'Active Auctions',
          value: summary.totals?.activeAuctions ?? 0,
          icon: <Gavel className="text-white" size={28} />,
          gradient: 'from-indigo-500 to-indigo-600'
        },
        {
          label: 'Total Bids',
          value: summary.totals?.bids ?? 0,
          icon: <Activity className="text-white" size={28} />,
          gradient: 'from-purple-500 to-purple-600'
        },
        {
          label: 'Total Revenue',
          value: formatCurrency(summary.totals?.revenue ?? 0),
          icon: <DollarSign className="text-white" size={28} />,
          gradient: 'from-emerald-500 to-emerald-600'
        }
      ]
    : [];

  const tabs = [
    { id: 'auctions', label: 'Manage Auctions', icon: <Gavel size={20} /> },
    { id: 'users', label: 'Manage Users', icon: <Users size={20} /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart2 size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-500 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Crown className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-white">Admin Dashboard</h1>
                  <p className="text-white/80 text-sm">Welcome back, {currentAdmin?.username || 'Admin'}</p>
                </div>
              </div>
              <p className="text-white/70 text-base">Manage auctions, users, and platform insights in one place.</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                size="small" 
                onClick={() => router.push('/')}
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl"
              >
                <XCircle size={18} />
                Exit
              </Button>
              <Button 
                variant="primary" 
                size="small" 
                onClick={loadDashboard}
                className="bg-white hover:bg-slate-100 px-4 py-2 rounded-xl font-bold shadow-lg border-2 border-white"
              >
                <RefreshCw size={18} className="text-blue-900" />
                <span className="text-blue-900">Refresh</span>
              </Button>
            </div>
          </header>

          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-white px-5 py-4 rounded-xl flex items-center gap-3 mb-6">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Metrics Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div 
                key={metric.label} 
                className={`bg-gradient-to-br ${metric.gradient} rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {metric.icon}
                  </div>
                </div>
                <p className="text-white/80 text-sm font-medium mb-1">{metric.label}</p>
                <p className="text-3xl font-extrabold text-white">{metric.value}</p>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
          <div className="flex border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 text-white'
                    : 'text-slate-600 hover:text-indigo-800 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'auctions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                    Manage Auctions
                  </h2>
                  <span className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full font-medium">
                    {auctions.length} total auctions
                  </span>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-slate-700">Auction Details</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-700">Current Price</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-700">Status</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-700">Ends At</th>
                        <th className="px-6 py-4 text-right font-bold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {auctions.map((auction) => (
                        <tr key={auction.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-900 mb-1">{auction.title}</div>
                            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                              ID: {auction.id}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                              {formatCurrency(auction.currentPrice)}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                                auction.isClosed 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {auction.isClosed ? '🔴 Closed' : '🟢 Active'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-600 text-sm">{formatDateTime(auction.endTime)}</td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2 justify-end">
                              {!auction.isClosed && (
                                <Button
                                  variant="ghost"
                                  size="small"
                                  onClick={() => handleCloseAuction(auction.id)}
                                  className="text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 px-3 py-1.5 rounded-lg"
                                >
                                  <ShieldCheck size={16} />
                                  End
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="small"
                                onClick={() => handleDeleteAuction(auction.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                              >
                                <Trash2 size={16} />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {auctions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <Gavel className="mx-auto text-slate-300 mb-3" size={48} />
                            <p className="text-slate-500 text-base">No auctions available.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                    Manage Users
                  </h2>
                  <span className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full font-medium">
                    {users.length} registered users
                  </span>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-slate-700">User Details</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-700">Email Address</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-700">Role</th>
                        <th className="px-6 py-4 text-right font-bold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{user.username}</div>
                                <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block mt-1">
                                  ID: {user.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-slate-700">{user.email}</td>
                          <td className="px-6 py-5">
                            <select
                              value={user.role || 'user'}
                              onChange={(event) => handleRoleChange(user.id, event.target.value)}
                              className="border-2 border-slate-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-400 transition-colors"
                            >
                              <option value="user">👤 User</option>
                              <option value="admin">👑 Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                            >
                              <UserMinus size={16} />
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <Users className="mx-auto text-slate-300 mb-3" size={48} />
                            <p className="text-slate-500 text-base">No users found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent mb-2">
                    Reports & Analytics
                  </h2>
                  <p className="text-slate-600">Insights and statistics about your platform performance.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Report */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <TrendingUp className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Revenue Trends</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Last 7 days performance</p>
                    <div className="space-y-3">
                      {summary?.revenueByDay?.length ? (
                        summary.revenueByDay.map((entry) => (
                          <div key={entry.date} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                            <span className="text-sm font-medium text-slate-700">
                              {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-sm font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                              {formatCurrency(entry.total)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="mx-auto text-slate-300 mb-2" size={40} />
                          <p className="text-sm text-slate-500">No revenue data available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Bidders */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Award className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Top Bidders</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Most active users</p>
                    <div className="space-y-3">
                      {summary?.topBidders?.length ? (
                        summary.topBidders.map((bidder, index) => (
                          <div key={bidder.userId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                                #{index + 1}
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                {bidder.username || `User #${bidder.userId}`}
                              </span>
                            </div>
                            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {bidder.bidCount} bids
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Users className="mx-auto text-slate-300 mb-2" size={40} />
                          <p className="text-sm text-slate-500">No bidding activity yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Auctions */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Gavel className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Latest Auctions</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Recently created</p>
                    <div className="space-y-3">
                      {summary?.recentAuctions?.length ? (
                        summary.recentAuctions.map((auction) => (
                          <div key={auction.id} className="p-3 bg-white rounded-lg border border-emerald-100">
                            <div className="font-bold text-slate-900 text-sm mb-1">{auction.title}</div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Ends {formatDateTime(auction.endTime)}</span>
                              <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {formatCurrency(auction.currentPrice)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Gavel className="mx-auto text-slate-300 mb-2" size={40} />
                          <p className="text-sm text-slate-500">No recent auctions</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
