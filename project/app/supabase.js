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
  var SUPABASE_URL      = "https://motdpromimfaokpymesl.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_MJIwd0f3O6qMxIKn4TR_Nw_B320mbie";
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
     MAPPER — konversi baris DB (snake_case) ke format app (camelCase)
  ============================================================ */

  function mapTicket(row) {
    return {
      id:           row.id,
      number:       row.number,
      type:         row.type,
      title:        row.title,
      description:  row.description  || "",
      status:       row.status        || "Open",
      priority:     row.priority      || "Medium",
      severity:     row.severity      || "—",
      progress:     row.progress      || 0,
      app:          null,
      appName:      row.app_name      || "—",
      module:       row.module        || null,
      department:   null,
      deptName:     row.dept_name     || "—",
      requestor:    row.requestor_id,
      ba:           row.ba_id         || null,
      developer:    row.developer_id  || null,
      qa:           row.qa_id         || null,
      created:      row.created_at,
      updated:      row.updated_at,
      target:       row.target_date   || null,
      completed:    row.completed_at  || null,
      slaTarget:    row.sla_target    || 24,
      slaUsed:      row.sla_used      || 0,
      slaBreached:  row.sla_breached  || false,
      watchers:     row.watchers      || [],
      comments:     0,
      timeline:     [],     // dimuat terpisah via getTicketTimeline
      /* Bug-specific */
      environment:     row.environment    || null,
      bugType:         row.bug_type       || null,
      reproducibility: row.reproducibility || null,
      browser:         row.browser        || null,
      steps:           row.steps          || null,
      expected:        row.expected       || null,
      actual:          row.actual         || null,
      /* CR-specific */
      changeType: row.change_type  || null,
      category:   row.category     || null,
      reason:     row.reason       || null,
      item:       row.item         || null,
      /* Project Request-specific */
      projectCategory:   row.project_category    || null,
      timeline_est:      row.timeline_est         || null,
      budget:            row.budget               || null,
      businessObjective: row.business_objective   || null,
      scope:             row.scope                || null,
      targetUsers:       row.target_users         || null,
      success:           row.success_criteria     || null,
    };
  }

  function mapTimelineEvent(row) {
    return {
      actor:    row.actor_id,
      action:   row.action,
      text:     row.text,
      at:       row.created_at,
      internal: row.is_internal  || false,
      progress: row.progress     != null ? row.progress : null,
    };
  }

  /* ============================================================
     SupabaseDB — semua operasi database TIXA
  ============================================================ */
  var SupabaseDB = {

    isConfigured: isConfigured,

    /* ── READ TICKETS ────────────────────────────────────── */

    /** Ambil semua tiket, urutkan terbaru dulu */
    getTickets: function () {
      return q(function (c) {
        return c.from("tickets")
          .select("*")
          .order("created_at", { ascending: false })
          .then(function (r) {
            if (r.error) throw r.error;
            return (r.data || []).map(mapTicket);
          });
      });
    },

    /** Ambil satu tiket berdasarkan ID */
    getTicket: function (id) {
      return q(function (c) {
        return c.from("tickets")
          .select("*")
          .eq("id", id)
          .single()
          .then(function (r) {
            if (r.error) throw r.error;
            return r.data ? mapTicket(r.data) : null;
          });
      });
    },

    /** Ambil semua timeline events untuk satu tiket (urut dari awal) */
    getTicketTimeline: function (ticketId) {
      return q(function (c) {
        return c.from("ticket_timeline")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true })
          .then(function (r) {
            if (r.error) throw r.error;
            return (r.data || []).map(mapTimelineEvent);
          });
      });
    },

    /** Ambil semua attachments untuk satu tiket */
    getTicketAttachments: function (ticketId) {
      return q(function (c) {
        return c.from("ticket_attachments")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true })
          .then(function (r) {
            if (r.error) throw r.error;
            return (r.data || []).map(function (a) {
              return { name: a.name, size: a.size, type: a.file_type, url: a.url || null };
            });
          });
      });
    },

    /* ── WRITE TICKETS ───────────────────────────────────── */

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

    /** Simpan satu event ke tabel ticket_timeline */
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

    /** Simpan metadata attachment ke tabel ticket_attachments */
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
