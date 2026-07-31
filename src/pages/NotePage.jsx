import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import notes from "../data/notes";
import MathMarkdown from "../components/MathMarkdown";
import "./pageStyles.css";

export default function NotePage() {
  const { slug } = useParams();
  const [content, setContent] = useState("");
  const [dark, setDark] = useState(() => {
    try {
      const v = localStorage.getItem("theme");
      if (v === null) return true; // default to dark mode
      return v === "dark";
    } catch (e) {
      return true;
    }
  });

  const note = notes.find((n) => n.slug === slug);
  const isPdf = note?.file?.toLowerCase().endsWith(".pdf");

  useEffect(() => {
    if (!note) return;
    if (isPdf) {
      setContent("");
      return;
    }

    fetch(`${import.meta.env.BASE_URL}${note.file}`)
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch(() => setContent("Failed to load note."));
  }, [note, isPdf]);

  useEffect(() => {
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch (e) {}
  }, [dark]);

  if (!note) {
    return <div>Note not found</div>;
  }

  function handleDownload() {
    const filename = (note.slug || "note") + (isPdf ? ".pdf" : ".md");

    if (isPdf) {
      const url = `${import.meta.env.BASE_URL}${note.file}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="note-page-container note-page-container-outer">
      <div className={dark ? "page dark-theme" : "page light-theme"}>
        <div className="topbar">
          <div className="note-title">{note.title}</div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button className="download-btn" onClick={handleDownload} aria-label="Download note">
              Download
            </button>
            <div className="theme-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={dark}
                  onChange={() => setDark((d) => !d)}
                  aria-label="Toggle dark mode"
                />
                <span className="slider" />
              </label>
            </div>
          </div>
        </div>

        <div className="page-content">
          {isPdf ? (
            <div className="pdf-viewer">
              <object
                className="pdf-embed"
                data={`${import.meta.env.BASE_URL}${note.file}`}
                type="application/pdf"
                aria-label="PDF viewer"
              >
                <p>
                  Your browser does not support inline PDF viewing. You can
                  <a href={`${import.meta.env.BASE_URL}${note.file}`} target="_blank" rel="noreferrer">
                    open the PDF in a new tab
                  </a>
                  .
                </p>
              </object>
            </div>
          ) : (
            <div className="markdown-container">
              <div className="markdown">
                <MathMarkdown content={content} />
              </div>
            </div>
          )}
        </div>
      </div>
      {isPdf ? (
        <div className="pdf-note-box">
          Sorry if you can't read my handwriting
        </div>
      ) : null}
    </div>
  );
}