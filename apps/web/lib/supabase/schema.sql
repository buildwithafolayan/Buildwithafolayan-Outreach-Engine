-- ============================================================
-- Outreach Engine — Supabase Schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- CONTACTS table
CREATE TABLE IF NOT EXISTS contacts (
  id            TEXT PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL UNIQUE,
  company       TEXT NOT NULL,
  website       TEXT,
  city          TEXT,
  industry      TEXT,
  state         TEXT NOT NULL DEFAULT 'READY',
  source        TEXT NOT NULL DEFAULT 'Manual Entry',
  notes         TEXT,
  tags          JSONB NOT NULL DEFAULT '[]',
  created_at    TEXT NOT NULL,
  last_activity TEXT
);
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- CAMPAIGNS table
CREATE TABLE IF NOT EXISTS campaigns (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'DRAFT',
  description    TEXT NOT NULL DEFAULT '',
  gmail_account  TEXT,
  daily_limit    INTEGER NOT NULL DEFAULT 20,
  hourly_limit   INTEGER NOT NULL DEFAULT 5,
  steps          JSONB NOT NULL DEFAULT '[]',
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  sent_count     INTEGER NOT NULL DEFAULT 0,
  replied_count  INTEGER NOT NULL DEFAULT 0,
  reply_rate     TEXT NOT NULL DEFAULT '—',
  created_at     TEXT NOT NULL,
  next_action    TEXT
);
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- SYSTEM_SETTINGS table (always exactly one row with id = 1)
CREATE TABLE IF NOT EXISTS system_settings (
  id                       INTEGER PRIMARY KEY DEFAULT 1,
  global_sending_enabled   BOOLEAN NOT NULL DEFAULT false,
  test_recipient           TEXT DEFAULT '',
  daily_limit              INTEGER NOT NULL DEFAULT 20,
  hourly_limit             INTEGER NOT NULL DEFAULT 5,
  failure_threshold        INTEGER NOT NULL DEFAULT 3,
  time_zone                TEXT NOT NULL DEFAULT 'Africa/Lagos',
  send_window_start        TEXT NOT NULL DEFAULT '09:00',
  send_window_end          TEXT NOT NULL DEFAULT '17:00',
  active_days              JSONB NOT NULL DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',
  randomized_delay_minutes INTEGER NOT NULL DEFAULT 15,
  email_signature          TEXT,
  admin_email              TEXT NOT NULL DEFAULT 'you@example.com',
  CONSTRAINT single_row CHECK (id = 1)
);
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;

-- Seed the single settings row (safe to re-run)
INSERT INTO system_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
