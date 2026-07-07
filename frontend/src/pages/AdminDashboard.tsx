import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, Store, ClipboardList, Info, FileSpreadsheet, KeySquare } from 'lucide-react';
import { API_URL } from '../context/AuthContext';
import axios from 'axios';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  phone?: string;
  address?: string;
  businessName?: string;
  serviceAreas?: string[];
  createdAt: string;
}

interface StatsSummary {
  totalProductsCount: number;
  totalInventoryCount: number;
  rentedInventoryCount: number;
  utilizationRate: number;
  activeRentalsCount: number;
  totalRevenue: number;
  mrr: number;
  pendingMaintenance: number;
  completedMaintenance: number;
}

export const AdminDashboard: React.FC = () => {
  const { user, api } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'repairs' | 'reports'>('users');
  const [loading, setLoading] = useState(true);

  // Stats summary state
  const [stats, setStats] = useState<StatsSummary | null>(null);

  // User list state
  const [users, setUsers] = useState<UserItem[]>([]);

  // Maintenance tickets state
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes, ticketsRes] = await Promise.all([
          api.get('/reports/stats'), // Resolves for admin (shows global system stats)
          api.get('/admin/users'),
          api.get('/maintenance/my-requests') // Admin retrieves global maintenance logs
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setTickets(ticketsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const handleChangeRole = async (userId: string, newRole: 'customer' | 'vendor' | 'admin') => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const payload: any = { role: newRole };
      if (newRole === 'vendor') {
        payload.businessName = 'Standard Business Partner';
        payload.serviceAreas = ['New York', 'Chicago'];
      }
      const res = await api.put(`/admin/users/${userId}`, payload);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: res.data.role, businessName: res.data.businessName, serviceAreas: res.data.serviceAreas } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to change user role.');
    }
  };

  const handleDownloadCSV = (type: 'rentals' | 'products' | 'maintenance') => {
    const token = localStorage.getItem('rentease_token');
    window.open(`${API_URL}/reports/export?type=${type}&authorization=Bearer ${token}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-on-surface-variant">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-6 md:px-12 max-w-container-max mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl md:text-4xl text-on-surface flex items-center gap-2">
            <KeySquare className="text-primary" /> Admin Control Room
          </h1>
          <p className="text-sm text-on-surface-variant">System oversight, account configurations, and dispute operations.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-surface-container border border-outline-variant/35 p-1 rounded-xl text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'users' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Accounts
          </button>
          <button
            onClick={() => setActiveTab('repairs')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'repairs' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Claims
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'reports' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Global Analytics Overview Banner */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30 text-center">
            <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Total System Revenue</p>
            <p className="text-2xl font-serif text-primary font-bold">${stats.totalRevenue}</p>
          </div>
          <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30 text-center">
            <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Monthly recurring rent</p>
            <p className="text-2xl font-serif text-primary font-bold">${stats.mrr}/mo</p>
          </div>
          <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30 text-center">
            <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Catalog Util. Rate</p>
            <p className="text-2xl font-serif text-primary font-bold">{stats.utilizationRate}%</p>
          </div>
          <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30 text-center">
            <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Active Leases</p>
            <p className="text-2xl font-serif text-primary font-bold">{stats.activeRentalsCount}</p>
          </div>
        </div>
      )}

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-on-surface border-b border-outline-variant/20 pb-4">
            System Accounts Directory
          </h2>

          <div className="bg-surface rounded-2xl border border-outline-variant/35 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-4 font-bold">User Information</th>
                    <th className="px-6 py-4 font-bold">Details / Business</th>
                    <th className="px-6 py-4 font-bold">Service Cities</th>
                    <th className="px-6 py-4 font-bold text-center">Role / Rank</th>
                    <th className="px-6 py-4 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-on-surface">{u.name}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-on-surface">{u.phone || 'No Phone'}</p>
                        {u.role === 'vendor' && (
                          <p className="text-[10px] bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-md inline-block mt-1 font-bold">
                            💼 {u.businessName || 'Business account'}
                          </p>
                        )}
                        {u.role === 'customer' && <p className="text-[10px] text-on-surface-variant">{u.address}</p>}
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">
                        {u.role === 'vendor' && u.serviceAreas && u.serviceAreas.length > 0 
                          ? u.serviceAreas.join(', ') 
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          u.role === 'admin' ? 'bg-primary text-on-primary border-primary' :
                          u.role === 'vendor' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-zinc-100 text-zinc-800 border-zinc-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value as any)}
                            className="bg-surface py-1.5 px-2 rounded-lg text-xs border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                          >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Claims Management */}
      {activeTab === 'repairs' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-on-surface border-b border-outline-variant/20 pb-4">
            System Maintenance Overview
          </h2>

          <div className="bg-surface rounded-2xl border border-outline-variant/35 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-4 font-bold">Client</th>
                    <th className="px-6 py-4 font-bold">Rented item</th>
                    <th className="px-6 py-4 font-bold">Ticket Category & Notes</th>
                    <th className="px-6 py-4 text-center font-bold">Status Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant italic">
                        No support tickets found on the platform.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr key={t._id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-on-surface">{t.userId?.name || 'Customer'}</p>
                          <p className="text-xs text-on-surface-variant">{t.userId?.email || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 font-serif font-semibold text-on-surface">
                          {t.rentalId?.productId?.productName || 'Rented Unit'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-primary">{t.issueCategory}</p>
                          <p className="text-xs text-on-surface-variant line-clamp-2 max-w-xs">{t.description}</p>
                          {t.resolutionNotes && (
                            <p className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg mt-1 font-semibold">
                              ✔️ Resolution: {t.resolutionNotes}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-full ${
                            t.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            t.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CSV Download Exporter */}
      {activeTab === 'reports' && (
        <div className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-6">
          <h2 className="font-serif text-2xl text-on-surface border-b border-outline-variant/20 pb-3 flex items-center gap-2">
            <FileSpreadsheet className="text-primary" /> Download Performance Sheets
          </h2>
          <p className="text-sm text-on-surface-variant max-w-lg">
            Download standard comma-separated values (CSV) reports detailing client leases, product utilization parameters, or maintenance workloads.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => handleDownloadCSV('products')}
              className="py-3 px-6 bg-surface-container border border-outline-variant/40 hover:bg-primary/5 hover:border-primary hover:text-primary rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              Export Catalog List (CSV)
            </button>
            <button
              onClick={() => handleDownloadCSV('rentals')}
              className="py-3 px-6 bg-surface-container border border-outline-variant/40 hover:bg-primary/5 hover:border-primary hover:text-primary rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              Export Order Contracts (CSV)
            </button>
            <button
              onClick={() => handleDownloadCSV('maintenance')}
              className="py-3 px-6 bg-surface-container border border-outline-variant/40 hover:bg-primary/5 hover:border-primary hover:text-primary rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              Export Support Log (CSV)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
