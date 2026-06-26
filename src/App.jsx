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
        <a className="back-button" href="/">Personal Site</a>
        <h1>Welcome to Stats Haven</h1>
        <nav>
          {/* 👈 Clean up internal navigation paths */}
          <Link to="/">Home</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/calculators">Calculators</Link>
        </nav>
      </header>
      {children}
    </>
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
          <Route path="calculators/p-value" element={<PValueCalculator />} />
        </Routes>
      </Layout>
    </div>
  );
}