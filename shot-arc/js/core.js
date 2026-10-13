// Shared constants, DOM handles and app state.
"use strict";

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const DEG = 180 / Math.PI, G = 32.174, RIM_FT = 10, BALL_R_FT = 0.3915;
const ARC = "#FF7A1A", RIMC = "#FF4D40";

const video = document.createElement("video");
video.muted = true; video.playsInline = true; video.preload = "auto";
video.setAttribute("playsinline", ""); video.setAttribute("muted", "");
video.style.cssText = "position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none";
document.body.appendChild(video);

const view = $("#view"), vctx = view.getContext("2d");
const proc = document.createElement("canvas"), pctx = proc.getContext("2d", { willReadFrequently: true });
const prevC = document.createElement("canvas"), prctx = prevC.getContext("2d", { willReadFrequently: true });
const small = document.createElement("canvas"), sctx = small.getContext("2d", { willReadFrequently: true });

const el = {
  stage: $("#stage"), hint: $("#hint"), hintBox: $("#hintBox"), skipCam: $("#skipCam"), drop: $("#drop"),
  scrub: $("#scrub"), readout: $("#readout"), play: $("#play"), playIcon: $("#playIcon"), prev: $("#prev"),
  next: $("#next"), rate: $("#rate"), trail: $("#trail"), showPts: $("#showPts"), courtLines: $("#courtLines"),
  fps: $("#fps"), slow: $("#slow"), fpsNote: $("#fpsNote"), camStatus: $("#camStatus"), tol: $("#tol"), tolOut: $("#tolOut"),
  courtStatus: $("#courtStatus"), relStatus: $("#relStatus"), trackStatus: $("#trackStatus"),
  track: $("#trackBtn"), stop: $("#stopBtn"), delPt: $("#delPt"), setEnd: $("#setEnd"), clear: $("#clearTrack"),
  rimC: $("#rimConstraint"), results: $("#results")
};

// Stored positions are in reference coordinates (frame 0's pixel grid); S.cam maps each frame into it.
const S = {
  loaded: false, url: null, fps: 30, slow: 1, nFrames: 1, frame: 0, W: 16, H: 9,
  cam: null, camState: "none", measuring: false, skipReq: false,
  laneB: [], laneF: [], rim: null, three: [], feet: null, calF: 0, cal: null, calErr: null,
  release: null, endFrame: null, madeObserved: null,
  points: new Map(), ball: null, mode: null, fit: null, fitError: null,
  tracking: false, stopReq: false, playing: false, msg: null, msgWarn: false, lastClick: null,
  camMode: "still", asking: false, shots: []
};
