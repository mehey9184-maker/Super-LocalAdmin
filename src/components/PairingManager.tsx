import React, { useState } from 'react';
import { RiderConnection, Shop, RiderProfile } from '../types';

interface PairingManagerProps {
  connections: RiderConnection[];
  shops: Shop[];
  riders: RiderProfile[];
  onGenerateCipher: (shopId: string, shopName: string, riderId: string, riderName: string, radiusKm: number) => Promise<RiderConnection>;
  onUpdateConnectionStatus: (connectionId: string, status: RiderConnection['status']) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const PairingManager: React.FC<PairingManagerProps> = ({
  connections,
  shops,
  riders,
  onGenerateCipher,
  onUpdateConnectionStatus,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.id || '');
  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.id || '');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCipher, setCopiedCipher] = useState<string | null>(null);

  const filteredConnections = connections.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.pairing_cipher.toLowerCase().includes(q) ||
      c.shop_name.toLowerCase().includes(q) ||
      c.rider_name.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  });

  const activeCount = connections.filter((c) => c.status === 'active').length;
  const pendingCount = connections.filter((c) => c.status === 'pending').length;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const shop = shops.find((s) => s.id === selectedShopId);
    const rider = riders.find((r) => r.id === selectedRiderId);

    if (!shop || !rider) {
      onShowToast('Selection Required', 'Please select both a shop and a rider', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const created = await onGenerateCipher(shop.id, shop.name, rider.id, rider.full_name, radiusKm);
      onShowToast('Cipher Generated', `Pairing code ${created.pairing_cipher} created for ${shop.name}`, 'success');
      setCopiedCipher(created.pairing_cipher);
      navigator.clipboard?.writeText(created.pairing_cipher);
    } catch (err: any) {
      onShowToast('Error', err?.message || 'Failed to create pairing cipher', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (cipher: string) => {
    navigator.clipboard?.writeText(cipher);
    setCopiedCipher(cipher);
    onShowToast('Copied to Clipboard', `Cipher ${cipher} copied to clipboard`, 'info');
    setTimeout(() => setCopiedCipher(null), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-[#1A1A1A] pb-16 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Merchant & Rider Pairing Cipher Control</h2>
          <p className="text-xs text-gray-400 font-medium">
            Generate cryptographically secure 6-character dispatch connection codes (`LE-XXXX`) to assign dedicated drivers to merchant kitchens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-100 p-2.5 px-3 rounded-sm shadow-2xs flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-gray-400">Active Pairings</span>
            <span className="text-lg font-bold text-[#FF5A36] font-mono-code">{activeCount}</span>
          </div>
          <div className="bg-white border border-gray-100 p-2.5 px-3 rounded-sm shadow-2xs flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-gray-400">Pending Review</span>
            <span className="text-lg font-bold text-amber-600 font-mono-code">{pendingCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate Cipher Generator Card */}
        <div className="bg-white border border-gray-100 rounded-sm shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <span className="material-symbols-outlined text-[#FF5A36] text-[20px]">key</span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">Generate Pairing Cipher</h3>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                  Target Merchant Partner
                </label>
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-[#FF5A36]"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.suburb})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                  Delivery Rider to Pair
                </label>
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-[#FF5A36]"
                >
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.full_name} ({r.vehicle_type} - {r.is_online ? 'Online' : 'Offline'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Dedicated Radius (km)
                  </label>
                  <span className="font-mono-code font-bold text-xs text-[#FF5A36]">{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                  className="w-full accent-[#FF5A36] cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full mt-2 py-2.5 bg-[#FF5A36] hover:bg-[#e04a29] text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                {isGenerating ? 'Generating...' : 'Issue Cryptographic Cipher'}
              </button>
            </form>
          </div>

          <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-sm text-[11px] text-gray-500 font-mono-code">
            <span className="text-[#FF5A36] font-bold block mb-1">SECURITY SPECIFICATION:</span>
            Codes are hashed via CSPRNG and valid for dedicated order broadcasting within selected merchant radius.
          </div>
        </div>

        {/* Active Connections Stream */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-sm shadow-2xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-500 text-[18px]">hub</span>
              <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">Active Rider-Store Pairings</h3>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pairings or ciphers..."
                className="pl-7 pr-3 py-1 bg-white border border-gray-200 rounded-sm text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5A36] w-48 sm:w-60"
              />
              <span className="material-symbols-outlined text-gray-400 absolute left-2 top-1.5 text-[14px]">search</span>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50">
                  <th className="py-3 px-4">Merchant Shop</th>
                  <th className="py-3 px-4">Dedicated Rider</th>
                  <th className="py-3 px-4">Pairing Cipher</th>
                  <th className="py-3 px-4 text-center">Radius</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-mono-code">
                {filteredConnections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 font-sans">
                      No matching rider pairings found. Generate a new cipher code on the left!
                    </td>
                  </tr>
                ) : (
                  filteredConnections.map((conn) => (
                    <tr key={conn.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-400 text-[16px]">storefront</span>
                          <span className="font-bold text-[#1A1A1A]">{conn.shop_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-400 text-[16px]">two_wheeler</span>
                          <span className="font-bold text-gray-800">{conn.rider_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#FF5A36] bg-[#FF5A36]/10 px-2 py-0.5 rounded-sm tracking-wider">
                            {conn.pairing_cipher}
                          </span>
                          <button
                            onClick={() => copyToClipboard(conn.pairing_cipher)}
                            className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                            title="Copy Cipher"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedCipher === conn.pairing_cipher ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 font-bold">
                        {conn.exclusive_radius_km || 5} km
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                            conn.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : conn.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {conn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex justify-end gap-1.5">
                          {conn.status !== 'active' ? (
                            <button
                              onClick={() => onUpdateConnectionStatus(conn.id, 'active')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateConnectionStatus(conn.id, 'revoked')}
                              className="px-2.5 py-1 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Revoke
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

          <div className="p-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between items-center font-sans">
            <span>Showing {filteredConnections.length} pair records</span>
            <span className="font-mono-code font-semibold">Real-time sync to Firestore `rider_connections`</span>
          </div>
        </div>
      </div>
    </div>
  );
};
