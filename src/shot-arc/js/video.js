// Video loading, frame-accurate seeking, frame-rate detection and playback.
"use strict";

/* ---------------- video / frames ---------------- */
function seekTo(f) {
  f = clamp(Math.round(f), 0, S.nFrames - 1);
  S.frame = f;
  const t = Math.min((f + 0.5) / S.fps, Math.max(0, video.duration - 0.001));
  return new Promise(res => {
    if (Math.abs(video.currentTime - t) < 1e-6 && video.readyState >= 2) { res(); return; }
    const on = () => { video.removeEventListener("seeked", on); res(); };
    video.addEventListener("seeked", on);
    video.currentTime = t;
  });
}
let seeking = false, pending = null;
async function goFrame(f) {
  pending = f;
  if (seeking) return;
  seeking = true;
  while (pending !== null) { const t = pending; pending = null; await seekTo(t); }
  seeking = false;
  render(); syncTransport();
}
function detectFps() {
  return new Promise(resolve => {
    if (!("requestVideoFrameCallback" in HTMLVideoElement.prototype)) { resolve(null); return; }
    const times = []; let done = false;
    const finish = () => {
      if (done) return; done = true;
      video.pause(); video.playbackRate = 1;
      const d = [];
      for (let i = 1; i < times.length; i++) { const x = times[i] - times[i - 1]; if (x > 0.0005) d.push(x); }
      if (d.length < 4) { resolve(null); return; }
      d.sort((a, b) => a - b);
      const f = 1 / d[Math.floor(d.length * 0.2)];
      const common = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 90, 100, 119.88, 120, 240];
      const best = common.reduce((a, b) => Math.abs(b - f) < Math.abs(a - f) ? b : a);
      resolve(Math.abs(best - f) / f < 0.04 ? best : Math.round(f * 100) / 100);
    };
    const cb = (now, meta) => { times.push(meta.mediaTime); if (times.length >= 18) finish(); else if (!done) video.requestVideoFrameCallback(cb); };
    video.requestVideoFrameCallback(cb);
    video.currentTime = 0; video.playbackRate = 0.5;
    video.play().catch(finish);
    setTimeout(finish, 3500);
  });
}
function clearShot() {
  Object.assign(S, { release: null, endFrame: null, madeObserved: null, ball: null, fit: null, fitError: null });
  S.points = new Map(); el.trackStatus.textContent = "";
}
async function loadVideo(file, opts = {}) {
  if (!file) return;
  if (S.measuring || S.tracking || S.asking) return;
  if (!file.type.startsWith("video/") && !/\.(mp4|mov|m4v|webm|mkv)$/i.test(file.name)) { setHint("That file isn't a video. Choose an MP4, MOV, or WebM clip.", true); return; }
  pause();
  if (S.url) URL.revokeObjectURL(S.url);
  Object.assign(S, { loaded: false, rim: null, laneB: [], laneF: [], three: [], feet: null, cal: null, calErr: null, mode: null, msg: null, cam: null, camState: "none", lastClick: null, tracked: false, shots: [], replay: null, presetReplay: false });
  clearShot();
  el.stage.classList.remove("loaded");
  S.url = URL.createObjectURL(file);
  setHint("Loading video…");
  try {
    await new Promise((res, rej) => {
      video.onloadeddata = res;
      video.onerror = () => rej(new Error("This browser can't play that video. Try an MP4 (H.264) file."));
      video.src = S.url;
    });
    if (!isFinite(video.duration)) await new Promise(r => { video.addEventListener("durationchange", r, { once: true }); video.currentTime = 1e7; });
  } catch (e) { setHint(e.message, true); return; }
  S.W = video.videoWidth; S.H = video.videoHeight;
  for (const cv of [view, proc, prevC]) { cv.width = S.W; cv.height = S.H; }
  const fps = await detectFps();
  S.fps = fps || 30;
  el.fps.value = S.fps;
  el.fpsNote.textContent = fps ? `Detected ${S.fps} fps. Change it if you know the real rate.` : "Couldn't detect the frame rate, so 30 fps is assumed. Enter the real rate if you know it.";
  S.nFrames = Math.max(1, Math.floor(video.duration * S.fps));
  el.scrub.max = S.nFrames - 1;
  S.loaded = true; el.stage.classList.add("loaded");
  S.content = null;
  await goFrame(0);
  S.content = detectContent();
  if (opts.preset) await applyPresetCourt(opts.preset);
  else await applyCamMode(await askCamera());
}
// Ask once per clip whether the camera moves. A still camera skips the camera-motion pass entirely.
function askCamera() {
  S.asking = true; updateUI();
  setHint("Tell the app whether the camera moves in this clip.");
  const box = $("#camAsk"); box.hidden = false;
  return new Promise(res => {
    const pick = m => { box.hidden = true; S.asking = false; $("#camStill").onclick = $("#camMoving").onclick = null; res(m); };
    $("#camStill").onclick = () => pick("still");
    $("#camMoving").onclick = () => pick("moving");
  });
}
async function applyCamMode(mode) {
  S.camMode = mode; $("#camMode").value = mode;
  if (mode === "moving") { await measureCamera(); return; }
  S.cam = null; S.camState = "still";
  await goFrame(S.frame);
  updateUI();
}
function syncTransport() {
  el.scrub.value = S.frame;
  el.readout.textContent = `Frame ${S.frame} / ${S.nFrames - 1}   ${(S.frame / S.fps).toFixed(2)} s`;
  el.playIcon.innerHTML = S.playing ? '<path d="M3 2h4v12H3zM9 2h4v12H9z"/>' : '<path d="M3 2l11 6-11 6z"/>';
  el.play.setAttribute("aria-label", S.playing ? "Pause" : "Play");
}
function loop(mediaTime) {
  if (!S.playing) return;
  const t = mediaTime ?? video.currentTime;
  S.frame = clamp(Math.floor(t * S.fps + 1e-4), 0, S.nFrames - 1);
  if (S.replay && !S.replay.frozen && replayShouldFreeze()) return;
  render(S.frame); syncTransport();
  if (video.requestVideoFrameCallback) video.requestVideoFrameCallback((n, m) => loop(m.mediaTime));
  else requestAnimationFrame(() => loop());
}
function play() {
  if (!S.loaded || S.tracking || S.measuring) return;
  S.mode = null; S.lastClick = null;
  const end = S.fit ? Math.round(S.fit.entryF) + Math.round(S.fps * 0.5) : S.nFrames - 1;
  if (S.frame >= Math.min(end, S.nFrames - 2)) S.frame = Math.max(0, (S.release ?? 0) - Math.round(S.fps * 0.5));
  video.currentTime = (S.frame + 0.5) / S.fps;
  video.playbackRate = +el.rate.value;
  S.playing = true;
  video.play().then(() => loop()).catch(() => { S.playing = false; syncTransport(); });
  updateUI();
}
function pause() {
  if (!S.playing) return;
  S.playing = false; video.pause();
  S.frame = clamp(Math.floor(video.currentTime * S.fps), 0, S.nFrames - 1);
  goFrame(S.frame); updateUI();
}
video.addEventListener("ended", () => { if (S.playing) pause(); if (S.replay) finishReplay(); });
