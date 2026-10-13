// Small linear solver and polynomial least-squares fit.
"use strict";

/* ---------------- math helpers ---------------- */
function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const k = M[r][c] / M[c][c];
      for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}
function polyfit(xs, ys, deg, ws) {
  const m = deg + 1, A = Array.from({ length: m }, () => new Array(m).fill(0)), b = new Array(m).fill(0);
  for (let i = 0; i < xs.length; i++) {
    const w = ws ? ws[i] : 1, pw = [1];
    for (let k = 1; k <= 2 * deg; k++) pw[k] = pw[k - 1] * xs[i];
    for (let r = 0; r < m; r++) { b[r] += w * pw[r] * ys[i]; for (let c = 0; c < m; c++) A[r][c] += w * pw[r + c]; }
  }
  return solve(A, b);
}
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : 0; };
