import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Plus, Pencil, Trash2, Calendar, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { API_URL } from '../context/AuthContext';
import axios from 'axios';

interface Product {
  _id: string;
  productName: string;
  category: 'furniture' | 'appliances';
  subCategory: string;
  rentPerMonth: number;
  securityDeposit: number;
  quantity: number;
  availableQuantity: number;
  images: string[];
  description: string;
}

interface RentalOrder {
  _id: string;
  rentalPlan: number;
  rentPerMonth: number;
  quantity: number;
  deliveryDate: string;
  deliveryAddress: string;
  deliveryTimeSlot?: string;
  status: string;
  userId: {
    name: string;
    email: string;
    phone: string;
  };
  productId: {
    productName: string;
    subCategory: string;
  };
}

interface RepairTicket {
  _id: string;
  issueCategory: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  resolutionNotes?: string;
  scheduledDate?: string;
  rentalId: {
    _id: string;
    productId?: {
      productName: string;
    };
  };
  userId: {
    name: string;
    phone: string;
  };
}

export const VendorDashboard: React.FC = () => {
  const { user, api } = useAuth();

  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'orders' | 'repairs'>('stats');
  
  // Dashboard stats state
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Inventory list and Form states
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form values
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState<'furniture' | 'appliances'>('furniture');
  const [pSubCategory, setPSubCategory] = useState('');
  const [pRent, setPRent] = useState('');
  const [pDeposit, setPDeposit] = useState('');
  const [pQty, setPQty] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImg, setPImg] = useState('');

  // Active Orders list
  const [orders, setOrders] = useState<RentalOrder[]>([]);

  // Repairs list & update forms
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState<'Pending' | 'In Progress' | 'Resolved'>('In Progress');
  const [ticketNotes, setTicketNotes] = useState('');
  const [ticketDate, setTicketDate] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, productsRes, ordersRes, repairsRes] = await Promise.all([
          api.get('/reports/stats'),
          api.get(`/products?vendorId=${user?.id}`), // Filtered automatically by service layer if vendor
          api.get('/rentals/my-rentals'),
          api.get('/maintenance/my-requests')
        ]);
        
        setStats(statsRes.data);
        // Only include products belonging to this vendor
        const vId = user?.id;
        const vendorProds = productsRes.data.filter((p: any) => {
          const vStr = typeof p.vendorId === 'object' ? (p.vendorId._id || p.vendorId.id) : p.vendorId;
          return vStr.toString() === vId;
        });
        setProducts(vendorProds);
        setOrders(ordersRes.data);
        setTickets(repairsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, refreshTrigger]);

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        productName: pName,
        category: pCategory,
        subCategory: pSubCategory,
        rentPerMonth: Number(pRent),
        securityDeposit: Number(pDeposit),
        quantity: Number(pQty),
        description: pDesc,
        images: pImg ? [pImg] : undefined
      };

      if (editingProduct) {
        // Edit existing
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.data : p));
      } else {
        // Create new
        const res = await api.post('/products', payload);
        setProducts(prev => [...prev, res.data]);
      }

      // Reset forms
      resetProductForm();
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to save product.');
    }
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setPName(p.productName);
    setPCategory(p.category);
    setPSubCategory(p.subCategory);
    setPRent(p.rentPerMonth.toString());
    setPDeposit(p.securityDeposit.toString());
    setPQty(p.quantity.toString());
    setPDesc(p.description);
    setPImg(p.images[0] || '');
    setShowAddForm(true);
  };

  const handleDeleteProduct = async (pId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${pId}`);
      setProducts(prev => prev.filter(p => p._id !== pId));
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setPName('');
    setPCategory('furniture');
    setPSubCategory('');
    setPRent('');
    setPDeposit('');
    setPQty('');
    setPDesc('');
    setPImg('');
    setShowAddForm(false);
  };

  const handleUpdateOrderStatus = async (oId: string, nextStatus: string) => {
    try {
      const res = await api.put(`/rentals/${oId}/status`, { status: nextStatus });
      setOrders(prev => prev.map(o => o._id === oId ? { ...o, status: res.data.status } : o));
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleUpdateRepairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId) return;

    try {
      const res = await api.put(`/maintenance/${selectedTicketId}/status`, {
        status: ticketStatus,
        resolutionNotes: ticketNotes,
        scheduledDate: ticketDate || undefined
      });

      setTickets(prev => prev.map(t => t._id === selectedTicketId ? { ...t, status: res.data.status, resolutionNotes: res.data.resolutionNotes, scheduledDate: res.data.scheduledDate } : t));
      setSelectedTicketId(null);
      setTicketNotes('');
      setTicketDate('');
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to update maintenance request.');
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
        <p className="text-sm text-on-surface-variant">Loading dashboard stats...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-6 md:px-12 max-w-container-max mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl md:text-4xl text-on-surface flex items-center gap-2">
            <LayoutDashboard className="text-primary" /> Vendor Console
          </h1>
          <p className="text-sm text-on-surface-variant">
            Partner Business: <span className="font-semibold text-on-surface">{user?.businessName || 'Japandi Living'}</span>
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-surface-container border border-outline-variant/35 p-1 rounded-xl text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'stats' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'inventory' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Deliveries
          </button>
          <button
            onClick={() => setActiveTab('repairs')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'repairs' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Repairs
          </button>
        </div>
      </div>

      {/* TABS INNER CONTENT */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8">
          {/* Key Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 text-center space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Total Listed Models</p>
              <p className="text-4xl font-serif text-primary font-bold">{stats.totalProductsCount}</p>
            </div>
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 text-center space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Occupancy Utilization</p>
              <p className="text-4xl font-serif text-primary font-bold">{stats.utilizationRate}%</p>
            </div>
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 text-center space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Active Contracts</p>
              <p className="text-4xl font-serif text-primary font-bold">{stats.activeRentalsCount}</p>
            </div>
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 text-center space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Monthly Recurring Revenue</p>
              <p className="text-4xl font-serif text-primary font-bold">${stats.mrr}/mo</p>
            </div>
          </div>

          {/* Quick Actions / CSV Exports */}
          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-4">
            <h3 className="font-serif text-xl text-on-surface font-semibold border-b border-outline-variant/20 pb-3">
              Export Administrative CSV Reports
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleDownloadCSV('products')}
                className="py-3 px-6 bg-surface-container border border-outline-variant/40 hover:bg-primary/5 hover:border-primary hover:text-primary rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <FileText size={16} /> Products Catalog List
              </button>
              <button
                onClick={() => handleDownloadCSV('rentals')}
                className="py-3 px-6 bg-surface-container border border-outline-variant/40 hover:bg-primary/5 hover:border-primary hover:text-primary rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <FileText size={16} /> Orders & Leases Sheets
              </button>
              <button
                onClick={() => handleDownloadCSV('maintenance')}
                className="py-3 px-6 bg-surface-container border border-outline-variant/40 hover:bg-primary/5 hover:border-primary hover:text-primary rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <FileText size={16} /> Repair Tickets Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
            <h2 className="font-serif text-2xl text-on-surface">Manage Products Catalog</h2>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="py-2.5 px-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus size={16} /> Add New Model
              </button>
            )}
          </div>

          {/* Create/Edit Product Form */}
          {showAddForm && (
            <form onSubmit={handleAddProductSubmit} className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-6">
              <h3 className="font-serif text-lg text-on-surface font-semibold border-b border-outline-variant/20 pb-2">
                {editingProduct ? `Edit Model Details: ${editingProduct.productName}` : 'Add New Rental Model'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="e.g. Sora Solid Wood Dining Chair"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Main Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as any)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface-variant focus:outline-none transition-colors"
                  >
                    <option value="furniture">Furniture</option>
                    <option value="appliances">Appliances</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Sub-Category</label>
                  <input
                    type="text"
                    required
                    value={pSubCategory}
                    onChange={(e) => setPSubCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="e.g. Chair, Sofa, Bed, Refrigerator"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Rent Per Month ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pRent}
                    onChange={(e) => setPRent(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="e.g. 25"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Security Deposit ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pDeposit}
                    onChange={(e) => setPDeposit(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="e.g. 100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Quantity Pool</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pQty}
                    onChange={(e) => setPQty(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Model Image Link</label>
                  <input
                    type="url"
                    value={pImg}
                    onChange={(e) => setPImg(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Model Description</label>
                  <textarea
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="Crafted from..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="py-3 px-6 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-semibold rounded-lg text-sm shadow-sm transition-colors"
                >
                  Save Model
                </button>
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="py-3 px-6 border border-outline-variant hover:bg-surface-container-low text-secondary font-semibold rounded-lg text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Product List Table */}
          <div className="bg-surface rounded-2xl border border-outline-variant/35 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-4 font-bold">Image</th>
                    <th className="px-6 py-4 font-bold">Product Title</th>
                    <th className="px-6 py-4 font-bold">Category</th>
                    <th className="px-6 py-4 font-bold text-center">Rents</th>
                    <th className="px-6 py-4 text-center font-bold">Stock Pool</th>
                    <th className="px-6 py-4 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant italic">
                        No product listings found. Add your first product.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-6 py-4">
                          <img
                            src={p.images[0]}
                            alt={p.productName}
                            className="w-12 h-12 rounded-lg object-cover border border-outline-variant/30 bg-surface-container-low"
                          />
                        </td>
                        <td className="px-6 py-4 font-serif font-bold text-on-surface">{p.productName}</td>
                        <td className="px-6 py-4 capitalize text-on-surface-variant">{p.category} ({p.subCategory})</td>
                        <td className="px-6 py-4 text-center font-semibold text-primary">${p.rentPerMonth}/mo</td>
                        <td className="px-6 py-4 text-center font-semibold text-on-surface">
                          {p.availableQuantity} / {p.quantity} left
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 text-outline hover:text-primary rounded-lg hover:bg-surface-container-low transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="p-1.5 text-outline hover:text-error rounded-lg hover:bg-surface-container-low transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-on-surface border-b border-outline-variant/20 pb-4">
            Rental Leases & Deliveries
          </h2>

          <div className="bg-surface rounded-2xl border border-outline-variant/35 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-4 font-bold">Client / Contact</th>
                    <th className="px-6 py-4 font-bold">Product Item</th>
                    <th className="px-6 py-4 font-bold">Delivery Date / Slot</th>
                    <th className="px-6 py-4 font-bold text-center">Status Badge</th>
                    <th className="px-6 py-4 text-center font-bold">Action controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant italic">
                        No customer orders or lease requests logged.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o._id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-on-surface">{o.userId?.name || 'Customer'}</p>
                          <p className="text-xs text-on-surface-variant">{o.userId?.email || 'N/A'}</p>
                          <p className="text-xs text-on-surface-variant font-medium">{o.userId?.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-serif font-semibold text-on-surface">{o.productId?.productName || 'Deleted Item'}</p>
                          <p className="text-xs text-on-surface-variant">Qty: {o.quantity} • Plan: {o.rentalPlan}m</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-on-surface">
                            {new Date(o.deliveryDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-on-surface-variant">{o.deliveryTimeSlot || 'Standard Slot'}</p>
                          <p className="text-[10px] text-outline line-clamp-1 max-w-xs">{o.deliveryAddress}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-full ${
                            o.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            o.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            o.status === 'Active' || o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            o.status === 'Pickup Scheduled' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            o.status === 'Completed' ? 'bg-zinc-100 text-zinc-800 border-zinc-200' :
                            'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className="bg-surface py-1.5 px-2 rounded-lg text-xs border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Active">Active</option>
                            <option value="Pickup Scheduled">Pickup Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
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

      {activeTab === 'repairs' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-on-surface border-b border-outline-variant/20 pb-4">
            Maintenance Tickets & Repair Logs
          </h2>

          {selectedTicketId && (
            <form onSubmit={handleUpdateRepairSubmit} className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-4">
              <h3 className="font-serif text-lg text-on-surface font-semibold border-b border-outline-variant/20 pb-2">
                Update Ticket Resolution Notes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Claim Status</label>
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Scheduled Service Date</label>
                  <input
                    type="date"
                    value={ticketDate}
                    onChange={(e) => setTicketDate(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Resolution notes</label>
                  <textarea
                    required
                    value={ticketNotes}
                    onChange={(e) => setTicketNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="Enter technician report, resolution steps, or damage details"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-xs font-semibold transition-colors"
                >
                  Save Updates
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className="py-2.5 px-5 border border-outline-variant hover:bg-surface-container-low text-secondary rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="bg-surface rounded-2xl border border-outline-variant/35 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-4 font-bold">Client Contact</th>
                    <th className="px-6 py-4 font-bold">Related Model</th>
                    <th className="px-6 py-4 font-bold">Repair Category / Details</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    <th className="px-6 py-4 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant italic">
                        No active maintenance claims logged.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr key={t._id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-on-surface">{t.userId?.name || 'Customer'}</p>
                          <p className="text-xs text-on-surface-variant">{t.userId?.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 font-serif font-semibold text-on-surface">
                          {t.rentalId?.productId?.productName || 'Rented Unit'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-primary">{t.issueCategory}</p>
                          <p className="text-xs text-on-surface-variant line-clamp-2 max-w-xs">{t.description}</p>
                          {t.scheduledDate && (
                            <p className="text-[10px] text-primary font-bold mt-1">
                              📅 Scheduled: {new Date(t.scheduledDate).toLocaleDateString()}
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
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedTicketId(t._id);
                              setTicketStatus(t.status);
                              setTicketNotes(t.resolutionNotes || '');
                              setTicketDate(t.scheduledDate ? t.scheduledDate.substring(0, 10) : '');
                            }}
                            className="py-1.5 px-3 bg-surface-container border border-outline-variant/40 hover:bg-primary/5 hover:border-primary hover:text-primary rounded-lg text-xs font-semibold transition-colors"
                          >
                            Update
                          </button>
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
    </div>
  );
};
