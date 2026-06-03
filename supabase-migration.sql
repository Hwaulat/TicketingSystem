-- ============================================================
-- TIXA Ticketing System — Supabase Migration
-- Jalankan file ini di Supabase SQL Editor:
-- Dashboard > SQL Editor > New query > paste > Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: tickets
-- Menyimpan setiap tiket yang dibuat (bug, CR, project request, discussion)
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id              TEXT PRIMARY KEY,
  number          TEXT UNIQUE NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('bug', 'cr', 'project_request', 'discussion')),
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'Open',
  priority        TEXT DEFAULT 'Medium',
  severity        TEXT,
  progress        INTEGER DEFAULT 0,

  -- Relasi ke master data (nama saja, tidak FK karena master di frontend)
  app_name        TEXT,
  module          TEXT,
  dept_name       TEXT,

  -- People
  requestor_id    TEXT,
  requestor_name  TEXT,
  ba_id           TEXT,
  developer_id    TEXT,
  qa_id           TEXT,

  -- Bug-specific
  environment     TEXT,
  bug_type        TEXT,
  reproducibility TEXT,
  browser         TEXT,
  steps           TEXT,
  expected        TEXT,
  actual          TEXT,

  -- CR-specific
  change_type     TEXT,
  category        TEXT,
  reason          TEXT,
  item            TEXT,

  -- Project Request-specific
  project_category   TEXT,
  timeline_est       TEXT,
  budget             TEXT,
  business_objective TEXT,
  scope              TEXT,
  target_users       TEXT,
  success_criteria   TEXT,

  -- Shared optional
  notes           TEXT,

  -- SLA
  sla_target      NUMERIC,
  sla_used        NUMERIC DEFAULT 0,
  sla_breached    BOOLEAN DEFAULT false,

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  target_date     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  -- Watchers (array of user IDs)
  watchers        TEXT[] DEFAULT '{}'
);

-- ============================================================
-- TABLE: ticket_timeline
-- Menyimpan semua aktivitas: status change, komentar, assignment, dll.
-- Tidak menggunakan FK agar bisa menyimpan aktivitas tiket demo juga.
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_timeline (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id     TEXT NOT NULL,        -- ID tiket (bisa "tk1" untuk demo)
  ticket_number TEXT,                 -- Nomor tiket, e.g. "BUG-202605-0042"
  actor_id      TEXT,
  actor_name    TEXT,
  action        TEXT NOT NULL,        -- created, status, comment, assigned, approved, dll.
  text          TEXT NOT NULL,        -- deskripsi aksi
  is_internal   BOOLEAN DEFAULT false,
  progress      INTEGER,              -- untuk aksi DEV_PROGRESS
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: ticket_attachments
-- Metadata file yang di-upload ke tiket.
-- Tidak menggunakan FK untuk fleksibilitas.
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id     TEXT NOT NULL,
  ticket_number TEXT,
  name          TEXT NOT NULL,
  size          TEXT,
  file_type     TEXT,
  url           TEXT,                 -- public URL jika pakai Supabase Storage
  uploaded_by   TEXT,
  uploader_name TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES — mempercepat query umum
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tickets_status     ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_type       ON tickets(type);
CREATE INDEX IF NOT EXISTS idx_tickets_requestor  ON tickets(requestor_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created    ON tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_ticket    ON ticket_timeline(ticket_id);
CREATE INDEX IF NOT EXISTS idx_timeline_number    ON ticket_timeline(ticket_number);
CREATE INDEX IF NOT EXISTS idx_timeline_created   ON ticket_timeline(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attach_ticket      ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attach_number      ON ticket_attachments(ticket_number);

-- ============================================================
-- ROW LEVEL SECURITY
-- Aktifkan RLS dan buat policy permissive (bisa diperketat nanti)
-- ============================================================
ALTER TABLE tickets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_timeline    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan semua operasi via anon key
-- (ganti dengan policy berbasis auth jika perlu)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tickets' AND policyname = 'allow_all_tickets'
  ) THEN
    CREATE POLICY allow_all_tickets ON tickets FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_timeline' AND policyname = 'allow_all_timeline'
  ) THEN
    CREATE POLICY allow_all_timeline ON ticket_timeline FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_attachments' AND policyname = 'allow_all_attachments'
  ) THEN
    CREATE POLICY allow_all_attachments ON ticket_attachments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- OPTIONAL: Supabase Storage bucket untuk file upload
-- Jalankan bagian ini jika ingin upload file ke Supabase Storage
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('ticket-files', 'ticket-files', true)
-- ON CONFLICT DO NOTHING;

-- CREATE POLICY "Allow upload ticket-files" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'ticket-files');
-- CREATE POLICY "Allow read ticket-files" ON storage.objects
--   FOR SELECT USING (bucket_id = 'ticket-files');
