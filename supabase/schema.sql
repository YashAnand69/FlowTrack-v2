-- ==============================================================================
-- FlowTrack SaaS Database Schema & Row Level Security (Supabase PostgreSQL)
-- Production-ready schema with typed constraints, cascades, indexes, and RLS.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLES CREATION
-- ==============================================================================

-- 2.1 PROFILES TABLE
-- Stores user-specific settings, business identity, branding, and currency preferences.
-- Tied 1:1 to auth.users. Automatically populated via trigger upon signup.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT DEFAULT 'My Freelance Business',
    business_email TEXT,
    logo_url TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    tax_rate NUMERIC(5,2) DEFAULT 0,
    payment_terms TEXT DEFAULT 'Payment due within 14 days of invoice date.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 CLIENTS TABLE
-- Stores freelancer client directory records.
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 INVOICES TABLE
-- Stores invoice records with foreign key links to auth.users and clients.
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')) DEFAULT 'draft',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 INVOICE ITEMS TABLE
-- Stores individual line items on an invoice with automatic cascade deletion.
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    rate NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (rate >= 0),
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4.1 PROFILES RLS POLICIES
-- ------------------------------------------------------------------------------
-- Policy 1: Users can view their own profile.
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile.
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile.
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Users can delete their own profile.
CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 4.2 CLIENTS RLS POLICIES
-- ------------------------------------------------------------------------------
-- Policy 1: Users can only see clients they created.
CREATE POLICY "Users can select own clients"
    ON public.clients FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can only insert clients assigned to their user ID.
CREATE POLICY "Users can insert own clients"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can only update their own clients.
CREATE POLICY "Users can update own clients"
    ON public.clients FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can only delete their own clients.
CREATE POLICY "Users can delete own clients"
    ON public.clients FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4.3 INVOICES RLS POLICIES
-- ------------------------------------------------------------------------------
-- Policy 1: Users can only query their own invoices.
CREATE POLICY "Users can select own invoices"
    ON public.invoices FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can create invoices bound to their user ID.
CREATE POLICY "Users can insert own invoices"
    ON public.invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own invoices.
CREATE POLICY "Users can update own invoices"
    ON public.invoices FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own invoices.
CREATE POLICY "Users can delete own invoices"
    ON public.invoices FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4.4 INVOICE ITEMS RLS POLICIES
-- ------------------------------------------------------------------------------
-- Policy 1: Users can view items belonging to an invoice they own.
CREATE POLICY "Users can select own invoice items"
    ON public.invoice_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE public.invoices.id = public.invoice_items.invoice_id
            AND public.invoices.user_id = auth.uid()
        )
    );

-- Policy 2: Users can add line items only to invoices they own.
CREATE POLICY "Users can insert own invoice items"
    ON public.invoice_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE public.invoices.id = public.invoice_items.invoice_id
            AND public.invoices.user_id = auth.uid()
        )
    );

-- Policy 3: Users can update line items belonging to their invoices.
CREATE POLICY "Users can update own invoice items"
    ON public.invoice_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE public.invoices.id = public.invoice_items.invoice_id
            AND public.invoices.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE public.invoices.id = public.invoice_items.invoice_id
            AND public.invoices.user_id = auth.uid()
        )
    );

-- Policy 4: Users can delete line items from their invoices.
CREATE POLICY "Users can delete own invoice items"
    ON public.invoice_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE public.invoices.id = public.invoice_items.invoice_id
            AND public.invoices.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 5. AUTOMATED TRIGGER: NEW USER REGISTRATION PROFILE GENERATOR
-- ==============================================================================
-- Automatically creates a public.profiles row when a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, business_name, business_email, currency)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Freelance Business'),
        NEW.email,
        'USD'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing immediately after INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. STORAGE BUCKET CONFIGURATION (FOR LOGO UPLOADS)
-- ==============================================================================
-- Insert logos bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos to their own folder (named by user_id)
CREATE POLICY "Users can upload their own logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'logos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own logos
CREATE POLICY "Users can update their own logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'logos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Allow public read access to logos
CREATE POLICY "Public can view logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'logos');
