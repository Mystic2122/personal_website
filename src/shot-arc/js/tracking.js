// Ball tracker: scans frames for candidates, then RANSAC keeps the path that fits a real arc.
"use strict";

/* ---------------- tracking ---------------- */
// Pass 1: scan every frame for ball-sized blobs that are moving (3-frame difference, corrected for camera motion)
//         or ball-colored. Each frame keeps a few candidates.
// Pass 2: RANSAC. Try many arcs through the release point and keep the one that the most candidates agree with,
//         that goes up then comes down, and (for a make) passes by the rim.
const rawC = [0, 1, 2].map(() => { const c = document.createElement("canvas"); return { c, x: c.getContext("2d", { willReadFrequently: true }) }; });
const warpC = document.createElement("canvas"), wctx = warpC.getContext("2d", { willReadFrequently: true });

function warpInto(src, g, f, ps) {
  const [sg, txg, tyg] = camAt(g), [sf, txf, tyf] = camAt(f);
  const a = sg / sf, e = ps * (txg - txf) / sf, h = ps * (tyg - tyf) / sf;
  wctx.setTransform(1, 0, 0, 1, 0, 0); wctx.clearRect(0, 0, warpC.width, warpC.height);
  wctx.setTransform(a, 0, 0, a, e, h); wctx.drawImage(src, 0, 0); wctx.setTransform(1, 0, 0, 1, 0, 0);
  return wctx.getImageData(0, 0, warpC.width, warpC.height).data;
}
function components(mask, w, h, other) {
  const out = [], stack = new Int32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (mask[i] !== 1) continue;
    let sp = 0, n = 0, sx = 0, sy = 0, of = 0, x0 = w, x1 = 0, y0 = h, y1 = 0;
    stack[sp++] = i; mask[i] = 2;
    while (sp) {
      const j = stack[--sp], x = j % w, y = (j / w) | 0;
      n++; sx += x; sy += y; if (other[j]) of++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x > 0 && mask[j - 1] === 1) { mask[j - 1] = 2; stack[sp++] = j - 1; }
      if (x < w - 1 && mask[j + 1] === 1) { mask[j + 1] = 2; stack[sp++] = j + 1; }
      if (y > 0 && mask[j - w] === 1) { mask[j - w] = 2; stack[sp++] = j - w; }
      if (y < h - 1 && mask[j + w] === 1) { mask[j + w] = 2; stack[sp++] = j + w; }
    }
    if (n >= 3) out.push({ n, x: sx / n, y: sy / n, bw: x1 - x0 + 1, bh: y1 - y0 + 1, of: of / n });
  }
  return out;
}
function detectCandidates(cur, A, B, pw, ph, match, rp) {
  const N = pw * ph, M = new Uint8Array(N), C = new Uint8Array(N);
  for (let i = 0, p = 0; i < N; i++, p += 4) {
    if (A[p + 3] > 0 && B[p + 3] > 0) {
      const d1 = Math.abs(cur[p] - A[p]) + Math.abs(cur[p + 1] - A[p + 1]) + Math.abs(cur[p + 2] - A[p + 2]);
      if (d1 > 40) {
        const d2 = Math.abs(cur[p] - B[p]) + Math.abs(cur[p + 1] - B[p + 1]) + Math.abs(cur[p + 2] - B[p + 2]);
        if (d2 > 40) M[i] = 1;
      }
    }
    if (match && match(cur[p], cur[p + 1], cur[p + 2])) C[i] = 1;
  }
  const area = Math.PI * rp * rp, minN = Math.max(3, area * 0.2), maxN = Math.max(12, area * 3.2), maxB = Math.max(6, rp * 4.5);
  const judge = (b, motionSrc) => {
    if (b.n < minN || b.n > maxN || b.bw > maxB || b.bh > maxB) return null;
    if (Math.max(b.bw, b.bh) / Math.min(b.bw, b.bh) > 3) return null;
    const fill = b.n / (b.bw * b.bh), size = 1 - Math.min(1, Math.abs(Math.log(b.n / area)) / 2);
    return { x: b.x, y: b.y, score: b.of + (1 - Math.abs(fill - 0.785)) + size + (motionSrc ? 0.3 : 0) };
  };
  const all = [];
  for (const b of components(M, pw, ph, C)) { const j = judge(b, true); if (j) all.push(j); }
  if (match) for (const b of components(C, pw, ph, M)) { const j = judge(b, false); if (j) all.push(j); }
  all.sort((a, b) => b.score - a.score);
  const keep = [];
  for (const c of all) {
    if (keep.some(k => Math.hypot(k.x - c.x, k.y - c.y) < rp)) continue;
    keep.push(c); if (keep.length >= 10) break;
  }
  return keep;
}
function fitTraj(pts) { // pts: {t,x,y,w}; image-space path, quadratic in time on both axes (allows perspective)
  const ts = pts.map(p => p.t), ws = pts.map(p => p.w);
  const bx = polyfit(ts, pts.map(p => p.x), 2, ws), by = polyfit(ts, pts.map(p => p.y), 2, ws);
  return bx && by ? { b0: bx[0], b1: bx[1], b2: bx[2], c0: by[0], c1: by[1], c2: by[2] } : null;
}
function ransac(cands, f0, tSpan, anchor, manual, r, rimPx) {
  const rimTol = Math.max(rimPx * 1.5, r * 4), tol = Math.max(r * 1.3, 3), useRim = el.rimC.checked;
  const byT = new Map(), list = [];
  for (const [f, cs] of cands) { byT.set(f - f0, cs); for (const c of cs) list.push({ t: f - f0, x: c.x, y: c.y }); }
  const man = manual.map(p => ({ t: p.f - f0, x: p.x, y: p.y }));
  const manT = new Map(man.map(p => [p.t, p]));
  const A0 = { t: 0, x: anchor.x, y: anchor.y, w: 50 };
  const X = (m, t) => m.b0 + m.b1 * t + m.b2 * t * t, Y = (m, t) => m.c0 + m.c1 * t + m.c2 * t * t;
  const rimPass = m => {
    let best = null;
    for (let t = 1; t <= tSpan + 3; t += 0.25) { const d = Math.hypot(X(m, t) - S.rim.x, Y(m, t) - S.rim.y); if (!best || d < best.d) best = { t, d }; }
    return best;
  };
  const valid = m => {
    if (!m || !(m.c2 > 0) || !(m.c1 < 0) || Math.abs(m.b2) > m.c2 * 0.8) return null;
    const rp = rimPass(m);
    if (useRim && (rp.d > rimTol || m.c1 + 2 * m.c2 * rp.t <= 0)) return null;
    return rp;
  };
  const evaluate = (m, rp) => {
    const tMax = useRim ? Math.min(tSpan, Math.ceil(rp.t) + 2) : tSpan;
    let score = 0; const inl = new Map();
    for (let t = 1; t <= tMax; t++) {
      const mx = X(m, t), my = Y(m, t), mp = manT.get(t);
      if (mp) { score += Math.hypot(mp.x - mx, mp.y - my) < tol * 2 ? 2 : -2; continue; }
      const cs = byT.get(t); if (!cs) continue;
      let best = null, bd = tol;
      for (const c of cs) { const d = Math.hypot(c.x - mx, c.y - my); if (d < bd) { bd = d; best = c; } }
      if (best) { score += 1 + 0.5 * (1 - bd / tol); inl.set(t, best); }
    }
    return { score, inl, tHit: rp.t };
  };
  const refit = inl => fitTraj([A0, ...man.map(p => ({ ...p, w: 4 })), ...[...inl].map(([t, c]) => ({ t, x: c.x, y: c.y, w: 1 }))]);
  let best = null;
  if (man.length >= 2) { const m = fitTraj([A0, ...man.map(p => ({ ...p, w: 4 }))]), rp = valid(m); if (rp) best = { m, ...evaluate(m, rp) }; }
  const pool = [...list, ...man];
  for (let it = 0; it < 5000 && pool.length >= 2; it++) {
    const a = pool[(Math.random() * pool.length) | 0], b = pool[(Math.random() * pool.length) | 0];
    if (a.t === b.t) continue;
    const m = fitTraj([A0, { ...a, w: 1 }, { ...b, w: 1 }]), rp = valid(m);
    if (!rp) continue;
    const e = evaluate(m, rp);
    if (!best || e.score > best.score) best = { m, ...e };
  }
  if (!best) return null;
  for (let k = 0; k < 4; k++) {
    const m = refit(best.inl), rp = valid(m);
    if (!rp) break;
    const e = evaluate(m, rp);
    if (e.score < best.score) break;
    best = { m, ...e };
  }
  return { inl: best.inl, count: best.inl.size, tHit: best.tHit };
}
async function track() {
  if (el.track.disabled) return;
  S.mode = null; S.tracking = true; S.stopReq = false; S.madeObserved = null; S.msg = null;
  for (const [f, p] of [...S.points]) if (f > S.release && p.src !== "manual") S.points.delete(f);
  fitBall(); updateUI();
  const f0 = S.release, anchor = S.points.get(f0);
  const limit = S.endFrame != null ? Math.min(S.nFrames - 2, S.endFrame + 2) : Math.min(S.nFrames - 2, f0 + Math.ceil(S.fps * 3 * Math.max(1, S.slow)));
  const ps = Math.min(1, 800 / S.W), pw = Math.round(S.W * ps), ph = Math.round(S.H * ps);
  for (const r of rawC) { r.c.width = pw; r.c.height = ph; }
  warpC.width = pw; warpC.height = ph;
  const match = S.ball.h != null ? matcher(S.ball, +el.tol.value * 1.3) : null;
  const cands = new Map();
  const first = Math.max(0, f0 - 1);
  let stopped = false;
  for (let g = first; g <= limit + 1; g++) {
    if (S.stopReq) { stopped = true; break; }
    await seekTo(g);
    rawC[g % 3].x.drawImage(video, 0, 0, pw, ph);
    const f = g - 1;
    if (f <= f0 || g - 2 < first) continue;
    const cur = rawC[f % 3].x.getImageData(0, 0, pw, ph).data;
    const A = warpInto(rawC[(f - 1) % 3].c, f - 1, f, ps), B = warpInto(rawC[(f + 1) % 3].c, f + 1, f, ps);
    const rp = S.ball.r / zoomAt(f) * ps;
    const cs = detectCandidates(cur, A, B, pw, ph, match, rp).map(c => toRef({ x: c.x / ps, y: c.y / ps }, f));
    cands.set(f, cs);
    if (f % 3 === 0) {
      S.frame = g; render(g); syncTransport();
      setHint(`Scanning frames for the ball… ${Math.round(100 * (g - first) / (limit + 1 - first))}%`);
      await new Promise(requestAnimationFrame);
    }
  }
  setHint("Fitting the arc…");
  await new Promise(requestAnimationFrame);
  const manual = [...S.points].filter(([f, p]) => f > f0 && p.src === "manual").map(([f, p]) => ({ f, x: p.x, y: p.y }));
  const res = ransac(cands, f0, limit - f0, anchor, manual, S.ball.r, S.cal.rimPx);
  S.tracking = false;
  if (!res || res.count + manual.length < 4) {
    el.trackStatus.textContent = stopped
      ? "Stopped before finding the ball's path."
      : "Couldn't find a believable arc. Check that the rim click is on the right hoop, then use “Place ball by hand” on 6 to 10 frames spread across the flight. That's enough to fit the arc.";
  } else {
    const tEnd = Math.ceil(res.tHit);
    for (const [t, c] of res.inl) if (t <= tEnd + 1) S.points.set(f0 + t, { x: c.x, y: c.y, src: "auto" });
    if (S.endFrame == null) S.madeObserved = clamp(f0 + Math.round(res.tHit), f0 + 1, S.nFrames - 1);
    const tot = res.count + manual.length;
    el.trackStatus.textContent = `Found the ball on ${res.count} frames${manual.length ? ` plus your ${manual.length} hand-placed` : ""}. It reaches rim height around frame ${S.madeObserved ?? S.endFrame}.` +
      (tot < 8 ? " That's thin. Check the dots, and add a few by hand where they're missing." : " Check the white dots, and fix any that sit off the ball.");
  }
  fitBall();
  await goFrame(S.madeObserved ?? S.frame);
  updateUI();
}
