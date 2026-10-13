import { Link } from "react-router-dom";
import "./ShotArc.css";

// Shot Arc is a self-contained vanilla JS/canvas app (video processing, camera
// calibration, ball tracking) that lives in public/shot-arc. It's embedded here
// via iframe rather than ported to React, since it's a full, independent page.
export default function ShotArc() {
  return (
    <div className="shot-arc-page">
      <Link className="shot-arc-back-link" to="/">Back to personal site</Link>
      <iframe
        className="shot-arc-frame"
        src={`${import.meta.env.BASE_URL}shot-arc/index.html`}
        title="Shot Arc: basketball shot analyzer"
        allow="autoplay"
      />
    </div>
  );
}
