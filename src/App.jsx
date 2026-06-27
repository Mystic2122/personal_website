import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./index.css";
import "./StatsHaven.css";
import Notes from "./pages/Notes";
import NotePage from "./pages/NotePage";
import Calculators from "./pages/Calculators";
import PValueCalculator from "./calculators/pvalue/PValueCalculator";

// Main Personal Portfolio Home Component
function HomeLandingPage() {
  const [profileSrc, setProfileSrc] = useState("images/profile.jpg");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
  });
};

  return (
    <div id ="top" className="home-page">
      <nav className={scrolled ? "scrolled" : ""}>
        <button
          className="nav-item"
          style={{ marginLeft: "10px" }}
          onClick={() => scrollTo("top")}
        >
          Home
        </button>

        <button
          className="nav-item"
          onClick={() => scrollTo("about")}
        >
          About
        </button>

        <button
          className="nav-item"
          onClick={() => scrollTo("skills")}
        >
          Skills
        </button>

        <button
          className="nav-item"
          onClick={() => scrollTo("proj-container")}
        >
          Projects
        </button>

        <button
          className="nav-item"
          onClick={() => scrollTo("contact-div")}
        >
          Contact
        </button>
      </nav>
      <section id="about">
        <h1>Nick Wendt</h1>
        <img 
          id="profile-img" 
          src={profileSrc} 
          alt="Personal photo" 
          onMouseEnter={() => setProfileSrc("images/steve.jpg")} 
          onMouseLeave={() => setProfileSrc("images/profile.jpg")} 
        />
        <p id="about-content">
          Hi I'm Nick. I recently graduate from San Francisco State University with a B.S. in statistics with minors in computer science and economics. Starting in Fall 2026 I will be moving to San Diego to persue a masters degree in data science from UCSD. After I complete my degree I want to use my skills to design experiments that generate high quality data and find meaning while presenting my findings in a simple and impactful way. In addition to statistics, I have a deep interest in algorithms. I enjoy analyzing time complexity and understanding how efficient algorithms can be applied to real-world problems. <br /><br /> My dream job is to become a sports analyst. But being a Database Architect or Administrator would be pretty cool. <br /><br /> When I'm not coding or doing math, I like playing and watching sports, and I like to cook.
        </p>
      </section>
      <section id="skills">
        <h1>Skills</h1>
        <div id="skills-container">
          <div className="skills-content">
            <p>Programming Languages</p>
            <ul>
              <li>Python</li>
              <li>R</li>
              <li>SQL</li>
              <li>Java</li>
            </ul>
          </div>
          <div className="skills-content">
            <p>Tools & Technologies</p>
            <ul>
              <li>MySQL</li>
              <li>MongoDB</li>
              <li>Git & GitHub</li>
              <li>Markdown & LaTeX</li>
            </ul>
          </div>
        </div>
      </section>
      <section id="proj-container">
        <h2>Recent Projects</h2>
        <div className="project">
          <a href="https://github.com/Mystic2122/SFHacks25"> SF Hacks NBA Player Guessing Game </a>
          <p> Displays an image of a blurred NBA player and prompts user to guess. If the guess is incorrect, hints are given. </p>
          <p>Technologies used: Flask, MongoDB</p>
        </div>
        <div className="project">
          <a href="https://github.com/Mystic2122/avatar"> Avatar the Last Airbender Episode Quiz </a>
          <p> Displays a screenshot from an episode of Avatar and the user has to guess the episode with 3 levels of difficulty. </p>
          <p>Technologies used: Express, MongoDB</p>
        </div>
        <div className="project">
          <a href="https://github.com/Mystic2122/self_driving_algorithm_optimization"> Self-Driving Car Algorithm Design </a>
          <p> Uses implementations of Dijkstra and Floyd-Warshall to compute optimal assignment of cars to customers under different cases. </p>
          <p>Technologies used: Python, GitHub</p>
        </div>
        <div className="project">
          <Link to="/stats-haven"> Stats Haven </Link>
          <p> Interactive statistics notes and calculators built with React; includes distributions, p-value calculators, and reference notes. </p>
          <p>Technologies used: React, Vite, KaTeX</p>
        </div>
      </section>
      <footer>
        <div id="contact-div">
          <h2>Contact Me</h2>
          <div id="contacts">
            <a className="contact" href="https://github.com/Mystic2122"> GitHub </a>
            <a className="contact" href="https://www.linkedin.com/in/connect-with-nicholas-wendt/" > LinkedIn </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stats Haven Shared Global Frame
function Layout({ children }) {
  return (
    <>
      <header>
        <div className="title-div">
          <a className="back-button" href="/personal_website/">Personal Site</a>
          <h1>Welcome to Stats Haven</h1>
        </div>
        <nav>
          <Link to="/stats-haven">Home</Link>
          <Link to="/stats-haven/notes">Notes</Link>
          <Link to="/stats-haven/calculators">Calculators</Link>
        </nav>
      </header>
      {children}
    </>
  );
}

// Stats Haven Project Dashboard View
function StatsDashboard() {
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
          <img src="prob-background.jpg" alt="Probability Note Background" />
          <div className="divider"></div>
          <p>Joint Distributions</p>
        </div>
      </section>
    </main>
  );
}

// Stats Haven Project Page
function StatsHaven() {
  return (
    <div className="stats-haven">
      <Layout>
        <Routes>
          <Route index element={<StatsDashboard />} />
          <Route path="notes" element={<Notes />} />
          <Route path="notes/:slug" element={<NotePage />} />
          <Route path="calculators" element={<Calculators />} />
          <Route path="calculators/p-value" element={<PValueCalculator />} />
        </Routes>
      </Layout>
    </div>
  );
}

// App Routing Map Controller
export default function App() {
  return (
    <Routes>
      {/* Absolute Core Portfolio Directory */}
      <Route path="/" element={<HomeLandingPage />} />

      {/* Nested Stats Haven Project Hub Modules */}
      <Route path="stats-haven/*" element={<StatsHaven />} />
    </Routes>
  );
}