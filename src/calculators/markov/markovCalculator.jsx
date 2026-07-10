import { useState } from "react";
import "./markovStyles.css";

export default function MarkovCalculator() {
    const [calc, setCalc] = useState("steady");
    const [size, setSize] = useState(3);
    const [stateNames, setStateNames] = useState(
        ["S1","S2","S3"]
    );
    function updateName(i,value){
        const copy = [...stateNames];
        copy[i] = value;
        setStateNames(copy);
    }

    const [matrix, setMatrix] = useState([
        ["","",""],
        ["","",""],
        ["","",""]
    ]);
    function updateCell(i,j,value){
        const copy = matrix.map(row=>[...row]);
        copy[i][j] = value;
        setMatrix(copy);
    }
    function validTransitionMatrix(mat){
        for(const row of mat){
            let sum = 0;
            for(const value of row){
                if(isNaN(value) || value < 0 || value > 1)
                    return false;
                sum += value;
            }
            if(Math.abs(sum-1) > 1e-8)
                return false;
        }
        return true;
    }
    function rowSum(row){
        return row
            .map(parseProbability)
            .reduce((sum, value) => sum + (isNaN(value) ? 0 : value), 0);
    }
    const [steadyState, setSteadyState] = useState(null);
    function calculateSteadyState(){
        const numericMatrix = matrix.map(row =>
            row.map(parseProbability)
        );

        if (!validTransitionMatrix(numericMatrix)) {
            alert("Each row must contain valid probabilities that sum to 1.");
            return;
        }
        const n = numericMatrix.length;
        let pi = Array(n).fill(1/n);
        for(let iter=0; iter<1000; iter++){
            const next = Array(n).fill(0);
            for(let i=0;i<n;i++){
                for(let j=0;j<n;j++){
                    next[j]+=pi[i]*numericMatrix[i][j];
                }
            }
            let error = 0;
            for(let i=0;i<n;i++){
                error += Math.abs(next[i]-pi[i]);
            }
            pi = next;
            if(error < 1e-12) break;
        }
        setSteadyState(pi);
    }

    function resizeMatrix(n) {
        setSize(n);
        setStateNames(prev =>
            Array.from({ length: n }, (_, i) => prev[i] || `S${i + 1}`)
        );
        setMatrix(prev =>
            Array.from({ length: n }, (_, i) =>
                Array.from({ length: n }, (_, j) => prev[i]?.[j] ?? "")
            )
        );
    }

    function parseProbability(value) {
        value = value.trim();
        if (value === "") return NaN;
        if (value.includes("/")) {
            const [num, den] = value.split("/");
            if (Number(den) === 0) return NaN;
            return Number(num) / Number(den);
        }
        return Number(value);
    }

    return (
        <div className="calculator-page">

            <div className="calculator-row">
                <button
                    className={`dist-button ${calc === "steady" ? "active" : ""}`}
                    onClick={() => setCalc("steady")}
                >
                    Steady State
                </button>

                <button
                    className={`dist-button ${calc === "nstep" ? "active" : ""}`}
                    onClick={() => setCalc("nstep")}
                >
                    n-Step Transition
                </button>
            </div>

            {calc === "steady" && (
                <>

                    <h1>Steady-State Calculator</h1>

                    <div className="matrix-size">

                        <label>Number of States</label>

                        <button
                            className="matrix-button"
                            onClick={() => size > 2 && resizeMatrix(size - 1)}
                        >
                            −
                        </button>

                        <span className="matrix-count">{size}</span>

                        <button
                            className="matrix-button"
                            onClick={() => size < 10 && resizeMatrix(size + 1)}
                        >
                            +
                        </button>

                    </div>

                    <h2>State Names (Optional)</h2>

                    <div className="state-name-container">
                        {stateNames.map((name, i) => (
                            <div key={i}>
                                <label>State {i + 1}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => updateName(i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <h2>Transition Matrix</h2>

                    <table className="transition-matrix">
                        <thead>
                            <tr>
                                <th></th>

                                {stateNames.map((name, j) => (
                                    <th key={j}>{name}</th>
                                ))}

                                <th>Row Sum</th>
                            </tr>
                        </thead>

                        <tbody>
                            {matrix.map((row, i) => (
                                <tr key={i}>
                                    <th>{stateNames[i]}</th>

                                    {row.map((cell, j) => (
                                        <td key={j}>
                                            <input
                                                type="text"
                                                placeholder="0"
                                                value={cell}
                                                onChange={(e) =>
                                                    updateCell(i, j, e.target.value)
                                                }
                                            />
                                        </td>
                                    ))}
                                    <td>
                                        {rowSum(row).toFixed(3)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        className="calculate-button"
                        onClick={calculateSteadyState}
                    >
                        Calculate Steady State
                    </button>

                    {steadyState && (
                        <div className="calculator-result">
                            <h2>Steady-State Distribution</h2>

                            {steadyState.map((prob, i) => (
                                <p key={i}>
                                    <strong>{stateNames[i]}:</strong>{" "}
                                    {prob.toFixed(6)}
                                </p>
                            ))}
                        </div>
                    )}

                </>
            )}

            {calc === "nstep" && (
                <>
                    <h1>n-Step Transition Calculator</h1>

                    <p>
                        Coming soon...
                    </p>
                </>
            )}

        </div>
    );
}