// Measures camera pan/zoom between frames so positions can be put on one fixed grid.
"use strict";

/* ---------------- camera motion ---------------- */
function camAt(f) {
  if (!S.cam) return [1, 0, 0];
  const i = clamp(f, 0, S.nFrames - 1) * 3;
  return [S.cam[i], S.cam[i + 1], S.cam[i + 2]];
}
function toRef(p, f) { const [s, tx, ty] = camAt(f); return { x: s * p.x + tx, y: s * p.y + ty }; }
function fromRef(p, f) { const [s, tx, ty] = camAt(f); return { x: (p.x - tx) / s, y: (p.y - ty) / s }; }
function zoomAt(f) { return camAt(f)[0]; } // reference px per frame px

function grayLevel() {
  const w = small.width, h = small.height, d = sctx.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
  for (let i = 0, p = 0; i < g.length; i++, p += 4) g[i] = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
  const w2 = w >> 1, h2 = h >> 1, g2 = new Float32Array(w2 * h2);
  for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
    const a = 2 * y * w + 2 * x;
    g2[y * w2 + x] = (g[a] + g[a + 1] + g[a + w] + g[a + w + 1]) / 4;
  }
  return { full: { g, w, h }, half: { g: g2, w: w2, h: h2 } };
}
function texturedPoints(L, P, margin) {
  const pts = [], nx = 14, ny = 9;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = Math.round(margin + (L.w - 2 * margin) * (i + 0.5) / nx), y = Math.round(margin + (L.h - 2 * margin) * (j + 0.5) / ny);
    let e = 0;
    for (let yy = -P; yy < P; yy++) for (let xx = -P; xx < P; xx++) {
      const k = (y + yy) * L.w + x + xx;
      e += Math.abs(L.g[k + 1] - L.g[k]) + Math.abs(L.g[k + L.w] - L.g[k]);
    }
    pts.push({ x, y, e: e / (4 * P * P) });
  }
  const thr = Math.max(4, median(pts.map(p => p.e)) * 0.6);
  return pts.filter(p => p.e >= thr);
}
function integral(L) {
  if (L.ii) return L.ii;
  const w = L.w, h = L.h, ii = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) { let row = 0; for (let x = 0; x < w; x++) { row += L.g[y * w + x]; ii[(y + 1) * (w + 1) + x + 1] = ii[y * (w + 1) + x + 1] + row; } }
  return (L.ii = ii);
}
// Zero-mean block matching, so a camera flash or exposure change doesn't break it.
function blockMatch(A, B, pts, P, R, guess) {
  const w = A.w, h = A.h, a = A.g, b = B.g, out = [], ii = integral(B), W1 = w + 1, n = (2 * P + 1) ** 2;
  const meanB = (x, y) => (ii[(y + P + 1) * W1 + x + P + 1] - ii[(y - P) * W1 + x + P + 1] - ii[(y + P + 1) * W1 + x - P] + ii[(y - P) * W1 + x - P]) / n;
  for (const p of pts) {
    const gd = guess ? guess(p) : [0, 0], cx = Math.round(gd[0]), cy = Math.round(gd[1]);
    if (p.x - P + cx - R - 1 < 0 || p.x + P + cx + R + 1 >= w || p.y - P + cy - R - 1 < 0 || p.y + P + cy + R + 1 >= h) continue;
    let mA = 0;
    for (let yy = -P; yy <= P; yy++) for (let xx = -P; xx <= P; xx++) mA += a[(p.y + yy) * w + p.x + xx];
    mA /= n;
    const sadAt = (dx, dy, cap) => {
      const bx = p.x + cx + dx, by = p.y + cy + dy, off = mA - meanB(bx, by);
      let s = 0;
      for (let yy = -P; yy <= P; yy++) {
        const ra = (p.y + yy) * w + p.x, rb = (by + yy) * w + bx;
        for (let xx = -P; xx <= P; xx++) s += Math.abs(a[ra + xx] - b[rb + xx] - off);
        if (s >= cap) return s;
      }
      return s;
    };
    let best = Infinity, bx = 0, by = 0;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const s = sadAt(dx, dy, best);
      if (s < best) { best = s; bx = dx; by = dy; }
    }
    if (Math.abs(bx) === R || Math.abs(by) === R) continue;
    let fx = bx, fy = by;
    const l = sadAt(bx - 1, by, Infinity), r = sadAt(bx + 1, by, Infinity), u = sadAt(bx, by - 1, Infinity), d = sadAt(bx, by + 1, Infinity);
    const d1 = l - 2 * best + r, d2 = u - 2 * best + d;
    if (d1 > 0) fx += clamp((l - r) / (2 * d1), -0.5, 0.5);
    if (d2 > 0) fy += clamp((u - d) / (2 * d2), -0.5, 0.5);
    out.push({ x: p.x, y: p.y, qx: p.x + cx + fx, qy: p.y + cy + fy });
  }
  return out;
}
function fitSim(m) {
  if (m.length < 6) return null;
  let use = m, s = 1, tx = 0, ty = 0;
  for (let it = 0; it < 5; it++) {
    let px = 0, py = 0, qx = 0, qy = 0;
    for (const k of use) { px += k.x; py += k.y; qx += k.qx; qy += k.qy; }
    const n = use.length; px /= n; py /= n; qx /= n; qy /= n;
    let num = 0, den = 0;
    for (const k of use) { const ax = k.x - px, ay = k.y - py; num += ax * (k.qx - qx) + ay * (k.qy - qy); den += ax * ax + ay * ay; }
    s = den > 0 ? clamp(num / den, 0.85, 1.18) : 1; tx = qx - s * px; ty = qy - s * py;
    const res = m.map(k => Math.hypot(s * k.x + tx - k.qx, s * k.y + ty - k.qy));
    const thr = Math.max(0.6, 2.5 * median(use.map(k => res[m.indexOf(k)])));
    const next = m.filter((k, i) => res[i] < thr);
    if (next.length < 6) break;
    use = next;
  }
  return { s, tx, ty, n: use.length };
}
function estimateMotion(A, B) {
  // Coarse pass on half resolution handles fast pans; fine pass on the small frame refines scale and shift.
  const c = fitSim(blockMatch(A.half, B.half, texturedPoints(A.half, 5, 18), 5, 12)) || { s: 1, tx: 0, ty: 0 };
  const guess = p => [c.s * p.x + 2 * c.tx - p.x, c.s * p.y + 2 * c.ty - p.y];
  const f = fitSim(blockMatch(A.full, B.full, texturedPoints(A.full, 6, 14), 6, 3, guess));
  // Too few agreeing patches means a cut or a flash frame: assume the camera held still.
  if (!f || f.n < 10) return { s: 1, tx: 0, ty: 0 };
  return f;
}
async function measureCamera() {
  S.measuring = true; S.skipReq = false; S.cam = null; S.camState = "measuring";
  updateUI();
  const sw = Math.min(360, S.W), sh = Math.max(40, Math.round(S.H * sw / S.W)), k = S.W / sw;
  small.width = sw; small.height = sh;
  const cam = new Float64Array(S.nFrames * 3); cam[0] = 1;
  let prev = null, maxDev = 0;
  const corners = [[0, 0], [S.W, 0], [0, S.H], [S.W, S.H]];
  for (let f = 0; f < S.nFrames; f++) {
    if (S.skipReq) break;
    await seekTo(f);
    sctx.drawImage(video, 0, 0, sw, sh);
    const cur = grayLevel();
    if (prev) {
      const m = estimateMotion(prev, cur), s = m.s, tx = m.tx * k, ty = m.ty * k, i = f * 3, j = i - 3;
      cam[i] = cam[j] / s; cam[i + 1] = cam[j + 1] - cam[j] * tx / s; cam[i + 2] = cam[j + 2] - cam[j] * ty / s;
      for (const [x, y] of corners) maxDev = Math.max(maxDev, Math.hypot(cam[i] * x + cam[i + 1] - x, cam[i] * y + cam[i + 2] - y));
    }
    prev = cur;
    if (f % 4 === 0) { setHint(`Checking for camera pan and zoom… ${Math.round(100 * f / S.nFrames)}%`); await new Promise(requestAnimationFrame); }
  }
  S.measuring = false;
  if (S.skipReq) { S.cam = null; S.camState = "skipped"; }
  else if (maxDev < S.W * 0.004) { S.cam = null; S.camState = "steady"; }
  else { S.cam = cam; S.camState = "moving"; }
  await goFrame(0);
  updateUI();
}
