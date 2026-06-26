import { useEffect, useState } from "react";

export default function Home() {
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

  return (
    <div className="home-page">
      <nav className={scrolled ? "scrolled" : ""}>
        <a className="nav-item" style={{ marginLeft: "10px" }} href="#top">Home</a>
        <a className="nav-item" href="#about">About</a>
        <a className="nav-item" href="#skills">Skills</a>
        <a className="nav-item" href="#proj-container">Projects</a>
        <a className="nav-item" href="#contact-div">Contact</a>
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
          Hi I'm Nick. I recently graduate from San Francisco State University with a B.S. in statistics with minors in computer science and economics.
          Starting in Fall 2026 I will be moving to San Diego to persue a masters degree in data science from UCSD.
          After I complete my degree I want to use my skills to design experiments that generate high quality data and find meaning while presenting my findings in a simple and impactful way.
          In addition to statistics, I have a deep interest in algorithms. I enjoy analyzing time complexity and understanding how efficient algorithms can be applied to real-world problems.
          <br /><br />
          My dream job is to become a sports analyst. But being a Database Architect or Administrator would be pretty cool.
          <br /><br />
          When I'm not coding or doing math, I like playing and watching sports, and I like to cook.
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
          <a href="https://github.com/Mystic2122/SFHacks25">
            SF Hacks NBA Player Guessing Game
          </a>
          <p>
            Displays an image of a blurred NBA player and prompts user to guess. If the guess is incorrect, hints are given.
          </p>
          <p>Technologies used: Flask, MongoDB</p>
        </div>

        <div className="project">
          <a href="https://github.com/Mystic2122/avatar">
            Avatar the Last Airbender Episode Quiz
          </a>
          <p>
            Displays a screenshot from an episode of Avatar and the user has to guess the episode with 3 levels of difficulty.
          </p>
          <p>Technologies used: Express, MongoDB</p>
        </div>

        <div className="project">
          <a href="https://github.com/Mystic2122/self_driving_algorithm_optimization">
            Self-Driving Car Algorithm Design
          </a>
          <p>
            Uses implementations of Dijkstra and Floyd-Warshall to compute optimal assignment of cars to customers under different cases.
          </p>
          <p>Technologies used: Python, GitHub</p>
        </div>

        <div className="project">
          <a href="/stats-haven/">
            Stats Haven
          </a>
          <p>
            Interactive statistics notes and calculators built with React; includes distributions, p-value calculators, and reference notes.
          </p>
          <p>Technologies used: React, Vite, KaTeX</p>
        </div>
      </section>

      <footer>
        <div id="contact-div">
          <h2>Contact Me</h2>

          <a className="contact" href="https://github.com/Mystic2122">
            GitHub
          </a>

          <a
            className="contact"
            href="https://www.linkedin.com/in/connect-with-nicholas-wendt/"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}