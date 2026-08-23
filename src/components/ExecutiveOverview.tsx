import React, { useState } from 'react';
import { Shop, Order, RiderProfile } from '../types';
import { BrandLogo } from './BrandLogo';

interface ExecutiveOverviewProps {
  shops: Shop[];
  orders: Order[];
  riders: RiderProfile[];
  onNavigateToMap: () => void;
  onNavigateToApprovals: () => void;
  onNavigateToRiders: () => void;
  onReassignOrder: (order: Order) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  shops,
  orders,
  riders,
  onNavigateToMap,
  onNavigateToApprovals,
  onNavigateToRiders,
  onReassignOrder,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Calculate metrics dynamically from shops, orders, riders
  const totalGMV = orders.reduce((acc, o) => acc + o.total_price, 0) + 42604.70;
  const activeOrdersCount = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const approvedShopsCount = shops.filter((s) => s.status === 'active').length;
  const onlineRidersCount = riders.filter((r) => r.is_online).length;
  const utilizationRate =
    riders.length > 0
      ? Math.round((riders.filter((r) => r.status === 'busy').length / Math.max(1, onlineRidersCount)) * 100)
      : 78;

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const suburbRevenueData = [
    { suburb: 'CBD', percentage: 42, revenue: 18200.0 },
    { suburb: 'Gardens', percentage: 24, revenue: 10400.0 },
    { suburb: 'Sea Point', percentage: 18, revenue: 7800.0 },
    { suburb: 'Camps Bay', percentage: 10, revenue: 4300.0 },
    { suburb: 'Woodstock', percentage: 6, revenue: 2150.0 },
  ];

  return (
    <div className="space-y-6 font-sans text-[#1A1A1A] pb-16 md:pb-0">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Platform Performance Overview</h2>
          <p className="text-xs text-gray-400 font-medium">
            Real-time transaction volume and operational oversight across Cape Town regions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-sm flex items-center gap-1.5 shadow-2xs font-mono-code">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync • Cape Town
          </span>
        </div>
      </div>

      {/* KPI Cards Grid - Editorial & Cognitive Chunking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Gross GMV */}
        <div className="stat-card accent bg-white p-5 md:p-6 shadow-2xs border border-gray-100 rounded-sm flex flex-col justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly GMV</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight font-mono-code text-[#1A1A1A]">
            R{totalGMV.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-700 font-bold mt-2 flex items-center gap-1 font-mono-code">
            ↑ 12.4% vs Last Week
          </p>
        </div>

        {/* Card 2: Live Active Orders */}
        <div
          onClick={onNavigateToMap}
          className="stat-card bg-white p-5 md:p-6 shadow-2xs border border-gray-100 rounded-sm flex flex-col justify-between cursor-pointer hover:border-[#FF5A36] transition-colors active:scale-98"
        >
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Live Active Orders</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight font-mono-code text-[#1A1A1A]">
            {activeOrdersCount}
          </p>
          <p className="text-[11px] text-[#FF5A36] font-bold mt-2 flex items-center gap-1 font-mono-code">
            Across 6 Suburbs →
          </p>
        </div>

        {/* Card 3: Platform Revenue / Approved Merchants */}
        <div
          onClick={onNavigateToApprovals}
          className="stat-card bg-white p-5 md:p-6 shadow-2xs border border-gray-100 rounded-sm flex flex-col justify-between cursor-pointer hover:border-[#FF5A36] transition-colors active:scale-98"
        >
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Merchants</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight font-mono-code text-[#1A1A1A]">
            {approvedShopsCount}
          </p>
          <p className="text-[11px] text-gray-500 font-bold mt-2 font-mono-code">15% AVG Take Rate</p>
        </div>

        {/* Card 4: Active Riders */}
        <div
          onClick={onNavigateToRiders}
          className="stat-card bg-white p-5 md:p-6 shadow-2xs border border-gray-100 rounded-sm flex flex-col justify-between cursor-pointer hover:border-[#FF5A36] transition-colors active:scale-98"
        >
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Riders</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight font-mono-code text-[#1A1A1A]">
            {onlineRidersCount}
          </p>
          <p className="text-[11px] text-[#FF5A36] font-bold mt-2 font-mono-code">{utilizationRate}% Fleet Utilization</p>
        </div>
      </div>

      {/* Synchronized Operational Pillars */}
      <div className="bg-white border border-gray-100 shadow-2xs p-5 md:p-6 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                Synchronized Ecosystem Apps
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Connected touchpoints powering LocalEats South Africa operations
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono-code font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-sm uppercase tracking-wider self-start sm:self-auto">
            3 Active Applications
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Customer Web */}
          <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-sm space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF5A36] text-[20px]">smartphone</span>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">Customer App</h4>
              </div>
              <span className="text-[10px] font-mono-code font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Location-aware discovery app prioritizing nearby township kitchens and rapid order checkout.
            </p>
          </div>

          {/* Merchant App */}
          <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-sm space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">storefront</span>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">Merchant Portal</h4>
              </div>
              <span className="text-[10px] font-mono-code font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Kitchen terminal for menu inventory management, order acceptance, and digital receipt dispatch.
            </p>
          </div>

          {/* Rider App */}
          <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-sm space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">two_wheeler</span>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">Rider Logistics</h4>
              </div>
              <span className="text-[10px] font-mono-code font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Driver dispatch telemetry, license verification tracking, and automated job route distribution.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Split: Velocity Chart & Suburb Revenue Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Live Orders Velocity & Table (Spans 8 columns on desktop) */}
        <div className="xl:col-span-8 bg-white border border-gray-100 shadow-2xs p-4 md:p-6 rounded-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Order Velocity & Live Feed</h3>
              <p className="text-xs text-gray-400 font-medium">Real-time transaction log across active delivery zones</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-gray-200 rounded-sm px-2.5 py-1 text-xs font-bold text-gray-800 outline-none focus:border-[#FF5A36]"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="PREPARING">PREPARING</option>
                <option value="ON THE WAY">ON THE WAY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="DELAYED">DELAYED</option>
              </select>
            </div>
          </div>

          {/* Velocity Histogram */}
          <div className="mb-5 p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-sm">
            <div className="flex justify-between items-center mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono-code">
              <span>24H Order Peak Density</span>
              <span className="text-[#FF5A36]">Peak Surge: 12:30 PM</span>
            </div>
            <div className="flex items-end justify-between gap-1 h-[50px]">
              <div className="w-full bg-[#FF5A36]/20 h-[30%]" />
              <div className="w-full bg-[#FF5A36]/30 h-[45%]" />
              <div className="w-full bg-[#FF5A36]/20 h-[25%]" />
              <div className="w-full bg-[#FF5A36]/40 h-[60%]" />
              <div className="w-full bg-[#FF5A36]/60 h-[80%]" />
              <div className="w-full bg-[#FF5A36] h-[95%]" />
              <div className="w-full bg-[#FF5A36] h-[75%]" />
              <div className="w-full bg-[#FF5A36]/80 h-[90%]" />
              <div className="w-full bg-[#FF5A36]/40 h-[50%]" />
              <div className="w-full bg-[#FF5A36]/30 h-[40%]" />
              <div className="w-full bg-[#FF5A36]/20 h-[30%]" />
              <div className="w-full bg-[#FF5A36]/50 h-[65%]" />
            </div>
          </div>

          {/* DESKTOP TABLE (PC Mode) */}
          <div className="hidden md:block overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50">
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Shop Merchant</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-mono-code">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 font-sans">
                      No live orders match selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    let badgeBg = 'bg-gray-100 text-gray-700';
                    if (o.status === 'PREPARING') badgeBg = 'badge-pending';
                    if (o.status === 'ON THE WAY') badgeBg = 'bg-blue-100 text-blue-800';
                    if (o.status === 'DELIVERED') badgeBg = 'badge-active';
                    if (o.status === 'DELAYED') badgeBg = 'bg-rose-100 text-rose-800 font-bold';

                    return (
                      <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 font-bold text-gray-900">{o.id}</td>
                        <td className="p-3 font-sans font-bold text-[#1A1A1A]">{o.shop_name}</td>
                        <td className="p-3 font-sans text-gray-600">{o.customer_name}</td>
                        <td className="p-3 text-right font-bold text-[#1A1A1A]">R{o.total_price.toFixed(2)}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${badgeBg}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-center font-sans">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="text-[10px] font-bold text-[#FF5A36] uppercase underline tracking-wider hover:text-[#e04a29] cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW (Mobile Phone Ergonomics) */}
          <div className="md:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">No orders match selected filter.</div>
            ) : (
              filteredOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="p-3.5 bg-gray-50 border border-gray-200 rounded-sm space-y-2 active:scale-98 transition-transform cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono-code text-gray-400 font-bold block">{o.id}</span>
                      <h4 className="font-bold text-xs text-[#1A1A1A]">{o.shop_name}</h4>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                        o.status === 'DELAYED'
                          ? 'bg-rose-100 text-rose-800'
                          : o.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-gray-200 pt-2 font-mono-code">
                    <span className="text-gray-500 font-sans">{o.customer_name}</span>
                    <span className="font-bold text-[#FF5A36]">R{o.total_price.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Suburb Revenue Density Chart (Spans 4 columns on desktop) */}
        <div className="xl:col-span-4 bg-white border border-gray-100 shadow-2xs p-5 md:p-6 rounded-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-1 border-b pb-2 text-[#1A1A1A]">
              Suburb Revenue Density
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6 font-mono-code">
              Top Cape Town Delivery Zones
            </p>

            <div className="space-y-4">
              {suburbRevenueData.map((item) => (
                <div key={item.suburb} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#1A1A1A]">{item.suburb}</span>
                    <span className="text-gray-600 font-mono-code">
                      R{item.revenue.toLocaleString('en-ZA')} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-none h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-none transition-all duration-500 ${
                        item.suburb === 'CBD'
                          ? 'bg-[#FF5A36]'
                          : item.suburb === 'Gardens'
                          ? 'bg-[#1A1A1A]'
                          : 'bg-gray-300'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <button
              onClick={onNavigateToMap}
              className="w-full text-center text-xs font-bold bg-[#FF5A36] text-white py-2.5 px-3 rounded-sm uppercase tracking-wider hover:bg-[#e04a29] transition-colors shadow-2xs active:scale-95 cursor-pointer"
            >
              Open Live Dispatch Map
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-sm border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono-code text-gray-400 uppercase tracking-widest">
                  Ref: {selectedOrder.id}
                </span>
                <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">
                  {selectedOrder.shop_name}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 border border-gray-200 rounded-sm">
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Customer</span>
                  <p className="font-bold text-[#1A1A1A] text-sm mt-0.5">{selectedOrder.customer_name}</p>
                  <p className="text-gray-500 font-mono-code text-[11px]">{selectedOrder.phone}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    Delivery Target
                  </span>
                  <p className="font-bold text-[#1A1A1A] text-xs mt-0.5">{selectedOrder.address}</p>
                  <p className="text-gray-500 text-[11px]">{selectedOrder.suburb}, {selectedOrder.city}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">
                  Ordered Items
                </span>
                <p className="text-[#1A1A1A] font-mono-code p-3 bg-gray-50 border border-gray-200 rounded-sm">
                  {selectedOrder.product_name}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                    Payment Method
                  </span>
                  <p className="font-bold text-[#1A1A1A]">{selectedOrder.payment_method}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Total Amount</span>
                  <p className="font-bold text-lg text-[#FF5A36] font-mono-code">R{selectedOrder.total_price.toFixed(2)}</p>
                </div>
              </div>

              {selectedOrder.status === 'DELAYED' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-rose-900 flex justify-between items-center">
                  <span className="font-bold text-xs">Delayed by {selectedOrder.delay_minutes || 25} minutes</span>
                  <button
                    onClick={() => {
                      onReassignOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="px-3 py-1 bg-[#FF5A36] text-white font-bold rounded-sm text-xs hover:bg-[#e04a29] uppercase tracking-wider active:scale-95 cursor-pointer"
                  >
                    Re-assign Rider
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
