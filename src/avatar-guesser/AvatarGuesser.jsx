import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AvatarGuesser.css";
import episodeData from "./episodes.json";

const episodeTitleMap = {
  S1E01: "The Boy in the Iceberg",
  S1E02: "The Avatar Returns",
  S1E03: "The Southern Air Temple",
  S1E04: "The Warriors of Kyoshi",
  S1E05: "The King of Omashu",
  S1E06: "Imprisoned",
  S1E07: "Winter Solstice Part 1: The Spirit World",
  S1E08: "Winter Solstice Part 2: Avatar Roku",
  S1E09: "The Waterbending Scroll",
  S1E10: "Jet",
  S1E11: "The Great Divide",
  S1E12: "The Storm",
  S1E13: "The Blue Spirit",
  S1E14: "The Fortuneteller",
  S1E15: "Bato of the Water Tribe",
  S1E16: "The Deserter",
  S1E17: "The Northern Air Temple",
  S1E18: "The Waterbending Master",
  S1E19: "The Siege of the North: Part 1",
  S1E20: "The Siege of the North: Part 2",
  S2E01: "The Avatar State",
  S2E02: "The Cave of Two Lovers",
  S2E03: "Return to Omashu",
  S2E04: "The Swamp",
  S2E05: "Avatar Day",
  S2E06: "The Blind Bandit",
  S2E07: "Zuko Alone",
  S2E08: "The Chase",
  S2E09: "Bitter Work",
  S2E10: "The Library",
  S2E11: "The Desert",
  S2E12: "The Serpent's Pass",
  S2E13: "The Drill",
  S2E14: "City of Walls and Secrets",
  S2E15: "Tales of Ba Sing Se",
  S2E16: "Appa's Lost Days",
  S2E17: "Lake Laogai",
  S2E18: "The Earth King",
  S2E19: "The Guru",
  S2E20: "The Crossroads of Destiny",
  S3E01: "The Awakening",
  S3E02: "The Headband",
  S3E03: "The Painted Lady",
  S3E04: "Sokka's Master",
  S3E05: "The Beach",
  S3E06: "The Avatar and the Firelord",
  S3E07: "The Runaway",
  S3E08: "The Puppetmaster",
  S3E09: "Nightmares and Daydreams",
  S3E10: "Day of Black Sun Part 1",
  S3E11: "Day of Black Sun Part 2",
  S3E12: "The Western Air Temple",
  S3E13: "The Firebending Masters",
  S3E14: "The Boiling Rock",
  S3E15: "The Southern Raiders",
  S3E16: "The Ember Island Players",
  S3E17: "Sozin's Comet, Part 1: The Phoenix King",
  S3E18: "Sozin's Comet, Part 2: The Old Masters",
  S3E19: "Sozin's Comet, Part 3: Into the Inferno",
  S3E20: "Sozin's Comet, Part 4: Avatar Aang",

};

function AvatarGuesser() {
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [message, setMessage] = useState("");
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const book1Keys = Object.keys(episodeTitleMap).filter((key) => key.startsWith("S1"));
  const book2Keys = Object.keys(episodeTitleMap).filter((key) => key.startsWith("S2"));
  const book3Keys = Object.keys(episodeTitleMap).filter((key) => key.startsWith("S3"));

  const pickRandomImage = (data = images) => {
    if (!data.length) return null;
    const random = data[Math.floor(Math.random() * data.length)];
    return random;
  };

  useEffect(() => {
    const data = Array.isArray(episodeData) ? episodeData : [];
    setImages(data);

    if (data.length > 0) {
      setCurrentImage(pickRandomImage(data));
    }
  }, []);

  const makeEpisodeKey = (season, episode) => {
    return `S${season}E${episode.toString().padStart(2, "0")}`;
  };

  const guessEpisode = (season, episode) => {
    if (!currentImage || gameOver) return;

    if (currentImage.season === season && currentImage.episode === episode) {
      setStreak((prev) => prev + 1);
      setMessage("Correct!");
      setCurrentImage(pickRandomImage(images));
    } else {
      setGameOver(true);
      setMessage(
        `Wrong! This was ${makeEpisodeKey(
          currentImage.season,
          currentImage.episode
        )}`
      );
    }
  };

  const startNewGame = () => {
    setStreak(0);
    setGameOver(false);
    setMessage("");
    setCurrentImage(pickRandomImage(images));
  };


  return (
    <div className="guesser-container">
      <Link to="/" className="back-to-site-button">
        Back to Personal Website
      </Link>

      <h1>Guess what episode this screenshot is from</h1>
      <div className="streak-counter">Streak: {streak}</div>

      <div className="game-layout">
        <div className="book-column">
          <div className="book-title">Book 1</div>
          <div className="episode-grid book-1">
            {book1Keys.map((key) => {
              const season = Number(key[1]);
              const episode = Number(key.slice(3));

              return (
                <button
                  key={key}
                  className={`episode-button season-${season}`}
                  onClick={() => guessEpisode(season, episode)}
                >
                  <b>{key}</b>
                  <span>{episodeTitleMap[key]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="image-column">
          {currentImage && (
            <img
              className="episode-image"
              src={currentImage.url}
              alt="Avatar screenshot"
            />
          )}
          <h2>{message}</h2>
          {gameOver && (
            <button className="play-again-button" onClick={startNewGame}>
              Play Again
            </button>
          )}
        </div>

        <div className="book-column">
          <div className="book-title">Book 2</div>
          <div className="episode-grid book-2">
            {book2Keys.map((key) => {
              const season = Number(key[1]);
              const episode = Number(key.slice(3));

              return (
                <button
                  key={key}
                  className={`episode-button season-${season}`}
                  onClick={() => guessEpisode(season, episode)}
                >
                  <b>{key}</b>
                  <span>{episodeTitleMap[key]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="book-3-section">
        <div className="book-title">Book 3</div>
        <div className="episode-grid book-3">
          {book3Keys.map((key) => {
            const season = Number(key[1]);
            const episode = Number(key.slice(3));

            return (
              <button
                key={key}
                className={`episode-button season-${season}`}
                onClick={() => guessEpisode(season, episode)}
              >
                <b>{key}</b>
                <span>{episodeTitleMap[key]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AvatarGuesser;