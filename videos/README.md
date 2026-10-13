Demo clips for the Shot Arc project:

- `shot-arc-test-clip.mp4`
- `long-shot-example.mp4`

These are what the "Load test clip" buttons on the Shot Arc page fetch. Each
clip's pixel-coordinate court mapping (painted-lane corners + rim center) is
filled into `TEST_CLIPS` in `src/shot-arc/js/test-clips.js`, with `ready`
flipped to `true` once it's in place, so the court-marking step is skipped
for it.
