import React, { useState } from 'react';
import { Shop, ShopStatus } from '../types';

interface ShopApprovalsProps {
  shops: Shop[];
  onUpdateStatus: (shopId: string, status: ShopStatus) => void;
  onUpdateTakeRate: (shopId: string, takeRate: number) => void;
  onUpdateShopDetails?: (shopId: string, details: Partial<Shop>) => void;
  onAddShop?: (shopData: Partial<Shop> & { bank_details?: string }) => void;
}

export const ShopApprovals: React.FC<ShopApprovalsProps> = ({
  shops,
  onUpdateStatus,
  onUpdateTakeRate,
  onUpdateShopDetails,
  onAddShop
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'suspended' | 'all'>('pending');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [customTakeRate, setCustomTakeRate] = useState<number>(15);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Partial<Shop>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newShopForm, setNewShopForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    suburb: 'CBD',
    city: 'Cape Town',
    category: 'Fast Food',
    take_rate: 15,
    delivery_fee: 25,
    bank_details: 'FNB - 62890192837'
  });

  const categories: string[] = Array.from(new Set(shops.map((s) => s.category)));

  const pendingShops = shops.filter((s) => s.status === 'pending' || s.status === 'review');
  const activeShops = shops.filter((s) => s.status === 'active');
  const suspendedShops = shops.filter((s) => s.status === 'suspended');

  const filteredShops = shops.filter((s) => {
    if (activeTab === 'pending' && s.status !== 'pending' && s.status !== 'review') return false;
    if (activeTab === 'active' && s.status !== 'active') return false;
    if (activeTab === 'suspended' && s.status !== 'suspended') return false;
    if (selectedCategory !== 'ALL' && s.category !== selectedCategory) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.suburb.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    }
    return true;
  });

  const handleOpenDetail = (shop: Shop) => {
    setSelectedShop(shop);
    setCustomTakeRate(shop.take_rate || 15);
    setEditFormData(shop);
    setIsEditing(false);
  };

  const handleApprove = (shopId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateStatus(shopId, 'active');
    if (selectedShop && selectedShop.id === shopId) {
      setSelectedShop({ ...selectedShop, status: 'active', is_active: true });
    }
  };

  const handleBatchApprovePending = () => {
    if (pendingShops.length === 0) return;
    pendingShops.forEach((s) => onUpdateStatus(s.id, 'active'));
  };

  const handleReject = (shopId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateStatus(shopId, 'suspended');
    if (selectedShop && selectedShop.id === shopId) {
      setSelectedShop({ ...selectedShop, status: 'suspended', is_active: false });
    }
  };

  const handleSaveTakeRate = () => {
    if (selectedShop) {
      onUpdateTakeRate(selectedShop.id, customTakeRate);
      setSelectedShop({ ...selectedShop, take_rate: customTakeRate });
    }
  };

  const handleSaveEditForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedShop && onUpdateShopDetails) {
      onUpdateShopDetails(selectedShop.id, editFormData);
      setSelectedShop({ ...selectedShop, ...editFormData });
      setIsEditing(false);
    }
  };

  const handleAddNewShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddShop) {
      onAddShop({
        ...newShopForm,
        is_active: true,
        status: 'active'
      });
      setIsAddModalOpen(false);
      setNewShopForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        suburb: 'CBD',
        city: 'Cape Town',
        category: 'Fast Food',
        take_rate: 15,
        delivery_fee: 25,
        bank_details: 'FNB - 62890192837'
      });
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#1A1A1A] pb-16 md:pb-0">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Multi-Store Merchant Ecosystem & Oversight</h2>
          <p className="text-xs text-gray-400 font-medium">
            Monitor verified shops, adjust commission take-rates, update contact info, and onboard new partners in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#FF5A36] hover:bg-[#e04a29] text-white px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_business</span>
            Add Merchant
          </button>

          {pendingShops.length > 0 && (
            <button
              onClick={handleBatchApprovePending}
              className="bg-[#1A1A1A] hover:bg-black text-white px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">done_all</span>
              Approve Pending ({pendingShops.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters & Tabs Container */}
      <div className="bg-white border border-gray-100 shadow-2xs rounded-sm">
        <div className="flex border-b border-gray-100 px-3 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-gray-400 hover:text-gray-800'
            }`}
          >
            Pending Approvals
            <span className="px-1.5 py-0.5 rounded-sm bg-[#FF5A36]/10 text-[#FF5A36] text-[10px] font-mono-code font-bold">
              {pendingShops.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'active'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-gray-400 hover:text-gray-800'
            }`}
          >
            Active Merchants
            <span className="px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600 text-[10px] font-mono-code font-bold">
              {activeShops.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('suspended')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'suspended'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-gray-400 hover:text-gray-800'
            }`}
          >
            Suspended
            <span className="px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600 text-[10px] font-mono-code font-bold">
              {suspendedShops.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'all'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-gray-400 hover:text-gray-800'
            }`}
          >
            All Merchants ({shops.length})
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-3 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-200 rounded-sm h-8 px-3 text-xs bg-white text-gray-800 font-bold outline-none focus:border-[#FF5A36]"
            >
              <option value="ALL">ALL CATEGORIES</option>
              {categories.map((cat, idx) => (
                <option key={cat || `cat-fallback-${idx}`} value={cat}>
                  {(cat || "").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by name, suburb, phone..."
              className="border border-gray-200 rounded-sm h-8 pl-8 pr-3 text-xs bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5A36] w-64"
            />
            <span className="material-symbols-outlined text-gray-400 absolute left-2.5 top-2 text-[14px]">search</span>
          </div>
        </div>
      </div>

      {/* DESKTOP DATA TABLE */}
      <div className="hidden md:block bg-white border border-gray-100 shadow-2xs overflow-hidden rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50">
              <th className="py-3 px-4">Merchant Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Contact Details</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-right">Take-Rate</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-mono-code">
            {filteredShops.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 font-sans">
                  No merchant records match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredShops.map((shop) => (
                <tr
                  key={shop.id}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                  onClick={() => handleOpenDetail(shop)}
                >
                  <td className="py-3 px-4 font-sans font-bold text-[#1A1A1A]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-[18px]">storefront</span>
                      <span>{shop.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-sans text-gray-600">{shop.category}</td>
                  <td className="py-3 px-4">
                    <div className="text-[11px] text-gray-700">{shop.email}</div>
                    <div className="text-[10px] text-gray-400">{shop.phone}</div>
                  </td>
                  <td className="py-3 px-4 font-sans text-gray-600">
                    <span className="font-semibold">{shop.suburb}</span>, {shop.city}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#FF5A36]">{shop.take_rate}%</td>
                  <td className="py-3 px-4 text-center font-sans">
                    {shop.status === 'pending' && (
                      <span className="badge-pending">Pending</span>
                    )}
                    {shop.status === 'review' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-sm">
                        Review
                      </span>
                    )}
                    {shop.status === 'active' && (
                      <span className="badge-active">Active</span>
                    )}
                    {shop.status === 'suspended' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 rounded-sm">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {shop.status === 'pending' || shop.status === 'review' ? (
                        <>
                          <button
                            onClick={(e) => handleApprove(shop.id, e)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-sm uppercase tracking-wider shadow-2xs active:scale-95 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={(e) => handleReject(shop.id, e)}
                            className="px-2 py-1 bg-gray-200 hover:bg-rose-100 hover:text-rose-800 text-gray-700 text-[10px] font-bold rounded-sm uppercase tracking-wider active:scale-95 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenDetail(shop)}
                          className="px-2.5 py-1 border border-gray-200 hover:border-[#FF5A36] text-gray-800 hover:text-[#FF5A36] text-[10px] font-bold rounded-sm uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Edit & Inspect
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE RESPONSIVE CARDS */}
      <div className="md:hidden space-y-3">
        {filteredShops.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-white border border-gray-100 rounded-sm text-xs">
            No merchant records found.
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => handleOpenDetail(shop)}
              className="p-4 bg-white border border-gray-200 rounded-sm shadow-2xs space-y-3 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-[#1A1A1A]">{shop.name}</h3>
                  <p className="text-[11px] text-gray-500">{shop.category} • {shop.suburb}</p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                    shop.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : shop.status === 'suspended'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {shop.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-2.5">
                <span className="text-gray-400 text-[10px] font-mono-code">Take-Rate:</span>
                <span className="font-mono-code font-bold text-[#FF5A36]">{shop.take_rate}%</span>
              </div>

              <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleOpenDetail(shop)}
                  className="flex-1 py-1.5 border border-gray-200 text-gray-800 font-bold text-xs rounded-sm uppercase tracking-wider"
                >
                  Manage Merchant
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Merchant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-sm shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">Onboard New Merchant Partner</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddNewShop} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    value={newShopForm.name}
                    onChange={(e) => setNewShopForm({ ...newShopForm, name: e.target.value })}
                    placeholder="e.g. Cape Town Smokehouse"
                    className="w-full border border-gray-200 rounded-sm p-2 text-xs bg-gray-50 font-bold focus:outline-none focus:border-[#FF5A36]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newShopForm.email}
                    onChange={(e) => setNewShopForm({ ...newShopForm, email: e.target.value })}
                    placeholder="orders@restaurant.co.za"
                    className="w-full border border-gray-200 rounded-sm p-2 text-xs bg-gray-50 focus:outline-none focus:border-[#FF5A36]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newShopForm.phone}
                    onChange={(e) => setNewShopForm({ ...newShopForm, phone: e.target.value })}
                    placeholder="+27 21 555 0199"
                    className="w-full border border-gray-200 rounded-sm p-2 text-xs bg-gray-50 focus:outline-none focus:border-[#FF5A36]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Category</label>
                  <input
                    type="text"
                    value={newShopForm.category}
                    onChange={(e) => setNewShopForm({ ...newShopForm, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-sm p-2 text-xs bg-gray-50 focus:outline-none focus:border-[#FF5A36]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Suburb</label>
                  <input
                    type="text"
                    value={newShopForm.suburb}
                    onChange={(e) => setNewShopForm({ ...newShopForm, suburb: e.target.value })}
                    className="w-full border border-gray-200 rounded-sm p-2 text-xs bg-gray-50 focus:outline-none focus:border-[#FF5A36]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Physical Street Address</label>
                  <input
                    type="text"
                    required
                    value={newShopForm.address}
                    onChange={(e) => setNewShopForm({ ...newShopForm, address: e.target.value })}
                    placeholder="124 Kloof Street"
                    className="w-full border border-gray-200 rounded-sm p-2 text-xs bg-gray-50 focus:outline-none focus:border-[#FF5A36]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Platform Take Rate (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newShopForm.take_rate}
                    onChange={(e) => setNewShopForm({ ...newShopForm, take_rate: parseFloat(e.target.value) })}
                    className="w-full border border-gray-200 rounded-sm p-2 text-xs bg-gray-50 font-mono-code font-bold focus:outline-none focus:border-[#FF5A36]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Standard Delivery Fee (ZAR)</label>
                  <input
                    type="number"
                    value={newShopForm.delivery_fee}
                    onChange={(e) => setNewShopForm({ ...newShopForm, delivery_fee: parseFloat(e.target.value) })}
                    className="w-full border border-gray-200 rounded-sm p-2 text-xs bg-gray-50 font-mono-code focus:outline-none focus:border-[#FF5A36]"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-sm font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF5A36] text-white hover:bg-[#e04a29] rounded-sm font-bold text-xs uppercase tracking-wider shadow-2xs"
                >
                  Add Merchant to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merchant Detail & Edit Modal */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white border border-gray-200 w-full max-w-xl rounded-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">
                  {isEditing ? 'Edit Merchant Information' : 'Merchant Application Details'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-[#FF5A36] font-bold uppercase tracking-wider hover:underline"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Info'}
                </button>
                <button
                  onClick={() => setSelectedShop(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
              {isEditing ? (
                <form id="editShopForm" onSubmit={handleSaveEditForm} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Name</label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Phone</label>
                      <input
                        type="text"
                        value={editFormData.phone || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Suburb</label>
                      <input
                        type="text"
                        value={editFormData.suburb || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, suburb: e.target.value })}
                        className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Category</label>
                      <input
                        type="text"
                        value={editFormData.category || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Street Address</label>
                    <input
                      type="text"
                      value={editFormData.address || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#FF5A36] text-white font-bold rounded-sm uppercase tracking-wider"
                  >
                    Save Changes to Firestore
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FF5A36]/10 rounded-sm border border-[#FF5A36]/20 flex items-center justify-center text-[#FF5A36] flex-shrink-0">
                      <span className="material-symbols-outlined text-[28px]">storefront</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#1A1A1A]">{selectedShop.name}</h4>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mt-0.5">{selectedShop.category} • {selectedShop.suburb}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Owner Email</label>
                      <div className="border border-gray-200 rounded-sm p-2.5 bg-gray-50 font-mono-code text-gray-800">
                        {selectedShop.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Phone Number</label>
                      <div className="border border-gray-200 rounded-sm p-2.5 bg-gray-50 font-mono-code text-gray-800">
                        {selectedShop.phone}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Address</label>
                      <div className="border border-gray-200 rounded-sm p-2.5 bg-gray-50 text-gray-800 font-bold">
                        {selectedShop.address}, {selectedShop.suburb}, {selectedShop.city}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Bank Settlement Details</label>
                      <div className="border border-gray-200 rounded-sm p-2.5 bg-gray-50 font-mono-code text-gray-800 flex justify-between items-center">
                        <span className="text-gray-400">Stored in secure shop_payout_info collection</span>
                        <span className="material-symbols-outlined text-[16px] text-emerald-500">lock</span>
                      </div>
                    </div>
                  </div>

                  {/* Take rate adjuster */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest">Platform Take Rate (%)</label>
                      <span className="text-xs font-mono-code font-bold text-[#FF5A36]">Current: {customTakeRate}%</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[10, 12.5, 15, 18, 20, 25].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setCustomTakeRate(rate)}
                          className={`px-3 py-1 rounded-sm text-xs font-mono-code font-bold border transition-colors cursor-pointer ${
                            customTakeRate === rate
                              ? 'bg-[#FF5A36] text-white border-[#FF5A36]'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        step="0.5"
                        value={customTakeRate}
                        onChange={(e) => setCustomTakeRate(Number(e.target.value))}
                        className="border border-gray-200 rounded-sm p-2 bg-white font-mono-code text-[#1A1A1A] w-28 text-sm font-bold focus:border-[#FF5A36] outline-none"
                      />
                      <button
                        onClick={handleSaveTakeRate}
                        className="h-9 px-4 bg-[#1A1A1A] hover:bg-black text-white rounded-sm font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Save Take Rate
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              {selectedShop.status === 'active' ? (
                <button
                  onClick={() => handleReject(selectedShop.id)}
                  className="px-4 py-2 border border-rose-200 text-rose-800 hover:bg-rose-50 rounded-sm font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Suspend Merchant
                </button>
              ) : (
                <button
                  onClick={() => handleApprove(selectedShop.id)}
                  className="px-5 py-2 bg-[#FF5A36] text-white hover:bg-[#e04a29] rounded-sm font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                >
                  Approve Merchant
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
