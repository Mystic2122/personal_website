// Court models, camera calibration from the paint + rim, and the 3D ball-flight fit with real gravity.
"use strict";

/* ---------------- court + camera geometry ---------------- */
// World coordinates in feet: origin on the floor directly under the rim center, X along the baseline,
// Y toward half court, Z up. The rim center is (0, 0, 10).
const COURTS = {
  nba: { name: "NBA", lane: 16, ft: 19, rimOff: 5.25, arc: 23.75, corner: 22 },
  wnba: { name: "WNBA", lane: 16, ft: 19, rimOff: 5.25, arc: 22.146, corner: 22 },
  ncaa: { name: "College (NCAA)", lane: 12, ft: 19, rimOff: 5.25, arc: 22.146, corner: 21.654 },
  hs: { name: "High school (US)", lane: 12, ft: 19, rimOff: 5.25, arc: 19.75, corner: 19.75 },
  fiba: { name: "FIBA / international", lane: 16.08, ft: 19.03, rimOff: 5.167, arc: 22.146, corner: 21.654 }
};
const court = () => COURTS[$("#courtType").value] || COURTS.nba;
const yBreak = C => Math.sqrt(Math.max(0, C.arc * C.arc - C.corner * C.corner));
// Signed distance from a floor point to the 3-point line: positive = behind the line.
function threeDist(X, Y, C) { return Y > yBreak(C) ? Math.hypot(X, Y) - C.arc : Math.abs(X) - C.corner; }

const vAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vMul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const vNorm = a => Math.hypot(a[0], a[1], a[2]);
const vCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mVec = (M, v) => [0, 1, 2].map(i => M[i][0] * v[0] + M[i][1] * v[1] + M[i][2] * v[2]);
const mT = M => [0, 1, 2].map(i => [0, 1, 2].map(j => M[j][i]));
const mMul = (A, B) => [0, 1, 2].map(i => [0, 1, 2].map(j => A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j]));
function mInv(M) {
  const [a, b, c] = M[0], [d, e, f] = M[1], [g, h, i] = M[2];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-15) return null;
  return [[A / det, -(b * i - c * h) / det, (b * f - c * e) / det], [B / det, (a * i - c * g) / det, -(a * f - c * d) / det], [C / det, -(a * h - b * g) / det, (a * e - b * d) / det]];
}
function rodrigues(r) {
  const th = Math.hypot(r[0], r[1], r[2]);
  if (th < 1e-12) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const [x, y, z] = r.map(v => v / th), c = Math.cos(th), s = Math.sin(th), C = 1 - c;
  return [[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]];
}
function lm(fun, p0, iters = 80) {
  let p = [...p0], r = fun(p), cost = r.reduce((s, v) => s + v * v, 0), lam = 1e-3;
  const n = p.length;
  for (let it = 0; it < iters; it++) {
    const J = [];
    for (let j = 0; j < n; j++) {
      const h = 1e-6 * Math.max(1, Math.abs(p[j])), q = [...p]; q[j] += h;
      const rj = fun(q); J.push(rj.map((v, i) => (v - r[i]) / h));
    }
    const A = [...Array(n)].map((_, a) => [...Array(n)].map((_, b) => { let s = 0; for (let i = 0; i < r.length; i++) s += J[a][i] * J[b][i]; return s; }));
    const g = [...Array(n)].map((_, a) => { let s = 0; for (let i = 0; i < r.length; i++) s += J[a][i] * r[i]; return s; });
    let moved = false;
    for (let tries = 0; tries < 12; tries++) {
      const M = A.map((row, a) => row.map((v, b) => v + (a === b ? lam * (A[a][a] + 1e-9) : 0)));
      const d = solve(M, g.map(x => -x));
      if (!d) { lam *= 10; continue; }
      const q = p.map((v, i) => v + d[i]), rq = fun(q), cq = rq.reduce((s, v) => s + v * v, 0);
      if (cq < cost) {
        const done = cost - cq < 1e-9 * (1 + cost);
        p = q; r = rq; cost = cq; lam = Math.max(lam / 3, 1e-10); moved = true;
        if (done) return { p, r, cost };
        break;
      }
      lam *= 10;
    }
    if (!moved) break;
  }
  return { p, r, cost };
}
function homography(world, img) { // maps (X,Y,1) -> image (x,y,1)
  const A = [], b = [];
  world.forEach(([X, Y], i) => {
    const [x, y] = img[i];
    A.push([X, Y, 1, 0, 0, 0, -x * X, -x * Y]); b.push(x);
    A.push([0, 0, 0, X, Y, 1, -y * X, -y * Y]); b.push(y);
  });
  const h = solve(A, b);
  return h ? [[h[0], h[1], h[2]], [h[3], h[4], h[5]], [h[6], h[7], 1]] : null;
}
function poseFromH(H, f) {
  const g1 = [H[0][0] / f, H[1][0] / f, H[2][0]], g2 = [H[0][1] / f, H[1][1] / f, H[2][1]], g3 = [H[0][2] / f, H[1][2] / f, H[2][2]];
  let lam = 2 / (vNorm(g1) + vNorm(g2));
  if (g3[2] * lam < 0) lam = -lam;
  const r1 = vMul(g1, lam), r2 = vMul(g2, lam), r3 = vCross(r1, r2), t = vMul(g3, lam);
  let R = [0, 1, 2].map(i => [r1[i], r2[i], r3[i]]);
  for (let k = 0; k < 8; k++) { const Ri = mInv(R); if (!Ri) return null; const RiT = mT(Ri); R = R.map((row, i) => row.map((v, j) => 0.5 * (v + RiT[i][j]))); }
  return { R, t };
}
const camCenter = cam => vMul(mVec(mT(cam.R), cam.t), -1);
function project(cam, X) {
  const q = vAdd(mVec(cam.R, X), cam.t);
  return { x: cam.f * q[0] / q[2] + cam.cx, y: cam.f * q[1] / q[2] + cam.cy, z: q[2] };
}
function ray(cam, u) {
  return { C: camCenter(cam), d: mVec(mT(cam.R), [(u.x - cam.cx) / cam.f, (u.y - cam.cy) / cam.f, 1]) };
}
function floorOf(cam, u) {
  const { C, d } = ray(cam, u);
  if (d[2] >= -1e-9) return null;
  const s = -C[2] / d[2];
  return [C[0] + s * d[0], C[1] + s * d[1]];
}
function segCross(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}
function camFrom(base, p) {
  return { R: mMul(rodrigues([p[0], p[1], p[2]]), base.R), t: vAdd(base.t, [p[3], p[4], p[5]]), f: base.f * Math.exp(p[6]), cx: base.cx, cy: base.cy };
}

// Camera calibration from the painted lane (4 corners, known size) plus the rim (known to be 10 ft up).
// Optional clicks on the 3-point line tighten it near the shooter.
function calibrate() {
  S.cal = null; S.calErr = null;
  if (S.laneB.length < 2 || S.laneF.length < 2 || !S.rim) return;
  const C = court(), cf = S.calF, toC = p => fromRef(p, cf), cx = S.W / 2, cy = S.H / 2;
  const B = S.laneB.map(toC), F = S.laneF.map(toC), rim = toC(S.rim), three = S.three.map(toC);
  let Fa = F[0], Fb = F[1];
  if (segCross(B[0], Fa, B[1], Fb)) [Fa, Fb] = [Fb, Fa];
  const hw = C.lane / 2, o = C.rimOff, yF = C.ft - o, img = [B[0], B[1], Fa, Fb];
  let best = null;
  for (const m of [1, -1]) {
    const world = [[-hw * m, -o], [hw * m, -o], [-hw * m, yF], [hw * m, yF]];
    const H = homography(world, img.map(p => [p.x - cx, p.y - cy]));
    if (!H) continue;
    for (let i = 0; i <= 400; i++) {
      const f = S.W * 0.25 * Math.pow(160, i / 400), ps = poseFromH(H, f);
      if (!ps) continue;
      const cam = { ...ps, f, cx, cy };
      if (camCenter(cam)[2] <= 0) continue;
      const q = project(cam, [0, 0, RIM_FT]);
      if (q.z <= 0) continue;
      const e = Math.hypot(q.x - rim.x, q.y - rim.y);
      if (!best || e < best.e) best = { e, cam, world };
    }
  }
  if (!best) { S.calErr = "Those clicks don't fit a court seen from above. Check that the first pair is at the baseline and the second pair at the free-throw line."; return; }
  const obs = best.world.map((w, i) => ({ w: [w[0], w[1], 0], u: img[i] }));
  const resid = cam => {
    const r = [];
    for (const ob of obs) { const q = project(cam, ob.w); r.push((q.x - ob.u.x) / 2, (q.y - ob.u.y) / 2); }
    const q = project(cam, [0, 0, RIM_FT]); r.push((q.x - rim.x) / 2, (q.y - rim.y) / 2);
    for (const u of three) { const fl = floorOf(cam, u); r.push(fl ? threeDist(fl[0], fl[1], C) / 0.25 : 40); }
    return r;
  };
  const sol = lm(p => resid(camFrom(best.cam, p)), [0, 0, 0, 0, 0, 0, 0], 60);
  const cam = camFrom(best.cam, sol.p), Cc = camCenter(cam);
  const laneErr = Math.sqrt(obs.reduce((s, ob) => { const q = project(cam, ob.w); return s + (q.x - ob.u.x) ** 2 + (q.y - ob.u.y) ** 2; }, 0) / obs.length);
  const qr = project(cam, [0, 0, RIM_FT]), rimErr = Math.hypot(qr.x - rim.x, qr.y - rim.y);
  const threeErr = three.length ? Math.sqrt(three.reduce((s, u) => { const fl = floorOf(cam, u); return s + (fl ? threeDist(fl[0], fl[1], C) ** 2 : 100); }, 0) / three.length) : null;
  if (!(Cc[2] > 0) || Cc[2] > 400) { S.calErr = "The court clicks give an impossible camera position. Re-check the paint corners."; return; }
  const q11 = project(cam, [0, 0, RIM_FT + 1]);
  S.cal = { ...cam, calF: cf, laneErr, rimErr, threeErr, height: Cc[2], rimPx: Math.hypot(q11.x - qr.x, q11.y - qr.y) * zoomAt(cf) };
}
// World point -> pixel position in frame f.
function W2F(X, f) {
  const q = project(S.cal, X);
  if (q.z <= 0.5) return null;
  return fromRef(toRef({ x: q.x, y: q.y }, S.cal.calF), f);
}

/* ---------------- ball flight fit (3D, with real gravity) ---------------- */
// The ball's path is p(t) = p0 + v t - (g/2) t^2 z. Gravity and the frame rate give the scale, the camera
// calibration gives the directions, and the made shot pins the path through the rim center.
const ballPos = (p, t) => [p[0] + p[3] * t, p[1] + p[4] * t, p[2] + p[5] * t - 0.5 * G * t * t];
const rimCrossT = p => { const d = p[5] * p[5] + 2 * G * (p[2] - RIM_FT); return d < 0 ? null : (p[5] + Math.sqrt(d)) / G; };
function fitBallCore(obs, k, endGuessF) {
  const cam = S.cal, SIG = 2, useRim = el.rimC.checked;
  const fun = list => p => {
    const r = [];
    for (const o of list) {
      const q = project(cam, ballPos(p, (o.f - S.release) / k));
      if (q.z <= 0) { r.push(50, 50); continue; }
      r.push((q.x - o.u.x) / SIG, (q.y - o.u.y) / SIG);
    }
    if (useRim) {
      const tr = rimCrossT(p);
      if (tr == null || tr <= 0) r.push(60, 60); else { const q = ballPos(p, tr); r.push(q[0] / 0.25, q[1] / 0.25); }
    }
    return r;
  };
  const rr = ray(cam, obs[0].u), tau = Math.max(0.3, (endGuessF - S.release) / k);
  let best = null;
  for (const h of [6.5, 8, 9.5, 11]) {
    const s = (h - rr.C[2]) / rr.d[2];
    if (!(s > 0)) continue;
    const p0 = vAdd(rr.C, vMul(rr.d, s));
    const v = vAdd(vMul(vSub([0, 0, RIM_FT], p0), 1 / tau), [0, 0, 0.5 * G * tau]);
    const sol = lm(fun(obs), [...p0, ...v], 100);
    if (!best || sol.cost < best.cost) best = sol;
  }
  if (!best) return null;
  // Drop points the tracker got wrong, then refit.
  const err = obs.map(o => { const q = project(cam, ballPos(best.p, (o.f - S.release) / k)); return Math.hypot(q.x - o.u.x, q.y - o.u.y); });
  const thr = Math.max(8, 3 * median(err));
  const kept = obs.filter((o, i) => i === 0 || err[i] <= thr);
  if (kept.length < obs.length && kept.length >= 5) best = lm(fun(kept), best.p, 100);
  const e2 = kept.map(o => { const q = project(cam, ballPos(best.p, (o.f - S.release) / k)); return Math.hypot(q.x - o.u.x, q.y - o.u.y); });
  return { p: best.p, kept, dropped: obs.length - kept.length, rms: Math.sqrt(e2.reduce((s, v) => s + v * v, 0) / e2.length) };
}
function fitBall() {
  S.fit = null; S.fitError = null;
  if (!S.cal || S.release == null || !S.points.has(S.release)) return;
  const cf = S.cal.calF, endF = S.endFrame ?? S.madeObserved ?? Infinity;
  const obs = [...S.points].filter(([f, p]) => f >= S.release && f <= endF && p.src !== "pred").sort((a, b) => a[0] - b[0]).map(([f, p]) => ({ f, u: fromRef(p, cf) }));
  if (obs.length < 5) { if (obs.length > 1) S.fitError = "Need the ball on at least 5 frames to fit the flight."; return; }
  const endGuess = Number.isFinite(endF) ? endF : obs[obs.length - 1].f + 3;
  const k = S.fps * S.slow;
  const core = fitBallCore(obs, k, endGuess);
  if (!core) { S.fitError = "Couldn't fit the ball's flight. Check the release click and the tracked points."; return; }
  const p = core.p, tR = rimCrossT(p);
  if (tR == null || !(tR > 0)) { S.fitError = "The fitted flight never comes down through rim height. Check the court clicks and the frame rate."; return; }
  const vh = Math.hypot(p[3], p[4]), C = court();
  const tA = Math.max(0, p[5] / G), apexH = ballPos(p, tA)[2];
  const relDist = Math.hypot(p[0], p[1]);
  let feetSpot = null;
  if (S.feet) { const fl = floorOf(S.cal, fromRef(S.feet, cf)); if (fl) feetSpot = fl; }
  const spot = feetSpot || [p[0], p[1]];
  let slowHint = null;
  if (core.rms > 6) {
    for (const m of [2, 4, 8]) {
      const alt = fitBallCore(obs, k * m, endGuess);
      if (alt && alt.rms < core.rms * 0.5 && alt.rms < 5) { slowHint = S.slow * m; break; }
    }
  }
  S.fit = {
    p, k, tR, tA, vh,
    relAngle: Math.atan2(p[5], vh) * DEG,
    entryAngle: Math.atan2(G * tR - p[5], vh) * DEG,
    relH: p[2], apexH, speed: Math.hypot(p[3], p[4], p[5]),
    relDist, feetDist: feetSpot ? Math.hypot(feetSpot[0], feetSpot[1]) : null,
    spot, dist: Math.hypot(spot[0], spot[1]), fromFeet: !!feetSpot,
    lineDelta: threeDist(spot[0], spot[1], C),
    rms: core.rms, n: core.kept.length, dropped: core.dropped, slowHint,
    releaseF: S.release, apexF: S.release + tA * k, entryF: S.release + tR * k
  };
}
