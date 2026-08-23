import React, { useState, useEffect } from 'react';
import { firebaseService, testFirestoreConnection } from '../services/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onRefreshData,
}) => {
  const [defaultTakeRate, setDefaultTakeRate] = useState<number>(() => {
    const saved = localStorage.getItem('localeats_default_take_rate');
    return saved ? Number(saved) : 15;
  });
  const [delayThreshold, setDelayThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('localeats_delay_threshold');
    return saved ? Number(saved) : 20;
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs?: number; message: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const projectId = firebaseService.getProjectId();
  const databaseId = firebaseService.getDatabaseId();
  const userConsoleUrl = `https://console.firebase.google.com/project/localeats-5e26e/firestore/databases/-default-/data`;

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await testFirestoreConnection();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Failed to ping Firestore endpoint',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSeedFirestore = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await firebaseService.seedInitialDatabase();
      if (res.success) {
        setSeedResult(`✅ Successfully seeded ${res.count} operational documents into Firestore.`);
        if (onShowToast) {
          onShowToast('Firestore Seeded', `${res.count} records synchronized across all collections`, 'success');
        }
        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        setSeedResult(`⚠️ Seed Notice: ${res.error || 'Check network connection'}`);
        if (onShowToast) {
          onShowToast('Seed Warning', res.error, 'error');
        }
      }
    } catch (e: any) {
      setSeedResult(`❌ Seed Error: ${e?.message}`);
      if (onShowToast) {
        onShowToast('Seed Error', e?.message, 'error');
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('localeats_default_take_rate', String(defaultTakeRate));
    localStorage.setItem('localeats_delay_threshold', String(delayThreshold));
    if (onShowToast) {
      onShowToast('Platform Config Saved', `Commission: ${defaultTakeRate}%, Delay Threshold: ${delayThreshold}m`, 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans animate-fade-in">
      <div className="bg-white border border-gray-200 w-full max-w-xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF5A36] text-[20px]">local_fire_department</span>
            <h3 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">
              Firebase Firestore Backend & Operations
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSaveSettings} className="p-5 space-y-4 text-xs overflow-y-auto flex-1 font-sans">
          {/* Primary Firebase Connection Card */}
          <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#FF5A36]">cloud_done</span>
                <span className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Cloud Firestore Status
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono-code ${
                testResult?.success ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {testResult?.success ? 'Connected & Active' : isTesting ? 'Testing...' : 'Standby'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono-code bg-white p-3 border border-orange-100 rounded-sm">
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Firebase Project ID</span>
                <span className="text-gray-800 font-bold">{projectId}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Firestore Database ID</span>
                <span className="text-gray-800 font-bold truncate block">{databaseId}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-sm font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                {isTesting ? 'Pinging...' : 'Ping Firestore'}
              </button>

              <button
                type="button"
                onClick={handleSeedFirestore}
                disabled={isSeeding}
                className="px-3 py-1.5 bg-[#FF5A36] hover:bg-[#e04a29] text-white rounded-sm font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                {isSeeding ? 'Seeding Data...' : 'Seed / Sync Live Collections'}
              </button>

              <a
                href={userConsoleUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-gray-300 hover:bg-white text-gray-700 rounded-sm font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                Open Console
              </a>
            </div>

            {/* Test result status message */}
            {testResult && (
              <div className={`p-2.5 rounded-sm text-[11px] font-mono-code font-bold flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                <span className="material-symbols-outlined text-[16px]">
                  {testResult.success ? 'check_circle' : 'error'}
                </span>
                <span>{testResult.message}</span>
              </div>
            )}

            {seedResult && (
              <div className="p-2.5 bg-white border border-gray-200 rounded-sm text-[11px] font-mono-code font-bold text-gray-800">
                {seedResult}
              </div>
            )}
          </div>

          {/* Firestore Collections Schema Overview */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-sm space-y-2">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-gray-700">inventory_2</span>
              Configured Firestore Collections
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono-code text-[11px]">
              <div className="bg-white p-2 border border-gray-200 rounded-sm">
                <span className="text-[#FF5A36] font-bold block">/shops</span>
                <span className="text-[10px] text-gray-500 font-sans">Merchant Profiles & Take-rates</span>
              </div>
              <div className="bg-white p-2 border border-gray-200 rounded-sm">
                <span className="text-[#FF5A36] font-bold block">/rider_profiles</span>
                <span className="text-[10px] text-gray-500 font-sans">Fleet Telemetry & Status</span>
              </div>
              <div className="bg-white p-2 border border-gray-200 rounded-sm">
                <span className="text-[#FF5A36] font-bold block">/orders</span>
                <span className="text-[10px] text-gray-500 font-sans">Live Dispatches & SLA</span>
              </div>
              <div className="bg-white p-2 border border-gray-200 rounded-sm">
                <span className="text-[#FF5A36] font-bold block">/rider_connections</span>
                <span className="text-[10px] text-gray-500 font-sans">Pairing Ciphers & Radii</span>
              </div>
              <div className="bg-white p-2 border border-gray-200 rounded-sm">
                <span className="text-[#FF5A36] font-bold block">/payments</span>
                <span className="text-[10px] text-gray-500 font-sans">Merchant Settlement Ledgers</span>
              </div>
              <div className="bg-white p-2 border border-gray-200 rounded-sm">
                <span className="text-emerald-700 font-bold block">Security Rules</span>
                <span className="text-[10px] text-gray-500 font-sans">Hardened & Deployed</span>
              </div>
            </div>
          </div>

          {/* Platform Operational Defaults */}
          <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-sm">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
              Platform Operational Rules
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Default Platform Commission (%)
                </label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={defaultTakeRate}
                  onChange={(e) => setDefaultTakeRate(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-sm p-2 bg-white font-mono-code text-gray-900 text-xs font-bold focus:border-[#FF5A36] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Dispatch SLA Delay Threshold (mins)
                </label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={delayThreshold}
                  onChange={(e) => setDelayThreshold(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-sm p-2 bg-white font-mono-code text-gray-900 text-xs font-bold focus:border-[#FF5A36] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex justify-end gap-2 border-t border-gray-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-sm font-medium text-xs hover:bg-gray-50 uppercase tracking-wider cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FF5A36] text-white hover:bg-[#e04a29] rounded-sm font-bold text-xs uppercase tracking-wider shadow-2xs cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
