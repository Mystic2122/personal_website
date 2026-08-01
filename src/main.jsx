import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from "react-router-dom";
import "katex/dist/katex.min.css";
import './index.css'
import './stats-haven/StatsHaven.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>
)