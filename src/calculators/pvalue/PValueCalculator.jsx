import { useState } from "react";
import { jStat } from "jstat";
import MathMarkdown from "../../components/MathMarkdown";
import "./PValueCalculatorStyles.css";
import zTestStat from "../../assets/zTestStat.png";
import propZTestStat from "../../assets/propZtestStat.png";
import tTestStat from "../../assets/tTestStat.png";
import s from "../../assets/s.png";
import f from "../../assets/fTestStat.png";
import fDef from "../../assets/fTestStat2.png";
import chiDef from "../../assets/chiDef.png";
import chiTestStat from "../../assets/chiTestStat.png";
import { MarkdownHooks } from "react-markdown";

const popMeanTestRules = `
Use when X is normally distributed or when n &gt; 30 with $\\sigma$ known
`;

const propZTestRules = `
Use when $n\\hat{p} \\text{ and } n(1-\\hat{p}) \\geq 10$
`;

const tTestRules = `
Use when population standard deviation is unknown 
`;

const sText = `
S is an unbiased estimator of $\\sigma$ when we lose a degree of freedom estimating $\\bar{x}$
`;

const fText1 = `
$df_1 = n - 1$  
$df_2 = m -1$
`;

const fText2 = `
An F distribution is defined a a ratio of $\\chi ^2$ random variables divided by their degrees of freedom
`;

const chiText1 = `
Used for goodness of fit tests
`;

const chiText2 = `
This test statistic allows for inference on population variance
`

export default function PValueCalculator() {
  const [dist, setDist] = useState("z");
  const [x, setX] = useState("");
  const [mean, setMean] = useState("");
  const [sd, setSd] = useState("");
  const [df, setDf] = useState("");
  const [df2, setDf2] = useState("");
  const [tail, setTail] = useState("two");
  const [pValue, setPValue] = useState(null);

  function calculate() {
    const xNum = parseFloat(x);
    if (isNaN(xNum)) return;
    let p;

    // ---------------- Z / Normal ----------------
    if (dist === "z") {
      const meanNum = parseFloat(mean);
      const sdNum = parseFloat(sd);
      if (isNaN(meanNum) || isNaN(sdNum)) return;
      const cdf = jStat.normal.cdf(xNum, meanNum, sdNum);
      if (tail === "two") p = 2 * (1 - cdf);
      if (tail === "right") p = 1 - cdf;
      if (tail === "left") p = cdf;
    }
    // ---------------- T ----------------
    else if (dist === "t") {
      const dfNum = parseFloat(df);
      if (isNaN(dfNum)) return;
      const cdf = jStat.studentt.cdf(xNum, dfNum);
      if (tail === "two") p = 2 * (1 - cdf);
      if (tail === "right") p = 1 - cdf;
      if (tail === "left") p = cdf;
    }
    // ---------------- F ----------------
    else if (dist === "f") {
      const df1 = parseFloat(df);
      const df2Num = parseFloat(df2);
      if (isNaN(df1) || isNaN(df2Num)) return;
      const cdf = jStat.centralF.cdf(xNum, df1, df2Num);
      if (tail === "right") p = 1 - cdf;
      if (tail === "left") p = cdf;
      if (tail === "two") p = 2 * Math.min(cdf, 1 - cdf);
    }
    // ---------------- Chi-Square ----------------
    else if (dist === "chi") {
      const dfNum = parseFloat(df);
      if (isNaN(dfNum)) return;
      const cdf = jStat.chisquare.cdf(xNum, dfNum);
      if (tail === "right") p = 1 - cdf;
      if (tail === "left") p = cdf;
      if (tail === "two") p = 2 * Math.min(cdf, 1 - cdf);
    }
    setPValue(p);
  }

  function handleDistChange(newDist) {
    setDist(newDist);
    setX("");
    setMean("");
    setSd("");
    setDf("");
    setDf2("");
    setPValue(null);
  }

  return (
    /* FIX 1: Restored missing top-level parent wrapper element */
    <div className="calculator-container">
      <h3>P-Value Calculator</h3>

      {/* Distribution selector */}
      <div className="calculator-row">
        {/* Z Wrapper */}
        <div className="dist-button-wrapper">
          {/* CHANGED FROM <button> TO <span> TO AVOID CSS BUTTON CONFLICTS */}
          <span 
            className="standard-normal-popup" 
            onClick={() => { 
              setDist("z"); 
              setMean("0"); 
              setSd("1"); 
            }} 
          >
            Standard Normal
          </span>
          <button 
            className={`dist-button ${dist === "z" ? "active" : ""}`} 
            onClick={() => handleDistChange("z")}
          > 
            Z 
          </button>
        </div>

        {/* T Wrapper */}
        <div className="dist-button-wrapper">
          <button className={`dist-button ${dist === "t" ? "active" : ""}`} onClick={() => handleDistChange("t")}> T </button>
        </div>

        {/* F Wrapper */}
        <div className="dist-button-wrapper">
          <button className={`dist-button ${dist === "f" ? "active" : ""}`} onClick={() => handleDistChange("f")}> F </button>
        </div>

        {/* χ² Wrapper */}
        <div className="dist-button-wrapper">
          <button className={`dist-button ${dist === "chi" ? "active" : ""}`} onClick={() => handleDistChange("chi")}> χ² </button>
        </div>
      </div>

      {/* Tail selector */}
      <div className="calculator-tail-group">
        <label className="calculator-radio">
          <input
            type="radio"
            name="tail"
            value="left"
            checked={tail === "left"}
            onChange={(e) => setTail(e.target.value)}
          />{" "}
          Left tail
        </label>
        <label className="calculator-radio">
          <input
            type="radio"
            name="tail"
            value="right"
            checked={tail === "right"}
            onChange={(e) => setTail(e.target.value)}
          />{" "}
          Right tail
        </label>
        <label className="calculator-radio">
          <input
            type="radio"
            name="tail"
            value="two"
            checked={tail === "two"}
            onChange={(e) => setTail(e.target.value)}
          />{" "}
          Two tail
        </label>
      </div>

      {/* Test statistic layout engine */}
      <div className="distribution-inputs-container">
        {(() => {
          switch (dist) {
            case "z":
              return (
                <div className="layout-z">
                  <input
                    className="calculator-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="Z-test statistic"
                    value={x}
                    onChange={(e) => setX(e.target.value)}
                  />
                  {/* FIX 2: Fixed invalid HTML attribute type="decimal" to type="text" */}
                  <input
                    className="calculator-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="Mean"
                    value={mean}
                    onChange={(e) => setMean(e.target.value)}
                  />
                  <input
                    className="calculator-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="Standard Deviation"
                    value={sd}
                    onChange={(e) => setSd(e.target.value)}
                  />
                  <button className="calculate-button" onClick={calculate}>
                    Calculate
                  </button>

                  {pValue !== null && (
                    <div className="calculator-result">P-value: {pValue.toFixed(6)}</div>
                  )}
                  <div className="extra-info">
                    <div className="z-stat-img">
                      <h5>Population Mean Test</h5>
                      <img src={zTestStat} alt="Z Test Statistic" />
                      <br></br>
                      <div className="pop-mean-test-text">
                        <MathMarkdown content={popMeanTestRules} />
                      </div>
                    </div>
                    <div className="z-stat-img">
                      <h5>Population Proportion Test</h5>
                      <img src={propZTestStat} />
                      <br></br>
                      <div className="prop-z-test-text">
                        <MathMarkdown content={propZTestRules} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            case "t":
              return (
                <div className="layout-t">
                  <div className="input-group">
                    <input
                      className="calculator-input"
                      type="text"
                      inputMode="decimal"
                      placeholder="T-test statistic"
                      value={x}
                      onChange={(e) => setX(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      className="calculator-input"
                      type="number"
                      placeholder="df"
                      value={df}
                      onChange={(e) => setDf(e.target.value)}
                    />
                  </div>
                  <button className="t-test-calculate-button" onClick={calculate}>
                    Calculate
                  </button>

                  {pValue !== null && (
                    <div className="calculator-result">P-value: {pValue.toFixed(6)}</div>
                  )}
                  <div className="extra-info">
                    <div className="t-stat-img">
                      <h5>T test</h5>
                      <img src={tTestStat} alt="T Test Statistic" />
                      <br></br>
                      <div className="t-test-text">
                        <MathMarkdown content={tTestRules} />
                      </div>
                    </div>
                    <div className="t-stat-img">
                      <h5>Sample Standard Deviation</h5>
                      <img src={s} className="s-image" alt="Sample Standard Deviation" />
                      <br></br>
                      <div className="t-test-text">
                        <MathMarkdown content={sText} />
                      </div>
                    </div>
                  </div>  
                </div>
              );
            case "f":
              return (
                <div className="layout-f">
                  <input
                    className="calculator-input f-stat"
                    type="text"
                    inputMode="decimal"
                    placeholder="F-statistic"
                    value={x}
                    onChange={(e) => setX(e.target.value)}
                  />
                  <input
                    className="calculator-input f-df"
                    type="number"
                    placeholder="Numerator df (df1)"
                    value={df}
                    onChange={(e) => setDf(e.target.value)}
                  />
                  <input
                    className="calculator-input f-df"
                    type="number"
                    placeholder="Denominator df (df2)"
                    value={df2}
                    onChange={(e) => setDf2(e.target.value)}
                  />
                  <button className="calculate-button" onClick={calculate}>
                    Calculate
                  </button>

                  {pValue !== null && (
                    <div className="calculator-result">P-value: {pValue.toFixed(6)}</div>
                  )}
                  <div className="extra-info-f">
                    <div className="t-stat-img">
                      <h5>F Test Statistic</h5>
                      <img src={f} />
                      <br></br>
                      <div className="t-test-text">
                        <MathMarkdown content={fText1} />
                      </div>
                    </div>
                    <div className="t-stat-img">
                      <h5>Definition of F Distribution</h5>
                      <img src={fDef} className="s-image" alt="Sample Standard Deviation" />
                      <br></br>
                      <div className="t-test-text">
                        <MathMarkdown content={fText2} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            case "chi":
              return (
                <div className="layout-chi">
                  <input
                    className="calculator-input chi-stat"
                    type="text"
                    inputMode="decimal"
                    placeholder="χ² Statistic"
                    value={x}
                    onChange={(e) => setX(e.target.value)}
                  />
                  <input
                    className="calculator-input chi-df"
                    type="number"
                    placeholder="df"
                    value={df}
                    onChange={(e) => setDf(e.target.value)}
                  />
                  <button className="calculate-button" onClick={calculate}>
                    Calculate
                  </button>

                  {pValue !== null && (
                    <div className="calculator-result">P-value: {pValue.toFixed(6)}</div>
                  )}
                  <div className="extra-info-chi">
                    <div className="t-stat-img">
                      <h5>χ² Test Statistic</h5>
                      <img src={chiTestStat} className="chi-test-stat"/>
                      <br></br>
                      <div className="chi-test-text">
                        <MathMarkdown content={chiText1} />
                      </div>
                    </div>
                    <div className="t-stat-img">
                      <h5>Definition of χ² Distribution</h5>
                      <img src={chiDef} className="s-image" alt="Sample Standard Deviation" />
                      <br></br>
                      <div className="t-test-text">
                        <MathMarkdown content={chiText2} />
                      </div>
                    </div>
                  </div>
                  
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>

      
      
    </div>
  );
}
