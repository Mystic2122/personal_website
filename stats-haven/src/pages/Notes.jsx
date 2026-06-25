import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import notes from "../data/notes";
import "./pageStyles.css";

export default function Notes() {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    function normalizeText(s) {
      if (!s) return "";
      return String(s)
        .toLowerCase()
        // map Greek chi and superscript 2
        .replace(/χ/g, "chi")
        .replace(/\u00B2/g, "2")
        // common words -> normalized forms
        .replace(/squared/g, "2")
        .replace(/square/g, "2")
        .replace(/\bsq\b/g, "2")
        // remove non-alphanumerics
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
    }

    const q = normalizeText(query.trim());

    const filtered = q
      ? notes.filter((n) => {
          const nt = normalizeText(n.title);
          const nc = normalizeText(n.category);
          const ns = normalizeText(n.slug || "");

          // direct contains
          if (nt.includes(q) || nc.includes(q) || ns.includes(q)) return true;

          // also compare with spaces removed to catch "chi2" vs "chi 2"
          const compact = (x) => x.replace(/\s+/g, "");
          if (compact(nt).includes(compact(q)) || compact(nc).includes(compact(q))) return true;

          return false;
        })
      : notes;

    return filtered.reduce((acc, n) => {
      const cat = n.category || "uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(n);
      return acc;
    }, {});
  }, [query]);

  const categoryKeys = Object.keys(grouped);

  return (
    <div className="notes-container page">
      <div className="notes-search">
        <input
          aria-label="Search Notes"
          placeholder="Search Notes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {categoryKeys.length === 0 && <div className="no-results">No notes found</div>}

      {categoryKeys.map((cat) => (
        <section key={cat} className="notes-category">
          <h3 className="category-title">{cat.replace(/[-_]/g, " ")}</h3>
          <div className="notes-list">
            {grouped[cat].map((note) => (
              <Link key={note.id} to={`/notes/${note.slug}`} className="note-link">
                <div className="note-card-title">{note.title}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}