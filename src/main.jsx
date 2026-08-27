import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

const SPLASH_MIN_MS = 1000
const SPLASH_FADE_MS = 320

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

const splash = document.getElementById('splash')

if (splash) {
  const desde = window.__splashStart ?? Date.now()
  const espera = Math.max(0, SPLASH_MIN_MS - (Date.now() - desde))

  setTimeout(() => {
    splash.classList.add('splash-out')
    setTimeout(() => splash.remove(), SPLASH_FADE_MS)
  }, espera)
}
