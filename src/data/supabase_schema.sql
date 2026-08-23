-- ===================================================
-- LocalEats SA - Supabase PostgreSQL Database Schema
-- Run this script in your Supabase SQL Editor
-- ===================================================

-- 1. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT DEFAULT 'Cape Town',
    suburb TEXT DEFAULT 'CBD',
    category TEXT DEFAULT 'General',
    is_active BOOLEAN DEFAULT true,
    lat NUMERIC(9,6) DEFAULT -33.9249,
    lng NUMERIC(9,6) DEFAULT 18.4241,
    delivery_fee NUMERIC(10,2) DEFAULT 25.00,
    take_rate NUMERIC(5,2) DEFAULT 15.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RIDER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.rider_profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_online BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'available',
    vehicle_type TEXT DEFAULT 'motorbike',
    verification_status TEXT DEFAULT 'approved',
    license_status TEXT DEFAULT 'Approved',
    background_check TEXT DEFAULT 'Cleared',
    rating NUMERIC(3,2) DEFAULT 4.8,
    rating_count INTEGER DEFAULT 100,
    total_earnings NUMERIC(12,2) DEFAULT 15000.00,
    total_deliveries INTEGER DEFAULT 200,
    current_latitude NUMERIC(9,6) DEFAULT -33.9249,
    current_longitude NUMERIC(9,6) DEFAULT 18.4241,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES public.shops(id) ON DELETE SET NULL,
    shop_name TEXT NOT NULL,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Cape Town',
    suburb TEXT DEFAULT 'CBD',
    rider_id TEXT REFERENCES public.rider_profiles(id) ON DELETE SET NULL,
    rider_name TEXT,
    product_name TEXT NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'PREPARING',
    delivery_status TEXT DEFAULT 'In Transit',
    payment_method TEXT DEFAULT 'Credit Card',
    lat NUMERIC(9,6) DEFAULT -33.9249,
    lng NUMERIC(9,6) DEFAULT 18.4241,
    shop_lat NUMERIC(9,6) DEFAULT -33.9231,
    shop_lng NUMERIC(9,6) DEFAULT 18.4195,
    delay_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENTS & SETTLEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES public.shops(id) ON DELETE SET NULL,
    entity_type TEXT DEFAULT 'Shop Partners',
    entity_name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT DEFAULT 'Bank Transfer',
    transaction_id TEXT,
    status TEXT DEFAULT 'pending',
    payment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APP ERRORS LOG TABLE
CREATE TABLE IF NOT EXISTS public.app_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_message TEXT NOT NULL,
    stack TEXT,
    context TEXT,
    service TEXT DEFAULT 'Dispatch Engine',
    level TEXT DEFAULT 'error',
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & default open policies for anon web client
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Allow public update shops" ON public.shops FOR UPDATE USING (true);
CREATE POLICY "Allow public insert shops" ON public.shops FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select riders" ON public.rider_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public update riders" ON public.rider_profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Allow public select payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow public update payments" ON public.payments FOR UPDATE USING (true);

CREATE POLICY "Allow public insert app_errors" ON public.app_errors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select app_errors" ON public.app_errors FOR SELECT USING (true);
