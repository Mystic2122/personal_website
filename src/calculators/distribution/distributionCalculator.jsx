import { useState } from "react";
import { jStat } from "jstat";
import "./distributionStyles.css";

export default function DistributionCalculator() {
  const [dist, setDist] = useState("normal");

  const [x, setX] = useState("");
  const [p, setP] = useState("");

  const [mean, setMean] = useState("0");
  const [sd, setSd] = useState("1");

  const [df, setDf] = useState("");
  const [df2, setDf2] = useState("");

  const [shape, setShape] = useState("2");
  const [scale, setScale] = useState("2");

  const [rate, setRate] = useState("1");

  const [operation, setOperation] = useState("cdf"); 
  // pdf | cdf | inv

  const [answer, setAnswer] = useState(null);

  function toNum(v) {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function calculate() {
    const xNum = toNum(x);
    const pNum = toNum(p);

    let result;

    // ---------------- NORMAL ----------------
    if (dist === "normal") {
      const m = toNum(mean) ?? 0;
      const s = toNum(sd) ?? 1;

      if (operation === "pdf") {
        if (xNum === null) return;
        result = jStat.normal.pdf(xNum, m, s);
      }

      if (operation === "cdf") {
        if (xNum === null) return;
        result = jStat.normal.cdf(xNum, m, s);
      }

      if (operation === "inv") {
        if (pNum === null) return;
        result = jStat.normal.inv(pNum, m, s);
      }
    }

    // ---------------- T ----------------
    if (dist === "t") {
      const d = toNum(df);
      if (d === null) return;

      if (operation === "pdf") {
        if (xNum === null) return;
        result = jStat.studentt.pdf(xNum, d);
      }

      if (operation === "cdf") {
        if (xNum === null) return;
        result = jStat.studentt.cdf(xNum, d);
      }

      if (operation === "inv") {
        if (pNum === null) return;
        result = jStat.studentt.inv(pNum, d);
      }
    }

    // ---------------- F ----------------
    if (dist === "f") {
      const d1 = toNum(df);
      const d2 = toNum(df2);
      if (d1 === null || d2 === null) return;

      if (operation === "pdf") {
        if (xNum === null) return;
        result = jStat.centralF.pdf(xNum, d1, d2);
      }

      if (operation === "cdf") {
        if (xNum === null) return;
        result = jStat.centralF.cdf(xNum, d1, d2);
      }

      if (operation === "inv") {
        if (pNum === null) return;
        result = jStat.centralF.inv(pNum, d1, d2);
      }
    }

    // ---------------- CHI-SQUARE ----------------
    if (dist === "chi") {
      const d = toNum(df);
      if (d === null) return;

      if (operation === "pdf") {
        if (xNum === null) return;
        result = jStat.chisquare.pdf(xNum, d);
      }

      if (operation === "cdf") {
        if (xNum === null) return;
        result = jStat.chisquare.cdf(xNum, d);
      }

      if (operation === "inv") {
        if (pNum === null) return;
        result = jStat.chisquare.inv(pNum, d);
      }
    }

    // ---------------- EXPONENTIAL ----------------
    if (dist === "exp") {
      const r = toNum(rate) ?? 1;

      if (operation === "pdf") {
        if (xNum === null) return;
        result = jStat.exponential.pdf(xNum, r);
      }

      if (operation === "cdf") {
        if (xNum === null) return;
        result = jStat.exponential.cdf(xNum, r);
      }

      if (operation === "inv") {
        if (pNum === null) return;
        result = jStat.exponential.inv(pNum, r);
      }
    }

    // ---------------- GAMMA ----------------
    if (dist === "gamma") {
      const k = toNum(shape) ?? 2;
      const s = toNum(scale) ?? 2;

      if (operation === "pdf") {
        if (xNum === null) return;
        result = jStat.gamma.pdf(xNum, k, s);
      }

      if (operation === "cdf") {
        if (xNum === null) return;
        result = jStat.gamma.cdf(xNum, k, s);
      }

      if (operation === "inv") {
        if (pNum === null) return;
        result = jStat.gamma.inv(pNum, k, s);
      }
    }

    setAnswer(result ?? null);
  }

  function handleDistChange(newDist) {
    setDist(newDist);
    setX("");
    setP("");
    setAnswer(null);
  }

  return (
    <div className="calculator-container">
      <h2>Distribution Calculator</h2>

      {/* DISTRIBUTIONS */}
      <div className="calculator-row">
        <button className={`dist-button ${dist === "normal" ? "active" : ""}`} onClick={() => handleDistChange("normal")}>Normal</button>
        <button className={`dist-button ${dist === "t" ? "active" : ""}`} onClick={() => handleDistChange("t")}>t</button>
        <button className={`dist-button ${dist === "f" ? "active" : ""}`} onClick={() => handleDistChange("f")}>F</button>
        <button className={`dist-button ${dist === "chi" ? "active" : ""}`} onClick={() => handleDistChange("chi")}>χ²</button>
        <button className={`dist-button ${dist === "exp" ? "active" : ""}`} onClick={() => handleDistChange("exp")}>Exp</button>
        <button className={`dist-button ${dist === "gamma" ? "active" : ""}`} onClick={() => handleDistChange("gamma")}>Gamma</button>
      </div>

      {/* MODE */}
      <div className="calculator-tail-group">
        <label>
          <input
            type="radio"
            value="pdf"
            checked={operation === "pdf"}
            onChange={(e) => setOperation(e.target.value)}
          />
          PDF
        </label>

        <label>
          <input
            type="radio"
            value="cdf"
            checked={operation === "cdf"}
            onChange={(e) => setOperation(e.target.value)}
          />
          CDF
        </label>

        <label>
          <input
            type="radio"
            value="inv"
            checked={operation === "inv"}
            onChange={(e) => setOperation(e.target.value)}
          />
          INV
        </label>
      </div>

      {/* ---------------- INPUTS ---------------- */}

      {dist === "normal" && (
        <>
          <input className="calculator-input" placeholder="Mean" value={mean} onChange={(e) => setMean(e.target.value)} />
          <input className="calculator-input" placeholder="SD" value={sd} onChange={(e) => setSd(e.target.value)} />
          {operation !== "inv" ? (
            <input className="calculator-input" placeholder="x" value={x} onChange={(e) => setX(e.target.value)} />
          ) : (
            <input className="calculator-input" placeholder="p (0-1)" value={p} onChange={(e) => setP(e.target.value)} />
          )}
        </>
      )}

      {dist === "t" && (
        <>
          <input className="calculator-input" placeholder="df" value={df} onChange={(e) => setDf(e.target.value)} />
          {operation !== "inv" ? (
            <input className="calculator-input" placeholder="x" value={x} onChange={(e) => setX(e.target.value)} />
          ) : (
            <input className="calculator-input" placeholder="p (0-1)" value={p} onChange={(e) => setP(e.target.value)} />
          )}
        </>
      )}

      {dist === "f" && (
        <>
          <input className="calculator-input" placeholder="df1" value={df} onChange={(e) => setDf(e.target.value)} />
          <input className="calculator-input" placeholder="df2" value={df2} onChange={(e) => setDf2(e.target.value)} />
          {operation !== "inv" ? (
            <input className="calculator-input" placeholder="x" value={x} onChange={(e) => setX(e.target.value)} />
          ) : (
            <input className="calculator-input" placeholder="p (0-1)" value={p} onChange={(e) => setP(e.target.value)} />
          )}
        </>
      )}

      {dist === "chi" && (
        <>
          <input className="calculator-input" placeholder="df" value={df} onChange={(e) => setDf(e.target.value)} />
          {operation !== "inv" ? (
            <input className="calculator-input" placeholder="x" value={x} onChange={(e) => setX(e.target.value)} />
          ) : (
            <input className="calculator-input" placeholder="p (0-1)" value={p} onChange={(e) => setP(e.target.value)} />
          )}
        </>
      )}

      {dist === "exp" && (
        <>
          <input className="calculator-input" placeholder="rate λ" value={rate} onChange={(e) => setRate(e.target.value)} />
          {operation !== "inv" ? (
            <input className="calculator-input" placeholder="x" value={x} onChange={(e) => setX(e.target.value)} />
          ) : (
            <input className="calculator-input" placeholder="p (0-1)" value={p} onChange={(e) => setP(e.target.value)} />
          )}
        </>
      )}

      {dist === "gamma" && (
        <>
          <input className="calculator-input" placeholder="shape k" value={shape} onChange={(e) => setShape(e.target.value)} />
          <input className="calculator-input" placeholder="scale θ" value={scale} onChange={(e) => setScale(e.target.value)} />
          {operation !== "inv" ? (
            <input className="calculator-input" placeholder="x" value={x} onChange={(e) => setX(e.target.value)} />
          ) : (
            <input className="calculator-input" placeholder="p (0-1)" value={p} onChange={(e) => setP(e.target.value)} />
          )}
        </>
      )}

      <button className="calculate-button" onClick={calculate}>
        Calculate
      </button>

      {answer !== null && (
        <div className="calculator-result">
          <h3>{dist.toUpperCase()} - {operation.toUpperCase()}</h3>
          <p>{answer.toFixed(6)}</p>
        </div>
      )}
    </div>
  );
}