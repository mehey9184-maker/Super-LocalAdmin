import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType } from '../types';
import { BrandLogo } from './BrandLogo';

interface NavigationSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingApprovalsCount: number;
  delayedOrdersCount: number;
  onExportReports: () => void;
  onOpenSettings: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  delayedOrdersCount,
  onExportReports,
  onOpenSettings,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'overview' as TabType,
      label: 'Dashboard',
      icon: 'dashboard',
      badge: null,
    },
    {
      id: 'approvals' as TabType,
      label: 'Shop Approvals',
      icon: 'store',
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      badgeColor: 'bg-[#FF5A36] text-white',
    },
    {
      id: 'live_map' as TabType,
      label: 'Live Dispatch Map',
      icon: 'location_on',
      badge: delayedOrdersCount > 0 ? delayedOrdersCount : null,
      badgeColor: 'bg-amber-500 text-white animate-pulse',
    },
    {
      id: 'rider_fleet' as TabType,
      label: 'Rider Verification',
      icon: 'two_wheeler',
      badge: null,
    },
    {
      id: 'pairings' as TabType,
      label: 'Pairing Ciphers',
      icon: 'vpn_key',
      badge: null,
    },
    {
      id: 'financials' as TabType,
      label: 'Financial Payouts',
      icon: 'credit_card',
      badge: null,
    },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[240px] bg-[#121212] text-white flex-col z-30 font-sans shrink-0 border-r border-white/5">
        {/* Brand Header */}
        <div className="p-6 pb-5">
          <div className="flex items-center gap-3 mb-1">
            <BrandLogo className="w-9 h-9 shrink-0 drop-shadow-md" />
            <div>
              <span className="text-white font-extrabold tracking-tight text-lg block leading-none">LOCALEATS</span>
              <span className="text-[9px] text-[#FF5400] font-mono-code font-bold uppercase tracking-wider block mt-0.5">
                SOUTH AFRICA
              </span>
            </div>
          </div>
          <p className="text-[9px] text-gray-500 font-mono-code uppercase tracking-widest pl-12">
            Super Admin Platform
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-none text-sm font-semibold transition-colors text-left cursor-pointer active:scale-98 ${
                  isActive
                    ? 'border-r-3 border-[#FF5A36] text-[#FF5A36] bg-[#FF5A36]/10'
                    : 'text-gray-400 hover:text-[#FF5A36] hover:bg-[#FF5A36]/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-[18px] opacity-80"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer & User Profile */}
        <div className="mt-auto p-6 border-t border-white/10 space-y-4">
          <button
            onClick={onExportReports}
            className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-semibold py-2 px-3 rounded-sm transition-colors flex items-center justify-center gap-2 border border-white/10 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-[#FF5A36]">download</span>
            Export Reports
          </button>

          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe0Z1HMXVo03xQflVpVncrSEudE0QWYyIHDPcLx__dqgBU6d-UFNV5pcCBaf2e9UIKZoberQr0M8zEu2PxAR8gDTp5D2bHuWLpakBAvSoASFKIt4GQtETEuIU0YnlawvsW6d1c92duTGmKFmnGBLVL7KlRiE-4Pg8gUnJfzNRzHvEuT2N44wsnCijx1QedaX3vVd64NcIfcjdpTqrKeJEnWBRtFNPXUvQnWQJ34YCWThioa9IUfja9"
              alt="Admin Alpha Avatar"
              className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white uppercase tracking-wider truncate">Admin Alpha</p>
              <p className="text-[10px] text-gray-500 truncate">Super User</p>
            </div>
          </div>

          <div className="pt-2 flex justify-between border-t border-white/10 text-[11px] text-gray-400">
            <button onClick={onOpenSettings} className="flex items-center gap-1 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[14px]">settings</span>
              Settings
            </button>
            <span className="text-[10px] text-gray-500 font-mono-code">v1.5.0</span>
          </div>
        </div>
      </aside>

      {/* MOBILE FOOTER NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121212] border-t border-white/10 z-40 flex items-center justify-around px-1 font-sans shadow-2xl">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.88, opacity: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative cursor-pointer ${
                isActive ? 'text-[#FF5400]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.badge !== null && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] text-[8px] font-bold rounded-full bg-[#FF5A36] text-white flex items-center justify-center px-0.5 border border-[#121212]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold tracking-tight mt-0.5 truncate max-w-[60px]">
                {item.label.split(' ')[0]}
              </span>
              {isActive && (
                <motion.span
                  layoutId="activeTabIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#FF5400] rounded-full"
                />
              )}
            </motion.button>
          );
        })}

        <motion.button
          whileTap={{ scale: 0.88, opacity: 0.8 }}
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 text-gray-400 hover:text-gray-200"
        >
          <span className="material-symbols-outlined text-[22px]">more_horiz</span>
          <span className="text-[9px] font-bold tracking-tight mt-0.5">More</span>
        </motion.button>
      </div>

      {/* MOBILE MORE MENU SHEET */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="bg-[#181818] border-t border-white/15 rounded-t-2xl p-5 text-white space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <BrandLogo className="w-6 h-6" />
                  <span className="font-extrabold text-sm text-white tracking-wide">
                    LOCALEATS SUPER ADMIN
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-full"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onExportReports();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-3 bg-white/10 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#FF5A36]">download</span>
                  Export Data
                </button>
                <button
                  onClick={() => {
                    onOpenSettings();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-3 bg-white/10 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">settings</span>
                  Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
