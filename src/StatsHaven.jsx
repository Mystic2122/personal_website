import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Notes from "./pages/Notes"
import Calculators from "./pages/Calculators"
import PValueCalculator from "./calculators/pvalue/PValueCalculator";
import NotePage from "./pages/NotePage";

function Layout({ children }) {
  return (
    <>
      <header>
        <h1>Welcome to Stats Haven</h1>

        <nav>
          <Link to="/stats-haven/">Home</Link>
          <Link to="/stats-haven/notes">Notes</Link>
          <Link to="/stats-haven/calculators">Calculators</Link>
        </nav>
      </header>

      {children}
    </>
  );
}

function Home() {
  return (
    <main>
      <div className="topic-grid">
        <div className="topic-card">Probability</div>
        <div className="topic-card">Statistical Inference</div>
        <div className="topic-card">Regression</div>
        <div className="topic-card">Machine Learning</div>
      </div>

      <section className="notes-row">
        <div className="notes-row-title">Recent Notes</div>

        <div className="note-card">
          <img src="/prob-background.jpg" />
          <div className="divider"></div>
          <p>Joint Distributions</p>
        </div>
      </section>
    </main>
  );
}



export default function App() {
  return (
    <div className="stats-haven">
      <Layout>
        <Routes>
          <Route index element={<Home />} />
          <Route path="notes" element={<Notes />} />
          <Route path="notes/:slug" element={<NotePage />} />
          <Route path="calculators" element={<Calculators />} />
          <Route
            path="calculators/p-value"
            element={<PValueCalculator />}
          />
        </Routes>
      </Layout>
    </div>
  );
}