// Ball color sampling and ball-edge finding around a click.
"use strict";

/* ---------------- color matching ---------------- */
function matcher(ref, tol) {
  const sMin = Math.max(0.2, ref.s * 0.5), vMin = Math.max(0.12, ref.v * 0.35) * 255, rh = ref.h;
  return (r, g, b) => {
    const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
    if (mx < vMin) return false;
    const mn = r < g ? (r < b ? r : b) : (g < b ? g : b), d = mx - mn;
    if (d / mx < sMin) return false;
    let h;
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
    let dh = Math.abs(h - rh); if (dh > 180) dh = 360 - dh;
    return dh <= tol;
  };
}
function region(cx, cy, R) {
  const x0 = clamp(Math.floor(cx - R), 0, S.W - 1), y0 = clamp(Math.floor(cy - R), 0, S.H - 1);
  const x1 = clamp(Math.ceil(cx + R), 0, S.W), y1 = clamp(Math.ceil(cy + R), 0, S.H);
  return { x0, y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
}
function meanColor(cx, cy, r, minSat) {
  const g = region(cx, cy, r), d = pctx.getImageData(g.x0, g.y0, g.w, g.h).data;
  let n = 0, hc = 0, hs = 0, ss = 0, vs = 0;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if ((g.x0 + x - cx) ** 2 + (g.y0 + y - cy) ** 2 > r * r) continue;
    const p = (y * g.w + x) * 4, R = d[p], Gc = d[p + 1], B = d[p + 2];
    const mx = Math.max(R, Gc, B), mn = Math.min(R, Gc, B), dd = mx - mn;
    if (!mx || dd / mx < minSat || mx < 30) continue;
    let h;
    if (mx === R) h = ((Gc - B) / dd) % 6; else if (mx === Gc) h = (B - R) / dd + 2; else h = (R - Gc) / dd + 4;
    h *= 60; if (h < 0) h += 360;
    hc += Math.cos(h / DEG); hs += Math.sin(h / DEG); ss += dd / mx; vs += mx / 255; n++;
  }
  if (n < 3) return null;
  let h = Math.atan2(hs, hc) * DEG; if (h < 0) h += 360;
  return { h, s: ss / n, v: vs / n };
}
function refine(cx, cy, match, maxR) {
  const g = region(cx, cy, maxR * 2 + 4), d = pctx.getImageData(g.x0, g.y0, g.w, g.h).data;
  const at = (x, y) => {
    x = Math.round(x) - g.x0; y = Math.round(y) - g.y0;
    if (x < 0 || y < 0 || x >= g.w || y >= g.h) return false;
    const p = (y * g.w + x) * 4; return match(d[p], d[p + 1], d[p + 2]);
  };
  let x = cx, y = cy, e = [];
  for (let it = 0; it < 3; it++) {
    e = [];
    for (let k = 0; k < 16; k++) {
      const a = k * Math.PI / 8, dx = Math.cos(a), dy = Math.sin(a);
      let last = 0, gap = 0;
      for (let t = 1; t <= maxR; t++) {
        if (at(x + dx * t, y + dy * t)) { last = t; gap = 0; }
        else if (++gap > Math.max(3, last * 0.3)) break;
      }
      e.push(last);
    }
    let sx = 0, sy = 0;
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 8, m = (e[k] - e[k + 8]) / 2; sx += m * Math.cos(a); sy += m * Math.sin(a); }
    x += sx / 4; y += sy / 4;
  }
  const s = [...e].sort((a, b) => a - b);
  return { x, y, r: (s[7] + s[8]) / 2 + 0.5 };
}
function snapToBall(p) {
  if (!S.ball || S.ball.h == null) return null;
  pctx.drawImage(video, 0, 0, S.W, S.H);
  const rf = S.ball.r / zoomAt(S.frame);
  const g = refine(p.x, p.y, matcher(S.ball, +el.tol.value), Math.round(rf * 2));
  if (g.r < rf * 0.5 || g.r > rf * 1.6 || Math.hypot(g.x - p.x, g.y - p.y) > rf) return null;
  return g;
}
