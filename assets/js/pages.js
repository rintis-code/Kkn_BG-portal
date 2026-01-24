// assets/js/pages.js
// Catatan: helper berikut diasumsikan ada di ../assets/js/app.js
// $(), $$(), loadJSON(), safeText(), fmtDate(), badgeStatus()

async function initNavbar(active) {
  const site = await loadJSON("data/site.json");

  const elBrand = $("#brand");
  if (elBrand) elBrand.textContent = site.siteName || "KKN Portal";

  const btn = $("#btnLaporan");
  if (btn && site.ctaFormLaporan) btn.href = site.ctaFormLaporan;

  const btnDrive = $("#btnDrive");
  if (btnDrive && site.ctaDrive) btnDrive.href = site.ctaDrive;

  // Active nav
  $$("[data-nav]").forEach(a => {
    const key = a.getAttribute("data-nav");
    if (key === active) {
      a.classList.add("text-slate-900");
      a.classList.remove("text-slate-600");
    } else {
      a.classList.add("text-slate-600");
      a.classList.remove("text-slate-900");
    }
  });
}

/**
 * Render PIC agar:
 * - Jika pic adalah array -> tampil per baris (tanpa koma)
 * - Jika string -> tampil 1 baris
 * - Jika kosong -> fallback
 */
function renderPic(pic, fallback = "TBD") {
  if (Array.isArray(pic)) {
    const items = pic
      .filter(v => v !== null && v !== undefined && String(v).trim() !== "")
      .map(v => `<div>${safeText(v)}</div>`)
      .join("");
    return items || `<div>${safeText(fallback)}</div>`;
  }
  if (pic === null || pic === undefined || String(pic).trim() === "") {
    return `<div>${safeText(fallback)}</div>`;
  }
  return `<div>${safeText(pic)}</div>`;
}

// ===============================
// Mini card untuk preview (Home)
// ===============================
function prokerCardMini(p) {
  const outputs = (p.output || []).slice(0, 2).map(o => `
    <a href="${safeText(o.link || "#")}" target="_blank" rel="noopener"
      class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-white ring-1 ring-slate-200">
      ${safeText(o.label || "Output")}
    </a>
  `).join("");

  const status = (p.status || "planned").toLowerCase();
  const statusLabel =
    status === "done" ? "Selesai" :
    status === "ongoing" ? "Berjalan" :
    "Rencana";

  const statusClass =
    status === "done" ? "bg-emerald-100 text-emerald-800 ring-emerald-200" :
    status === "ongoing" ? "bg-amber-100 text-amber-800 ring-amber-200" :
    "bg-slate-100 text-slate-800 ring-slate-200";

  // progress (0-100)
  let prog = Number(p.progress ?? 0);
  if (Number.isNaN(prog)) prog = 0;
  prog = Math.max(0, Math.min(100, prog));
  if (status === "done") prog = 100;

  const progLabel =
    prog >= 100 ? "100% (Selesai)" :
    prog >= 70 ? `${prog}% (Hampir selesai)` :
    prog >= 40 ? `${prog}% (Berjalan)` :
    `${prog}% (Persiapan)`;

  return `
    <div class="rounded-2xl bg-white/70 p-5 ring-1 ring-white/30 backdrop-blur">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-xs font-bold text-slate-500">${safeText(p.id || "")}</div>
          <div class="mt-1 text-base font-extrabold text-slate-900">
            ${safeText(p.nama || "-")}
          </div>
        </div>
        <div class="shrink-0">
          <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${statusClass}">
            ${statusLabel}
          </span>
        </div>
      </div>

      <div class="mt-2 text-sm text-slate-600">
        ${safeText(p.ringkas || "")}
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>Progress</span>
          <span>${safeText(progLabel)}</span>
        </div>
        <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-100">
          <div class="h-full rounded-full bg-slate-900" style="width: ${prog}%"></div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        ${outputs || `<span class="text-xs text-slate-500">Belum ada output.</span>`}
      </div>

      <div class="mt-3 text-xs text-slate-500">
        PIC:
      <div class="font-bold text-slate-700">
        ${renderPic(p.pic, "TBD")}
      </div>
        <span class="mx-2">•</span>
        Tgl: <span class="font-bold text-slate-700">${safeText(p.tanggal || "-")}</span>
        <span class="mx-2">•</span>
        Update: <span class="font-bold text-slate-700">${safeText(p.updatedAt || "-")}</span>
      </div>
    </div>
  `;
}

// ===============================
// HOME (index.html desa)
// ===============================
async function initHome() {
  const site = await loadJSON("data/site.json");

  const t = $("#tagline"); if (t) t.textContent = site.tagline || "-";
  const d = $("#desa"); if (d) d.textContent = site.desa || "-";
  const p = $("#periode"); if (p) p.textContent = site.periode || "-";

  const btnForm = $("#btnForm");
  if (btnForm && site.ctaFormLaporan) btnForm.href = site.ctaFormLaporan;

  const wrap = $("#highlights");
  const proker = await loadJSON("data/proker.json");

  const total = proker.length;
  const planned = proker.filter(x => x.status === "planned").length;
  const ongoing = proker.filter(x => x.status === "ongoing").length;
  const done = proker.filter(x => x.status === "done").length;

  const staticH = (site.heroHighlights || []).map(h => {
  let link = "#";
  const label = (h.label || "").toLowerCase();

  if (label.includes("program")) link = "proker.html";
  else if (label.includes("dokumentasi")) link = "dokumentasi.html";
  else if (label.includes("output")) link = "output.html";

  return `
    <a href="${link}"
       class="block rounded-2xl bg-white/70 p-4 ring-1 ring-white/30 backdrop-blur hover:shadow-md hover:-translate-y-1 transition">
      <div class="text-2xl font-bold text-slate-900">${safeText(h.value)}</div>
      <div class="mt-1 text-sm text-slate-600">${safeText(h.label)}</div>
    </a>
  `;
}).join("");

  const dynamicH = `
  <a href="proker.html" class="rounded-2xl bg-white/70 p-4 ring-1 ring-white/30 backdrop-blur hover:shadow-md transition block">
    <div class="text-2xl font-bold text-slate-900">${total}</div>
    <div class="mt-1 text-sm text-slate-600">Total Proker</div>
  </a>

  <a href="proker.html" class="rounded-2xl bg-white/70 p-4 ring-1 ring-white/30 backdrop-blur hover:shadow-md transition block">
    <div class="text-2xl font-bold text-slate-900">${planned}</div>
    <div class="mt-1 text-sm text-slate-600">Planned</div>
  </a>

  <a href="proker.html" class="rounded-2xl bg-white/70 p-4 ring-1 ring-white/30 backdrop-blur hover:shadow-md transition block">
    <div class="text-2xl font-bold text-slate-900">${ongoing}</div>
    <div class="mt-1 text-sm text-slate-600">Ongoing</div>
  </a>

  <a href="proker.html" class="rounded-2xl bg-white/70 p-4 ring-1 ring-white/30 backdrop-blur hover:shadow-md transition block">
    <div class="text-2xl font-bold text-slate-900">${done}</div>
    <div class="mt-1 text-sm text-slate-600">Done</div>
  </a>
`;

  if (wrap) wrap.innerHTML = staticH + dynamicH;

  // Proker highlight (3 terbaru)
  const latest = [...proker]
    .sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""))
    .slice(0, 3);

  const prev = $("#prokerPreview");
  if (prev) prev.innerHTML = latest.map(x => prokerCardMini(x)).join("");
}

// ===============================
// TIM (profil.html)
// ===============================
async function initTim() {
  const tim = await loadJSON("data/tim.json");
  const wrap = $("#timList");
  if (!wrap) return;

  wrap.innerHTML = tim.map(t => `
    <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div class="text-lg font-bold text-slate-900">${safeText(t.nama)}</div>
      <div class="mt-1 text-sm text-slate-600">${safeText(t.peran)} · ${safeText(t.prodi)}</div>
      <div class="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700">
        <div class="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div class="text-xs text-slate-500">NIM</div><div class="font-semibold">${safeText(t.nim)}</div>
        </div>
        <div class="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div class="text-xs text-slate-500">Kontak</div><div class="font-semibold">${safeText(t.kontak || "-")}</div>
        </div>
      </div>
    </div>
  `).join("");
}

// ===============================
// PROKER (proker.html)
// ===============================
async function initProker() {
  const res = await fetch("data/proker.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Fetch proker.json gagal: " + res.status);
  const data = await res.json();

  // Isi dropdown kategori
  const categories = Array.from(new Set(data.map(d => d.kategori).filter(Boolean))).sort();
  const fKat = $("#filterKategori");
  if (fKat) {
    fKat.innerHTML =
      `<option value="">Semua kategori</option>` +
      categories.map(c => `<option value="${safeText(c)}">${safeText(c)}</option>`).join("");
  }

  // Tabs kategori (kekinian)
  const tabsWrap = $("#kategoriTabs");
  let activeCat = "";

  function renderTabs() {
    if (!tabsWrap) return;

    const makeBtn = (label, value, isActive) => `
      <button type="button"
        class="rounded-full px-4 py-2 text-sm font-bold ring-1 transition
          ${isActive ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-800 ring-slate-200 hover:shadow"}"
        data-cat="${safeText(value)}">
        ${safeText(label)}
      </button>
    `;

    tabsWrap.innerHTML =
      makeBtn("Semua", "", activeCat === "") +
      categories.map(c => makeBtn(c, c, activeCat === c)).join("");

    $$("button[data-cat]", tabsWrap).forEach(btn => {
      btn.addEventListener("click", () => {
        activeCat = btn.getAttribute("data-cat") || "";
        const fKat = $("#filterKategori");
        if (fKat) fKat.value = activeCat;
        renderTabs();
        render();
      });
    });
  }

  function prokerCardDetail(p) {
    const kpi = (p.kpi || []).map(x => `<li class="text-sm text-slate-700">${safeText(x)}</li>`).join("");
    const outputs = (p.output || []).map(o => `
      <a class="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-white"
         href="${safeText(o.link || "#")}" target="_blank" rel="noopener">
        <span class="h-2 w-2 rounded-full bg-slate-400"></span>${safeText(o.label)}
      </a>
    `).join("");

    return `
      <article class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-500">${safeText(p.id)} · ${safeText(p.kategori || "-")}</div>
            <h3 class="mt-1 text-xl font-extrabold text-slate-900">${safeText(p.nama)}</h3>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">${safeText(p.ringkas)}</p>
          </div>
          <div class="flex items-center gap-3">
            ${typeof badgeStatus === "function" ? badgeStatus(p.status) : ""}
            <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">${typeof fmtDate === "function" ? fmtDate(p.tanggal) : safeText(p.tanggal)}</div>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div class="text-xs font-semibold text-slate-500">PIC</div>
            <div class="mt-1 font-bold text-slate-900">
              ${renderPic(p.pic, "-")}
            </div>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 md:col-span-2">
            <div class="text-xs font-semibold text-slate-500">KPI</div>
            <ul class="mt-2 list-disc pl-5 space-y-1">${kpi || `<li class="text-sm text-slate-700">-</li>`}</ul>
          </div>
        </div>

        ${outputs ? `<div class="mt-5 flex flex-wrap gap-2">${outputs}</div>` : ``}
      </article>
    `;
  }

  function render() {
    const q = ($("#searchProker")?.value || "").toLowerCase().trim();
    const cat = $("#filterKategori")?.value || "";
    const st = $("#filterStatus")?.value || "";

    const filtered = data.filter(p => {
      const hay = `${p.id} ${p.nama} ${p.kategori} ${(p.kataKunci || []).join(" ")} ${p.pic || ""}`.toLowerCase();
      const okQ = !q || hay.includes(q);
      const okCat = !cat || p.kategori === cat;
      const okSt = !st || p.status === st;
      return okQ && okCat && okSt;
    }).sort((a, b) => (a.tanggal || "").localeCompare(b.tanggal || ""));

    const cnt = $("#prokerCount");
    if (cnt) cnt.textContent = `${filtered.length} program`;

    const list = $("#prokerList");
    if (list) list.innerHTML = filtered.map(p => prokerCardDetail(p)).join("");
  }

  $("#searchProker")?.addEventListener("input", render);

  $("#filterKategori")?.addEventListener("change", () => {
    activeCat = $("#filterKategori")?.value || "";
    renderTabs();
    render();
  });

  $("#filterStatus")?.addEventListener("change", render);

  renderTabs();
  render();
}

// ===============================
// DOKUMENTASI (dokumentasi.html)
// ===============================
async function initDokumentasi() {
  const docs = await loadJSON("data/dokumentasi.json");
  const grid = $("#docGrid");
  if (!grid) return;

  grid.innerHTML = docs.map(d => `
    <a class="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-md transition"
       href="${safeText(d.link || "#")}" target="_blank" rel="noopener">
      <div class="aspect-[16/10] bg-slate-100">
        ${d.thumb
          ? `<img src="${safeText(d.thumb)}" alt="${safeText(d.judul)}" class="h-full w-full object-cover group-hover:scale-[1.02] transition">`
          : `<div class="flex h-full items-center justify-center text-sm text-slate-500">No image</div>`}
      </div>
      <div class="p-4">
        <div class="text-sm font-bold text-slate-900">${safeText(d.judul)}</div>
        <div class="mt-1 text-xs text-slate-600">${typeof fmtDate === "function" ? fmtDate(d.tanggal) : safeText(d.tanggal)} · ${safeText(d.tipe)}</div>
      </div>
    </a>
  `).join("");
}

// ===============================
// OUTPUT (output.html)
// ===============================
async function initOutput() {
  const proker = await loadJSON("data/proker.json");
  const all = [];
  proker.forEach(p => (p.output || []).forEach(o => all.push({ proker: p.nama, id: p.id, ...o })));

  const wrap = $("#outputList");
  if (!wrap) return;

  const dataset = all.length
    ? all
    : [{ label: "Belum ada output", link: "#", id: "-", proker: "-" }];

  wrap.innerHTML = dataset.map(o => `
    <a class="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition"
       href="${safeText(o.link || "#")}" target="_blank" rel="noopener">
      <div>
        <div class="text-xs font-semibold text-slate-500">${safeText(o.id)} · ${safeText(o.proker)}</div>
        <div class="mt-1 text-lg font-bold text-slate-900">${safeText(o.label)}</div>
      </div>
      <div class="text-sm font-semibold text-slate-700 underline underline-offset-4">Buka</div>
    </a>
  `).join("");
}

// ===============================
// Rekap Mingguan (rekap.html)
// ===============================
window.initRekap = async function initRekap() {
  try {
    if (!document.getElementById("rk_total")) return;

    const res = await fetch("data/proker.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch proker.json gagal: " + res.status);
    const data = await res.json();

    const proker = Array.isArray(data) ? data : [];
    const total = proker.length;

    const normStatus = (s) => String(s || "planned").toLowerCase();
    let planned = 0, ongoing = 0, done = 0;

    const parseYMD = (s) => {
      if (!s) return null;
      const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return null;
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return isNaN(d.getTime()) ? null : d;
    };

    const today = new Date();
    const daysDiff = (d) => Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    const late = [];
    let updatedWeek = 0;
    const recent = [];
    const topProgress = [];

    proker.forEach(p => {
      const st = normStatus(p.status);
      if (st === "done") done++;
      else if (st === "ongoing") ongoing++;
      else planned++;

      const d = parseYMD(p.updatedAt);
      if (!d) {
        late.push({ p, days: 9999 });
      } else {
        const dd = daysDiff(d);
        if (dd >= 7) late.push({ p, days: dd });
        if (dd <= 7) updatedWeek++;
        recent.push({ p, d });
      }

      let prog = Number(p.progress ?? 0);
      if (Number.isNaN(prog)) prog = 0;
      prog = Math.max(0, Math.min(100, prog));
      if (st === "done") prog = 100;
      topProgress.push({ p, prog });
    });

    late.sort((a, b) => b.days - a.days);
    recent.sort((a, b) => (b.d?.getTime?.() || 0) - (a.d?.getTime?.() || 0));
    topProgress.sort((a, b) => b.prog - a.prog);

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };

    setText("rk_total", total);
    setText("rk_planned", planned);
    setText("rk_ongoing", ongoing);
    setText("rk_done", done);
    setText("rk_late", late.length);
    setText("rk_week", updatedWeek);

    const cardHTML = (p, note) => `
      <div class="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
        <div class="text-xs font-extrabold tracking-widest text-slate-300 uppercase">${(p.id || "")}</div>
        <div class="mt-1 text-base font-black text-white">${(p.nama || "-")}</div>
        <div class="mt-1 text-sm text-slate-200">${(p.ringkas || "")}</div>
        <div class="mt-3 text-xs text-slate-300">
          Status: <span class="font-black text-white">${(p.status || "planned")}</span>
          <span class="mx-2">•</span>
          Update: <span class="font-black text-white">${(p.updatedAt || "-")}</span>
          ${note ? `<span class="mx-2">•</span><span class="font-black text-white">${note}</span>` : ""}
        </div>
      </div>
    `;

    const lateWrap = document.getElementById("rk_late_list");
    const lateEmpty = document.getElementById("rk_late_empty");
    if (lateWrap) {
      lateWrap.innerHTML = late.slice(0, 12).map(x => {
        const note = (x.days === 9999) ? "Belum pernah update" : `Telat ${x.days} hari`;
        return cardHTML(x.p, note);
      }).join("");
      if (lateEmpty) lateEmpty.classList.toggle("hidden", late.length !== 0);
    }

    const recentWrap = document.getElementById("rk_recent");
    if (recentWrap) {
      recentWrap.innerHTML = recent.slice(0, 8).map(x => cardHTML(x.p, "Update terbaru")).join("");
    }

    const topWrap = document.getElementById("rk_top_progress");
    if (topWrap) {
      topWrap.innerHTML = topProgress.slice(0, 8).map(x => cardHTML(x.p, `Progress ${x.prog}%`)).join("");
    }

  } catch (e) {
    console.error("initRekap error:", e);
  }
};

// ===============================
// Auto-run berdasarkan atribut <body data-page="...">
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body?.dataset?.page || "";
  try {
    if (typeof initNavbar === "function") {
      // active key sesuai page (home/proker/dokumentasi/output/rekap/tim)
      await initNavbar(page);
    }
    if (page === "home") await initHome();
    if (page === "tim") await initTim();
    if (page === "proker") await initProker();
    if (page === "dokumentasi") await initDokumentasi();
    if (page === "output") await initOutput();
    if (page === "rekap") await window.initRekap();
  } catch (e) {
    console.error("pages.js run error:", e);
  }
});
