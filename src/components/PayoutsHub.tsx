import React, { useState } from 'react';
import { PaymentSettlement } from '../types';

interface PayoutsHubProps {
  payments: PaymentSettlement[];
  onMarkCompleted: (paymentId: string, transactionId: string) => void;
  onExecuteBatchPayout: () => void;
}

export const PayoutsHub: React.FC<PayoutsHubProps> = ({
  payments,
  onMarkCompleted,
  onExecuteBatchPayout,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [txRefs, setTxRefs] = useState<{ [key: string]: string }>({});

  const filteredPayments = payments.filter((p) => {
    if (selectedMethod !== 'ALL' && p.payment_method !== selectedMethod) return false;
    if (selectedEntity !== 'ALL' && p.entity_type !== selectedEntity) return false;
    return true;
  });

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const totalNetPayoutDue = pendingPayments.reduce((acc, p) => acc + p.net_payout, 0);

  const handleTxRefChange = (id: string, val: string) => {
    setTxRefs((prev) => ({ ...prev, [id]: val }));
  };

  const handleMarkDone = (p: PaymentSettlement) => {
    const ref = txRefs[p.id] || p.transaction_id || `TX-${Math.floor(Math.random() * 899999 + 100000)}`;
    onMarkCompleted(p.id, ref);
  };

  const handleBatchExecution = () => {
    if (pendingPayments.length === 0) return;
    onExecuteBatchPayout();
  };

  return (
    <div className="space-y-6 font-sans text-[#1A1A1A] pb-16 md:pb-0">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Financial Settlement & Payout Hub</h2>
          <p className="text-xs text-gray-400 font-medium">
            Manage weekly dispersals, net commissions, and batch payout execution across Cape Town partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="bg-white border border-gray-200 text-gray-800 px-3 py-1.5 rounded-sm text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-2xs uppercase tracking-wider cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#FF5A36]">refresh</span> Sync Ledger
          </button>
          {pendingPayments.length > 0 && (
            <button
              onClick={handleBatchExecution}
              className="bg-[#FF5A36] text-white px-4 py-1.5 rounded-sm text-xs font-bold hover:bg-[#e04a29] transition-colors flex items-center gap-1.5 shadow-2xs uppercase tracking-wider cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span> Execute Batch Payout
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar - Cognitive Chunking */}
      <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-2xs flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Date Range</label>
          <div className="flex items-center border border-gray-200 rounded-sm px-3 h-9 bg-gray-50 font-mono-code text-xs text-gray-800 font-bold">
            <span className="material-symbols-outlined text-[#FF5A36] text-[16px] mr-2">calendar_today</span>
            <span>Current Settlement Cycle</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Payment Method</label>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="border border-gray-200 rounded-sm h-9 px-3 text-xs bg-white text-gray-800 font-bold outline-none focus:border-[#FF5A36]"
          >
            <option value="ALL">ALL METHODS</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="1Voucher">1Voucher</option>
            <option value="OTT Cash">OTT Cash</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Entity Type</label>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="border border-gray-200 rounded-sm h-9 px-3 text-xs bg-white text-gray-800 font-bold outline-none focus:border-[#FF5A36]"
          >
            <option value="ALL">ALL ENTITIES</option>
            <option value="Shop Partners">Shop Partners</option>
            <option value="Rider Fleet">Rider Fleet</option>
          </select>
        </div>
      </div>

      {/* DESKTOP TABLE (PC Mode) */}
      <div className="hidden md:flex bg-white border border-gray-100 rounded-sm shadow-2xs overflow-hidden flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50">
                <th className="py-3 px-4">Entity Name</th>
                <th className="py-3 px-4 text-right">Gross Volume</th>
                <th className="py-3 px-4 text-right">Take Rate (10%)</th>
                <th className="py-3 px-4 text-right">Net Payout Due</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 w-48">Transaction ID</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-mono-code">
              {filteredPayments.map((p) => {
                const currentTxRef = txRefs[p.id] !== undefined ? txRefs[p.id] : p.transaction_id;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-[18px]">
                          {p.entity_type === 'Shop Partners' ? 'storefront' : 'sports_motorsports'}
                        </span>
                        <span className="font-bold text-[#1A1A1A] text-xs">{p.entity_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-700 font-bold">
                      R{((p.gross_revenue) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-400">
                      R{((p.commission_amount) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#1A1A1A] text-sm">
                      R{((p.net_payout) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          p.payment_method === 'Bank Transfer'
                            ? 'bg-blue-100 text-blue-800'
                            : p.payment_method === '1Voucher'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {p.payment_method === 'Bank Transfer' ? 'account_balance' : 'confirmation_number'}
                        </span>
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <input
                        type="text"
                        value={currentTxRef}
                        onChange={(e) => handleTxRefChange(p.id, e.target.value)}
                        placeholder="Ref..."
                        disabled={p.status === 'completed'}
                        className="w-full border border-gray-200 rounded-sm px-2.5 py-1 text-xs font-mono-code bg-gray-50 text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      {p.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-green-700 font-bold text-[10px] uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkDone(p)}
                          className="bg-[#FF5A36] text-white px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-[#e04a29] transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        >
                          Complete Payout
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 p-3 bg-gray-50 text-xs text-gray-500 flex justify-between items-center font-sans">
          <span className="font-bold">Pending Dispersal Sum: <strong className="text-[#1A1A1A] font-mono-code text-sm ml-1">R{((totalNetPayoutDue) || 0).toFixed(2)}</strong></span>
          <span className="font-mono-code text-[11px] font-bold text-gray-400">Showing {filteredPayments.length} of {payments.length} settlements</span>
        </div>
      </div>

      {/* MOBILE RESPONSIVE SETTLEMENT CARDS (Mobile Ergonomics) */}
      <div className="md:hidden space-y-3">
        {filteredPayments.map((p) => {
          const currentTxRef = txRefs[p.id] !== undefined ? txRefs[p.id] : p.transaction_id;

          return (
            <div key={p.id} className="p-4 bg-white border border-gray-200 rounded-sm shadow-2xs space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">
                    {p.entity_type === 'Shop Partners' ? 'storefront' : 'sports_motorsports'}
                  </span>
                  <div>
                    <h3 className="font-bold text-xs text-[#1A1A1A]">{p.entity_name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase">{p.entity_type}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                    p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-sm text-xs font-mono-code border border-gray-100">
                <div>
                  <span className="text-gray-400 text-[9px] uppercase block font-sans">Gross Volume</span>
                  <span className="font-bold text-gray-800">R{((p.gross_revenue) || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase block font-sans">Net Payout Due</span>
                  <span className="font-bold text-[#FF5A36]">R{((p.net_payout) || 0).toFixed(2)}</span>
                </div>
              </div>

              {p.status !== 'completed' && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={currentTxRef}
                    onChange={(e) => handleTxRefChange(p.id, e.target.value)}
                    placeholder="Enter Reference ID..."
                    className="w-full border border-gray-200 rounded-sm p-2 text-xs font-mono-code bg-white"
                  />
                  <button
                    onClick={() => handleMarkDone(p)}
                    className="w-full py-2 bg-[#FF5A36] text-white font-bold text-xs rounded-sm uppercase tracking-wider active:scale-98"
                  >
                    Complete Payout
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE STICKY THUMB ACTION BAR */}
      {pendingPayments.length > 0 && (
        <div className="md:hidden fixed bottom-18 left-4 right-4 z-30 bg-[#1A1A1A] text-white p-3 rounded-sm shadow-2xl flex items-center justify-between border border-white/10 animate-fade-in">
          <div>
            <span className="text-[10px] text-gray-400 font-mono-code uppercase block">Payout Due Sum</span>
            <span className="text-xs font-bold text-[#FF5A36] font-mono-code">R{((totalNetPayoutDue) || 0).toFixed(2)}</span>
          </div>
          <button
            onClick={handleBatchExecution}
            className="bg-[#FF5A36] text-white text-xs font-bold px-3.5 py-1.5 rounded-sm uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer"
          >
            Batch Disperse
          </button>
        </div>
      )}
    </div>
  );
};
