import { Shop, Order, RiderProfile, PaymentSettlement, AppErrorLog, SystemHealth, ShopStatus, VerificationStatus, RiderConnection } from '../types';
import { INITIAL_SHOPS, INITIAL_RIDERS, INITIAL_ORDERS, INITIAL_PAYMENTS, INITIAL_ERRORS, INITIAL_SYSTEM_HEALTH, INITIAL_CONNECTIONS } from '../data/mockData';
import { firebaseService } from './firebase';

// Keys for LocalStorage Cache
const STORAGE_KEYS = {
  SHOPS: 'localeats_admin_shops_v3',
  RIDERS: 'localeats_admin_riders_v3',
  ORDERS: 'localeats_admin_orders_v3',
  PAYMENTS: 'localeats_admin_payments_v3',
  CONNECTIONS: 'localeats_admin_connections_v3',
  ERRORS: 'localeats_admin_errors_v3'
};

// Local cache helpers
function getLocalItem<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage`, e);
    return defaultData;
  }
}

function setLocalItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage`, e);
  }
}

// Unified Database Service (Firestore + Resilient Cache)
export const dbService = {
  // --- SHOPS ---
  async getShops(): Promise<Shop[]> {
    // Attempt to fetch from Firestore first
    const firestoreShops = await firebaseService.fetchShops();
    if (firestoreShops && firestoreShops.length > 0) {
      setLocalItem(STORAGE_KEYS.SHOPS, firestoreShops);
      return firestoreShops;
    }
    return getLocalItem<Shop[]>(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
  },

  async updateShopStatus(shopId: string, status: ShopStatus): Promise<Shop[]> {
    const shops = getLocalItem<Shop[]>(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
    const updated = shops.map((s) => {
      if (s.id === shopId) {
        return {
          ...s,
          status,
          is_active: status === 'active'
        };
      }
      return s;
    });
    setLocalItem(STORAGE_KEYS.SHOPS, updated);

    // Sync with Firestore in background
    const target = updated.find((s) => s.id === shopId);
    if (target) {
      firebaseService.saveShop(target);
    }
    return updated;
  },

  async updateShopTakeRate(shopId: string, takeRate: number): Promise<Shop[]> {
    const shops = getLocalItem<Shop[]>(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
    const updated = shops.map((s) => (s.id === shopId ? { ...s, take_rate: takeRate } : s));
    setLocalItem(STORAGE_KEYS.SHOPS, updated);

    const target = updated.find((s) => s.id === shopId);
    if (target) {
      firebaseService.saveShop(target);
    }
    return updated;
  },

  async updateShopDetails(shopId: string, details: Partial<Shop>): Promise<Shop[]> {
    const shops = getLocalItem<Shop[]>(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
    const updated = shops.map((s) => (s.id === shopId ? { ...s, ...details } : s));
    setLocalItem(STORAGE_KEYS.SHOPS, updated);

    const target = updated.find((s) => s.id === shopId);
    if (target) {
      firebaseService.saveShop(target);
    }
    return updated;
  },

  async addShop(newShopData: Partial<Shop>): Promise<Shop> {
    const shops = getLocalItem<Shop[]>(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
    const newShop: Shop = {
      id: `SHOP-${Math.floor(1000 + Math.random() * 9000)}`,
      owner_id: `OWN-${Math.floor(100 + Math.random() * 900)}`,
      name: newShopData.name || 'New Local Merchant',
      email: newShopData.email || 'partner@localeats.co.za',
      phone: newShopData.phone || '+27 21 555 0199',
      address: newShopData.address || 'Long Street',
      city: newShopData.city || 'Cape Town',
      suburb: newShopData.suburb || 'CBD',
      category: newShopData.category || 'Local Cuisine',
      is_active: newShopData.is_active ?? true,
      status: newShopData.status || 'active',
      lat: newShopData.lat || -33.9249 + (Math.random() - 0.5) * 0.05,
      lng: newShopData.lng || 18.4241 + (Math.random() - 0.5) * 0.05,
      delivery_fee: newShopData.delivery_fee || 25,
      take_rate: newShopData.take_rate || 15,
      created_at: new Date().toISOString(),
      bank_details: newShopData.bank_details || 'FNB - 62890192837',
      total_orders_count: 0,
      gross_revenue: 0
    };
    const updated = [newShop, ...shops];
    setLocalItem(STORAGE_KEYS.SHOPS, updated);
    firebaseService.saveShop(newShop);
    return newShop;
  },

  // --- RIDERS ---
  async getRiders(): Promise<RiderProfile[]> {
    const firestoreRiders = await firebaseService.fetchRiders();
    if (firestoreRiders && firestoreRiders.length > 0) {
      setLocalItem(STORAGE_KEYS.RIDERS, firestoreRiders);
      return firestoreRiders;
    }
    return getLocalItem<RiderProfile[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
  },

  async toggleRiderOnline(riderId: string): Promise<RiderProfile[]> {
    const riders = getLocalItem<RiderProfile[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    const updated = riders.map((r) => {
      if (r.id === riderId) {
        const nextOnline = !r.is_online;
        return {
          ...r,
          is_online: nextOnline,
          status: nextOnline ? ('available' as const) : ('offline' as const)
        };
      }
      return r;
    });
    setLocalItem(STORAGE_KEYS.RIDERS, updated);

    const target = updated.find((r) => r.id === riderId);
    if (target) {
      firebaseService.saveRider(target);
    }
    return updated;
  },

  async updateRiderVerification(riderId: string, verificationStatus: VerificationStatus): Promise<RiderProfile[]> {
    const riders = getLocalItem<RiderProfile[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    const updated = riders.map((r) => (r.id === riderId ? { 
      ...r, 
      verification_status: verificationStatus,
      license_status: verificationStatus === 'approved' ? ('Approved' as const) : r.license_status
    } : r));
    setLocalItem(STORAGE_KEYS.RIDERS, updated);

    const target = updated.find((r) => r.id === riderId);
    if (target) {
      firebaseService.saveRider(target);
    }
    return updated;
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    const firestoreOrders = await firebaseService.fetchOrders();
    if (firestoreOrders && firestoreOrders.length > 0) {
      setLocalItem(STORAGE_KEYS.ORDERS, firestoreOrders);
      return firestoreOrders;
    }
    return getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  async updateOrderStatus(orderId: string, status: Order['status'], deliveryStatus?: string): Promise<Order[]> {
    const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          delivery_status: deliveryStatus || o.delivery_status
        };
      }
      return o;
    });
    setLocalItem(STORAGE_KEYS.ORDERS, updated);

    const target = updated.find((o) => o.id === orderId);
    if (target) {
      firebaseService.saveOrder(target);
    }
    return updated;
  },

  async reassignOrderRider(orderId: string, newRiderId: string, newRiderName: string): Promise<Order[]> {
    const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          rider_id: newRiderId,
          rider_name: newRiderName,
          status: 'ON THE WAY' as const,
          delivery_status: `Re-assigned to ${newRiderName} (Dispatched)`,
          delay_minutes: 0
        };
      }
      return o;
    });
    setLocalItem(STORAGE_KEYS.ORDERS, updated);

    const targetOrder = updated.find((o) => o.id === orderId);
    if (targetOrder) {
      firebaseService.saveOrder(targetOrder);
    }

    // Update rider busy status
    const riders = getLocalItem<RiderProfile[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    const updatedRiders = riders.map((r) => (r.id === newRiderId ? { ...r, status: 'busy' as const } : r));
    setLocalItem(STORAGE_KEYS.RIDERS, updatedRiders);

    const targetRider = updatedRiders.find((r) => r.id === newRiderId);
    if (targetRider) {
      firebaseService.saveRider(targetRider);
    }

    return updated;
  },

  // --- RIDER CONNECTIONS & CIPHER CODES ---
  async getConnections(): Promise<RiderConnection[]> {
    const firestoreConns = await firebaseService.fetchConnections();
    if (firestoreConns && firestoreConns.length > 0) {
      setLocalItem(STORAGE_KEYS.CONNECTIONS, firestoreConns);
      return firestoreConns;
    }
    return getLocalItem<RiderConnection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
  },

  async generatePairingCipher(shopId: string, shopName: string, riderId: string, riderName: string, exclusiveRadiusKm: number = 5): Promise<RiderConnection> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'LE-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newConnection: RiderConnection = {
      id: `PAIR-${Math.floor(100 + Math.random() * 900)}`,
      shop_id: shopId,
      shop_name: shopName,
      rider_id: riderId,
      rider_name: riderName,
      pairing_cipher: code,
      status: 'active',
      paired_at: new Date().toISOString(),
      exclusive_radius_km: exclusiveRadiusKm
    };

    const connections = getLocalItem<RiderConnection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    const updated = [newConnection, ...connections];
    setLocalItem(STORAGE_KEYS.CONNECTIONS, updated);
    firebaseService.saveConnection(newConnection);
    return newConnection;
  },

  async updateConnectionStatus(connectionId: string, status: RiderConnection['status']): Promise<RiderConnection[]> {
    const connections = getLocalItem<RiderConnection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    const updated = connections.map((c) => (c.id === connectionId ? { ...c, status } : c));
    setLocalItem(STORAGE_KEYS.CONNECTIONS, updated);

    const target = updated.find((c) => c.id === connectionId);
    if (target) {
      firebaseService.saveConnection(target);
    }
    return updated;
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<PaymentSettlement[]> {
    const firestorePayments = await firebaseService.fetchPayments();
    if (firestorePayments && firestorePayments.length > 0) {
      setLocalItem(STORAGE_KEYS.PAYMENTS, firestorePayments);
      return firestorePayments;
    }
    return getLocalItem<PaymentSettlement[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  },

  async markPaymentCompleted(paymentId: string, transactionId: string): Promise<PaymentSettlement[]> {
    const payments = getLocalItem<PaymentSettlement[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    const updated = payments.map((p) => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'completed' as const,
          transaction_id: transactionId || `TX-${Math.floor(Math.random() * 899999 + 100000)}`
        };
      }
      return p;
    });
    setLocalItem(STORAGE_KEYS.PAYMENTS, updated);

    const target = updated.find((p) => p.id === paymentId);
    if (target) {
      firebaseService.savePayment(target);
    }
    return updated;
  },

  async executeBatchPayout(): Promise<PaymentSettlement[]> {
    const payments = getLocalItem<PaymentSettlement[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    const updated = payments.map((p) => {
      if (p.status === 'pending') {
        const item = {
          ...p,
          status: 'completed' as const,
          transaction_id: p.transaction_id || `BATCH-TX-${Math.floor(Math.random() * 899999 + 100000)}`
        };
        firebaseService.savePayment(item);
        return item;
      }
      return p;
    });
    setLocalItem(STORAGE_KEYS.PAYMENTS, updated);
    return updated;
  },

  // --- APP ERRORS & LOGS ---
  async getErrorLogs(): Promise<AppErrorLog[]> {
    return getLocalItem<AppErrorLog[]>(STORAGE_KEYS.ERRORS, INITIAL_ERRORS);
  },

  async logAppError(message: string, stack: string, context: string, service: AppErrorLog['service'], level: AppErrorLog['level'] = 'error'): Promise<AppErrorLog[]> {
    const logs = getLocalItem<AppErrorLog[]>(STORAGE_KEYS.ERRORS, INITIAL_ERRORS);
    const newLog: AppErrorLog = {
      id: `ERR-${Math.floor(Math.random() * 8999 + 1000)}`,
      error_message: message,
      stack,
      context,
      level,
      service,
      created_at: new Date().toISOString(),
      resolved: false
    };
    const updated = [newLog, ...logs];
    setLocalItem(STORAGE_KEYS.ERRORS, updated);
    return updated;
  },

  async resolveErrorLog(id: string): Promise<AppErrorLog[]> {
    const logs = getLocalItem<AppErrorLog[]>(STORAGE_KEYS.ERRORS, INITIAL_ERRORS);
    const updated = logs.map((l) => (l.id === id ? { ...l, resolved: true } : l));
    setLocalItem(STORAGE_KEYS.ERRORS, updated);
    return updated;
  },

  async clearAllErrorLogs(): Promise<AppErrorLog[]> {
    setLocalItem(STORAGE_KEYS.ERRORS, []);
    return [];
  },

  getSystemHealth(): SystemHealth {
    return INITIAL_SYSTEM_HEALTH;
  }
};
