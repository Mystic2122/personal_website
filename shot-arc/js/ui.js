// Click handling, step buttons, status text, results panel and event wiring. Loaded last.
"use strict";

/* ---------------- UI ---------------- */
const MODE_HINTS = {
  laneB: "Click the two corners of the paint where it meets the baseline, under the hoop. Either order.",
  laneF: "Click the two corners of the paint at the free-throw line. Either order.",
  rim: "Click the center of the rim: the middle of the hoop opening.",
  three: "Click a few spots on the 3-point line, ideally near where the shot is taken. Press Esc or the button again when done.",
  release: "Step to the first frame where the ball has left the shooter's hands (← →), then click the middle of the ball.",
  feet: "Step back to the last frame where both feet are flat on the floor before the jump, then click the floor midway between them.",
  edit: "Click the ball to place it on this frame. It jumps ahead after each click. Press Esc when done."
};
function setHint(t, warn, flash) {
  el.hint.textContent = t; el.hintBox.classList.toggle("warn", !!warn);
  if (flash) { el.hintBox.classList.remove("flash"); void el.hintBox.offsetWidth; el.hintBox.classList.add("flash"); }
}
function nextNeeded() {
  if (S.laneB.length < 2) return "laneB";
  if (S.laneF.length < 2) return "laneF";
  if (!S.rim) return "rim";
  if (S.release == null) return "release";
  return null;
}
function defaultHint() {
  if (!S.loaded) return "Load a video to start.";
  const n = nextNeeded();
  if (n) return (n === "laneB" ? "Pick a frame near the shot where the paint is clear. " : "") + MODE_HINTS[n];
  if (S.calErr) return S.calErr;
  if (!S.fit) return S.fitError || "Press “Track ball”.";
  if (S.presetReplay) { const n = allShots().length; return `Press play to watch ${n > 1 ? `all ${n} tracked shots` : "the tracked shot"}. It pauses after each one goes in.`; }
  return "Press play to watch the flight. Step through frames with ← →.";
}
function recompute() { calibrate(); fitBall(); }
function updateUI() {
  const L = S.loaded, T = S.tracking, M = S.measuring || S.asking, busy = T || M;
  document.querySelectorAll("[data-mode]").forEach(b => {
    b.disabled = !L || busy;
    b.setAttribute("aria-pressed", S.mode === b.dataset.mode ? "true" : "false");
  });
  el.track.disabled = !(L && S.cal && S.ball && S.release != null) || busy;
  el.track.hidden = T; el.stop.hidden = !T;
  el.skipCam.hidden = !M;
  $("#resetBtn").disabled = !L || busy;
  $("#newClip").hidden = !L;
  const shotsN = L ? allShots().length : 0;
  $("#replayBar").hidden = !(L && S.camMode === "still" && shotsN > 0);
  $("#replayBtn").disabled = busy || !!S.replay;
  $("#replayCount").textContent = shotsN ? `${shotsN} tracked shot${shotsN > 1 ? "s" : ""} in this clip` : "";
  $("#camMode").disabled = !L || busy;
  const nb = $("#nextShot");
  nb.hidden = !L || S.camMode !== "still";
  nb.disabled = busy || !S.cal;
  nb.title = S.cal ? "Keep the court marking and track another shot in this clip." : "Mark the court first.";
  [el.delPt, el.setEnd, el.clear].forEach(b => b.disabled = !L || busy || S.release == null);
  [el.play, el.prev, el.next, el.scrub, el.fps, el.slow].forEach(b => b.disabled = !L || busy);
  el.setEnd.textContent = S.endFrame != null ? `Clear make frame (${S.endFrame})` : "Use this frame as the make";
  el.camStatus.textContent = {
    none: "", measuring: "Measuring how the camera pans and zooms…",
    still: "Camera set as still, so the camera check was skipped.",
    steady: "Camera is steady.", skipped: "Camera check skipped. Pans and zooms won't be corrected.",
    moving: "The camera pans or zooms. Positions are corrected for it."
  }[S.camState];
  const tick = ok => ok ? "✓" : "–";
  let cs = `Baseline corners ${S.laneB.length}/2, free-throw corners ${S.laneF.length}/2, rim ${tick(!!S.rim)}${S.three.length ? `, 3-point line ${S.three.length}` : ""}.`;
  if (S.cal) {
    cs = `Calibrated. Paint corners fit within ${S.cal.laneErr.toFixed(1)} px, rim within ${S.cal.rimErr.toFixed(1)} px${S.cal.threeErr != null ? `, 3-point line within ${S.cal.threeErr.toFixed(1)} ft` : ""}. Camera about ${Math.round(S.cal.height)} ft up.`;
    if (S.cal.laneErr > 8 || S.cal.rimErr > 12 || (S.cal.threeErr ?? 0) > 1.5) cs += " That's loose: redo the clicks that don't sit on the lines.";
    else cs += " The blue lines should sit on the real court lines.";
  } else if (S.calErr) cs = S.calErr;
  el.courtStatus.textContent = L ? cs : "";
  el.relStatus.textContent = S.release != null && S.ball
    ? `Ball marked on frame ${S.release}.${S.ball.h == null ? " Couldn't read its color, so tracking will rely on motion." : ""}${S.feet ? ` Feet marked on frame ${S.feet.f}.` : ""}`
    : "";
  // Steps 3 and 4 start under the video; once the ball has been tracked they move to the sidebar for good.
  if (S.fit) S.tracked = true;
  const stepHome = S.tracked ? $("#sideSteps") : $("#inlineSteps");
  for (const id of ["#st3", "#st4"]) { const n = $(id); if (n.parentElement !== stepHome) stepHome.appendChild(n); }
  $("#st1").classList.toggle("done", L && !M);
  $("#st2").classList.toggle("done", !!S.cal);
  $("#st3").classList.toggle("done", S.release != null);
  $("#st4").classList.toggle("done", !!S.fit);
  if (!busy) {
    if (S.replay) setHint(S.replay.frozen
      ? `Shot ${S.replay.idx + 1} of ${S.replay.shots.length} went in. Press Continue or space.`
      : "Replaying your tracked shots.");
    else if (S.msg) setHint(S.msg, S.msgWarn);
    else if (S.mode) setHint(MODE_HINTS[S.mode]);
    else setHint(defaultHint(), !!(S.calErr || (S.fitError && !S.fit)));
  }
  renderResults();
}
function lineText(F, C) {
  const d = F.lineDelta, a = Math.abs(d).toFixed(1);
  if (F.fromFeet) {
    if (d >= 0.3) return { badge: "3-pointer", note: `Feet ${a} ft behind the 3-point line.` };
    if (d > -0.5) return { badge: "On the line", note: `Feet within half a foot of the 3-point line.` };
    return { badge: "2-pointer", note: `Feet ${a} ft inside the 3-point line.` };
  }
  if (d >= 0) return { badge: "3-pointer", note: `Released ${a} ft behind the 3-point line.` };
  if (d > -4) return { badge: "Near the line", note: `The ball was released ${a} ft inside the line. Shooters let go 1–3 ft in front of their feet, more on a forward hop, so the feet may well have been behind it. Mark the feet to settle it.` };
  return { badge: "2-pointer", note: `Released ${a} ft inside the 3-point line.` };
}
function shotLogHtml() {
  if (!S.shots.length) return "";
  return `<div class="shotlog"><h3>Earlier shots in this clip</h3><div class="tablewrap"><table class="frames">
    <thead><tr><th>#</th><th>Distance</th><th>Type</th><th>Release</th><th>Entry</th><th>Release ht</th><th>Apex</th><th>Release frame</th><th>Made frame</th><th></th></tr></thead>
    <tbody>${S.shots.map(h => `<tr><td>${h.n}</td><td>${h.dist.toFixed(1)} ft${h.fromFeet ? "" : "*"}</td><td>${h.badge}</td><td>${h.relAngle.toFixed(1)}°</td><td>${h.entryAngle.toFixed(1)}°</td><td>${h.relH.toFixed(1)} ft</td><td>${h.apexH.toFixed(1)} ft</td><td>${h.releaseF}</td><td>${h.madeF ?? ""}</td><td><button data-go="${h.releaseF}">Show</button></td></tr>`).join("")}</tbody>
  </table></div>${S.shots.some(h => !h.fromFeet) ? `<p class="quality">* Measured from the release spot; feet weren't marked.</p>` : ""}</div>`;
}
function bindGo() { el.results.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => { exitReplay(); pause(); goFrame(+b.dataset.go); })); }
// The shot the results panel describes: during a replay, the shot being replayed; on a loaded test clip
// that hasn't been touched, its first shot (Play starts there); otherwise the current one.
function shownShot() {
  const shots = S.replay ? S.replay.shots : S.presetReplay ? allShots() : null;
  const i = S.replay ? S.replay.idx : 0, F = shots && shots[i];
  return F ? { F, cur: F.releaseF === S.release, label: `Shot ${i + 1} of ${shots.length}. ` } : { F: S.fit, cur: true, label: "" };
}
function renderResults() {
  const { F, cur, label } = shownShot();
  if (!F) { el.results.innerHTML = `<p class="empty">${S.fitError || (S.shots.length ? "Mark the next shot's release and track it. Earlier shots are listed below." : "Shot distance, angles and key frames appear here once the ball is tracked.")}</p>${shotLogHtml()}`; bindGo(); return; }
  // Feet and the observed make frame are only stored for the current shot, not for saved ones.
  const C = court(), lt = lineText(F, C), obsMake = cur ? S.endFrame ?? S.madeObserved : null;
  const rows = [
    ["Release", F.releaseF, "Marked by you"],
    ["Apex", F.apexF, "From the fitted flight"],
    ["Rim entry", F.entryF, obsMake != null ? `From the fitted flight (${S.endFrame != null ? "you marked" : "tracker saw"} frame ${obsMake})` : "From the fitted flight"]
  ];
  if (cur && S.feet) rows.unshift(["Feet (takeoff)", S.feet.f, "Marked by you"]);
  let quality = `Ball path fits the tracked points within ${F.rms.toFixed(1)} px on average (${F.n} frames${F.dropped ? `, ${F.dropped} bad points ignored` : ""}).`;
  let warn = "";
  if (F.slowHint) warn = `The path fits much better with a slow-motion factor of ${F.slowHint}. If the clip is slowed down, set that in step 1.`;
  else if (F.rms > 6) warn = "The path doesn't fit the tracked points well. Check for wrong dots, the frame rate, and the slow-motion factor.";
  if (F.fromFeet && Math.abs(F.feetDist - F.relDist) > 4) warn += ` The feet are ${Math.abs(F.feetDist - F.relDist).toFixed(1)} ft from where the ball was released, which is a lot. Make sure the feet were flat on the floor in the frame you used.`;
  el.results.innerHTML = `
    <div class="headline">
      <div class="big"><span class="num">${F.dist.toFixed(1)} ft</span><span class="lbl">Shot distance <span class="badge">${lt.badge}</span></span></div>
      <div class="big"><span class="num">${F.relAngle.toFixed(1)}°</span><span class="lbl">Release angle</span></div>
      <div class="big"><span class="num">${F.entryAngle.toFixed(1)}°</span><span class="lbl">Entry angle at the rim</span></div>
    </div>
    <p class="note">${label}${F.fromFeet ? "Measured from the shooter's feet to the spot under the rim." : "Measured from the spot under the release point to the spot under the rim. Mark the shooter's feet for the official-style distance."} ${lt.note}</p>
    <dl class="stats">
      <div><dt>Release height</dt><dd>${F.relH.toFixed(2)} ft</dd></div>
      <div><dt>Apex height</dt><dd>${F.apexH.toFixed(2)} ft</dd></div>
      <div><dt>Apex above rim</dt><dd>${(F.apexH - RIM_FT).toFixed(2)} ft</dd></div>
      <div><dt>Release speed</dt><dd>${F.speed.toFixed(1)} ft/s</dd></div>
      <div><dt>Time to rim</dt><dd>${F.tR.toFixed(2)} s</dd></div>
      <div><dt>Release spot to rim</dt><dd>${F.relDist.toFixed(1)} ft</dd></div>
      ${F.feetDist != null ? `<div><dt>Feet to rim</dt><dd>${F.feetDist.toFixed(1)} ft</dd></div>` : ""}
    </dl>
    <div class="tablewrap"><table class="frames">
      <thead><tr><th>Moment</th><th>Frame</th><th>Video time</th><th>Source</th><th></th></tr></thead>
      <tbody>${rows.map(([n, fr, src]) => `<tr><td>${n}</td><td>${Math.round(fr)}</td><td>${(fr / S.fps).toFixed(2)} s</td><td>${src}</td><td><button data-go="${Math.round(fr)}">Show</button></td></tr>`).join("")}</tbody>
    </table></div>
    <p class="quality">${quality}${warn ? ` <span class="warn">${warn}</span>` : ""} Heights are to the center of the ball. Uses real gravity, so the frame rate and slow-motion factor must be right.</p>
    ${shotLogHtml()}`;
  bindGo();
}

function canvasPoint(e) {
  const r = view.getBoundingClientRect();
  return { x: (e.clientX - r.left) * S.W / r.width, y: (e.clientY - r.top) * S.H / r.height };
}
let clickTimer = null;
function markClick(p) {
  S.lastClick = { ...p, f: S.frame };
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { S.lastClick = null; if (!S.playing && !S.tracking) render(); }, 700);
}
function placeRelease(p) {
  pctx.drawImage(video, 0, 0, S.W, S.H);
  const z = zoomAt(S.frame), tol = +el.tol.value, maxR = Math.round(Math.min(S.W, S.H) * 0.15);
  let prior = null; // expected ball radius in reference px, from the camera calibration
  if (S.cal) {
    const u = fromRef(toRef(p, S.frame), S.cal.calF), rr = ray(S.cal, u), s = (8 - rr.C[2]) / rr.d[2];
    if (s > 0) { const q = project(S.cal, vAdd(rr.C, vMul(rr.d, s))); if (q.z > 0) prior = S.cal.f * BALL_R_FT / q.z * zoomAt(S.cal.calF); }
  }
  let color = meanColor(p.x, p.y, Math.max(4, S.W * 0.006), 0.2) || meanColor(p.x, p.y, Math.max(6, S.W * 0.01), 0.1);
  let center = p, rRef = null;
  if (color) {
    let g = refine(p.x, p.y, matcher(color, tol), maxR);
    if (g.r >= 3) {
      const c2 = meanColor(g.x, g.y, Math.max(2, g.r * 0.6), 0.2);
      if (c2) { color = c2; g = refine(g.x, g.y, matcher(color, tol), maxR); }
      const rr = g.r * z;
      if (g.r >= 3 && (!prior || (rr > prior * 0.6 && rr < prior * 1.6)) && Math.hypot(g.x - p.x, g.y - p.y) < g.r * 1.2) { center = g; rRef = rr; }
    }
  }
  if (rRef == null) rRef = prior ?? Math.max(6, S.W * 0.012) * z;
  for (const f of [...S.points.keys()]) if (f < S.frame) S.points.delete(f);
  S.ball = { r: rRef, h: color ? color.h : null, s: color ? color.s : 0, v: color ? color.v : 0 };
  S.release = S.frame;
  S.points.set(S.frame, { ...toRef(center, S.frame), src: "manual" });
}
function handleCanvasClick(e) {
  if (!S.loaded) return;
  if (S.replay) { setHint("Exit the replay to mark or edit shots.", false, true); return; }
  if (S.asking) { setHint("First pick whether the camera is still or moves.", true, true); return; }
  if (S.tracking || S.measuring) { setHint(S.tracking ? "Tracking is running. Press “Stop tracking” to click on the video." : "Still checking camera motion. Press Skip if you don't need it.", true, true); return; }
  if (S.playing) pause();
  const p = canvasPoint(e);
  S.msg = null;
  const mode = S.mode || nextNeeded();
  if (!mode) { setHint("To add or move something, press its button first (for example “Place ball by hand” or “Shooter's feet”).", false, true); return; }
  markClick(p);
  const ref = toRef(p, S.frame);
  if (mode === "laneB" || mode === "laneF") {
    const arr = mode === "laneB" ? S.laneB : S.laneF;
    if (arr.length >= 2) arr.length = 0;
    arr.push(ref); S.calF = S.frame;
    if (arr.length === 2) S.mode = null;
  } else if (mode === "rim") { S.rim = ref; S.calF = S.frame; S.mode = null; }
  else if (mode === "three") { S.three.push(ref); if (S.three.length >= 8) S.mode = null; }
  else if (mode === "feet") { S.feet = { ...ref, f: S.frame }; S.mode = null; }
  else if (mode === "release") { placeRelease(p); S.mode = null; }
  else if (mode === "edit") {
    if (S.release != null && S.frame < S.release) { S.msg = "That frame is before the release. Mark the release again if it's wrong."; S.msgWarn = true; updateUI(); return; }
    const q = snapToBall(p) || p;
    S.points.set(S.frame, { ...toRef(q, S.frame), src: "manual" });
    fitBall(); render(); updateUI();
    goFrame(S.frame + +$("#stepN").value);
    return;
  }
  recompute(); render(); updateUI();
}
view.addEventListener("click", handleCanvasClick);

document.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
  exitReplay(); pause(); S.msg = null; S.presetReplay = false;
  const m = b.dataset.mode;
  if (S.mode === m) { S.mode = null; updateUI(); return; }
  S.mode = m;
  if (m === "laneB") S.laneB = []; if (m === "laneF") S.laneF = []; if (m === "three") S.three = [];
  recompute(); render(); updateUI();
}));
function resetAll() {
  if (!S.loaded || S.tracking || S.measuring || S.asking) return;
  exitReplay(); S.presetReplay = false;
  pause(); clearShot();
  Object.assign(S, { rim: null, laneB: [], laneF: [], three: [], feet: null, cal: null, calErr: null, mode: null, msg: null, lastClick: null, tracked: false, shots: [] });
  el.rimC.checked = true;
  goFrame(S.frame); updateUI();
  setHint("Cleared. " + defaultHint(), false, true);
}
$("#resetBtn").addEventListener("click", resetAll);
// Still camera: the court marking stays valid for the whole clip, so keep it and start a fresh shot.
function nextShot() {
  if (!S.loaded || !S.cal || S.camMode !== "still" || S.tracking || S.measuring || S.asking) return;
  exitReplay(); S.presetReplay = false;
  let resume = S.frame;
  if (S.fit) {
    const F = S.fit, lt = lineText(F, court());
    S.shots.push({ n: S.shots.length + 1, dist: F.dist, fromFeet: F.fromFeet, badge: lt.badge, relAngle: F.relAngle, entryAngle: F.entryAngle, relH: F.relH, apexH: F.apexH, releaseF: S.release, madeF: Math.round(F.entryF), fit: { ...F } });
    resume = Math.round(F.entryF) + Math.round(S.fps * 0.5);
  }
  pause(); clearShot();
  Object.assign(S, { feet: null, tracked: false, mode: null, msg: null, lastClick: null });
  goFrame(clamp(resume, 0, S.nFrames - 1)); updateUI();
  setHint("Court kept. Step to the next shot's release and click the ball.", false, true);
}
$("#nextShot").addEventListener("click", nextShot);
$("#newClip").addEventListener("click", () => location.reload());
$("#camMode").addEventListener("change", async e => {
  if (!S.loaded || S.tracking || S.measuring || S.asking) { e.target.value = S.camMode; return; }
  exitReplay(); pause(); clearShot();
  Object.assign(S, { rim: null, laneB: [], laneF: [], three: [], feet: null, cal: null, calErr: null, mode: null, msg: null, tracked: false, shots: [] });
  setHint("Camera setting changed, so the court and shot need marking again.", false, true);
  await applyCamMode(e.target.value);
});
$("#courtType").addEventListener("change", () => { recompute(); render(); updateUI(); });
el.skipCam.addEventListener("click", () => { S.skipReq = true; });
el.track.addEventListener("click", () => { exitReplay(); S.presetReplay = false; track(); });
el.stop.addEventListener("click", () => { S.stopReq = true; });
el.delPt.addEventListener("click", () => {
  if (S.frame === S.release) { S.msg = "That's the release point. Mark the release again to move it."; S.msgWarn = true; updateUI(); return; }
  S.points.delete(S.frame); fitBall(); render(); updateUI();
});
el.setEnd.addEventListener("click", () => { S.endFrame = S.endFrame != null ? null : S.frame; fitBall(); render(); updateUI(); });
el.clear.addEventListener("click", () => {
  for (const f of [...S.points.keys()]) if (f !== S.release) S.points.delete(f);
  S.madeObserved = null; el.trackStatus.textContent = "";
  fitBall(); render(); updateUI();
});
el.rimC.addEventListener("change", () => { fitBall(); render(); updateUI(); });
el.tol.addEventListener("input", () => { el.tolOut.textContent = `${el.tol.value}°`; });
el.fps.addEventListener("change", async () => {
  const v = +el.fps.value; if (!(v > 0) || !S.loaded) { el.fps.value = S.fps; return; }
  exitReplay();
  S.fps = v; S.nFrames = Math.max(1, Math.floor(video.duration * S.fps)); el.scrub.max = S.nFrames - 1;
  el.fpsNote.textContent = "Frame rate set by you. Frame numbers changed, so mark the court and the shot again.";
  clearShot();
  Object.assign(S, { rim: null, laneB: [], laneF: [], three: [], feet: null, cal: null, calErr: null, shots: [] });
  await applyCamMode(S.camMode);
});
el.slow.addEventListener("change", () => { const v = +el.slow.value; S.slow = v >= 1 ? v : 1; el.slow.value = S.slow; fitBall(); render(); updateUI(); });
el.trail.addEventListener("change", () => render());
el.showPts.addEventListener("change", () => render());
el.courtLines.addEventListener("change", () => render());
el.rate.addEventListener("change", () => { video.playbackRate = +el.rate.value; });
el.scrub.addEventListener("input", () => { exitReplay(); pause(); goFrame(+el.scrub.value); });
el.prev.addEventListener("click", () => { exitReplay(); pause(); goFrame(S.frame - 1); });
el.next.addEventListener("click", () => { exitReplay(); pause(); goFrame(S.frame + 1); });
el.play.addEventListener("click", togglePlay);

/* ---------------- replay of all tracked shots ---------------- */
// Every tracked shot in the clip (saved ones plus the current one), in the order they happen.
function allShots() {
  const list = S.shots.map(h => h.fit).filter(Boolean);
  if (S.fit) list.push({ ...S.fit });
  return list.sort((a, b) => a.releaseF - b.releaseF);
}
// Freeze a few frames after the ball reaches the rim.
const stopFrame = F => Math.min(S.nFrames - 1, Math.round(F.entryF) + Math.max(3, Math.round(S.fps * 0.2)));
function resumePlayback() {
  video.currentTime = (S.frame + 0.5) / S.fps;
  video.playbackRate = +el.rate.value;
  S.playing = true;
  video.play().then(() => loop()).catch(() => { S.playing = false; syncTransport(); });
  updateUI();
}
// from: frame to start at. Replay picks up at the first shot that hasn't gone in yet by then;
// past the last shot it starts over from the beginning.
function startReplay(from = 0) {
  const shots = allShots();
  if (!shots.length || !S.loaded || S.tracking || S.measuring || S.asking) return;
  pause();
  S.mode = null; S.msg = null; S.lastClick = null;
  const i = shots.findIndex(F => stopFrame(F) > from);
  S.replay = { shots, idx: Math.max(0, i), frozen: false, mode: $("#arcMode").value };
  S.frame = i < 0 ? 0 : from;
  resumePlayback();
}
function replayShouldFreeze() {
  const R = S.replay, cur = R.shots[R.idx];
  if (!cur || S.frame < stopFrame(cur)) return false;
  S.playing = false; video.pause(); R.frozen = true;
  const F = cur, lt = lineText(F, court());
  $("#rcTitle").textContent = `Shot ${R.idx + 1} of ${R.shots.length}`;
  $("#rcStats").innerHTML = `<span><b>${F.dist.toFixed(1)} ft</b>${lt.badge}</span><span><b>${F.relAngle.toFixed(1)}°</b>release</span><span><b>${F.entryAngle.toFixed(1)}°</b>entry</span><span><b>${F.relH.toFixed(1)} ft</b>release height</span><span><b>${F.apexH.toFixed(1)} ft</b>apex</span>`;
  $("#replayCard").hidden = false;
  goFrame(stopFrame(cur)); updateUI();
  return true;
}
function continueReplay() {
  const R = S.replay;
  if (!R || !R.frozen) return;
  $("#replayCard").hidden = true;
  R.frozen = false; R.idx++;
  resumePlayback();
}
// Watch the shot that just went in again: back up to a few frames before its release and play on.
const AGAIN_LEAD = 20;
function replayShotAgain() {
  const R = S.replay;
  if (!R || !R.frozen) return;
  $("#replayCard").hidden = true;
  R.frozen = false;
  S.frame = Math.max(0, Math.round(R.shots[R.idx].releaseF) - AGAIN_LEAD);
  resumePlayback();
}
function finishReplay() {
  if (!S.replay) return;
  S.replay = null; $("#replayCard").hidden = true;
  S.replayEndF = S.frame; // the video just ends: no shot overlay on its last frame (see drawOverlay)
  render(); updateUI();
  setHint("Replay finished.", false, true);
}
function exitReplay() {
  if (!S.replay) return;
  S.replay = null; $("#replayCard").hidden = true;
  if (S.playing) pause();
  render(); updateUI();
}
function togglePlay() {
  if (S.replay) {
    if (S.replay.frozen) continueReplay();
    else if (S.playing) pause();
    else resumePlayback();
    return;
  }
  if (S.playing) { pause(); return; }
  // A test clip loaded with saved shots: play means watching all of them, the same as "Replay all shots".
  if (S.presetReplay && allShots().length) { startReplay(S.frame); return; }
  play();
}
$("#replayBtn").addEventListener("click", () => startReplay(0));
$("#rcContinue").addEventListener("click", continueReplay);
$("#rcAgain").addEventListener("click", replayShotAgain);
// The button also rewinds to the start (other ways of leaving a replay, like scrubbing, stay where they are).
$("#rcExit").addEventListener("click", () => { exitReplay(); goFrame(0); });
$("#arcMode").addEventListener("change", e => { if (S.replay) { S.replay.mode = e.target.value; if (!S.playing) render(); } });
$("#file").addEventListener("change", e => loadVideo(e.target.files[0]));
$("#file2").addEventListener("change", e => loadVideo(e.target.files[0]));
el.stage.addEventListener("dragover", e => { e.preventDefault(); el.drop.classList.add("over"); });
el.stage.addEventListener("dragleave", () => el.drop.classList.remove("over"));
el.stage.addEventListener("drop", e => { e.preventDefault(); el.drop.classList.remove("over"); loadVideo(e.dataTransfer.files[0]); });
document.addEventListener("keydown", e => {
  const tg = e.target.tagName;
  if ((tg === "INPUT" && e.target.type !== "range" && e.target.type !== "checkbox") || tg === "SELECT" || tg === "TEXTAREA") return;
  if (!S.loaded || S.tracking || S.measuring || S.asking) return;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault(); exitReplay(); pause();
    goFrame(S.frame + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1));
  } else if (e.key === " " || (e.key === "Enter" && S.replay && S.replay.frozen)) { e.preventDefault(); togglePlay(); }
  else if (e.key === "Escape") { S.mode = null; S.msg = null; updateUI(); }
});
updateUI();
