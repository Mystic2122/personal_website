import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import "katex/dist/katex.min.css";
import './index.css'
import App from './App.jsx'

const basename = import.meta.env.DEV ? '/' : '/stats-haven/dist'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
)
