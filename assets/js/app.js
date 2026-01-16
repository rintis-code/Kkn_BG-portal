// assets/js/app.js
// Helper minimal tanpa framework

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Gagal load JSON: ${path} (HTTP ${res.status})`);
  return await res.json();
}

function fmtDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
}

function safeText(s) {
  return (s ?? "").toString().replace(/[&<>"']/g, m => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[m]));
}

function badgeStatus(status) {
  const map = {
    planned: { text: "Planned", cls: "bg-slate-100 text-slate-700 ring-slate-200" },
    ongoing: { text: "Ongoing", cls: "bg-amber-100 text-amber-800 ring-amber-200" },
    done:    { text: "Done",    cls: "bg-emerald-100 text-emerald-800 ring-emerald-200" }
  };
  const s = map[status] || { text: status || "—", cls: "bg-slate-100 text-slate-700 ring-slate-200" };
  return `<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${s.cls}">${s.text}</span>`;
}
