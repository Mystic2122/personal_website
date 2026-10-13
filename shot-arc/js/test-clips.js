// Bundled demo clips with the court already mapped, for visitors trying the
// app without a video of their own. Loaded last so every helper it needs
// (S, el, $, loadVideo, calibrate, render, updateUI, goFrame, setHint) already exists.
"use strict";

// Fill in the real pixel coordinates once the clip is in public/videos/<file>, then
// flip `ready` to true. Coordinates are plain video pixels (origin top-left) read
// off `calF`, the frame the clicks would have been made on. Court marking only
// works for a still (tripod) camera, since that's the only case the app doesn't
// need to measure camera motion for first.
// Paths are relative to where this page is served (<base>/shot-arc/index.html), so
// they reach up one level to <base>/videos/ (public/videos/ in the repo).
// `shots`/`current` are optional: when present, their fitted flights (`fit`) are
// shown immediately too, not just the court. `shots` is earlier completed shots in
// the clip (the same shape S.shots stores them in); `current` is whichever shot was
// still on screen when the capture was taken. Both come straight out of the capture
// snippet in the comment below — no manual editing needed beyond pasting the result in.
const TEST_CLIPS = {
  test: {
    label: "Test clip",
    file: "../videos/shot-arc-test-clip.mp4",
    ready: true,
    courtType: "hs",
    calF: 0,
    laneB: [
      { x: 261.59755787331466, y: 1214.6751884002672 },
      { x: 434.5001271940982, y: 1194.161976533435 }
    ],
    laneF: [
      { x: 821.3329941490715, y: 1246.9102356195745 },
      { x: 750.9997456118036, y: 1290.8671181913573 }
    ],
    rim: { x: 472.5973034851183, y: 986.0993990269961 },
    three: [{ x: 97.48664461968964, y: 1308.4498712200707 }],
    shots: [
      {
        n: 1, dist: 21.020206825154304, fromFeet: true, badge: "3-pointer",
        relAngle: 48.17233656993403, entryAngle: 41.89493249711165,
        relH: 7.760537199482511, apexH: 14.06178455268087,
        releaseF: 100, madeF: 134,
        fit: {
          p: [-2.065383323194043, 19.9308139729332, 7.760537199482511, 1.9981635390475647, -17.910360751136793, 20.136351821608798],
          k: 30, tR: 1.1283403571341353, tA: 0.6258578921367812, vh: 18.021478290213608,
          relAngle: 48.17233656993403, entryAngle: 41.89493249711165,
          relH: 7.760537199482511, apexH: 14.06178455268087, speed: 27.02307059621923,
          relDist: 20.03754360931992, feetDist: 21.020206825154304,
          spot: [-3.6789558150445814, 20.695757514119002],
          dist: 21.020206825154304, fromFeet: true, lineDelta: 1.270206825154304,
          rms: 1.2105546935877876, n: 35, dropped: 0, slowHint: null,
          releaseF: 100, apexF: 118.77573676410344, entryF: 133.85021071402406
        }
      },
      {
        n: 2, dist: 17.800022160873425, fromFeet: true, badge: "2-pointer",
        relAngle: 51.469311638941775, entryAngle: 43.83649779882132,
        relH: 7.460860406234547, apexH: 13.573772029667538,
        releaseF: 349, madeF: 382,
        fit: {
          p: [-5.177212645380907, 15.833723371063678, 7.460860406234547, 5.291219517429968, -14.880618858450637, 19.83314491311618],
          k: 30, tR: 1.087764796537092, tA: 0.6164339190997756, vh: 15.793347384012948,
          relAngle: 51.469311638941775, entryAngle: 43.83649779882132,
          relH: 7.460860406234547, apexH: 13.573772029667538, speed: 25.353174529765983,
          relDist: 16.65864119809476, feetDist: 17.800022160873425,
          spot: [-8.176573822282172, 15.810895909351721],
          dist: 17.800022160873425, fromFeet: true, lineDelta: -1.949977839126575,
          rms: 2.1328797868008906, n: 33, dropped: 0, slowHint: null,
          releaseF: 349, apexF: 367.49301757299327, entryF: 381.63294389611275
        }
      }
    ],
    current: {
      release: 645,
      fit: {
        p: [7.110286761605448, 18.64656541335183, 8.046407595496714, -5.910941675087197, -17.083872876707808, 19.639909024948576],
        k: 30, tR: 1.1116096472692139, tA: 0.6104279550241989, vh: 18.07755359427252,
        relAngle: 47.37198423113662, entryAngle: 41.73268280955548,
        relH: 8.046407595496714, apexH: 14.04078234697705, speed: 26.693144634194976,
        relDist: 19.95621656393492, feetDist: 20.70979898944441,
        spot: [6.986713048330316, 19.495681956871465],
        dist: 20.70979898944441, fromFeet: true, lineDelta: 0.9597989894444083,
        rms: 0.765371776521832, n: 34, dropped: 0, slowHint: null,
        releaseF: 645, apexF: 663.312838650726, entryF: 678.3482894180764
      },
      feet: { x: 970.7911472907657, y: 1331.8935419250215, f: 636 },
      endFrame: null
    }
  },
  longShot: {
    label: "Long-shot example",
    file: "../videos/long-shot-example.mp4",
    ready: true,
    courtType: "hs",
    calF: 0,
    laneB: [
      { x: 752.8538283062645, y: 555.7308584686775 },
      { x: 846.4037122969837, y: 533.4570765661252 }
    ],
    laneF: [
      { x: 1064.6867749419953, y: 540.1392111368909 },
      { x: 1051.3225058004641, y: 566.8677494199536 }
    ],
    rim: { x: 859.7679814385151, y: 408.7238979118329 },
    three: [{ x: 737.2621809744779, y: 622.5522041763342 }],
    shots: [
      {
        n: 1, dist: 31.06364705911761, fromFeet: true, badge: "3-pointer",
        relAngle: 53.30379432752716, entryAngle: 49.80120937063387,
        relH: 7.678594442851042, apexH: 18.127686231528692,
        releaseF: 101, madeF: 147,
        fit: {
          p: [-14.738074734149402, 24.88845231597267, 7.678594442851042, 9.416852024847538, -16.875549110650084, 25.930255656623004],
          k: 30, tR: 1.5167357692603292, tA: 0.8059382003053087, vh: 19.325145791011202,
          relAngle: 53.30379432752716, entryAngle: 49.80120937063387,
          relH: 7.678594442851042, apexH: 18.127686231528692, speed: 32.339440599083765,
          relDist: 28.9248319883421, feetDist: 31.06364705911761,
          spot: [-16.34262869334765, 26.417203788531374],
          dist: 31.06364705911761, fromFeet: true, lineDelta: 11.31364705911761,
          rms: 1.579475975224775, n: 47, dropped: 0, slowHint: null,
          releaseF: 101, apexF: 125.17814600915926, entryF: 146.50207307780988
        }
      }
    ],
    current: {
      release: 380,
      fit: {
        p: [-8.98186484399452, 23.720119819902568, 7.846753634743513, 7.389242124543304, -18.31709266248274, 22.758651083317204],
        k: 30, tR: 1.3127625090780795, tA: 0.7073615678285946, vh: 19.75137419981466,
        relAngle: 49.046520735194115, entryAngle: 44.60098437135839,
        relH: 7.846753634743513, apexH: 15.896051190723115, speed: 30.134249317235025,
        relDist: 25.36371385160934, feetDist: 27.72770440135848,
        spot: [-12.227023866856307, 24.886250796944896],
        dist: 27.72770440135848, fromFeet: true, lineDelta: 7.97770440135848,
        rms: 1.0498051473924712, n: 38, dropped: 0, slowHint: null,
        releaseF: 380, apexF: 401.22084703485785, entryF: 419.3828752723424
      },
      feet: { x: 1205.0116009280744, y: 533.4570765661252, f: 378 },
      endFrame: null
    }
  }
};

// Paste this into the console (F12) once the court is marked AND every shot you
// want saved has been tracked — click "Next shot in this clip" after each shot
// except the last one, so it stays as the "current" fit, then run this. It prints
// one JSON blob with the court mapping, every earlier shot's fitted flight, and the
// current one — paste the whole thing back to update a TEST_CLIPS entry above.
//
// console.log(JSON.stringify({ dims: `${S.W}x${S.H}`, courtType: document.querySelector('#courtType').value, calF: S.calF, laneB: S.laneB, laneF: S.laneF, rim: S.rim, three: S.three, shots: S.shots, current: { release: S.release, fit: S.fit, feet: S.feet, endFrame: S.endFrame } }, null, 2))

async function fetchAsVideoFile(url, name) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`couldn't fetch it (${res.status})`);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "video/mp4" });
}

// Guards against a preset captured on one clip's resolution being applied to a
// different clip (e.g. a portrait clip's pixel coordinates reused on a landscape
// one) — which produced exactly this: a calibration built from points outside the
// frame, with the court wireframe projected miles off the video.
function presetFitsFrame(preset) {
  const pts = [...preset.laneB, ...preset.laneF, preset.rim, ...(preset.three || [])];
  return pts.every(p => p.x >= 0 && p.x <= S.W && p.y >= 0 && p.y <= S.H);
}

// Drops the user straight into "mark the shot" (or, if the preset has tracked
// shots saved, straight into watching them) by pre-filling what a still camera
// needs instead of asking for it.
async function applyPresetCourt(preset) {
  if (!presetFitsFrame(preset)) {
    console.warn(`Shot Arc: test-clip preset doesn't fit this clip's frame (${S.W}x${S.H}) — falling back to manual court marking.`);
    setHint("This test clip's saved court mapping doesn't match its video — mark the court as usual.", true, true);
    await applyCamMode(await askCamera());
    return;
  }
  S.camMode = "still";
  $("#camMode").value = "still";
  $("#courtType").value = preset.courtType || "nba";
  S.cam = null; S.camState = "still";
  S.calF = preset.calF ?? 0;
  S.laneB = preset.laneB.map(p => ({ ...p }));
  S.laneF = preset.laneF.map(p => ({ ...p }));
  S.rim = { ...preset.rim };
  S.three = (preset.three || []).map(p => ({ ...p }));
  // calibrate(), not recompute() — recompute() also calls fitBall(), which would
  // immediately null out S.fit below since there are no raw tracked S.points here.
  calibrate();

  if (preset.shots?.length) S.shots = preset.shots.map(h => ({ ...h, fit: { ...h.fit } }));
  if (preset.current?.fit) {
    S.release = preset.current.release;
    S.fit = { ...preset.current.fit };
    S.feet = preset.current.feet ? { ...preset.current.feet } : null;
    S.endFrame = preset.current.endFrame ?? null;
    S.tracked = true;
  }
  // With saved shots, Play runs the replay of all of them (see togglePlay in ui.js).
  S.presetReplay = !!S.fit;

  await goFrame(S.frame);
  render();
  updateUI();
  setHint(S.fit
    ? defaultHint()
    : "Test clip loaded — the court is already mapped. Step to the frame where the ball leaves the shooter's hands and click “Ball at release” to begin.", false, true);
}

async function loadTestClip(key) {
  const clip = TEST_CLIPS[key];
  if (!clip || S.measuring || S.tracking || S.asking) return;
  setHint(`Loading ${clip.label}…`);
  let file;
  try {
    file = await fetchAsVideoFile(clip.file, `${key}.mp4`);
  } catch (e) {
    setHint(`Couldn't load ${clip.label}: ${e.message}`, true);
    return;
  }
  el.rate.value = "1"; // demo clips play at full speed by default (uploads keep the 0.5× default)
  await loadVideo(file, clip.ready ? { preset: clip } : {});
}

document.querySelectorAll("[data-test-clip]").forEach(btn => {
  btn.addEventListener("click", () => loadTestClip(btn.dataset.testClip));
});
