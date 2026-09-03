export type TabType = 
  | 'overview' 
  | 'approvals' 
  | 'live_map' 
  | 'rider_fleet' 
  | 'pairings'
  | 'financials';

export type ShopStatus = 'pending' | 'active' | 'suspended' | 'review';

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  suburb: string;
  category: string;
  is_active: boolean;
  status: ShopStatus;
  lat: number;
  lng: number;
  delivery_fee: number;
  take_rate: number; // e.g. 15%
  created_at: string;
  total_orders_count?: number;
  gross_revenue?: number;
}

export interface ShopPayoutInfo {
  shop_id: string;
  bank_details: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending'
  | 'preparing'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'PREPARING'
  | 'ON THE WAY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'CANCELLED';

export interface Order {
  id: string;
  shop_id: string;
  shop_name: string;
  user_id?: string;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  suburb: string;
  rider_id: string | null;
  rider_name?: string;
  product_name: string;
  total_price: number;
  status: OrderStatus;
  delivery_status: string;
  payment_method: 'Cash on Delivery' | 'Card' | 'Instant EFT' | 'Bank Transfer' | '1Voucher' | 'OTT Cash' | 'Credit Card';
  lat: number;
  lng: number;
  shop_lat: number;
  shop_lng: number;
  delay_minutes?: number;
  created_at: string;
}

export type VehicleType = 'motorbike' | 'bicycle' | 'car';
export type VerificationStatus = 'pending' | 'approved' | 'suspended' | 'rejected' | 'in_progress';

export interface RiderProfile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  is_online: boolean;
  status: 'available' | 'busy' | 'offline' | 'suspended';
  vehicle_type: VehicleType;
  verification_status: VerificationStatus;
  license_status: 'Approved' | 'Pending Review' | 'Under Review' | 'Expired';
  background_check: 'Cleared' | 'In Progress' | 'Pending' | 'Flagged';
  rating: number;
  rating_count: number;
  total_earnings: number;
  total_deliveries: number;
  current_latitude: number;
  current_longitude: number;
  battery_level?: number;
  avatar_url?: string;
  joined_date: string;
}

export interface RiderConnection {
  id: string;
  shop_id: string;
  shop_name: string;
  rider_id: string;
  rider_name: string;
  pairing_cipher: string;
  status: 'active' | 'pending' | 'revoked' | 'expired';
  paired_at: string;
  exclusive_radius_km?: number;
}

export interface PaymentSettlement {
  id: string;
  shop_id?: string;
  rider_id?: string;
  entity_type: 'Shop Partners' | 'Rider Fleet';
  entity_name: string;
  gross_revenue: number;
  commission_rate: number;
  commission_amount: number;
  net_payout: number;
  payment_method: 'Cash on Delivery' | 'Bank Transfer' | '1Voucher' | 'OTT Cash' | 'Instant EFT';
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'paid' | 'processing';
  payment_date: string;
  currency: string;
}

export interface AppErrorLog {
  id: string;
  error_message: string;
  stack: string;
  context: string;
  level: 'error' | 'warning' | 'critical';
  service: 'Dispatch Engine' | 'Payment Gateway' | 'Database' | 'SMS Gateway' | 'Auth Service';
  created_at: string;
  resolved: boolean;
}

export interface SystemHealth {
  database: 'operational' | 'degraded' | 'down';
  dispatch_engine: 'operational' | 'degraded' | 'down';
  payment_gateway: 'operational' | 'degraded' | 'down';
  sms_gateway: 'operational' | 'degraded' | 'down';
  storage: 'operational' | 'degraded' | 'down';
  latency_ms: number;
  active_connections: number;
  last_checked: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

export interface FirebaseConfigState {
  projectId: string;
  databaseId: string;
  apiKey: string;
  authDomain: string;
  isConnected: boolean;
  isCustomConfig: boolean;
}
