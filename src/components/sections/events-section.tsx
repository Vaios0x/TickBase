'use client'

import { useState, useEffect } from 'react'
import { CheckoutModal } from '@/components/modals/checkout-modal'
import { EventCard } from '@/components/ui/event-card'
import { EventsFilters } from '@/components/ui/events-filters'
import { useEvents } from '@/hooks/use-events'

export function EventsSection() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const {
    events,
    categories,
    filteredAndSortedEvents,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    clearFilters,
    getCategoryColor,
    getCategoryInfo
  } = useEvents()

  // Track mouse position and window size for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    // Set initial window size
    handleResize()
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleBuyTicket = (event: any) => {
    console.log('🎫 handleBuyTicket ejecutándose', event.title)
    console.log('🎫 Evento completo:', event)
    
    // Asegurar que tenemos un evento válido
    if (!event || !event.id) {
      console.error('🎫 ERROR: Evento inválido recibido')
      return
    }
    
    // Actualizar el estado
    setSelectedEvent(event)
    setIsCheckoutOpen(true)
    
    console.log('🎫 Estado actualizado', { 
      isOpen: true, 
      eventTitle: event.title,
      eventId: event.id,
      selectedEvent: event
    })
    
    // Forzar un re-render
    setTimeout(() => {
      console.log('🎫 Estado después del timeout:', { 
        isCheckoutOpen, 
        selectedEvent 
      })
    }, 100)
  }

  // Calcular estadísticas
  const totalTickets = events.reduce((sum, event) => sum + event.totalTickets, 0)
  const availableTickets = events.reduce((sum, event) => sum + event.availableTickets, 0)
  const averagePrice = events.length > 0 
    ? (events.reduce((sum, event) => sum + parseFloat(event.price.split(' ')[0]), 0) / events.length).toFixed(2)
    : '0'

  return (
    <section className="events-section" style={{
      padding: 'clamp(2rem, 5vw, 4rem) 0',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at ${windowSize.width - mousePosition.x}px ${windowSize.height - mousePosition.y}px, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 20% 80%, rgba(0, 255, 0, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 0, 0.08) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        transition: 'all 0.1s ease'
      }} />
      
      {/* Animated Grid Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 20s linear infinite',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 clamp(1rem, 3vw, 2rem)',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Centrar todo el contenido
        width: '100%'
      }}>
        
        {/* Hero Section - Completamente Responsivo */}
        <div className="hero-section">
          {/* Hero Background */}
          <div className="hero-background">
            {/* Hero Glow Effects */}
            <div style={{
              position: 'absolute',
              top: '-60%',
              left: '-60%',
              width: '220%',
              height: '220%',
              background: 'radial-gradient(circle, rgba(0, 255, 255, 0.08) 0%, transparent 60%)',
              animation: 'pulse 8s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-60%',
              right: '-60%',
              width: '220%',
              height: '220%',
              background: 'radial-gradient(circle, rgba(255, 0, 255, 0.08) 0%, transparent 60%)',
              animation: 'pulse 8s ease-in-out infinite reverse'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 className="hero-title">
                🎫 Eventos NFT 2026
              </h1>
              
              <p className="hero-description">
                Descubre los eventos más increíbles del año. Compra tickets NFT únicos y forma parte de experiencias inolvidables en Base Network.
              </p>

              {/* Hero Stats - Completamente Responsivos */}
              <div className="hero-stats">
                {[
                  { icon: '🎭', value: events.length, label: 'Eventos', color: '#00ffff' },
                  { icon: '🎫', value: availableTickets.toLocaleString(), label: 'Tickets Disponibles', color: '#ff00ff' },
                  { icon: '💰', value: `${averagePrice} ETH`, label: 'Precio Promedio', color: '#ffff00' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="stat-card"
                    style={{
                      '--stat-color': stat.color,
                      '--stat-color-15': `${stat.color}26`,
                      '--stat-color-05': `${stat.color}0D`,
                      '--stat-color-30': `${stat.color}4D`,
                      '--stat-color-20': `${stat.color}33`,
                      '--stat-color-40': `${stat.color}66`,
                      '--stat-color-50': `${stat.color}80`,
                      '--stat-color-60': `${stat.color}99`
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)'
                      e.currentTarget.style.boxShadow = `0 20px 40px ${stat.color}66`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.boxShadow = `0 10px 30px ${stat.color}33`
                    }}
                  >
                    <div className="stat-icon">
                      {stat.icon}
                    </div>
                    <div className="stat-value">
                      {stat.value}
                    </div>
                    <div className="stat-label">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <EventsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />

        {/* Grid de eventos - Completamente Responsivo */}
        <div 
          className="events-grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(320px, 85vw, 420px), 1fr))', // Aumentado el ancho mínimo
            gap: 'clamp(2rem, 4vw, 3rem)', // Gap aumentado para mejor separación
            marginBottom: 'clamp(3rem, 6vw, 5rem)', // Margen inferior aumentado
            padding: 'clamp(1rem, 2vw, 2rem)', // Padding adicional para evitar cortes
            boxSizing: 'border-box'
          }}
        >
          {filteredAndSortedEvents.map(event => {
            const categoryInfo = getCategoryInfo(event.category)
            console.log('🎭 Mapeando evento:', event.title, 'handleBuyTicket:', typeof handleBuyTicket, 'función válida:', !!handleBuyTicket)
            return (
              <EventCard
                key={event.id}
                event={event}
                categoryColor={categoryInfo.color}
                categoryName={categoryInfo.name}
                categoryIcon={categoryInfo.icon}
                onBuyTicket={handleBuyTicket}
              />
            )
          })}
        </div>

        {/* Mensaje cuando no hay eventos */}
        {filteredAndSortedEvents.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
            color: '#b0b0b0'
          }}>
            <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', marginBottom: 'clamp(1rem, 2vw, 1rem)' }}>🔍</div>
            <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', marginBottom: 'clamp(1rem, 2vw, 1rem)' }}>No se encontraron eventos</h3>
            <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>Intenta ajustar los filtros de búsqueda o categoría.</p>
            <button
              onClick={clearFilters}
              style={{
                marginTop: 'clamp(1rem, 2vw, 1rem)',
                padding: 'clamp(0.8rem, 2vw, 1rem) clamp(1.2rem, 3vw, 1.5rem)',
                background: 'rgba(0, 255, 255, 0.2)',
                border: '1px solid rgba(0, 255, 255, 0.4)',
                borderRadius: 'clamp(8px, 2vw, 10px)',
                color: '#00ffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Limpiar Filtros
            </button>
          </div>
        )}

        {/* Estadísticas de eventos - Completamente Responsivas */}
        <div style={{
          marginTop: 'clamp(2rem, 5vw, 4rem)',
          padding: 'clamp(1.5rem, 4vw, 2rem)',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'clamp(15px, 4vw, 20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: '#00ffff',
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
          }}>
            📊 Estadísticas de Eventos
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px, 40vw, 150px), 1fr))',
            gap: 'clamp(0.8rem, 2vw, 1rem)'
          }}>
            <div style={{
              padding: 'clamp(0.8rem, 2vw, 1rem)',
              background: 'rgba(0, 255, 255, 0.1)',
              borderRadius: 'clamp(10px, 3vw, 15px)',
              border: '1px solid rgba(0, 255, 255, 0.3)'
            }}>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 'clamp(0.3rem, 1vw, 0.5rem)' }}>🎭</div>
              <div style={{ color: '#00ffff', fontWeight: 'bold', fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>
                {filteredAndSortedEvents.length}
              </div>
              <div style={{ color: '#b0b0b0', fontSize: 'clamp(0.7rem, 2vw, 0.9rem)' }}>Eventos</div>
            </div>
            <div style={{
              padding: 'clamp(0.8rem, 2vw, 1rem)',
              background: 'rgba(255, 0, 255, 0.1)',
              borderRadius: 'clamp(10px, 3vw, 15px)',
              border: '1px solid rgba(255, 0, 255, 0.3)'
            }}>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 'clamp(0.3rem, 1vw, 0.5rem)' }}>🎫</div>
              <div style={{ color: '#ff00ff', fontWeight: 'bold', fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>
                {filteredAndSortedEvents.reduce((sum, event) => sum + event.availableTickets, 0)}
              </div>
              <div style={{ color: '#b0b0b0', fontSize: 'clamp(0.7rem, 2vw, 0.9rem)' }}>Tickets Disponibles</div>
            </div>
            <div style={{
              padding: 'clamp(0.8rem, 2vw, 1rem)',
              background: 'rgba(255, 255, 0, 0.1)',
              borderRadius: 'clamp(10px, 3vw, 15px)',
              border: '1px solid rgba(255, 255, 0, 0.3)'
            }}>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 'clamp(0.3rem, 1vw, 0.5rem)' }}>💰</div>
              <div style={{ color: '#ffff00', fontWeight: 'bold', fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>
                {filteredAndSortedEvents.length > 0 
                  ? (filteredAndSortedEvents.reduce((sum, event) => sum + parseFloat(event.price.split(' ')[0]), 0) / filteredAndSortedEvents.length).toFixed(3)
                  : '0'
                } ETH
              </div>
              <div style={{ color: '#b0b0b0', fontSize: 'clamp(0.7rem, 2vw, 0.9rem)' }}>Precio Promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de checkout */}
      {isCheckoutOpen && selectedEvent && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            console.log('🎫 Cerrando modal de checkout')
            setIsCheckoutOpen(false)
            setSelectedEvent(null)
          }}
          event={selectedEvent}
        />
      )}

      {/* Debug info para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#00ffff',
          padding: '1rem',
          borderRadius: '10px',
          fontSize: '0.8rem',
          zIndex: 9999,
          border: '1px solid #00ffff'
        }}>
          <div>Modal: {isCheckoutOpen ? 'ABIERTO' : 'CERRADO'}</div>
          <div>Evento: {selectedEvent?.title || 'Ninguno'}</div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
}
