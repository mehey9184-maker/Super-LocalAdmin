import React, { useState } from 'react';

interface NewAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAlert: (title: string, message: string, target: string) => void;
}

export const NewAlertModal: React.FC<NewAlertModalProps> = ({
  isOpen,
  onClose,
  onSendAlert,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState('ALL');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill out alert title and message content.');
      return;
    }
    onSendAlert(title, message, targetGroup);
    setTitle('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF5A36] text-[20px]">add_alert</span>
            <h3 className="font-bold text-slate-900 text-sm">Broadcast System Alert</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Target Audience
            </label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="w-full border border-slate-200 rounded p-2.5 bg-white text-slate-800 font-medium text-xs focus:border-[#FF5A36] outline-none"
            >
              <option value="ALL">All Users (Merchants + Riders + Customers)</option>
              <option value="MERCHANTS">Active Shop Merchants Only</option>
              <option value="RIDERS">Online Delivery Fleet Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Alert Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Heavy Rain Surge Surcharge Active in Cape Town CBD"
              className="w-full border border-slate-200 rounded p-2.5 bg-white text-slate-800 text-xs focus:border-[#FF5A36] outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Message Content
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detailed operational notification instructions broadcasted to active mobile apps..."
              className="w-full border border-slate-200 rounded p-2.5 bg-white text-slate-800 text-xs focus:border-[#FF5A36] outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
            Alerts are immediately pushed via WebSocket and FCM push notification channels.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded font-medium text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FF5A36] text-white hover:bg-[#e04a29] rounded font-semibold text-xs shadow-sm"
            >
              Broadcast Alert Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
