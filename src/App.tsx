import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TabType,
  Shop,
  Order,
  RiderProfile,
  PaymentSettlement,
  ShopStatus,
  VerificationStatus,
  ToastNotification,
  ToastType,
} from './types';
import { dbService } from './services/db';
import { firebaseService, ensureAuth } from './services/firebase';
import { NavigationSidebar } from './components/NavigationSidebar';
import { TopHeader } from './components/TopHeader';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { ShopApprovals } from './components/ShopApprovals';
import { FleetMap } from './components/FleetMap';
import { RiderFleet } from './components/RiderFleet';
import { PairingManager } from './components/PairingManager';
import { PayoutsHub } from './components/PayoutsHub';
import { NewAlertModal } from './components/NewAlertModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/ToastContainer';
import { DashboardSkeleton } from './components/DashboardSkeleton';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data State
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [payments, setPayments] = useState<PaymentSettlement[]>([]);

  // Modal State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [reassignTargetOrder, setReassignTargetOrder] = useState<Order | null>(null);

  // Toast System State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (title: string, message?: string, type: ToastType = 'info') => {
    const newToast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      removeToast(newToast.id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize Firebase and load initial data
  useEffect(() => {
    ensureAuth();
    loadAllData();

    // Subscribe to live Firestore snapshots
    const unsubOrders = firebaseService.subscribeToOrders((liveOrders) => {
      if (liveOrders && liveOrders.length > 0) {
        setOrders(liveOrders);
      }
    });

    const unsubRiders = firebaseService.subscribeToRiders((liveRiders) => {
      if (liveRiders && liveRiders.length > 0) {
        setRiders(liveRiders);
      }
    });

    const unsubShops = firebaseService.subscribeToShops((liveShops) => {
      if (liveShops && liveShops.length > 0) {
        setShops(liveShops);
      }
    });

    return () => {
      unsubOrders();
      unsubRiders();
      unsubShops();
    };
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const loadedShops = await dbService.getShops();
      const loadedOrders = await dbService.getOrders();
      const loadedRiders = await dbService.getRiders();
      const loadedPayments = await dbService.getPayments();

      setShops(loadedShops || []);
      setOrders(loadedOrders || []);
      setRiders(loadedRiders || []);
      setPayments(loadedPayments || []);
    } finally {
      setIsLoading(false);
    }
  };

  // --- MUTATION HANDLERS ---
  const handleUpdateShopStatus = async (shopId: string, status: ShopStatus) => {
    const shop = shops.find((s) => s.id === shopId);
    const updated = await dbService.updateShopStatus(shopId, status);
    setShops(updated);
    addToast(
      `Merchant ${status === 'active' ? 'Approved' : 'Status Updated'}`,
      `${shop?.name || shopId} status changed to ${status?.toUpperCase() || status}`,
      status === 'active' ? 'success' : 'warning'
    );
  };

  const handleUpdateShopTakeRate = async (shopId: string, takeRate: number) => {
    const shop = shops.find((s) => s.id === shopId);
    const updated = await dbService.updateShopTakeRate(shopId, takeRate);
    setShops(updated);
    addToast(
      'Take-Rate Updated',
      `${shop?.name || shopId} set to ${takeRate}% platform commission`,
      'success'
    );
  };

  const handleUpdateShopDetails = async (shopId: string, details: Partial<Shop>) => {
    const shop = shops.find((s) => s.id === shopId);
    const updated = await dbService.updateShopDetails(shopId, details);
    setShops(updated);
    addToast(
      'Merchant Details Saved',
      `Information for ${shop?.name || shopId} updated in Firestore`,
      'success'
    );
  };

  const handleAddShop = async (shopData: Partial<Shop>) => {
    const newShop = await dbService.addShop(shopData);
    const updated = await dbService.getShops();
    setShops(updated);
    addToast(
      'New Merchant Onboarded',
      `${newShop.name} successfully registered into Firestore`,
      'success'
    );
  };

  const handleToggleRiderOnline = async (riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    const updated = await dbService.toggleRiderOnline(riderId);
    setRiders(updated);
    const isNowOnline = updated.find((r) => r.id === riderId)?.is_online;
    addToast(
      'Rider Status Changed',
      `${rider?.full_name} is now ${isNowOnline ? 'ONLINE' : 'OFFLINE'}`,
      isNowOnline ? 'success' : 'info'
    );
  };

  const handleUpdateRiderVerification = async (riderId: string, status: VerificationStatus) => {
    const rider = riders.find((r) => r.id === riderId);
    const updated = await dbService.updateRiderVerification(riderId, status);
    setRiders(updated);
    addToast(
      `Rider Verification ${status === 'approved' ? 'Passed' : status?.toUpperCase() || status}`,
      `Credentials for ${rider?.full_name} marked as ${status?.toUpperCase() || status}`,
      status === 'approved' ? 'success' : 'warning'
    );
  };

  const handleReassignRider = async (orderId: string, newRiderId: string, newRiderName: string) => {
    const updatedOrders = await dbService.reassignOrderRider(orderId, newRiderId, newRiderName);
    setOrders(updatedOrders);
    const updatedRiders = await dbService.getRiders();
    setRiders(updatedRiders);
    addToast(
      'Dispatch Re-assigned',
      `Order ${orderId} reassigned to ${newRiderName}`,
      'success'
    );
  };

  const handleMarkPaymentCompleted = async (paymentId: string, transactionId: string) => {
    const updated = await dbService.markPaymentCompleted(paymentId, transactionId);
    setPayments(updated);
    addToast(
      'Payment Dispersal Complete',
      `Settlement ${paymentId} completed with Ref: ${transactionId}`,
      'success'
    );
  };

  const handleExecuteBatchPayout = async () => {
    const updated = await dbService.executeBatchPayout();
    setPayments(updated);
    addToast(
      'Batch Dispersal Successful',
      'All pending settlements executed via banking gateway',
      'success'
    );
  };

  const handleSendAlert = (title: string, message: string, target: string) => {
    addToast('Broadcast Sent', `"${title}" sent to ${target}`, 'success');
  };

  const handleExportReports = () => {
    const reportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalShops: shops.length,
        activeShops: shops.filter((s) => s.status === 'active').length,
        totalOrders: orders.length,
        onlineRiders: riders.filter((r) => r.is_online).length,
      },
      shops,
      orders,
      riders,
      payments,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LocalEats_Admin_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Report Exported', 'JSON executive report downloaded to your device', 'success');
  };

  // Filter entities by global search query if present
  const searchedShops = shops.filter(
    (s) =>
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.suburb.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchedOrders = orders.filter(
    (o) =>
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchedRiders = riders.filter(
    (r) =>
      !searchQuery ||
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApprovalsCount = shops.filter((s) => s.status === 'pending' || s.status === 'review').length;
  const delayedOrdersCount = orders.filter((o) => o.status === 'DELAYED').length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] flex font-sans overflow-x-hidden">
      {/* Side Navigation Bar */}
      <NavigationSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        delayedOrdersCount={delayedOrdersCount}
        onExportReports={handleExportReports}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-0 md:ml-[240px] flex flex-col min-h-screen relative bg-[#F8F9FA]">
        {/* Top Header Bar */}
        <TopHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAlertModal={() => setIsAlertModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          unreadNotificationsCount={delayedOrdersCount + pendingApprovalsCount}
        />

        {/* Main View Area */}
        <main className="flex-1 mt-16 p-4 md:p-8 pb-20 md:pb-8 max-w-[1600px] w-full mx-auto relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoading ? 'loading' : activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {isLoading ? (
                <DashboardSkeleton />
              ) : (
                <>
                  {activeTab === 'overview' && (
                    <ExecutiveOverview
                      shops={searchedShops}
                      orders={searchedOrders}
                      riders={searchedRiders}
                      onNavigateToMap={() => setActiveTab('live_map')}
                      onNavigateToApprovals={() => setActiveTab('approvals')}
                      onNavigateToRiders={() => setActiveTab('rider_fleet')}
                      onReassignOrder={(order) => {
                        setReassignTargetOrder(order);
                        setActiveTab('live_map');
                      }}
                    />
                  )}

                  {activeTab === 'approvals' && (
                    <ShopApprovals
                      shops={searchedShops}
                      onUpdateStatus={handleUpdateShopStatus}
                      onUpdateTakeRate={handleUpdateShopTakeRate}
                      onUpdateShopDetails={handleUpdateShopDetails}
                      onAddShop={handleAddShop}
                    />
                  )}

                  {activeTab === 'live_map' && (
                    <FleetMap
                      shops={searchedShops}
                      orders={searchedOrders}
                      riders={searchedRiders}
                      onReassignRider={handleReassignRider}
                      reassignTargetOrder={reassignTargetOrder}
                      clearReassignTarget={() => setReassignTargetOrder(null)}
                    />
                  )}

                  {activeTab === 'rider_fleet' && (
                    <RiderFleet
                      riders={searchedRiders}
                      onToggleOnline={handleToggleRiderOnline}
                      onUpdateVerification={handleUpdateRiderVerification}
                    />
                  )}

                  {activeTab === 'pairings' && (
                    <PairingManager
                      shops={searchedShops}
                      riders={searchedRiders}
                      onShowToast={addToast}
                    />
                  )}

                  {activeTab === 'financials' && (
                    <PayoutsHub
                      payments={payments}
                      onMarkCompleted={handleMarkPaymentCompleted}
                      onExecuteBatchPayout={handleExecuteBatchPayout}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Footer Stats Bar */}
        <footer className="mt-auto h-11 bg-white border-t border-gray-200 flex items-center px-8 justify-between text-xs font-sans text-gray-500">
          <div className="flex items-center gap-6">
            <span className="font-bold text-gray-800">LocalEats Super Admin</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline font-mono-code text-[11px]">Firebase Cloud Firestore Operations</span>
          </div>
          <span className="text-[11px] font-mono-code text-gray-400">v1.6.0 (Firestore Connected)</span>
        </footer>
      </div>

      {/* Global Modals */}
      <NewAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onSendAlert={handleSendAlert}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onShowToast={addToast}
        onRefreshData={loadAllData}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
