/* ============================================================
   TIXA — Supabase Integration

   SETUP (lakukan sebelum deploy):
   1. Buka https://supabase.com → buat project baru
   2. Pergi ke Settings › API
   3. Salin "Project URL"  → isi SUPABASE_URL di bawah
   4. Salin "anon public"  → isi SUPABASE_ANON_KEY di bawah
   5. Jalankan supabase-migration.sql di SQL Editor Supabase
   ============================================================ */
(function () {

  /* ──────────────────────────────────────────────────────────
     KONFIGURASI — ganti dua nilai ini dengan milik Anda
  ────────────────────────────────────────────────────────── */
  var SUPABASE_URL      = "YOUR_SUPABASE_URL";
  var SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
  /* ──────────────────────────────────────────────────────── */

  function isConfigured() {
    return SUPABASE_URL      !== "YOUR_SUPABASE_URL" &&
           SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
  }

  var _client = null;

  function getClient() {
    if (_client) return _client;
    if (!isConfigured()) return null;
    if (typeof supabase === "undefined") {
      console.warn("[TIXA:Supabase] Supabase CDN belum dimuat.");
      return null;
    }
    _client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _client;
  }

  /* Helper — jalankan query, tangkap error dengan tenang */
  async function q(fn) {
    var c = getClient();
    if (!c) return null;
    try {
      return await fn(c);
    } catch (e) {
      console.error("[TIXA:Supabase]", e.message || e);
      return null;
    }
  }

  /* ============================================================
     SupabaseDB — semua operasi database TIXA
  ============================================================ */
  var SupabaseDB = {

    isConfigured: isConfigured,

    /* ── TICKETS ─────────────────────────────────────────── */

    /** Simpan tiket baru ke tabel tickets */
    createTicket: function (data) {
      return q(function (c) {
        return c.from("tickets")
          .insert([data])
          .then(function (r) {
            if (r.error) throw r.error;
            return r.data;
          });
      });
    },

    /** Update field tertentu pada tiket yang ada */
    updateTicket: function (id, updates) {
      return q(function (c) {
        return c.from("tickets")
          .update(updates)
          .eq("id", id)
          .then(function (r) {
            if (r.error) throw r.error;
            return r.data;
          });
      });
    },

    /* ── TIMELINE ────────────────────────────────────────── */

    /**
     * Simpan satu event ke tabel ticket_timeline.
     * event = { ticket_id, ticket_number, actor_id, actor_name,
     *            action, text, is_internal?, progress?, created_at }
     */
    addTimelineEvent: function (event) {
      return q(function (c) {
        return c.from("ticket_timeline")
          .insert([event])
          .then(function (r) {
            if (r.error) throw r.error;
            return r.data;
          });
      });
    },

    /* ── ATTACHMENTS ─────────────────────────────────────── */

    /**
     * Simpan metadata attachment ke tabel ticket_attachments.
     * data = { ticket_id, ticket_number, name, size, file_type,
     *          url?, uploaded_by, uploader_name, created_at }
     */
    addAttachment: function (data) {
      return q(function (c) {
        return c.from("ticket_attachments")
          .insert([data])
          .then(function (r) {
            if (r.error) throw r.error;
            return r.data;
          });
      });
    },
  };

  window.SupabaseDB = SupabaseDB;

  /* Log status koneksi saat halaman dimuat */
  if (isConfigured()) {
    /* Cek koneksi ringan dengan mengambil 1 baris */
    setTimeout(function () {
      var c = getClient();
      if (c) {
        c.from("tickets").select("id").limit(1)
          .then(function (r) {
            if (r.error) {
              console.error("[TIXA:Supabase] Koneksi gagal:", r.error.message);
            } else {
              console.log("[TIXA:Supabase] Terhubung ✓");
            }
          });
      }
    }, 500);
  } else {
    console.warn(
      "[TIXA:Supabase] Belum dikonfigurasi — data tidak akan disimpan ke database.\n" +
      "Edit project/app/supabase.js dan isi SUPABASE_URL + SUPABASE_ANON_KEY."
    );
  }

})();
