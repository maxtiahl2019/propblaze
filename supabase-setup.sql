-- ─── PropBlaze: Agencies Table ────────────────────────────────────────────────
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create agencies table
CREATE TABLE IF NOT EXISTS public.agencies (
  id                        TEXT PRIMARY KEY,               -- PB-AG-XXXX-XXXX
  company_name              TEXT NOT NULL,
  agent_name                TEXT,
  email                     TEXT NOT NULL UNIQUE,
  phone                     TEXT,
  website                   TEXT,
  vat_number                TEXT,

  country                   TEXT NOT NULL,                  -- ISO-2: 'RS', 'DE'
  city                      TEXT NOT NULL DEFAULT '',
  flag                      TEXT NOT NULL DEFAULT '🏳️',

  property_types            TEXT[] NOT NULL DEFAULT '{}',
  price_bands               TEXT[] NOT NULL DEFAULT '{}',
  buyer_markets             TEXT[] NOT NULL DEFAULT '{}',
  languages                 TEXT[] NOT NULL DEFAULT '{}',
  specializations           TEXT[] NOT NULL DEFAULT '{}',
  delivery_channels         TEXT[] NOT NULL DEFAULT '{email}',

  quality_score             INTEGER NOT NULL DEFAULT 72,

  -- Historical performance
  response_rate             NUMERIC NOT NULL DEFAULT 0,
  conversion_rate           NUMERIC NOT NULL DEFAULT 0,
  avg_response_hours        NUMERIC NOT NULL DEFAULT 24,
  owner_direct_success_rate NUMERIC NOT NULL DEFAULT 0,
  cross_border_deals_12m    INTEGER NOT NULL DEFAULT 0,
  luxury_deals_12m          INTEGER NOT NULL DEFAULT 0,

  status                    TEXT NOT NULL DEFAULT 'pending_review'
                            CHECK (status IN ('pending_review', 'active', 'suspended')),
  is_active                 BOOLEAN NOT NULL DEFAULT false,
  contact_policy            TEXT NOT NULL DEFAULT 'open'
                            CHECK (contact_policy IN ('open', 'invite_only', 'blacklisted')),

  registered_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at               TIMESTAMPTZ,
  last_contacted            TIMESTAMPTZ,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON public.agencies
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. Indexes for APEX matching queries
CREATE INDEX IF NOT EXISTS idx_agencies_status     ON public.agencies (status);
CREATE INDEX IF NOT EXISTS idx_agencies_is_active  ON public.agencies (is_active);
CREATE INDEX IF NOT EXISTS idx_agencies_country    ON public.agencies (country);
CREATE INDEX IF NOT EXISTS idx_agencies_email      ON public.agencies (email);

-- 4. Row Level Security
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by API routes)
CREATE POLICY "service_role_all" ON public.agencies
  FOR ALL USING (auth.role() = 'service_role');

-- Anonymous users can INSERT (agency self-registration, no auth required)
CREATE POLICY "anon_insert" ON public.agencies
  FOR INSERT WITH CHECK (true);

-- Active agencies are publicly readable (for APEX API)
CREATE POLICY "public_read_active" ON public.agencies
  FOR SELECT USING (is_active = true AND status = 'active');

-- 5. Admin function: activate agency
CREATE OR REPLACE FUNCTION activate_agency(agency_id TEXT)
RETURNS void AS $$
  UPDATE public.agencies
  SET status = 'active', is_active = true, approved_at = now()
  WHERE id = agency_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. Admin function: suspend agency
CREATE OR REPLACE FUNCTION suspend_agency(agency_id TEXT)
RETURNS void AS $$
  UPDATE public.agencies
  SET status = 'suspended', is_active = false
  WHERE id = agency_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Done! ✅
-- Next step: set these env vars in Netlify Dashboard → Site → Environment Variables:
--   NEXT_PUBLIC_SUPABASE_URL      = https://your-project.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key (safe, RLS enforced)
--   SUPABASE_SERVICE_ROLE_KEY     = your-service-role-key (server only, never public!)
