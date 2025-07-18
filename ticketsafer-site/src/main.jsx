import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Asegurar que React esté disponible globalmente para librerías Web3
window.React = React

// Obtener el elemento root y limpiar loading fallback
const rootElement = document.getElementById('root')
const loadingElement = rootElement.querySelector('.loading')
if (loadingElement) {
  loadingElement.remove()
}

// Crear root con opciones optimizadas según Vite
const root = createRoot(rootElement, {
  // Habilitar concurrent features
  unstable_strictMode: true
})

// Render con error boundary implícito
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 