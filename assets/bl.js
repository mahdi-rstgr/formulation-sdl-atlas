/* Laboo shared runtime: header + mega menu, footer, cart store, product cards, product drawer, toast.
 * Every page loads it as a module. Paths are resolved from this file, so pages at any depth work. */
import { CATS, PRODUCTS, byId, parsePrice, vendorOf } from "../data/catalog.js";
export { CATS, PRODUCTS, byId, parsePrice, vendorOf };

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
const KEY = "laboo-cart-v1";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
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
  orchestration: G('<circle cx="24" cy="10" r="4"/><circle cx="10" cy="36" r="4"/><circle cx="38" cy="36" r="4"/><path d="M22 14 12 32M26 14l10 18M14 36h20"/>'),
  simulation: G('<path d="M24 6 8 15v18l16 9 16-9V15L24 6Z" stroke-dasharray="3 3"/><path d="M8 15l16 9 16-9M24 24v18"/>'),
  ai: G('<path d="M38 24a14 14 0 1 1-4.1-9.9"/><path d="M34 6v8h-8"/><circle cx="24" cy="24" r="3"/>'),
};
export const thumbOf = p => p.design ? `${ROOT}new-design/thumbs/${p.id}.png` : null;
export const imgHTML = (p, cls = "") => { const t = thumbOf(p);
  return t ? `<img class="${cls}" src="${t}" alt="" loading="lazy" onerror="this.outerHTML=this.nextElementSibling?.innerHTML||''"><template>${GLYPH[p.cat] || ""}</template>` : (GLYPH[p.cat] || ""); };

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
  if (p.design) t.push(`<span class="tag cad" title="Can be placed in the 3D design tool">3D</span>`);
  if (p.mcm) t.push(`<span class="tag">McMaster</span>`);
  return t.join("");
}

/* ================================================================ product card */
export function card(p) {
  const inCart = cart.qty(p.id) > 0;
  return `<article class="pcard" data-id="${p.id}">
    <div class="ph">${imgHTML(p)}<div class="tags">${kindTags(p)}</div><span class="sku">${p.sku}</span></div>
    <div class="bd">
      <span class="brand">${esc(p.brand)}</span>
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
      <p class="brand mono fine" style="margin:0 0 6px">${esc(p.brand)}</p>
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
      <div class="acts">
        <button type="button" class="btn btn-ink" data-add="${p.id}">${ICON.plus}Add to cart</button>
        ${p.design ? `<a class="btn" href="${ROOT}new-design/?add=${p.id}">${ICON.cube}Place in a design</a>` : ""}
        ${p.url ? `<a class="btn btn-ghost" href="${esc(p.url)}" target="_blank" rel="noopener">Vendor page ${ICON.out}</a>` : ""}
      </div>
      <p class="fine" style="margin-top:22px">Laboo does not sell this part. The cart sends you to ${p.vendor ? esc(p.vendor) : v ? esc(v) : "the maker"} ${/lab-built|research/i.test(p.price) ? "to ask about it" : p.kind === "software" ? "to get it" : "to buy it or request a quote"}.</p>
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

/* ================================================================ header + footer */
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 27.5h26" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M22.4 8.6A8.4 8.4 0 1 0 24.4 15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M21.6 12.9l2.9 2.6 2.6-2.9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="15" r="2.6" fill="var(--accent)"/></svg>`;
export const logo = (cls = "") => `<a class="logo ${cls}" href="${ROOT}" aria-label="Laboo home">${LOGO}Laboo</a>`;

function menus() {
  const R = ROOT;
  const n = id => PRODUCTS.filter(p => p.cat === id).length;
  return [
    { id: "platform", label: "Platform", cols: [
      { h: "Design", links: [[`${R}new-design/`, "New design", "Lay out a cell in 3D from any vendor's parts"], [`${R}solutions/#templates`, "Design templates", "Start from a proven formulation cell"], [`${R}new-design/#intelligence`, "Cell intelligence", "Capability, reach, overlap and budget checks"]] },
      { h: "Self-driving layer", links: [[`${R}self-driving/#orchestrate`, "Orchestrate", "Compare 8 open-source orchestration systems"], [`${R}self-driving/#rehearse`, "Rehearse", "Simulation ladder and digital twins"], [`${R}self-driving/#decide`, "Decide", "Optimizers and AI agent roles"]] },
      { feature: true, h: "Live digital twin", links: [[`${R}atlas/`, "Formulation SDL Atlas", "Follow a premix cup through a real cell with collision-checked UR motions"]] },
    ] },
    { id: "solutions", label: "Solutions", cols: [
      { h: "By material", links: [[`${R}solutions/#liquid`, "Liquids", "Pipettes, pumps, liquid handlers"], [`${R}solutions/#paste`, "Pastes & gels", "Extrusion against a yield stress"], [`${R}solutions/#powder`, "Powders", "Gravimetric and feeder dosing"], [`${R}solutions/#object`, "Objects", "Moving cups, vials and plates"]] },
      { h: "By cell", links: [[`${R}new-design/?t=sfl`, "Formulation cell", "CNC dispensing + cobot + mixer"], [`${R}new-design/?t=liquid`, "Liquid-handling bench", "Opentrons Flex + UR5e"], [`${R}new-design/?t=powder`, "Powder & paste station", "Quantos, feeders, Lite 6"], [`${R}new-design/?t=mounted`, "Cobot on a workstation", "McMaster table, pedestal and slide"]] },
      { h: "Proven loops", links: [[`${R}solutions/#loops`, "20 literature scenarios", "How published SDLs sense and act on each material"]] },
    ] },
    { id: "parts", label: "Parts library", cols: [
      { h: "Hardware", links: CATS.slice(0, 8).map(c => [`${R}parts/?cat=${c.id}`, c.name, `${n(c.id)} parts`]) },
      { h: "Software", links: CATS.slice(8).map(c => [`${R}parts/?cat=${c.id}`, c.name, `${n(c.id)} tools`]) },
      { feature: true, h: "New: McMaster-Carr structure", links: [[`${R}parts/?cat=structure`, "Workstations, pedestals & slides", "Real CAD you can drop into a design"]] },
    ] },
    { id: "learn", label: "Learn", cols: [
      { h: "Knowledge base", links: [[`${R}wiki/`, "SDL wiki", "Materials, hardware, simulation, AI"], [`${R}wiki/hardware/`, "Hardware guides", "Dispensers, platforms, cost vs. accuracy"], [`${R}wiki/references/`, "178 references", "Every number on Laboo is cited"]] },
      { h: "Research", links: [[`${R}atlas/`, "The atlas", "Seven questions, one live twin"], [`${R}wiki/orchestration/open-source/`, "Orchestration comparison", "Supplementary Table S1"], [`${R}#model`, "Why we don't sell parts", "How the cart refers you to makers"]] },
    ] },
  ];
}

export function mountChrome(current = "") {
  const h = document.createElement("header"); h.className = "bl-header";
  const M = menus();
  h.innerHTML = `<a class="skip" href="#main">Skip to content</a><div class="wrap in">
    ${logo()}
    <nav class="nav" id="bl-nav" aria-label="Main">
      ${M.map(m => `<div><button type="button" class="top ${current === m.id ? "cur" : ""}" aria-expanded="false" aria-controls="mega-${m.id}">${m.label}${ICON.car}</button>
        <div class="mega" id="mega-${m.id}"><div class="wrap cols">${m.cols.map(c => `<div class="${c.feature ? "feature" : ""}"><h4>${c.h}</h4>${c.links.map(([href, b, s]) => `<a href="${href}"><b>${esc(b)}</b><span>${esc(s)}</span></a>`).join("")}</div>`).join("")}</div></div></div>`).join("")}
    </nav>
    <div class="right">
      <button type="button" class="themebtn" id="bl-theme" aria-label="Switch theme"></button>
      <a class="cartbtn" href="${ROOT}cart/" aria-label="Cart">${ICON.cart}<span class="lbl">Cart</span><span class="n" id="bl-cart-n">0</span></a>
      <a class="btn btn-accent btn-sm" href="${ROOT}new-design/">Start designing</a>
      <button type="button" class="burger" aria-label="Menu" aria-expanded="false" aria-controls="bl-nav">${ICON.menu}</button>
    </div></div>`;
  document.body.prepend(h);
  const tops = $$(".nav .top", h), closeAll = except => tops.forEach(t => { if (t !== except) { t.setAttribute("aria-expanded", "false"); $("#" + t.getAttribute("aria-controls")).classList.remove("open"); } });
  const desktop = () => matchMedia("(min-width:981px)").matches;
  tops.forEach(t => {
    const m = $("#" + t.getAttribute("aria-controls"));
    const open = v => { t.setAttribute("aria-expanded", String(v)); m.classList.toggle("open", v); };
    t.onclick = () => { const v = t.getAttribute("aria-expanded") !== "true"; closeAll(t); open(v); };
    t.parentElement.addEventListener("mouseenter", () => { if (desktop()) { closeAll(t); open(true); } });
    t.parentElement.addEventListener("mouseleave", () => { if (desktop()) open(false); });
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
  document.addEventListener("click", e => { if (!h.contains(e.target)) closeAll(); });
  const burger = $(".burger", h), nav = $("#bl-nav", h);
  burger.onclick = () => { const v = !nav.classList.contains("open"); nav.classList.toggle("open", v); burger.setAttribute("aria-expanded", String(v)); };

  const f = document.createElement("footer"); f.className = "bl-footer";
  f.innerHTML = `<div class="wrap"><div class="top">
      <div>${logo()}<p class="tagline">Build the bench. Close the loop.</p><p>Design a self-driving lab from every maker's parts. Buy each one from the people who make it.</p></div>
      <div><h4>Platform</h4><a href="${ROOT}new-design/">New design</a><a href="${ROOT}solutions/#templates">Templates</a><a href="${ROOT}self-driving/">Self-driving layer</a><a href="${ROOT}atlas/">Digital twin</a></div>
      <div><h4>Parts</h4>${CATS.slice(0, 6).map(c => `<a href="${ROOT}parts/?cat=${c.id}">${c.name}</a>`).join("")}</div>
      <div><h4>Software</h4>${CATS.slice(8).map(c => `<a href="${ROOT}parts/?cat=${c.id}">${c.name}</a>`).join("")}<a href="${ROOT}parts/?cat=structure">Workstations</a></div>
      <div><h4>Learn</h4><a href="${ROOT}wiki/">Wiki</a><a href="${ROOT}wiki/references/">References</a><a href="https://github.com/mahdi-rstgr/formulation-sdl-atlas">GitHub</a><a href="${ROOT}cart/">Cart</a></div>
    </div>
    <div class="base"><span>Built on the review <i>Self-Driving Laboratories for Formulation</i> (Acceleration Consortium, University of Toronto, 2026).</span><span>Product names are trademarks of their owners. Prices are published list prices; vendors quote the final price.</span></div></div>`;
  document.body.append(f);

  // theme: dark (black + vibrant beet) by default, light editorial on request; remembered per browser
  const tb = $("#bl-theme", h), SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>', MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';
  const paint = () => { const t = document.documentElement.dataset.theme || "dark"; tb.innerHTML = t === "dark" ? SUN : MOON; tb.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme"); };
  tb.onclick = () => { const t = (document.documentElement.dataset.theme || "dark") === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = t; try { localStorage.setItem("laboo-theme", t); } catch { } paint(); };
  paint();

  const upd = () => { const n = cart.count(), el = $("#bl-cart-n"); if (el) { el.textContent = n; el.classList.toggle("zero", !n); } };
  window.addEventListener("bl-cart", upd); window.addEventListener("storage", e => { if (e.key === KEY) { upd(); window.dispatchEvent(new CustomEvent("bl-cart")); } }); upd();

  // reveal-on-scroll
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
  $$(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));
}
