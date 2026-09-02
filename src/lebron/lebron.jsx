import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./lebron.css";

const API_URL = (import.meta.env.VITE_API_URL || "https://personal-website-lomr.onrender.com").replace(/\/$/, "");
const quickQueries = [
  { label: "Random Field-goal Makes", query: "SELECT * FROM lebron_fg_makes ORDER BY RAND() LIMIT 10;" },
  { label: "Triple-Doubles", query: "SELECT * FROM triple_double LIMIT 50;" },
  { label: "The Steph Curry Influence", query: "SELECT matchUp, FG3M, FG3A, gameDate FROM lebron_game_totals ORDER BY FG3M DESC LIMIT 10;"},
  { label: "Top Plays", query: "SELECT * FROM top_plays;" }
];

function getColumns(rows) {
  return [...new Set(rows.flatMap((row) => Object.keys(row)))];
}

function parseYouTubeTimestamp(value) {
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match || !match[0]) return null;

  return (Number(match[1] || 0) * 3600) + (Number(match[2] || 0) * 60) + Number(match[3] || 0);
}

function getYouTubeEmbedUrl(value) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    let videoId = url.searchParams.get("v");

    if (url.hostname === "youtu.be") {
      videoId = url.pathname.slice(1);
    } else if (url.pathname.startsWith("/embed/")) {
      videoId = url.pathname.split("/embed/")[1];
    } else if (url.pathname.startsWith("/shorts/")) {
      videoId = url.pathname.split("/shorts/")[1];
    }

    if (!videoId || !["www.youtube.com", "youtube.com", "youtu.be"].includes(url.hostname)) {
      return null;
    }

    const timestamp = parseYouTubeTimestamp(url.searchParams.get("t") || url.searchParams.get("start"));
    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId.split(/[?&#]/)[0]}`);
    if (timestamp !== null) embedUrl.searchParams.set("start", timestamp);

    return embedUrl.toString();
  } catch {
    return null;
  }
}

function DataTable({ rows, emptyMessage, onVideoSelect }) {
  if (rows.length === 0) return <p className="lebron-empty">{emptyMessage}</p>;
  const columns = getColumns(rows);
  const videoColumn = columns.find((column) => column.toLowerCase() === "video");

  return (
    <div className="lebron-table-wrap">
      <table className="lebron-table">
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.gameId ?? rowIndex}
              className={videoColumn && getYouTubeEmbedUrl(row[videoColumn]) ? "lebron-video-row" : ""}
              onClick={() => {
                if (videoColumn && getYouTubeEmbedUrl(row[videoColumn])) onVideoSelect(row[videoColumn]);
              }}
              onKeyDown={(event) => {
                if (videoColumn && getYouTubeEmbedUrl(row[videoColumn]) && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onVideoSelect(row[videoColumn]);
                }
              }}
              tabIndex={videoColumn && getYouTubeEmbedUrl(row[videoColumn]) ? 0 : undefined}
            >
              {columns.map((column) => (
                <td key={column}>
                  {column === videoColumn && getYouTubeEmbedUrl(row[column]) ? "Watch video" : row[column] ?? "-"}
                </td>
              ))}
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
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedVideo(null);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

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
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail || `Request failed (${response.status})`);
      setQueryRows(body);
    } catch (requestError) {
      setQueryError(
        requestError.message === "Failed to fetch"
          ? "Could not reach the LeBron API. Refresh the page and try again."
          : requestError.message,
      );
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
        <h1>LeBron James Regular Season Play-by-Play Database</h1>
      </header>
      <section className="lebron-section lebron-query-section" aria-labelledby="query-heading">
        <div className="lebron-section-heading"><div><p className="lebron-kicker">Read-only explorer</p><h2 id="query-heading">Query the database</h2></div></div>
        <div className="lebron-query-tools">
          <div className="lebron-quick-searches">
            <span>Quick searches</span>
            {quickQueries.map(({ label, query: quickQuery }) => (
              <button key={quickQuery} type="button" onClick={() => selectQuickQuery(quickQuery)} disabled={queryLoading}>
                {label}
              </button>
            ))}
          </div>
          <div id="table-names">
            <h3>Table Names</h3>
            <ul>
              <li>pbp</li>
              <li>player</li>
              <li>team</li>
              <li>lebron_game_totals</li>
              <li>lebron_team_history</li>
              <li>top_plays</li>
            </ul>
          </div>
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
        {queryRows && <DataTable rows={queryRows} emptyMessage="The query returned no rows." onVideoSelect={setSelectedVideo} />}
      </section>
      <section className="lebron-section lebron-erd-section" aria-labelledby="database-layout-heading">
        <div className="lebron-section-heading">
          <div>
            <p className="lebron-kicker">Database Layout</p>
          </div>
        </div>
        <div id='database-info'>
        <img
          className="lebron-erd-image"
          src={`${import.meta.env.BASE_URL}images/lebron_db_ERD.png`}
          alt="Entity relationship diagram for the LeBron James database"
        />
        
        </div>
      </section>
      {selectedVideo && (
        <div className="lebron-video-modal" role="presentation" onClick={() => setSelectedVideo(null)}>
          <div className="lebron-video-dialog" role="dialog" aria-modal="true" aria-label="Play video" onClick={(event) => event.stopPropagation()}>
            <button className="lebron-video-close" type="button" onClick={() => setSelectedVideo(null)} aria-label="Close video">Close</button>
            <iframe
              className="lebron-video-frame"
              src={getYouTubeEmbedUrl(selectedVideo)}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <a className="lebron-video-direct-link" href={selectedVideo} target="_blank" rel="noreferrer">Open on YouTube</a>
          </div>
        </div>
      )}
    </main>
  );
}