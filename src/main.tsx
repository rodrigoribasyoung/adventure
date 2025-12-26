import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import './styles/theme.css'
import { registerServiceWorker } from './lib/pwa/registerSW'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registrar Service Worker para PWA
if (import.meta.env.PROD) {
  registerServiceWorker()
}

