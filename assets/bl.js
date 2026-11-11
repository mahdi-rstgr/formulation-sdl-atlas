/* assemblab shared runtime: app shell (sidebar + top bar), footer, cart store, provider logos, product cards, drawer, toast.
 * Every page loads it as a module. Paths are resolved from this file, so pages at any depth work. */
import { CATS, PRODUCTS, byId, parsePrice, vendorOf, logoOf } from "../data/catalog.js";
export { CATS, PRODUCTS, byId, parsePrice, vendorOf, logoOf };

export const ROOT = new URL("../", import.meta.url).href;
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const money = (v, cur = "$") => cur + Math.round(v).toLocaleString("en-US");
export const fmtPrice = p => p ? (p.lo === p.hi ? money(p.lo, p.cur) : `${money(p.lo, p.cur)}–${Math.round(p.hi).toLocaleString("en-US")}`) : "";
export const REF = n => `${ROOT}wiki/references/#ref-${n}`;
export const refLinks = s => String(s || "").split(",").map(n => n.trim()).filter(Boolean).map(n => `<a href="${REF(n)}">[${n}]</a>`).join(" ");
export const MAT = { liquid: ["Liquids", "var(--liquid)"], paste: ["Pastes & gels", "var(--paste)"], powder: ["Powders", "var(--powder)"], object: ["Objects", "var(--object)"] };

/* ================================================================ cart store (localStorage, shared by every page) */
const KEY = "assemblab-cart-v1";
try {   // carry over carts and preferences saved under the earlier name
  for (const [o, n] of [["laboo-cart-v1", KEY], ["labu-cart-v1", KEY], ["laboo-contacted-v1", "assemblab-contacted-v1"], ["labu-contacted-v1", "assemblab-contacted-v1"], ["laboo-theme", "assemblab-theme"], ["labu-theme", "assemblab-theme"]])
    if (localStorage.getItem(o) != null && localStorage.getItem(n) == null) { localStorage.setItem(n, localStorage.getItem(o)); localStorage.removeItem(o); }
} catch { }
const RENAMED = { "powder-hapd": "powder-auger", "ac-chemos2": "orch-os", "ac-atlas": "bo-planner", "ac-gryffin": "bo-categorical", "ac-golem": "robust-opt", "ac-chimera": "mo-scalarizer", "ac-olympus": "opt-benchmark", "ac-self-building-labs": "self-building-lab", "ac-organa": "agent-copilot", "ac-el-agente": "agent-chemistry", "ac-optima": "agent-campaign" };
const read = () => { try { const o = JSON.parse(localStorage.getItem(KEY)) || {}; for (const [a, b] of Object.entries(RENAMED)) if (o[a]) { o[b] = (o[b] || 0) + o[a]; delete o[a]; } return o; } catch { return {}; } };
const write = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch { } window.dispatchEvent(new CustomEvent("bl-cart")); };
export const cart = {
  all() { const o = read(); return Object.entries(o).filter(([id, q]) => byId[id] && q > 0).map(([id, qty]) => ({ p: byId[id], qty })); },
  qty(id) { return read()[id] || 0; },
  count() { return this.all().reduce((s, l) => s + l.qty, 0); },
  add(id, n = 1) { const o = read(); o[id] = (o[id] || 0) + n; write(o); },
  set(id, n) { const o = read(); if (n > 0) o[id] = n; else delete o[id]; write(o); },
  remove(id) { this.set(id, 0); },
  clear() { write({}); },
  replace(map) { write(map); },
};

/* ================================================================ icons */
export const ICON = {
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2.1 10.2a1.6 1.6 0 0 0 1.6 1.3h8.3a1.6 1.6 0 0 0 1.5-1.2L20.5 8H6.1"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  car: '<svg class="car" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m2 3.5 3 3 3-3"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" stroke-dasharray="2.4 1.8"/></svg>',
  design: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></svg>',
  parts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/><circle cx="18" cy="17" r="2"/></svg>',
  solutions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4M11 3v6L5.5 18.5A1.6 1.6 0 0 0 6.9 21h10.2a1.6 1.6 0 0 0 1.4-2.5L13 9V3"/><path d="M7.5 15h9"/></svg>',
  sdl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/><circle cx="12" cy="12" r="2"/></svg>',
  twin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="m8 12 3-3 2 2 3-3"/></svg>',
  learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
};
/* monoline category glyphs (shown when a part has no rendered image) */
const G = d => `<svg class="glyph" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const GLYPH = {
  liquid: G('<path d="M24 6c6 9 11 15 11 22a11 11 0 0 1-22 0c0-7 5-13 11-22Z"/><path d="M18 29a6 6 0 0 0 6 6"/>'),
  paste: G('<path d="M30 6l12 12M33 9l-19 19-4 10 10-4 19-19"/><path d="M10 38l-4 4M22 20l6 6"/>'),
  powder: G('<path d="M8 38h32M12 38c2-8 6-12 12-12s10 4 12 12"/><path d="M24 8v10M20 14l4 4 4-4"/><circle cx="17" cy="32" r=".6"/><circle cx="25" cy="31" r=".6"/><circle cx="31" cy="34" r=".6"/>'),
  arm: G('<path d="M10 40h14M14 40v-6h6v6"/><path d="M17 34 24 18l12-4"/><circle cx="24" cy="18" r="2.5"/><path d="M36 14l3-4M36 14l4 2"/>'),
  motion: G('<path d="M6 12h36M6 12v26M42 12v26M4 38h8M36 38h8"/><rect x="20" y="9" width="8" height="8" rx="1"/><path d="M24 17v10M21 27h6"/>'),
  platform: G('<rect x="6" y="10" width="36" height="28" rx="2"/><path d="M6 30h36M12 16h24"/><path d="M16 22v4M22 22v4M28 22v4M34 22v4"/>'),
  station: G('<path d="M10 38h28l-3-10H13l-3 10Z"/><path d="M16 28v-4h16v4M14 20h20"/><path d="M24 14v6"/>'),
  structure: G('<path d="M6 16h36M6 22h36M10 22v18M38 22v18M10 34h28"/><path d="M14 16V8h8v8"/>'),
  analysis: G('<rect x="8" y="12" width="32" height="20" rx="2"/><path d="M12 26l6-7 5 4 6-9 7 8"/><path d="M16 38h16M24 32v6"/>'),
  prep: G('<path d="M19 6h10M21 6v10l-9 18a3 3 0 0 0 2.7 4.4h18.6A3 3 0 0 0 36 34l-9-18V6"/><path d="M15 29h18"/><circle cx="21" cy="33" r="1.2"/><circle cx="27" cy="31" r="1.2"/>'),
  facility: G('<path d="M8 40V12l16-6 16 6v28"/><path d="M8 40h32M16 40V24h16v16M16 30h16"/>'),
  orchestration: G('<circle cx="24" cy="10" r="4"/><circle cx="10" cy="36" r="4"/><circle cx="38" cy="36" r="4"/><path d="M22 14 12 32M26 14l10 18M14 36h20"/>'),
  simulation: G('<path d="M24 6 8 15v18l16 9 16-9V15L24 6Z" stroke-dasharray="3 3"/><path d="M8 15l16 9 16-9M24 24v18"/>'),
  ai: G('<path d="M38 24a14 14 0 1 1-4.1-9.9"/><path d="M34 6v8h-8"/><circle cx="24" cy="24" r="3"/>'),
};
export const thumbOf = p => p.thumb ? ROOT + p.thumb : p.design ? `${ROOT}lab-simulator/thumbs/${p.id}.png` : null;
export const logoSrc = l => `${ROOT}assets/logos/${l.src}`;
/* a small provider mark beside the maker's name; makers without a logo get a two-letter badge */
export function logoChip(p) {
  const l = logoOf(p);
  if (!l) return `<span class="mono-badge" aria-hidden="true">${esc((p.vendor || p.brand).replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase())}</span>`;
  return `<span class="plogo ${l.tone}${l.wide ? " wide" : ""}"><img src="${logoSrc(l)}" alt="${esc(l.name)}" loading="lazy"></span>`;
}
/* the provider's logo as the product image: agents always, and parts without a render */
function logoImage(p) {
  const l = logoOf(p); if (!l) return GLYPH[p.cat] || "";
  return l.tone === "light" ? `<img class="logo-img" src="${logoSrc(l)}" alt="${esc(l.name)}" loading="lazy">`
    : `<span class="logo-card"><img src="${logoSrc(l)}" alt="${esc(l.name)}" loading="lazy"></span>`;
}
export const imgHTML = (p, cls = "") => {
  const t = thumbOf(p);
  return t ? `<img class="${cls}" src="${t}" alt="" loading="lazy" onerror="this.outerHTML=this.nextElementSibling?.innerHTML||''"><template>${logoImage(p)}</template>` : logoImage(p);
};

/* ================================================================ prices */
export function priceOf(p) { const v = parsePrice(p.price); return v; }
export function priceTag(p) {
  const v = priceOf(p);
  if (v) return `<span class="price num">${fmtPrice(v)}</span>`;
  return `<span class="price q">${esc(p.price)}</span>`;
}
export function kindTags(p) {
  const t = [];
  if (p.kind === "software") t.push(`<span class="tag ${/open/i.test(p.price) ? "open" : ""}">${/open/i.test(p.price) ? "Open source" : "Software"}</span>`);
  if (p.design) t.push(`<span class="tag cad" title="Can be placed in the 3D Lab Simulator">3D</span>`);
  if (p.mcm) t.push(`<span class="tag">McMaster</span>`);
  return t.join("");
}

/* ================================================================ product card */
export function card(p) {
  const inCart = cart.qty(p.id) > 0;
  return `<article class="pcard" data-id="${p.id}">
    <div class="ph">${imgHTML(p)}<div class="tags">${kindTags(p)}</div><span class="sku">${p.sku}</span></div>
    <div class="bd">
      <span class="brand">${logoChip(p)}${esc(p.brand)}</span>
      <h3><a href="${ROOT}parts/?p=${p.id}" data-open="${p.id}">${esc(p.name)}</a></h3>
      <span class="spec">${esc(p.spec)}</span>
      <div class="ft">${priceTag(p)}<button type="button" class="add ${inCart ? "in" : ""}" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart">${inCart ? ICON.check + "In cart" : ICON.plus + "Add"}</button></div>
    </div></article>`;
}
/* wire add-to-cart + open-drawer for any container of cards */
export function wireCards(root = document) {
  root.addEventListener("click", e => {
    const a = e.target.closest("[data-add]"); if (a) { e.preventDefault(); const id = a.dataset.add; cart.add(id); toast(`Added <b>${esc(byId[id].name)}</b>`, `${ROOT}cart/`, "View cart"); return; }
    const o = e.target.closest("[data-open]"); if (o && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openProduct(o.dataset.open); }
  });
  window.addEventListener("bl-cart", () => $$("[data-add]", root).forEach(b => { const q = cart.qty(b.dataset.add);
    if (b.classList.contains("add")) { b.classList.toggle("in", q > 0); b.innerHTML = q ? ICON.check + "In cart" : ICON.plus + "Add"; } }));
}

/* ================================================================ product drawer */
export function openProduct(id, push = true) {
  const p = byId[id]; if (!p) return;
  closeDrawer(false);
  const cat = CATS.find(c => c.id === p.cat), v = vendorOf(p);
  const scrim = document.createElement("div"); scrim.className = "scrim"; scrim.id = "bl-scrim";
  const d = document.createElement("aside"); d.className = "drawer"; d.id = "bl-drawer"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", p.name);
  d.innerHTML = `<div class="dh"><span class="mono fine">${p.sku} · ${esc(cat?.name)}</span><button class="x" type="button" aria-label="Close">${ICON.close}</button></div>
    <div class="dimg">${imgHTML(p)}</div>
    <div class="db">
      <p class="brand fine" style="margin:0 0 8px;display:flex;align-items:center;gap:8px">${logoChip(p)}${esc(p.brand)}</p>
      <h2 class="h3" style="font-size:26px">${esc(p.name)}</h2>
      <div style="display:flex;gap:6px;margin:12px 0 0;flex-wrap:wrap">${kindTags(p)}${p.mat.map(m => MAT[m] ? `<span class="tag"><i class="dot" style="background:${MAT[m][1]}"></i>${MAT[m][0]}</span>` : "").join("")}</div>
      <table class="spec-table">
        <tr><th>Type</th><td>${esc(p.sub)}</td></tr>
        <tr><th>Headline spec</th><td>${esc(p.spec)}</td></tr>
        <tr><th>List price</th><td>${priceTag(p)}${priceOf(p) ? ' <span class="fine">as published, 2026</span>' : ""}</td></tr>
        <tr><th>${p.kind === "software" ? "Provided by" : "Sold by"}</th><td>${p.vendor ? `${esc(p.vendor)} · ` : ""}${v ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(v)}</a>` : "Not sold. Generic part."}</td></tr>
        ${p.ref ? `<tr><th>Evidence</th><td>${refLinks(p.ref)}</td></tr>` : ""}
        ${p.mcm ? `<tr><th>McMaster part</th><td class="mono">${p.mcm} <span class="fine">· 3D model from McMaster-Carr CAD</span></td></tr>` : ""}
      </table>
      ${p.note ? `<p class="fine">${esc(p.note)}</p>` : ""}
      ${p.credit ? `<p class="fine credit">3D model: <a href="${p.credit.url}" target="_blank" rel="noopener">${esc(p.credit.name)}</a> · <a href="${p.credit.licenseUrl}" target="_blank" rel="noopener">${esc(p.credit.license)}</a></p>` : ""}
      <div class="acts">
        <button type="button" class="btn btn-accent" data-add="${p.id}">${ICON.plus}Add to cart</button>
        ${p.design ? `<a class="btn" href="${ROOT}lab-simulator/?add=${p.id}">${ICON.cube}Place in a design</a>` : ""}
        ${p.url ? `<a class="btn btn-ghost" href="${esc(p.url)}" target="_blank" rel="noopener">Vendor page ${ICON.out}</a>` : ""}
      </div>
      <p class="fine" style="margin-top:22px">assemblab does not sell this part. The cart sends you to ${p.vendor ? esc(p.vendor) : v ? esc(v) : "the maker"} ${/lab-built|research/i.test(p.price) ? "to ask about it" : p.kind === "software" ? "to get it" : "to buy it or request a quote"}.</p>
    </div>`;
  document.body.append(scrim, d);
  const close = () => closeDrawer();
  scrim.onclick = close; $(".x", d).onclick = close; $(".x", d).focus();
  d.addEventListener("click", e => { const a = e.target.closest("[data-add]"); if (a) { cart.add(a.dataset.add); toast(`Added <b>${esc(p.name)}</b>`, `${ROOT}cart/`, "View cart"); } });
  document.addEventListener("keydown", escClose);
  if (push && location.pathname.includes("/parts/")) history.replaceState(null, "", `?p=${p.id}`);
}
function escClose(e) { if (e.key === "Escape") closeDrawer(); }
export function closeDrawer(clearUrl = true) {
  $("#bl-scrim")?.remove(); $("#bl-drawer")?.remove(); document.removeEventListener("keydown", escClose);
  if (clearUrl && location.search.includes("p=")) { const u = new URL(location.href); u.searchParams.delete("p"); history.replaceState(null, "", u); }
}

/* ================================================================ toast */
export function toast(html, href, label) {
  $("#bl-toast")?.remove();
  const t = document.createElement("div"); t.id = "bl-toast"; t.className = "bl-toast"; t.setAttribute("role", "status");
  t.innerHTML = `<span>${html}</span>${href ? `<a href="${href}">${label} →</a>` : ""}`;
  document.body.append(t); clearTimeout(toast.t); toast.t = setTimeout(() => t.remove(), 3200);
  const b = $(".cartbtn"); if (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
}

/* ================================================================ app shell: sidebar, top bar, footer */
export const logo = (cls = "") => `<a class="logo ${cls}" href="${ROOT}" aria-label="assemblab home"><img src="${ROOT}assets/brand/assemblab-mark-dark.svg" alt="">assemb<i>lab</i></a>`;
const NAV = [
  ["Platform", [["", "Overview", "home"], ["lab-simulator/", "Lab Simulator", "design"], ["parts/", "Parts library", "parts"], ["solutions/", "Solutions", "solutions"], ["self-driving/", "Self-driving layer", "sdl"]]],
  ["Resources", [["atlas/", "Digital twin atlas", "twin"], ["wiki/", "Learn (wiki)", "learn"], ["cart/", "Cart", "cart"]]],
];
const TITLES = {
  "": ["Overview", "Build your self-driving lab, module by module"], "parts/": ["Parts library", "Hardware and software from every maker"],
  "solutions/": ["Solutions", "Start from what you formulate"], "self-driving/": ["Self-driving layer", "Orchestrate, rehearse and decide"],
  "cart/": ["Cart", "Each provider, one by one"],
};
/* the developer credited in the footer */
export const DEVELOPER = { name: "Mahdi Rastegar",
  scholar: "https://scholar.google.ca/citations?user=tWmo_h0AAAAJ&hl=en",
  linkedin: "https://www.linkedin.com/in/mahdirstgr/" };
const SCHOLAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3 1 9.5l4 2.4V17h2v-3.9l5 3 11-6.6L12 3Zm-5 12.2V18c0 1.7 2.2 3 5 3s5-1.3 5-3v-2.8l-5 3-5-3Z"/></svg>';
const LINKEDIN_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5Z"/></svg>';

export function mountChrome() {
  const rootPath = new URL(ROOT).pathname, here = location.pathname.slice(rootPath.length).replace(/index\.html$/, "");
  const sec = NAV.flatMap(g => g[1]).map(i => i[0]).filter(h => h && here.startsWith(h)).sort((a, b) => b.length - a.length)[0] ?? "";
  const app = document.createElement("div"); app.className = "app";
  const side = document.createElement("aside"); side.className = "sidebar"; side.id = "bl-side"; side.setAttribute("aria-label", "Navigation");
  side.innerHTML = `<a class="brand" href="${ROOT}"><img src="${ROOT}assets/brand/assemblab-favicon.svg" alt=""><span><b>assemb<i>lab</i></b><span>Self-driving lab builder</span></span></a>
    <nav class="side-nav">${NAV.map(([h, items]) => `<h6>${h}</h6>` + items.map(([href, label, ic]) => `<a href="${ROOT}${href}" class="${href === sec ? "cur" : ""}"${href === sec ? ' aria-current="page"' : ""}>${ICON[ic]}<span>${label}</span>${ic === "cart" ? '<span class="n zero" id="bl-side-n">0</span>' : ""}</a>`).join("")).join("")}</nav>`;
  const main = document.createElement("div"); main.className = "app-main";
  const [tt, ts] = TITLES[sec] || [document.title.split(" · ")[0], "assemblab"];
  const top = document.createElement("header"); top.className = "topbar";
  top.innerHTML = `<a class="skip" href="#main">Skip to content</a>
    <button type="button" class="iconbtn burger" aria-label="Menu" aria-expanded="false" aria-controls="bl-side">${ICON.menu}</button>
    <div class="ttl"><b>${esc(tt)}</b><span>${esc(ts)}</span></div>
    <form class="search" action="${ROOT}parts/" role="search"><label for="bl-q" class="sr">Search parts</label>${ICON.search}<input id="bl-q" name="q" type="search" placeholder="Search parts, makers, tools…"></form>
    <button type="button" class="iconbtn" id="bl-theme" aria-label="Switch theme"></button>
    <a class="iconbtn cartbtn" href="${ROOT}cart/" aria-label="Cart">${ICON.cart}<span class="n zero" id="bl-cart-n">0</span></a>
    <a class="btn btn-accent btn-sm" href="${ROOT}lab-simulator/">Lab Simulator</a>`;
  const kids = [...document.body.childNodes].filter(n => n.nodeName !== "SCRIPT");
  main.append(top, ...kids);
  const f = document.createElement("footer"); f.className = "bl-footer";
  f.innerHTML = `<div class="wrap"><div class="top">
      <div><img class="flogo" src="${ROOT}assets/brand/assemblab-logo-dark.svg" alt="assemblab"><p class="tagline">Build your self-driving lab, module by module.</p><p>A catalogue and Lab Simulator for self-driving laboratories. assemblab sells nothing; each part links to its maker.</p></div>
      <div><h4>Platform</h4><a href="${ROOT}lab-simulator/">Lab Simulator</a><a href="${ROOT}solutions/#templates">Templates</a><a href="${ROOT}self-driving/">Self-driving layer</a><a href="${ROOT}atlas/">Digital twin atlas</a></div>
      <div><h4>Parts</h4>${CATS.slice(0, 5).map(c => `<a href="${ROOT}parts/?cat=${c.id}">${c.name}</a>`).join("")}<a href="${ROOT}parts/?cat=ai">Decision &amp; AI</a></div>
      <div><h4>Learn</h4><a href="${ROOT}wiki/">Wiki</a><a href="${ROOT}wiki/references/">References</a><a href="https://github.com/mahdi-rstgr/formulation-sdl-atlas">GitHub</a><a href="${ROOT}cart/">Cart</a></div>
    </div>
    <div class="dev"><span>Developed by <b>${DEVELOPER.name}</b></span><a href="${DEVELOPER.scholar}" target="_blank" rel="noopener">${SCHOLAR_SVG}Google Scholar</a><a href="${DEVELOPER.linkedin}" target="_blank" rel="noopener">${LINKEDIN_SVG}LinkedIn</a></div>
    <div class="base"><span>Built on the review <i>Self-Driving Laboratories for Formulation</i> (2026). Instrument 3D models: <a href="https://mbzuai-nlp.github.io/ChemLab-Assets/" target="_blank" rel="noopener" style="display:inline;padding:0;text-decoration:underline">ChemLab-Assets (MBZUAI)</a>, CC BY-NC 4.0.</span><span>Product names and logos are trademarks of their owners and identify their products. Prices are published list prices; vendors quote the final price.</span></div></div>`;
  main.append(f);
  app.append(side, main); document.body.prepend(app);

  const burger = $(".burger", top); let scr = null;
  const setNav = v => { side.classList.toggle("open", v); burger.setAttribute("aria-expanded", String(v));
    if (v && !scr) { scr = document.createElement("div"); scr.className = "scrim-nav"; scr.onclick = () => setNav(false); document.body.append(scr); }
    else if (!v && scr) { scr.remove(); scr = null; } };
  burger.onclick = () => setNav(!side.classList.contains("open"));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setNav(false); });
  const q = new URLSearchParams(location.search).get("q"); if (q && sec === "parts/") $("#bl-q").value = q;

  // theme: dark dashboard by default, light on request; remembered per browser
  const tb = $("#bl-theme", top), SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>', MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';
  const paint = () => { const t = document.documentElement.dataset.theme || "dark"; tb.innerHTML = t === "dark" ? SUN : MOON; tb.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme"); };
  tb.onclick = () => { const t = (document.documentElement.dataset.theme || "dark") === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = t; try { localStorage.setItem("assemblab-theme", t); } catch { } paint(); };
  paint();

  const upd = () => { const n = cart.count(); for (const el of [$("#bl-cart-n"), $("#bl-side-n")]) if (el) { el.textContent = n; el.classList.toggle("zero", !n); } };
  window.addEventListener("bl-cart", upd); window.addEventListener("storage", e => { if (e.key === KEY) { upd(); window.dispatchEvent(new CustomEvent("bl-cart")); } }); upd();

  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
  $$(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));
}
