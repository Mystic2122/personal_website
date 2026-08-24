import { useState } from "react";
import { Link } from "react-router-dom";
import "./lebron.css";

const API_URL = "https://personal-website-lomr.onrender.com";
const quickQueries = [
  { label: "Field-goal makes", query: "SELECT * FROM lebron_fg_makes LIMIT 50" },
  { label: "Triple-doubles", query: "SELECT * FROM triple_double LIMIT 50" },
];

function getColumns(rows) {
  return [...new Set(rows.flatMap((row) => Object.keys(row)))];
}

function DataTable({ rows, emptyMessage }) {
  if (rows.length === 0) return <p className="lebron-empty">{emptyMessage}</p>;
  const columns = getColumns(rows);

  return (
    <div className="lebron-table-wrap">
      <table className="lebron-table">
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.gameId ?? rowIndex}>
              {columns.map((column) => <td key={column}>{row[column] ?? "-"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Lebron() {
  const [query, setQuery] = useState(quickQueries[0].query);
  const [queryRows, setQueryRows] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState("");

  const runQuery = async (queryToRun) => {
    setQueryLoading(true);
    setQueryError("");
    setQueryRows(null);
    try {
      const response = await fetch(`${API_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToRun }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || `Request failed (${response.status})`);
      setQueryRows(body);
    } catch (requestError) {
      setQueryError(requestError.message);
    } finally {
      setQueryLoading(false);
    }
  };

  const submitQuery = (event) => {
    event.preventDefault();
    runQuery(query);
  };

  const selectQuickQuery = (quickQuery) => {
    setQuery(quickQuery);
    runQuery(quickQuery);
  };

  const clearOutput = () => {
    setQueryRows(null);
    setQueryError("");
  };

  return (
    <main className="lebron-page">
      <Link className="lebron-back-link" to="/">Back to Personal Website</Link>
      <header className="lebron-hero">
        <p className="lebron-kicker">NBA data lab</p>
        <h1>LeBron James Regular Season Play-by-Play Data</h1>
      </header>
      <section className="lebron-section lebron-query-section" aria-labelledby="query-heading">
        <div className="lebron-section-heading"><div><p className="lebron-kicker">Read-only explorer</p><h2 id="query-heading">Query the database</h2></div></div>
        <div className="lebron-quick-searches">
          <span>Quick searches</span>
          {quickQueries.map(({ label, query: quickQuery }) => (
            <button key={quickQuery} type="button" onClick={() => selectQuickQuery(quickQuery)} disabled={queryLoading}>
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={submitQuery}>
          <label htmlFor="lebron-query">SQL query</label>
          <textarea id="lebron-query" value={query} onChange={(event) => setQuery(event.target.value)} rows="4" spellCheck="false" />
          <div className="lebron-query-actions">
            <button type="submit" disabled={queryLoading || !query.trim()}>{queryLoading ? "Running..." : "Run query"}</button>
            {(queryRows || queryError) && (
              <button className="lebron-clear-button" type="button" onClick={clearOutput} disabled={queryLoading}>
                Clear output
              </button>
            )}
          </div>
        </form>
        {queryError && <p className="lebron-state lebron-error">{queryError}</p>}
        {queryRows && <DataTable rows={queryRows} emptyMessage="The query returned no rows." />}
      </section>
      <section className="lebron-section lebron-erd-section" aria-labelledby="database-layout-heading">
        <div className="lebron-section-heading">
          <div>
            <p className="lebron-kicker">Database structure</p>
            <h2 id="database-layout-heading">Database Layout</h2>
          </div>
        </div>
        <img
          className="lebron-erd-image"
          src={`${import.meta.env.BASE_URL}images/lebron_db_ERD.png`}
          alt="Entity relationship diagram for the LeBron James database"
        />
      </section>
    </main>
  );
}