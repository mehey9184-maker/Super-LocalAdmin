import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Shop, Order, RiderProfile } from '../types';

interface FleetMapProps {
  shops: Shop[];
  orders: Order[];
  riders: RiderProfile[];
  onReassignRider: (orderId: string, newRiderId: string, newRiderName: string) => void;
  reassignTargetOrder?: Order | null;
  clearReassignTarget?: () => void;
}

export const FleetMap: React.FC<FleetMapProps> = ({
  shops,
  orders,
  riders,
  onReassignRider,
  reassignTargetOrder,
  clearReassignTarget,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedOrderToReassign, setSelectedOrderToReassign] = useState<Order | null>(
    reassignTargetOrder || null
  );
  const [selectedNewRiderId, setSelectedNewRiderId] = useState<string>('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Handle external reassign trigger
  useEffect(() => {
    if (reassignTargetOrder) {
      setSelectedOrderToReassign(reassignTargetOrder);
    }
  }, [reassignTargetOrder]);

  const delayedOrders = orders.filter((o) => o.status === 'DELAYED' || (o.delay_minutes && o.delay_minutes > 15));

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center at Cape Town CBD
      const map = L.map(mapContainerRef.current, {
        center: [-33.9249, 18.4241],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const layerGroup = markersLayerRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    // 1. Add Shop Markers (Blue)
    shops.forEach((shop) => {
      if (!shop.lat || !shop.lng) return;
      const shopIcon = L.divIcon({
        className: 'custom-shop-pin',
        html: `<div class="bg-blue-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center hover:scale-110 transition-transform" title="${shop.name}">
          <span class="material-symbols-outlined text-[16px]">store</span>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([shop.lat, shop.lng], { icon: shopIcon }).addTo(layerGroup);
      marker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <strong class="text-xs font-bold text-slate-900">${shop.name}</strong>
          <p class="text-slate-500 text-[10px]">${shop.category} • ${shop.suburb}</p>
          <p class="text-slate-700 font-mono-code font-bold mt-1">Delivery Fee: R${((shop.delivery_fee) || 0).toFixed(2)}</p>
        </div>
      `);
    });

    // 2. Add Rider Markers (Green)
    riders.forEach((rider) => {
      if (!rider.current_latitude || !rider.current_longitude || !rider.is_online) return;
      const riderIcon = L.divIcon({
        className: 'custom-rider-pin',
        html: `<div class="relative group">
          <div class="bg-emerald-600 text-white p-1.5 rounded-full shadow-md border-2 border-white flex items-center justify-center">
            <span class="material-symbols-outlined text-[16px]">sports_motorsports</span>
          </div>
          ${
            rider.status === 'busy'
              ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white"></span>'
              : '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white animate-ping"></span>'
          }
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([rider.current_latitude, rider.current_longitude], { icon: riderIcon }).addTo(
        layerGroup
      );
      marker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <strong class="text-xs font-bold text-slate-900">${rider.full_name}</strong>
          <p class="text-slate-500 text-[10px]">Status: <span class="capitalize font-bold text-emerald-600">${rider.status}</span></p>
          <p class="text-slate-700 font-mono-code font-bold mt-1">Rating: ⭐ ${rider.rating} (${rider.rating_count})</p>
        </div>
      `);
    });

    // 3. Add Orders & Dropoff Markers (Orange/Red)
    orders.forEach((order) => {
      if (!order.lat || !order.lng) return;
      const isDelayed = order.status === 'DELAYED';
      const dropoffIcon = L.divIcon({
        className: 'custom-dropoff-pin',
        html: `<div class="${
          isDelayed ? 'bg-rose-600 animate-bounce' : 'bg-[#FF5A36]'
        } text-white p-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
          <span class="material-symbols-outlined text-[16px]">location_on</span>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([order.lat, order.lng], { icon: dropoffIcon }).addTo(layerGroup);
      marker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <strong class="text-xs font-bold ${isDelayed ? 'text-rose-600' : 'text-slate-900'}">${order.id}: ${
        order.customer_name
      }</strong>
          <p class="text-slate-600 text-[10px]">${order.address}, ${order.suburb}</p>
          <p class="font-bold text-[#FF5A36] font-mono-code mt-1">R${((order.total_price) || 0).toFixed(2)} (${order.status})</p>
        </div>
      `);

      // Connect Shop to Dropoff with dashed polyline
      if (order.shop_lat && order.shop_lng) {
        L.polyline(
          [
            [order.shop_lat, order.shop_lng],
            [order.lat, order.lng],
          ],
          {
            color: isDelayed ? '#e11d48' : '#FF5A36',
            weight: 2,
            dashArray: '5, 8',
            opacity: 0.7,
          }
        ).addTo(layerGroup);
      }
    });
  }, [shops, orders, riders]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleCenter = () => mapInstanceRef.current?.setView([-33.9249, 18.4241], 14);

  const availableRiders = riders.filter((r) => r.is_online && r.status === 'available');

  const handleExecuteReassign = () => {
    if (!selectedOrderToReassign) return;
    if (!selectedNewRiderId) {
      alert('Please select an online available rider for re-assignment.');
      return;
    }
    const targetRider = riders.find((r) => r.id === selectedNewRiderId);
    if (!targetRider) return;

    onReassignRider(selectedOrderToReassign.id, targetRider.id, targetRider.full_name);
    setSelectedOrderToReassign(null);
    setSelectedNewRiderId('');
    if (clearReassignTarget) clearReassignTarget();
  };

  return (
    <div className="space-y-4 relative min-h-[550px] flex flex-col font-sans text-[#1A1A1A] pb-16 md:pb-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Live Dispatch & Fleet Map</h2>
          <p className="text-xs text-gray-400 font-medium">
            Real-time geospatial tracking of shop kitchens, active riders, and delayed orders requiring manual intervention.
          </p>
        </div>

        {/* Quick Controls & Mobile Alerts Trigger */}
        <div className="flex items-center gap-2">
          {delayedOrders.length > 0 && (
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden px-3 py-1.5 bg-rose-600 text-white rounded-sm font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Delayed ({delayedOrders.length})
            </button>
          )}
          <button
            onClick={handleCenter}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-800 rounded-sm font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#FF5A36]">my_location</span> Recenter
          </button>
        </div>
      </div>

      {/* Map Canvas + Drawer Layout */}
      <div className="relative flex-1 min-h-[500px] border border-gray-100 rounded-sm overflow-hidden shadow-2xs flex">
        {/* Leaflet Container */}
        <div ref={mapContainerRef} className="w-full h-[520px] bg-gray-100 z-10" />

        {/* Floating Map Controls */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 bg-white/95 backdrop-blur-xs rounded-sm shadow-md border border-gray-200 p-1">
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-gray-100 rounded-sm text-gray-800 cursor-pointer" title="Zoom In">
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <div className="h-px bg-gray-200 my-0.5" />
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-gray-100 rounded-sm text-gray-800 cursor-pointer" title="Zoom Out">
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <div className="h-px bg-gray-200 my-0.5" />
          <button onClick={handleCenter} className="p-1.5 hover:bg-gray-100 rounded-sm text-gray-800 cursor-pointer" title="Recenter Map">
            <span className="material-symbols-outlined text-[18px]">my_location</span>
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs rounded-sm shadow-md border border-gray-200 px-3 py-2 hidden sm:flex items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span className="font-bold text-gray-800 text-[10px] uppercase tracking-wider">Kitchen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span className="font-bold text-gray-800 text-[10px] uppercase tracking-wider">Rider</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5A36] inline-block" />
            <span className="font-bold text-gray-800 text-[10px] uppercase tracking-wider">Dropoff</span>
          </div>
        </div>

        {/* Delayed Orders Slide-out Drawer (Desktop Right Side) */}
        <div className="hidden lg:flex w-88 bg-white border-l border-gray-100 shadow-xl flex-col z-20">
          <div className="p-4 border-b border-gray-100 bg-rose-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>Delayed Orders (&gt;15m)</span>
            </div>
            <span className="bg-rose-800 text-white font-mono-code text-[10px] font-bold px-2 py-0.5 rounded-sm">
              {delayedOrders.length} Alert{delayedOrders.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {delayedOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs font-medium">
                <span className="material-symbols-outlined text-[32px] text-green-600 mb-2 block">
                  check_circle
                </span>
                No delayed orders requiring dispatch intervention!
              </div>
            ) : (
              delayedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-sm p-3.5 shadow-2xs space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-600" />

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono-code text-gray-400 font-bold">{order.id}</span>
                      <h4 className="font-bold text-xs text-[#1A1A1A] mt-0.5">{order.shop_name}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">{order.customer_name} • {order.suburb}</p>
                    </div>
                    <span className="text-rose-800 font-bold text-[10px] bg-rose-100 px-2 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {order.delay_minutes || 20}m delay
                    </span>
                  </div>

                  <div className="p-2 bg-gray-50 rounded-sm border border-gray-100 flex justify-between items-center text-[11px] font-mono-code">
                    <span className="text-gray-500">Value: <strong className="text-gray-800 font-bold">R{((order.total_price) || 0).toFixed(2)}</strong></span>
                    <span className="text-gray-500">Rider: <strong className="text-gray-800 font-bold">{order.rider_name || 'None'}</strong></span>
                  </div>

                  <button
                    onClick={() => setSelectedOrderToReassign(order)}
                    className="w-full bg-[#FF5A36] hover:bg-[#e04a29] text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    Manual Re-assign Rider
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MOBILE DELAYED ORDERS BOTTOM SHEET */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex flex-col justify-end">
          <div className="bg-white border-t border-gray-200 rounded-t-xl p-4 max-h-[80vh] flex flex-col space-y-3 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span>Delayed Orders ({delayedOrders.length})</span>
              </div>
              <button onClick={() => setIsMobileDrawerOpen(false)} className="text-gray-400 p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto space-y-3">
              {delayedOrders.map((order) => (
                <div key={order.id} className="p-3 bg-gray-50 border border-gray-200 rounded-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono-code text-gray-400 font-bold">{order.id}</span>
                      <h4 className="font-bold text-xs text-[#1A1A1A]">{order.shop_name}</h4>
                    </div>
                    <span className="text-rose-800 font-bold text-[9px] bg-rose-100 px-2 py-0.5 rounded-sm uppercase">
                      {order.delay_minutes || 20}m delay
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrderToReassign(order);
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full py-2 bg-[#FF5A36] text-white text-xs font-bold uppercase rounded-sm"
                  >
                    Re-assign Rider
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reassignment Modal */}
      {selectedOrderToReassign && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-sm border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono-code text-gray-400 uppercase tracking-widest">
                  Dispatch Override
                </span>
                <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">
                  Re-assign Rider for {selectedOrderToReassign.id}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedOrderToReassign(null);
                  if (clearReassignTarget) clearReassignTarget();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-sm"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-amber-900">
                <p className="font-bold">{selectedOrderToReassign.shop_name} → {selectedOrderToReassign.customer_name}</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Currently delayed by {selectedOrderToReassign.delay_minutes || 20} minutes. Select an available online driver below.
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">
                  Select Available Driver
                </label>
                <select
                  value={selectedNewRiderId}
                  onChange={(e) => setSelectedNewRiderId(e.target.value)}
                  className="w-full border border-gray-200 rounded-sm p-2.5 bg-white text-gray-800 font-bold text-xs focus:border-[#FF5A36] outline-none"
                >
                  <option value="">-- SELECT RIDER --</option>
                  {availableRiders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.full_name} ({r.vehicle_type?.toUpperCase() || r.vehicle_type} • ⭐ {r.rating} • {r.total_deliveries} jobs)
                    </option>
                  ))}
                </select>
                {availableRiders.length === 0 && (
                  <p className="text-rose-600 text-[11px] mt-1 font-bold">
                    No riders currently available. Override will force dispatch to closest online rider.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedOrderToReassign(null);
                  if (clearReassignTarget) clearReassignTarget();
                }}
                className="px-3.5 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReassign}
                className="px-4 py-1.5 bg-[#FF5A36] hover:bg-[#e04a29] text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
              >
                Confirm Dispatch Re-assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
