import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { applyPreferences, loadPreferences } from './utils/preferences.js'

applyPreferences(loadPreferences(), window.matchMedia('(prefers-reduced-motion: reduce)').matches)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)