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
  UserMinus
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

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardData, auctionsData, usersData] = await Promise.all([
        getAdminDashboard(),
        getAdminAuctions(),
        getAdminUsers()
      ]);
      setSummary(dashboardData);
      setAuctions(auctionsData);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-red-800 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = summary
    ? [
        {
          label: 'Total Users',
          value: summary.totals?.users ?? 0,
          icon: <Users className="text-red-800" size={24} />
        },
        {
          label: 'Active Auctions',
          value: summary.totals?.activeAuctions ?? 0,
          icon: <Gavel className="text-red-800" size={24} />
        },
        {
          label: 'Total Bids',
          value: summary.totals?.bids ?? 0,
          icon: <ShieldCheck className="text-red-800" size={24} />
        },
        {
          label: 'Total Revenue',
          value: formatCurrency(summary.totals?.revenue ?? 0),
          icon: <BarChart2 className="text-red-800" size={24} />
        }
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage auctions, users, and platform insights in one place.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="small" onClick={() => router.push('/')}
              className="text-gray-700 hover:text-red-800">
              <XCircle size={16} />
              Exit
            </Button>
            <Button variant="primary" size="small" onClick={loadDashboard}>
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                {metric.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="text-xl font-semibold text-gray-900">{metric.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Manage Auctions */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Manage Auctions</h2>
            <span className="text-sm text-gray-500">{auctions.length} auctions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Auction</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Current Price</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Ends</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {auctions.map((auction) => (
                  <tr key={auction.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{auction.title}</div>
                      <div className="text-xs text-gray-500">Auction #{auction.id}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{formatCurrency(auction.currentPrice)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          auction.isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {auction.isClosed ? 'Closed' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDateTime(auction.endTime)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        {!auction.isClosed && (
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleCloseAuction(auction.id)}
                            className="text-gray-700 hover:text-red-800"
                          >
                            <ShieldCheck size={16} />
                            End
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleDeleteAuction(auction.id)}
                          className="text-red-600 hover:text-red-700"
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
                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                      No auctions available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Manage Users */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Manage Users</h2>
            <span className="text-sm text-gray-500">{users.length} accounts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">User</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{user.username}</div>
                      <div className="text-xs text-gray-500">User #{user.id}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role || 'user'}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus size={16} />
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Analysis & Reports */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue (Last 7 Days)</h3>
            <div className="space-y-3">
              {summary?.revenueByDay?.length ? (
                summary.revenueByDay.map((entry) => (
                  <div key={entry.date} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(entry.total)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No revenue recorded in the last week.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Bidders</h3>
            <div className="space-y-3">
              {summary?.topBidders?.length ? (
                summary.topBidders.map((bidder) => (
                  <div key={bidder.userId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{bidder.username || `User #${bidder.userId}`}</span>
                    <span className="font-medium text-gray-900">{bidder.bidCount} bids</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No bidding activity yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Auctions</h3>
            <div className="space-y-3">
              {summary?.recentAuctions?.length ? (
                summary.recentAuctions.map((auction) => (
                  <div key={auction.id} className="text-sm">
                    <div className="font-semibold text-gray-900">{auction.title}</div>
                    <div className="text-gray-500">
                      Ends {formatDateTime(auction.endTime)} · {formatCurrency(auction.currentPrice)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent auctions.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
