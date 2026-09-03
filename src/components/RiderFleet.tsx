import React, { useState } from 'react';
import { RiderProfile, VerificationStatus } from '../types';

interface RiderFleetProps {
  riders: RiderProfile[];
  onToggleOnline: (riderId: string) => void;
  onUpdateVerification: (riderId: string, status: VerificationStatus) => void;
}

export const RiderFleet: React.FC<RiderFleetProps> = ({
  riders,
  onToggleOnline,
  onUpdateVerification,
}) => {
  const [selectedRiderForDocs, setSelectedRiderForDocs] = useState<RiderProfile | null>(null);

  const pendingVerificationRiders = riders.filter(
    (r) => r.verification_status === 'pending' || r.verification_status === 'in_progress'
  );
  const activeRidersCount = riders.filter((r) => r.is_online).length;
  const totalDeliveriesSum = riders.reduce((acc, r) => acc + r.total_deliveries, 0);

  const handleApprove = (riderId: string) => {
    onUpdateVerification(riderId, 'approved');
    if (selectedRiderForDocs && selectedRiderForDocs.id === riderId) {
      setSelectedRiderForDocs({ ...selectedRiderForDocs, verification_status: 'approved' });
    }
  };

  const handleReject = (riderId: string) => {
    onUpdateVerification(riderId, 'rejected');
    if (selectedRiderForDocs && selectedRiderForDocs.id === riderId) {
      setSelectedRiderForDocs({ ...selectedRiderForDocs, verification_status: 'rejected' });
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#1A1A1A] pb-16 md:pb-0">
      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Rider Fleet Verification & Dispatch</h2>
          <p className="text-xs text-gray-400 font-medium">
            Verify driver credentials, manage vehicle licenses, and monitor real-time online fleet availability.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="stat-card bg-white p-3 px-4 min-w-[130px] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Active Online</span>
            <span className="text-2xl font-bold tracking-tight">{activeRidersCount}</span>
          </div>
          <div className="stat-card accent bg-white p-3 px-4 min-w-[130px] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#FF5A36] block mb-0.5">Pending Verification</span>
            <span className="text-2xl font-bold text-[#FF5A36]">{pendingVerificationRiders.length}</span>
          </div>
          <div className="stat-card bg-white p-3 px-4 min-w-[130px] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Total Deliveries</span>
            <span className="text-2xl font-bold tracking-tight">{totalDeliveriesSum.toLocaleString('en-ZA')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Verification Queue & Fleet Status Monitor */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Verification Queue (Desktop Table / Mobile Cards) */}
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-sm shadow-2xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">Rider Verification Queue</h3>
            <span className="text-[10px] text-gray-400 font-mono-code font-bold uppercase tracking-wider">
              {pendingVerificationRiders.length} drivers awaiting review
            </span>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50">
                  <th className="p-3">Rider Details</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">License</th>
                  <th className="p-3">Background</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-mono-code">
                {pendingVerificationRiders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 font-sans">
                      All rider verification requests have been processed!
                    </td>
                  </tr>
                ) : (
                  pendingVerificationRiders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-sans">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              rider.avatar_url ||
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuC94OxSvW_pH8ppF62jjFNLN5AhOlf6tUcPGTuZVUgzn70Fr7S6BR_P7A2c8WYH5mNH--RoJfCHUcWlK2JoVcXW6y8M0jX5V5VU2rmB5weUqKpRjo5DOVF-EFawbvAtHwMEDxBaoc1CCfOEgMqUnLQA9YC1fdoVyjCJ9IKLDFcwU91mjqQ34-dZGjhsl8Eh89h2UhR6bXXVYZur3EiR5zF5xBkQX52qA__KJfdxWrEd75bwHnr3l04-'
                            }
                            alt={rider.full_name}
                            className="w-8 h-8 rounded-sm object-cover border border-gray-200"
                          />
                          <div>
                            <p className="font-bold text-[#1A1A1A]">{rider.full_name}</p>
                            <p className="text-[10px] text-gray-400 font-mono-code">ID: {rider.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-sans text-gray-600 capitalize font-bold text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-gray-500">
                            {rider.vehicle_type === 'motorbike'
                              ? 'two_wheeler'
                              : rider.vehicle_type === 'bicycle'
                              ? 'pedal_bike'
                              : 'directions_car'}
                          </span>
                          {rider.vehicle_type}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                            rider.license_status === 'Approved'
                              ? 'badge-active'
                              : rider.license_status === 'Expired'
                              ? 'bg-rose-100 text-rose-800'
                              : 'badge-pending'
                          }`}
                        >
                          {rider.license_status}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            rider.background_check === 'Cleared'
                              ? 'badge-active'
                              : 'badge-pending'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {rider.background_check === 'Cleared' ? 'check_circle' : 'schedule'}
                          </span>
                          {rider.background_check}
                        </span>
                      </td>
                      <td className="p-3 text-right font-sans">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(rider.id)}
                            className="px-2.5 py-1 bg-[#FF5A36] text-white rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-[#e04a29] transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setSelectedRiderForDocs(rider)}
                            className="px-2.5 py-1 border border-gray-200 text-gray-800 rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            Docs
                          </button>
                          <button
                            onClick={() => handleReject(rider.id)}
                            className="px-2.5 py-1 text-rose-800 hover:bg-rose-50 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS FOR RIDER QUEUE */}
          <div className="md:hidden p-3 space-y-3">
            {pendingVerificationRiders.length === 0 ? (
              <p className="p-4 text-center text-gray-400 text-xs">All rider requests processed!</p>
            ) : (
              pendingVerificationRiders.map((rider) => (
                <div key={rider.id} className="p-3 bg-gray-50 border border-gray-200 rounded-sm space-y-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        rider.avatar_url ||
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuC94OxSvW_pH8ppF62jjFNLN5AhOlf6tUcPGTuZVUgzn70Fr7S6BR_P7A2c8WYH5mNH--RoJfCHUcWlK2JoVcXW6y8M0jX5V5VU2rmB5weUqKpRjo5DOVF-EFawbvAtHwMEDxBaoc1CCfOEgMqUnLQA9YC1fdoVyjCJ9IKLDFcwU91mjqQ34-dZGjhsl8Eh89h2UhR6bXXVYZur3EiR5zF5xBkQX52qA__KJfdxWrEd75bwHnr3l04-'
                      }
                      alt={rider.full_name}
                      className="w-9 h-9 rounded-sm object-cover border border-gray-200"
                    />
                    <div>
                      <p className="font-bold text-xs text-[#1A1A1A]">{rider.full_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono-code">{rider.phone}</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] border-t border-gray-200 pt-2">
                    <span className="text-gray-500">Vehicle: <strong className="text-gray-800 uppercase">{rider.vehicle_type}</strong></span>
                    <span className="text-gray-500">License: <strong className="text-[#FF5A36] uppercase">{rider.license_status}</strong></span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(rider.id)}
                      className="flex-1 py-1.5 bg-[#FF5A36] text-white text-xs font-bold rounded-sm uppercase tracking-wider"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedRiderForDocs(rider)}
                      className="py-1.5 px-3 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-sm uppercase tracking-wider"
                    >
                      Docs
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fleet Status Monitor Table */}
        <div className="bg-white border border-gray-100 rounded-sm shadow-2xs flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">Fleet Status Monitor</h3>
            <span className="text-[10px] text-gray-400 font-mono-code font-bold uppercase">{riders.length} drivers</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50">
                  <th className="p-3">Rider</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {riders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-sans">
                      <p className="font-bold text-[#1A1A1A]">{rider.full_name}</p>
                      <div className="flex items-center gap-1 text-[10px] font-mono-code text-gray-400">
                        <span className="text-amber-600 font-bold">⭐ {rider.rating}</span>
                        <span>({rider.total_deliveries} jobs)</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleOnline(rider.id)}
                        className={`w-9 h-5 rounded-full mx-auto relative transition-colors cursor-pointer ${
                          rider.is_online ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                        title="Toggle Online/Offline"
                      >
                        <span
                          className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all ${
                            rider.is_online ? 'right-0.75' : 'left-0.75'
                          }`}
                        />
                      </button>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 block font-bold">
                        {rider.is_online ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {}}
                        className="text-[10px] font-bold text-[#FF5A36] uppercase underline tracking-wider hover:text-[#e04a29] cursor-pointer"
                      >
                        SMS Alert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Document Reviewer Modal */}
      {selectedRiderForDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-sm shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono-code text-gray-400 uppercase tracking-widest">Verification Inspector</span>
                <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">{selectedRiderForDocs.full_name} ({selectedRiderForDocs.id})</h3>
              </div>
              <button
                onClick={() => setSelectedRiderForDocs(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm space-y-1 font-mono-code text-gray-800">
                <p><strong>Phone:</strong> {selectedRiderForDocs.phone}</p>
                <p><strong>Email:</strong> {selectedRiderForDocs.email}</p>
                <p><strong>Vehicle:</strong> {selectedRiderForDocs.vehicle_type?.toUpperCase() || selectedRiderForDocs.vehicle_type}</p>
              </div>

              <div className="border border-gray-200 rounded-sm p-4 bg-[#1A1A1A] text-white space-y-2 text-center">
                <span className="material-symbols-outlined text-[36px] text-[#FF5A36]">badge</span>
                <p className="font-bold text-sm">South African Driver License Verified</p>
                <p className="text-gray-400 text-[11px] font-mono-code">License No: C1-984021-ZA • Status: {selectedRiderForDocs.license_status}</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => handleReject(selectedRiderForDocs.id)}
                className="px-4 py-2 border border-rose-200 text-rose-800 hover:bg-rose-50 rounded-sm font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Reject Driver
              </button>
              <button
                onClick={() => handleApprove(selectedRiderForDocs.id)}
                className="px-5 py-2 bg-[#FF5A36] text-white hover:bg-[#e04a29] rounded-sm font-bold text-xs uppercase tracking-wider shadow-2xs cursor-pointer"
              >
                Approve Driver Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
