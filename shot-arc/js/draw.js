// Canvas overlay: court lines, click markers, tracked points, the arc, the distance triangle and labels.
"use strict";

/* ---------------- drawing ---------------- */
// Labels are queued and drawn last, on top of everything, and kept clear of each other and of the marker dots.
let tagBoxes = [], tagQueue = [];
function tag(...args) { tagQueue.push(args); }
function avoid(x, y, r) { tagBoxes.push({ x: x - r, y: y - r, w: 2 * r, h: 2 * r }); }
function flushTags() { for (const a of tagQueue) drawTag(...a); tagQueue = []; }
function drawTag(c, text, x, y, color, align, s) {
  const t = textScale(s);
  c.font = `600 ${Math.round(15 * t)}px Barlow, "Segoe UI", sans-serif`;
  const w = c.measureText(text).width + 14 * t, h = 21 * t;
  const R = contentRect();
  let bx = align === "left" ? x - w : align === "center" ? x - w / 2 : x;
  bx = clamp(bx, R.x0 + 4, R.x1 - w - 4);
  // Nudge the label up or down until it doesn't overlap one already drawn this frame.
  const y0 = clamp(y - h / 2, R.y0 + 4, R.y1 - h - 4), gap = 3 * t;
  let by = y0;
  const hit = () => tagBoxes.some(r => bx < r.x + r.w + gap && bx + w + gap > r.x && by < r.y + r.h + gap && by + h + gap > r.y);
  for (let k = 1; hit() && k < 12; k++) by = clamp(y0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (h + gap), R.y0 + 4, R.y1 - h - 4);
  tagBoxes.push({ x: bx, y: by, w, h });
  c.fillStyle = "rgba(8,12,18,.82)";
  c.beginPath(); c.roundRect ? c.roundRect(bx, by, w, h, 4 * t) : c.rect(bx, by, w, h); c.fill();
  c.fillStyle = color; c.fillRect(bx, by, 3 * t, h);
  c.fillStyle = "#fff"; c.textBaseline = "middle"; c.fillText(text, bx + 8 * t, by + h / 2 + t);
}
function cross(c, p, color, s) {
  c.strokeStyle = "rgba(0,0,0,.6)"; c.lineWidth = 4 * s;
  c.beginPath(); c.arc(p.x, p.y, 8 * s, 0, 7); c.moveTo(p.x - 14 * s, p.y); c.lineTo(p.x + 14 * s, p.y); c.moveTo(p.x, p.y - 14 * s); c.lineTo(p.x, p.y + 14 * s); c.stroke();
  c.strokeStyle = color; c.lineWidth = 2 * s; c.stroke();
}
function path(c, pts) {
  c.beginPath(); let on = false;
  for (const p of pts) { if (!p) { on = false; continue; } on ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); on = true; }
}
function stroke2(c, color, w, s, dash) {
  c.setLineDash(dash ? dash.map(v => v * s) : []);
  c.strokeStyle = "rgba(0,0,0,.55)"; c.lineWidth = (w + 3) * s; c.stroke();
  c.strokeStyle = color; c.lineWidth = w * s; c.stroke();
  c.setLineDash([]);
}
function drawCourt(c, f, s) {
  const C = court(), o = C.rimOff, hw = C.lane / 2, yF = C.ft - o, yb = yBreak(C);
  const P = (X, Y) => W2F([X, Y, 0], f), lines = [];
  lines.push([[-hw, -o], [hw, -o], [hw, yF], [-hw, yF], [-hw, -o]].map(([X, Y]) => P(X, Y)));
  lines.push([...Array(49)].map((_, i) => P(6 * Math.cos(i * Math.PI / 24), yF + 6 * Math.sin(i * Math.PI / 24))));
  const a0 = Math.atan2(yb, C.corner);
  lines.push([P(C.corner, -o), P(C.corner, yb), ...[...Array(61)].map((_, i) => { const a = a0 + (Math.PI - 2 * a0) * i / 60; return P(C.arc * Math.cos(a), C.arc * Math.sin(a)); }), P(-C.corner, yb), P(-C.corner, -o)]);
  lines.push([P(-25, -o), P(25, -o)]);
  for (const L of lines) { path(c, L); c.strokeStyle = "rgba(90,220,255,.85)"; c.lineWidth = 2 * s; c.stroke(); }
}
// Markers and lines are sized against how big the canvas is on screen, not the file's pixel
// width, so a 1920-wide file and a 1080-wide one get the same small markers. Label text keeps
// a floor: it never shows smaller than about 11 screen pixels.
function overlayScale() {
  const shown = view.clientWidth;
  return shown > 0 ? Math.max(0.5, S.W / shown / 3) : 1;
}
// The part of the frame that is actual picture: excludes black bars baked into the file
// (e.g. a portrait clip exported inside a landscape frame), so the overlay stays on the video.
function contentRect() { return S.content || { x0: 0, y0: 0, x1: S.W, y1: S.H }; }
function detectContent() {
  const full = { x0: 0, y0: 0, x1: S.W, y1: S.H };
  pctx.drawImage(video, 0, 0, S.W, S.H);
  const d = pctx.getImageData(0, 0, S.W, S.H).data;
  const lum = (x, y) => { const i = (y * S.W + x) * 4; return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; };
  const DARK = 28, sy = Math.max(1, S.H >> 6), sx = Math.max(1, S.W >> 6);
  const colDark = x => { for (let y = 0; y < S.H; y += sy) if (lum(x, y) > DARK) return false; return true; };
  const rowDark = y => { for (let x = 0; x < S.W; x += sx) if (lum(x, y) > DARK) return false; return true; };
  let x0 = 0, x1 = S.W - 1, y0 = 0, y1 = S.H - 1;
  while (x0 < x1 && colDark(x0)) x0++;
  while (x1 > x0 && colDark(x1)) x1--;
  while (y0 < y1 && rowDark(y0)) y0++;
  while (y1 > y0 && rowDark(y1)) y1--;
  // Only treat real bars as bars; a thin dark edge of the scene shouldn't crop anything.
  if (x0 < S.W * 0.02) x0 = 0;
  if (S.W - 1 - x1 < S.W * 0.02) x1 = S.W - 1;
  if (y0 < S.H * 0.02) y0 = 0;
  if (S.H - 1 - y1 < S.H * 0.02) y1 = S.H - 1;
  if (x1 - x0 < S.W * 0.2 || y1 - y0 < S.H * 0.2) return full;
  return { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}
function textScale(s) {
  const shown = view.clientWidth;
  return shown > 0 ? Math.max(s, (S.W / shown) * 11 / 15) : s;
}
let resizeTimer = null;
window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (S.loaded && !S.playing && !S.tracking && !S.measuring) render(); }, 120); });
function render(f = S.frame) {
  if (!S.loaded) return;
  vctx.drawImage(video, 0, 0, S.W, S.H);
  if (!S.measuring) drawOverlay(f);
}
function drawOverlay(f) {
  const c = vctx, s = overlayScale(), trail = el.trail.checked, z = zoomAt(f);
  const P = p => fromRef(p, f);
  tagBoxes = []; tagQueue = [];
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  const R = contentRect();
  c.beginPath(); c.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); c.clip();
  if (S.cal && el.courtLines.checked) drawCourt(c, f, s);
  if (S.replay) { drawReplay(c, f, s); flushTags(); c.restore(); return; }
  // A replay that played to the end leaves its last frame as it was: court lines only, no shot data.
  // Moving to any other frame brings the normal overlay back.
  if (S.replayEndF != null && f !== S.replayEndF) S.replayEndF = null;
  if (S.replayEndF != null) { c.restore(); return; }
  for (const q of [...S.laneB, ...S.laneF]) { const p = P(q); c.fillStyle = "#5ADCFF"; c.strokeStyle = "#000"; c.lineWidth = 1.5 * s; c.beginPath(); c.rect(p.x - 5 * s, p.y - 5 * s, 10 * s, 10 * s); c.fill(); c.stroke(); }
  for (const q of S.three) { const p = P(q); c.beginPath(); c.arc(p.x, p.y, 5 * s, 0, 7); c.fillStyle = "#5ADCFF"; c.fill(); c.strokeStyle = "#000"; c.stroke(); }
  if (S.rim) cross(c, P(S.rim), RIMC, s);
  if (S.feet) { const p = P(S.feet); c.beginPath(); c.moveTo(p.x - 8 * s, p.y - 8 * s); c.lineTo(p.x + 8 * s, p.y + 8 * s); c.moveTo(p.x + 8 * s, p.y - 8 * s); c.lineTo(p.x - 8 * s, p.y + 8 * s); stroke2(c, "#FFE14D", 3, s); }

  if (el.showPts.checked) {
    for (const [pf, pr] of S.points) {
      if (trail && pf > f) continue;
      const p = P(pr);
      c.beginPath();
      if (pr.src === "manual") c.rect(p.x - 3.5 * s, p.y - 3.5 * s, 7 * s, 7 * s); else c.arc(p.x, p.y, 3.2 * s, 0, 7);
      c.lineWidth = 1.5 * s; c.strokeStyle = "rgba(0,0,0,.8)"; c.stroke();
      if (pr.src !== "pred") { c.fillStyle = "#fff"; c.fill(); } else { c.strokeStyle = "#fff"; c.stroke(); }
    }
    const cur = S.points.get(f);
    if (cur && S.ball) { const p = P(cur); c.beginPath(); c.arc(p.x, p.y, S.ball.r / z + 3 * s, 0, 7); c.strokeStyle = "#fff"; c.lineWidth = 2 * s; c.stroke(); }
  }

  // "Arc follows the ball" off: no arc while the ball is in the air, then the whole arc once it reaches the rim.
  if (S.fit && S.cal && (trail || f >= Math.round(S.fit.entryF))) drawFit(c, f, s, S.fit, { trail, full: true });
  flushTags();
  if (S.lastClick && S.lastClick.f === f) {
    c.beginPath(); c.arc(S.lastClick.x, S.lastClick.y, 14 * s, 0, 7);
    c.strokeStyle = "#fff"; c.lineWidth = 3 * s; c.stroke();
  }
  c.restore();
}
// Replay: while the ball flies, only its arc (plus earlier arcs in "keep" mode). On the freeze frame,
// just the shot that went in, with its full markings and labels.
function drawReplay(c, f, s) {
  const R = S.replay, cur = R.shots[R.idx];
  if (R.frozen) { if (cur) drawFit(c, f, s, cur, { trail: false, full: true }); return; }
  if (R.mode === "keep") for (let j = 0; j < R.idx; j++) drawFit(c, f, s, R.shots[j], { trail: false, full: false, faded: true });
  // With "Arc follows the ball" off, the shot in flight isn't drawn; its arc appears on the freeze frame.
  if (cur && f >= cur.releaseF && el.trail.checked) drawFit(c, f, s, cur, { trail: true, full: false });
}
// One shot's overlay. trail: arc grows with the ball; full: triangle, markers and labels; faded: earlier shot's line.
function drawFit(c, f, s, F, o) {
  const rel0 = F.releaseF, trail = o.trail;
  {
    const at = t => W2F(ballPos(F.p, t), f), tNow = (f - rel0) / F.k;
    const vis = fr => !trail || f >= Math.round(fr);
    // The triangle: shot spot on the floor -> spot under the rim -> rim.
    if (o.full && vis(rel0)) {
      const spot = W2F([F.spot[0], F.spot[1], 0], f), under = W2F([0, 0, 0], f), rimP = W2F([0, 0, RIM_FT], f);
      const relP = at(0), relFloor = W2F([F.p[0], F.p[1], 0], f);
      path(c, [spot, under]); stroke2(c, "#FFE14D", 2.5, s, [9, 6]);
      path(c, [under, rimP]); stroke2(c, "#fff", 1.5, s, [5, 5]);
      path(c, [relFloor, relP]); stroke2(c, "#fff", 1.5, s, [5, 5]);
      if (spot && under) tag(c, `${F.dist.toFixed(1)} ft`, (spot.x + under.x) / 2, (spot.y + under.y) / 2 + 22 * s, "#FFE14D", "center", s);
    }
    let tEnd = F.tR, show = true;
    if (trail) { if (f < rel0) show = false; else tEnd = Math.min(F.tR, tNow); }
    if (show && tEnd > 0) {
      path(c, [...Array(121)].map((_, i) => at(tEnd * i / 120)));
      if (o.faded) {
        c.globalAlpha = 0.7; c.strokeStyle = "rgba(0,0,0,.45)"; c.lineWidth = 6 * s; c.stroke();
        c.strokeStyle = ARC; c.lineWidth = 3 * s; c.stroke(); c.globalAlpha = 1;
      } else {
        c.strokeStyle = "rgba(0,0,0,.55)"; c.lineWidth = 8 * s; c.stroke();
        c.strokeStyle = ARC; c.lineWidth = 4.5 * s; c.stroke();
      }
      if (trail && tNow < F.tR) { const h = at(tEnd); if (h) { c.beginPath(); c.arc(h.x, h.y, 7 * s, 0, 7); c.fillStyle = ARC; c.fill(); c.lineWidth = 2 * s; c.strokeStyle = "#fff"; c.stroke(); } }
    }
    if (!o.full) return;
    const hdir = [F.p[3] / F.vh, F.p[4] / F.vh, 0];
    const angleArc = (X, deg) => {
      const R = 1.6, pts = [...Array(25)].map((_, i) => { const a = deg / DEG * i / 24; return W2F(vAdd(X, vAdd(vMul(hdir, R * Math.cos(a)), [0, 0, R * Math.sin(a)])), f); });
      path(c, [W2F(X, f), W2F(vAdd(X, vMul(hdir, 2.4)), f)]); stroke2(c, "#fff", 1.5, s, [5, 4]);
      path(c, pts); stroke2(c, "#fff", 1.5, s);
    };
    const dot = p => { if (!p) return; avoid(p.x, p.y, 9 * s); c.beginPath(); c.arc(p.x, p.y, 6 * s, 0, 7); c.fillStyle = "#fff"; c.fill(); c.lineWidth = 2.5 * s; c.strokeStyle = ARC; c.stroke(); };
    const rel = at(0), apex = at(F.tA), entry = at(F.tR);
    const side = rel && entry && entry.x < rel.x ? "right" : "left";
    if (vis(rel0) && rel) {
      angleArc(ballPos(F.p, 0), F.relAngle); dot(rel);
      tag(c, `Release ${F.relAngle.toFixed(1)}° at ${F.relH.toFixed(1)} ft`, rel.x + (side === "right" ? 18 : -18) * s, rel.y + 28 * s, ARC, side, s);
    }
    if (vis(F.apexF) && apex) { dot(apex); tag(c, `Apex ${F.apexH.toFixed(1)} ft`, apex.x, apex.y - 26 * s, ARC, "center", s); }
    if (vis(F.entryF) && entry) {
      angleArc(ballPos(F.p, F.tR), -F.entryAngle); dot(entry);
      tag(c, `Entry ${F.entryAngle.toFixed(1)}°`, entry.x + (side === "right" ? -18 : 18) * s, entry.y - 34 * s, ARC, side === "right" ? "left" : "right", s);
    }
  }
}
