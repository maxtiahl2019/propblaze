-- PropBlaze Leads Table
-- Run this in Supabase SQL Editor: https://app.supabase.com → SQL Editor
--
-- Captures every lead from:
--   /lead         → sell / buy / rent funnel
--   /rental-match → rental agency matching
--   /property-finder → direct property search

CREATE TABLE IF NOT EXISTS leads (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email           text NOT NULL,
  phone           text,

  -- Intent & source
  intent          text NOT NULL,   -- 'sell' | 'buy' | 'rent' | 'find_rental' | 'list_rental' | 'buy_property'
  source          text NOT NULL,   -- 'lead' | 'rental-match' | 'property-finder'

  -- Property context
  prop_type       text,
  country         text,
  city            text,
  price           numeric,

  -- What was shown / saved
  agencies_count  integer,
  saved_agencies  text[]  DEFAULT '{}',
  saved_properties text[] DEFAULT '{}',

  -- Metadata
  ip              text,
  user_agent      text,
  created_at      timestamptz DEFAULT now() NOT NULL,

  -- Prevent duplicate leads from same email + source
  UNIQUE (email, source)
);

-- Index for fast lookups by email and date
CREATE INDEX IF NOT EXISTS leads_email_idx   ON leads (email);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_source_idx  ON leads (source);
CREATE INDEX IF NOT EXISTS leads_country_idx ON leads (country);

-- Row Level Security: only service role can read/write
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow insert from anon (the API uses anon key)
CREATE POLICY "allow_insert" ON leads
  FOR INSERT TO anon WITH CHECK (true);

-- Only service role can read (for admin dashboard)
CREATE POLICY "allow_service_read" ON leads
  FOR SELECT TO service_role USING (true);

-- ─── Convenience view for admin dashboard ────────────────────────────────────
CREATE OR REPLACE VIEW leads_summary AS
SELECT
  source,
  intent,
  country,
  COUNT(*)                                    AS total_leads,
  COUNT(*) FILTER (WHERE phone IS NOT NULL)   AS with_phone,
  COUNT(*) FILTER (WHERE cardinality(saved_agencies) > 0 OR cardinality(saved_properties) > 0) AS with_saves,
  ROUND(AVG(agencies_count))                  AS avg_agencies_shown,
  MAX(created_at)                             AS last_lead_at,
  MIN(created_at)                             AS first_lead_at
FROM leads
GROUP BY source, intent, country
ORDER BY total_leads DESC;
