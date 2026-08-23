import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  desc: string;
  type: 'order' | 'merchant' | 'system' | 'payout';
  read: boolean;
}

interface TopHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAlertModal: () => void;
  onOpenSettings: () => void;
  unreadNotificationsCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenAlertModal,
  onOpenSettings,
  unreadNotificationsCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'New Merchant Onboarded',
      time: '2m ago',
      desc: "Nando's Khayelitsha submitted compliance documents for verification.",
      type: 'merchant',
      read: false,
    },
    {
      id: '2',
      title: 'Delayed Order Alert',
      time: '10m ago',
      desc: 'Order #ORD-9924 exceeds 30m threshold in Soweto East dispatch sector.',
      type: 'order',
      read: false,
    },
    {
      id: '3',
      title: 'Batch Settlement Dispersal',
      time: '45m ago',
      desc: 'R42,850.00 disbursed across 18 merchant bank accounts via FNB API.',
      type: 'payout',
      read: false,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length + unreadNotificationsCount;

  return (
    <header className="fixed top-0 left-0 md:left-[240px] w-full md:w-[calc(100%-240px)] h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8 z-20 font-sans shadow-2xs">
      {/* Left section: App Title & Search */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="w-7 h-7 shrink-0 drop-shadow-xs" />
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Executive Portal</h1>
        </div>

        {/* Global Search */}
        <div className="relative w-80 hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shops, riders, orders..."
            className="w-full pl-9 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36]/20 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right section: Actions & Notifications */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Broadcast Announcement Button */}
        <button
          onClick={onOpenAlertModal}
          className="text-xs font-semibold bg-[#FF5A36] text-white px-3.5 py-1.5 md:px-4 md:py-2 rounded-sm shadow-xs hover:bg-[#e04a29] transition-all flex items-center gap-1.5 uppercase tracking-wider active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add_alert</span>
          <span className="hidden sm:inline">ANNOUNCEMENT</span>
        </button>

        <div className="h-4 w-[1px] bg-gray-300" />

        {/* Interactive Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-gray-600 hover:text-[#FF5A36] rounded-sm transition-colors relative active:scale-90 cursor-pointer"
            title="Notification Center"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF5A36] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Interactive Notification Center Tray */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-sm shadow-2xl py-2 z-50 font-sans animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-xs text-[#1A1A1A] uppercase tracking-wider">
                  Platform Notifications
                </span>
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-[#FF5A36] font-bold uppercase tracking-wider hover:underline cursor-pointer"
                >
                  Clear Unread
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 transition-colors ${n.read ? 'bg-white opacity-70' : 'bg-orange-50/40'}`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36]" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono-code">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile & Settings Trigger */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
          title="Account Settings"
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6pGeOgPlr8BR12jtb77KONghkZIXOSeFLg0GF79_IoFD0le_h0zeSJnU20NR5BVt3MuTNIGRPuLvwXDJSAHKuRs2ej5XVSKTw96UtfZt0KbZWELkKhsTJTbMIrpwc2cnwcDPExHMbtvW6jpCv8Z30R_nVOSi_l1euiQhduPwI2G9hv8s3i6FzQDZ_74TVdfRGWwdvMePaaR7uqHcHw0_D4YrF0xcwc8oqQU6t01HBJ1tnBNaQeiVf"
            alt="Director Profile"
            className="w-7 h-7 rounded-full border border-gray-200 object-cover"
          />
          <span className="hidden xl:block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
            Admin Alpha
          </span>
        </button>
      </div>
    </header>
  );
};
