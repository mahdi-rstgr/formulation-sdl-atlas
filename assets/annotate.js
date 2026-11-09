/* Interactive figure annotation: invisible hotspots over an illustration; hovering, tapping or focusing one
 * draws a thin leader line from a label in an empty corner of the figure to the component.
 *
 *   annotate(container, { w, h, regions: [{ id, label, sub, poly: [[x, y], ...], anchor: [x, y], side: "tl" | "tr" | "bl" | "br" }] })
 *
 * Coordinates are in the image's own pixels (w × h); the overlay scales with the image. One label shows at a time,
 * so labels never overlap, and each label sits where the illustration is empty. */
const NS = "http://www.w3.org/2000/svg";
export function annotate(box, { w, h, regions }) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.setAttribute("class", "anno-svg"); svg.setAttribute("role", "group"); svg.setAttribute("aria-label", "Components of the figure");
  const lines = document.createElementNS(NS, "g"); lines.setAttribute("class", "anno-lines");
  const hot = document.createElementNS(NS, "g");
  const leader = document.createElementNS(NS, "polyline"), dot = document.createElementNS(NS, "circle"), halo = document.createElementNS(NS, "circle");
  leader.setAttribute("class", "anno-leader"); dot.setAttribute("class", "anno-dot"); halo.setAttribute("class", "anno-halo");
  dot.setAttribute("r", 6); halo.setAttribute("r", 16); lines.append(leader, halo, dot);
  svg.append(hot, lines);
  const label = document.createElement("div"); label.className = "anno-label"; label.setAttribute("aria-live", "polite");
  box.append(svg, label);
  let cur = null, pinned = null;
  function show(rg) {
    if (!rg) { box.classList.remove("on"); cur = null; return; }
    cur = rg; const [ax, ay] = rg.anchor, corner = rg.side || "tl";   // label sits in an empty corner: tl | tr | bl | br
    label.innerHTML = `<b>${rg.label}</b>${rg.sub ? `<span>${rg.sub}</span>` : ""}`;
    label.dataset.side = corner[1] === "r" ? "right" : "left";
    label.style.top = corner[0] === "t" ? "4%" : ""; label.style.bottom = corner[0] === "b" ? "4%" : "";
    label.style.left = corner[1] === "l" ? "3%" : ""; label.style.right = corner[1] === "r" ? "3%" : "";
    // leader: from the label edge facing the component, across, then up or down to it (orthogonal, like a drawing callout)
    const B = box.getBoundingClientRect(), L = label.getBoundingClientRect(), k = w / B.width;
    const lx0 = (L.left - B.left) * k, lx1 = (L.right - B.left) * k, ly0 = (L.top - B.top) * k, ly1 = (L.bottom - B.top) * k;
    const sxp = ax >= lx1 ? lx1 : ax <= lx0 ? lx0 : (corner[1] === "l" ? lx1 : lx0), syp = (ly0 + ly1) / 2;
    const pts = ax >= lx0 && ax <= lx1 ? `${ax},${corner[0] === "t" ? ly1 : ly0} ${ax},${ay}` : `${sxp},${syp} ${ax},${syp} ${ax},${ay}`;
    leader.setAttribute("points", pts);
    dot.setAttribute("cx", ax); dot.setAttribute("cy", ay); halo.setAttribute("cx", ax); halo.setAttribute("cy", ay);
    box.classList.add("on");
  }
  for (const rg of regions) {
    const a = document.createElementNS(NS, "a"); a.setAttribute("tabindex", "0"); a.setAttribute("role", "button"); a.setAttribute("aria-label", rg.label + (rg.sub ? `: ${rg.sub}` : ""));
    if (rg.href) a.setAttribute("href", rg.href);
    for (const poly of (Array.isArray(rg.poly[0][0]) ? rg.poly : [rg.poly])) { const p = document.createElementNS(NS, "polygon"); p.setAttribute("points", poly.map(q => q.join(",")).join(" ")); p.setAttribute("class", "anno-hot"); a.append(p); }
    a.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") show(rg); });
    a.addEventListener("pointerleave", e => { if (e.pointerType === "mouse" && !pinned) show(null); });
    a.addEventListener("click", e => { if (matchMedia("(hover: none)").matches || e.pointerType === "touch") { e.preventDefault(); pinned = pinned === rg ? null : rg; show(pinned); } });
    a.addEventListener("focus", () => show(rg)); a.addEventListener("blur", () => { if (!pinned) show(null); });
    hot.append(a);
  }
  box.addEventListener("pointerleave", () => { if (!pinned) show(null); });
  document.addEventListener("pointerdown", e => { if (pinned && !box.contains(e.target)) { pinned = null; show(null); } });
  return { show: id => show(regions.find(r => r.id === id) || null) };
}
