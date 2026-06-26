import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StatsHaven from "./StatsHaven";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stats-haven/*" element={<StatsHaven />} />
    </Routes>
  );
}