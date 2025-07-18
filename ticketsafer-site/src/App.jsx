import { useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './wagmi'
import '@rainbow-me/rainbowkit/styles.css'
import './App.css'
import TicketSafer from './components/TicketSafer'

const queryClient = new QueryClient()

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Registrar el service worker y manejar actualizaciones
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }

    // Escuchar eventos de actualización del PWA
    const handleSWUpdate = (event) => {
      if (event.detail && event.detail.type === 'SW_UPDATE_AVAILABLE') {
        setUpdateAvailable(true)
      }
    }

    window.addEventListener('sw-update-available', handleSWUpdate)
    
    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate)
    }
  }, [])

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      })
    }
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="App">
            {updateAvailable && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                background: '#667eea',
                color: 'white',
                padding: '10px',
                textAlign: 'center',
                zIndex: 9999
              }}>
                <span>¡Nueva versión disponible! </span>
                <button 
                  onClick={handleUpdate}
                  style={{
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  Actualizar
                </button>
              </div>
            )}
            <TicketSafer />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App 