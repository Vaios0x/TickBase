import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import './TicketSafer.css'
import './CheckoutStyles.css'

// Cache de imágenes para optimización
const imageCache = new Map()
const preloadedImages = new Set()

// Hook personalizado para intersection observer
const useIntersectionObserver = (threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [element, setElement] = useState(null)

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold, rootMargin: '50px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [element, threshold])

  return [setElement, isIntersecting]
}

// Función para convertir URL a WebP si es compatible
const getOptimizedImageUrl = (originalUrl) => {
  if (!originalUrl) return originalUrl
  
  // Verificar si el navegador soporta WebP
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').startsWith('data:image/webp')
  })()

  if (supportsWebP && originalUrl.includes('unsplash.com')) {
    // Para Unsplash, agregar parámetros de optimización
    const url = new URL(originalUrl)
    url.searchParams.set('fm', 'webp')
    url.searchParams.set('q', '85')
    url.searchParams.set('w', '800')
    url.searchParams.set('h', '600')
    url.searchParams.set('fit', 'crop')
    return url.toString()
  }

  return originalUrl
}

// Función para precargar imagen
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (preloadedImages.has(src)) {
      resolve(src)
      return
    }

    const img = new Image()
    img.onload = () => {
      preloadedImages.add(src)
      imageCache.set(src, img)
      resolve(src)
    }
    img.onerror = reject
    img.src = src
  })
}

// Componente súper optimizado para carga de imágenes
const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  priority = false,
  sizes = "800px",
  blur = true 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(priority)
  const [setRef, isIntersecting] = useIntersectionObserver(0.1)

  const optimizedSrc = getOptimizedImageUrl(src)

  // Efecto para manejar la carga basada en intersección
  useEffect(() => {
    if (priority) {
      setShouldLoad(true)
      // Precargar inmediatamente si es prioritaria
      preloadImage(optimizedSrc).catch(() => setImageError(true))
    } else if (isIntersecting) {
      setShouldLoad(true)
    }
  }, [isIntersecting, priority, optimizedSrc])

  // Efecto para cargar la imagen cuando sea necesario
  useEffect(() => {
    if (!shouldLoad || imageLoaded) return

    const loadImage = async () => {
      try {
        await preloadImage(optimizedSrc)
        setImageLoaded(true)
      } catch (error) {
        console.warn('Error cargando imagen:', error)
        setImageError(true)
      }
    }

    loadImage()
  }, [shouldLoad, optimizedSrc, imageLoaded])

  if (imageError) {
    return (
      <div 
        className={`image-placeholder error-placeholder ${className}`}
        ref={setRef}
        style={{
          background: 'linear-gradient(45deg, #ff6b35, #ffd700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontWeight: 'bold',
          fontSize: '14px',
          textAlign: 'center',
          minHeight: '200px',
          borderRadius: '12px'
        }}
      >
        <div>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎭</div>
          <div>Imagen no disponible</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={setRef} className={`optimized-image-container ${className}`}>
      {/* Placeholder con blur effect */}
      {!imageLoaded && (
        <div 
          className={`image-placeholder loading-placeholder ${blur ? 'blur-bg' : ''}`}
          style={{
            background: blur 
              ? 'linear-gradient(45deg, rgba(255, 215, 0, 0.08), rgba(255, 107, 53, 0.08))'
              : 'linear-gradient(45deg, rgba(255, 215, 0, 0.15), rgba(255, 107, 53, 0.15))',
            backgroundSize: '400% 400%',
            animation: 'fastShimmer 1.5s ease-in-out infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffd700',
            fontSize: '14px',
            minHeight: '200px',
            borderRadius: '12px',
            position: shouldLoad ? 'absolute' : 'static',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>⚡</div>
            <div>Carga rápida...</div>
          </div>
        </div>
      )}

      {/* Imagen optimizada */}
      {shouldLoad && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`optimized-image ${imageLoaded ? 'image-loaded' : 'image-loading'}`}
          sizes={sizes}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '12px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: imageLoaded ? 1 : 0,
            transform: imageLoaded ? 'scale(1)' : 'scale(1.05)',
            filter: imageLoaded ? 'none' : 'blur(4px)',
            position: 'relative',
            zIndex: 2
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  )
}

// Mock data for events
const mockEvents = [
  {
    id: 1,
    title: "Coldplay - Buenos Aires",
    artist: "Coldplay",
    venue: "Estadio River Plate",
    date: "2025-03-15",
    time: "20:00",
    price: 0.063,
    currency: "ETH",
    category: "Concierto",
    genre: "Rock/Pop",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    description: "Únete a Coldplay en su espectacular gira mundial 'Music of the Spheres'. Una experiencia única que combina música, tecnología y arte visual con efectos LED interactivos, confeti colorido y la mejor música de la banda británica. Prepárate para cantar junto a Chris Martin en una noche inolvidable llena de hits como 'Yellow', 'Viva La Vida' y 'Something Just Like This'.",
    tags: ["internacional", "estadio", "rock"],
    available: 5432,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "estadio",
    timeOfDay: "noche"
  },
  {
    id: 2,
    title: "Festival Lollapalooza 2025",
    artist: "Múltiples Artistas",
    venue: "Hipódromo de San Isidro",
    date: "2025-04-20",
    time: "12:00",
    price: 0.12,
    currency: "ETH",
    category: "Festival",
    genre: "Múltiple",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "El festival más esperado del año llega a Buenos Aires con un lineup increíble de artistas internacionales. Tres días de música non-stop con múltiples escenarios, food trucks gourmet, experiencias interactivas y la mejor producción audiovisual. Una celebración épica de la cultura musical contemporánea.",
    tags: ["festival", "múltiple", "hipódromo"],
    available: 15000,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "aire libre",
    timeOfDay: "tarde"
  },
  {
    id: 3,
    title: "Tango Show - Café Tortoni",
    artist: "Orquesta Típica Buenos Aires",
    venue: "Café Tortoni",
    date: "2025-02-28",
    time: "21:30",
    price: 0.019,
    currency: "ETH",
    category: "Show",
    genre: "Tango",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "Vive una auténtica experiencia de tango en el café más histórico de Buenos Aires. La Orquesta Típica Buenos Aires te transportará a la época dorada del tango con interpretaciones magistrales de Piazzolla, Gardel y otros grandes maestros. Incluye cena tradicional argentina y show de baile profesional.",
    tags: ["tango", "cultural", "histórico"],
    available: 120,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "club",
    timeOfDay: "noche"
  },
  {
    id: 4,
    title: "Ultra Music Festival Miami",
    artist: "David Guetta, Martin Garrix",
    venue: "Bayfront Park",
    date: "2025-03-28",
    time: "17:00",
    price: 0.15,
    currency: "ETH",
    category: "Festival",
    genre: "Electrónica",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "El festival de música electrónica más prestigioso del mundo regresa a Miami. Tres días de sets inolvidables con los mejores DJs planetarios incluyendo David Guetta, Martin Garrix, Tiësto y muchos más. Escenarios espectaculares, efectos visuales de última generación y la energía única de la escena electrónica global.",
    tags: ["electrónica", "internacional", "playa"],
    available: 25000,
    city: "Miami",
    country: "Estados Unidos",
    venueType: "aire libre",
    timeOfDay: "tarde"
  },
  {
    id: 5,
    title: "Ed Sheeran - Acoustic Tour",
    artist: "Ed Sheeran",
    venue: "Luna Park",
    date: "2025-05-10",
    time: "21:00",
    price: 0.05,
    currency: "ETH",
    category: "Concierto",
    genre: "Pop/Folk",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "Ed Sheeran presenta su tour acústico más íntimo en el histórico Luna Park. Una experiencia única con solo su guitarra y loop station, interpretando sus mayores éxitos como 'Shape of You', 'Perfect' y 'Thinking Out Loud' en versiones acústicas nunca antes escuchadas. Una noche mágica e irrepetible.",
    tags: ["acústico", "íntimo", "británico"],
    available: 8500,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "arena",
    timeOfDay: "noche"
  },
  {
    id: 6,
    title: "Tango Milonga - El Caminito",
    artist: "Orquesta Carlos Di Sarli",
    venue: "Club Gricel",
    date: "2025-02-25",
    time: "23:30",
    price: 0.01,
    currency: "ETH",
    category: "Show",
    genre: "Tango",
    image: "https://images.unsplash.com/photo-1504509546545-e000b4a62425?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "Sumérgete en la auténtica cultura porteña con esta milonga tradicional en el histórico Club Gricel. La legendaria Orquesta Carlos Di Sarli interpretará tangos clásicos mientras parejas experimentadas demuestran la elegancia y pasión del baile. Una experiencia cultural única en el corazón de Buenos Aires.",
    tags: ["tango", "milonga", "tradicional"],
    available: 80,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "club",
    timeOfDay: "madrugada"
  },
  {
    id: 7,
    title: "Obra de Teatro: El Rey León",
    artist: "Compañía Musical Argentina",
    venue: "Teatro Gran Rex",
    date: "2025-03-08",
    time: "15:00",
    price: 0.035,
    currency: "ETH",
    category: "Teatro",
    genre: "Musical",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    description: "El musical más exitoso de Broadway llega finalmente a Buenos Aires. Una producción espectacular con más de 100 artistas en escena, vestuarios deslumbrantes, efectos especiales y las canciones inmortales de Elton John y Tim Rice. Una experiencia familiar perfecta que transporta a toda la audiencia a la sabana africana.",
    tags: ["musical", "teatro", "familiar"],
    available: 1200,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "teatro",
    timeOfDay: "tarde"
  },
  {
    id: 8,
    title: "Partido de Fútbol: Boca vs River",
    artist: "Boca Juniors vs River Plate",
    venue: "Estadio Alberto J. Armando",
    date: "2025-03-12",
    time: "17:00",
    price: 0.075,
    currency: "ETH",
    category: "Deportes",
    genre: "Fútbol",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1393&q=80",
    description: "El superclásico más importante y apasionante del fútbol argentino llega a La Bombonera. Boca Juniors vs River Plate en un partido que paraliza al país entero. Vive la pasión, los cánticos, el color y la emoción única de este enfrentamiento histórico en el estadio más emblemático del mundo.",
    tags: ["fútbol", "superclásico", "estadio"],
    available: 45000,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "estadio",
    timeOfDay: "tarde"
  },
  {
    id: 9,
    title: "Festival de Jazz en el Parque",
    artist: "Múltiples Artistas de Jazz",
    venue: "Parque Tres de Febrero",
    date: "2025-04-05",
    time: "14:00",
    price: 0.017,
    currency: "ETH",
    category: "Festival",
    genre: "Jazz",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "Un domingo perfecto de jazz al aire libre en los hermosos jardines del Parque Tres de Febrero. Artistas locales e internacionales se presentarán en múltiples escenarios con estilos que van desde el jazz tradicional hasta fusiones contemporáneas. Ambiente relajado, food trucks y actividades para toda la familia.",
    tags: ["jazz", "aire libre", "festival"],
    available: 3000,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "aire libre",
    timeOfDay: "tarde"
  },
  {
    id: 10,
    title: "Fiesta Electrónica: Warehouse",
    artist: "DJ Snake, Skrillex",
    venue: "Club Niceto",
    date: "2025-02-29",
    time: "01:00",
    price: 0.025,
    currency: "ETH",
    category: "Festival",
    genre: "Electrónica",
    image: "https://images.unsplash.com/photo-1571266028243-d220bc1da145?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    description: "La noche electrónica más underground de Buenos Aires con los pesos pesados internacionales DJ Snake y Skrillex. Warehouse es la fiesta que define la escena electrónica alternativa de la ciudad. Sistema de sonido de última generación, visuales psicodélicos y una multitud que baila hasta el amanecer.",
    tags: ["electrónica", "underground", "club"],
    available: 600,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "club",
    timeOfDay: "madrugada"
  },
  {
    id: 11,
    title: "Concierto de Rock Nacional",
    artist: "Los Piojos Tributo",
    venue: "Estadio Obras",
    date: "2025-04-18",
    time: "20:30",
    price: 0.042,
    currency: "ETH",
    category: "Concierto",
    genre: "Rock Nacional",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "El mejor tributo a Los Piojos llega al Estadio Obras con todos los clásicos que marcaron generaciones. Una noche llena de nostalgia, rock nacional y la energía única del público argentino cantando a todo pulmón temas como 'Verano del '92', 'Tan Solo' y 'El Farolito'.",
    tags: ["rock nacional", "tributo", "nostalgia"],
    available: 12000,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "estadio",
    timeOfDay: "noche"
  },
  {
    id: 12,
    title: "Festival de Folklore",
    artist: "Los Chalchaleros, Mercedes Sosa Tributo",
    venue: "Teatro Colón",
    date: "2025-05-25",
    time: "19:00",
    price: 0.038,
    currency: "ETH",
    category: "Festival",
    genre: "Folklore",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "Una celebración de la música folklórica argentina en el prestigioso Teatro Colón. Los Chalchaleros junto a un emotivo tributo a Mercedes Sosa presentarán lo mejor del cancionero nacional. Una noche mágica donde la tradición y la cultura argentina brillan en todo su esplendor.",
    tags: ["folklore", "tradicional", "cultura"],
    available: 2500,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "teatro",
    timeOfDay: "noche"
  },
  {
    id: 13,
    title: "Stand Up Comedy Night",
    artist: "Migue Granados, Malena Pichot",
    venue: "Teatro Maipo",
    date: "2025-03-22",
    time: "22:00",
    price: 0.022,
    currency: "ETH",
    category: "Show",
    genre: "Comedia",
    image: "https://images.unsplash.com/photo-1585699062959-0c0d3b3c5b7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "La noche de stand up más divertida de Buenos Aires con Migue Granados y Malena Pichot. Dos de los comediantes más queridos del país se unen para una noche llena de risas, observaciones hilarantes sobre la vida cotidiana y la química única que solo ellos pueden crear en el escenario.",
    tags: ["comedia", "stand up", "humor"],
    available: 800,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "teatro",
    timeOfDay: "noche"
  },
  {
    id: 14,
    title: "Festival de Cumbia",
    artist: "Los Palmeras, La Delio Valdez",
    venue: "Club Ciudad de Buenos Aires",
    date: "2025-02-14",
    time: "21:00",
    price: 0.028,
    currency: "ETH",
    category: "Festival",
    genre: "Cumbia",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "La fiesta de cumbia más grande del año con Los Palmeras y La Delio Valdez. Una noche para bailar sin parar con los ritmos que mueven a toda Latinoamérica. Desde la cumbia santafesina hasta los beats más modernos, una celebración de la música popular que une a todas las generaciones.",
    tags: ["cumbia", "baile", "popular"],
    available: 5000,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "club",
    timeOfDay: "noche"
  },
  {
    id: 15,
    title: "Concierto de Música Clásica",
    artist: "Orquesta Filarmónica de Buenos Aires",
    venue: "Teatro Colón",
    date: "2025-04-12",
    time: "20:00",
    price: 0.045,
    currency: "ETH",
    category: "Concierto",
    genre: "Clásica",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "Una velada extraordinaria con la Orquesta Filarmónica de Buenos Aires interpretando las sinfonías más hermosas de Beethoven y Mozart. El Teatro Colón, uno de los teatros de ópera más importantes del mundo, será el escenario perfecto para esta experiencia cultural única e inolvidable.",
    tags: ["clásica", "orquesta", "elegante"],
    available: 2000,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "teatro",
    timeOfDay: "noche"
  },
  {
    id: 16,
    title: "Festival de Hip Hop",
    artist: "Trueno, Duki, Nicki Nicole",
    venue: "Movistar Arena",
    date: "2025-03-30",
    time: "19:30",
    price: 0.065,
    currency: "ETH",
    category: "Festival",
    genre: "Hip Hop",
    image: "https://images.unsplash.com/photo-1571266028243-d220bc1da145?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    description: "El festival de hip hop argentino más esperado del año con Trueno, Duki y Nicki Nicole. Los exponentes más importantes del trap y hip hop nacional se unen en una noche épica llena de freestyle, beats únicos y la energía inigualable de la nueva generación musical argentina.",
    tags: ["hip hop", "trap", "urbano"],
    available: 18000,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "arena",
    timeOfDay: "noche"
  },
  {
    id: 17,
    title: "Espectáculo de Cirque du Soleil",
    artist: "Cirque du Soleil",
    venue: "Estadio Luna Park",
    date: "2025-05-08",
    time: "20:00",
    price: 0.095,
    currency: "ETH",
    category: "Show",
    genre: "Circo",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    description: "El famoso Cirque du Soleil regresa a Buenos Aires con su espectáculo más innovador. Una fusión perfecta entre acrobacia, teatro, música en vivo y efectos visuales espectaculares. Una experiencia mágica que desafía los límites de la imaginación y transporta al público a un mundo de fantasía.",
    tags: ["circo", "acrobacia", "espectacular"],
    available: 9500,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "arena",
    timeOfDay: "noche"
  },
  {
    id: 18,
    title: "Concierto de Reggaeton",
    artist: "Bad Bunny, J Balvin",
    venue: "Campo Argentino de Polo",
    date: "2025-04-26",
    time: "21:00",
    price: 0.125,
    currency: "ETH",
    category: "Concierto",
    genre: "Reggaeton",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "Los reyes del reggaeton Bad Bunny y J Balvin se unen en un concierto histórico en Buenos Aires. Una noche llena de perreo, hits globales y la energía latina que caracteriza a estos artistas. Prepárate para cantar y bailar con 'Tití Me Preguntó', 'Mi Gente' y todos los éxitos que dominan las listas mundiales.",
    tags: ["reggaeton", "latino", "internacional"],
    available: 35000,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "aire libre",
    timeOfDay: "noche"
  },
  {
    id: 19,
    title: "Festival de Blues",
    artist: "Memphis La Blusera, Pappo Tributo",
    venue: "Usina del Arte",
    date: "2025-03-14",
    time: "21:30",
    price: 0.033,
    currency: "ETH",
    category: "Festival",
    genre: "Blues",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "Una noche dedicada al blues argentino con Memphis La Blusera y un emotivo tributo a Pappo. Los mejores exponentes del blues nacional se reúnen para rendir homenaje a este género que tanto marcó la música argentina. Guitarras, armónicas y la pasión pura del blues en estado salvaje.",
    tags: ["blues", "guitarra", "homenaje"],
    available: 1500,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "teatro",
    timeOfDay: "noche"
  },
  {
    id: 20,
    title: "Espectáculo de Danza Contemporánea",
    artist: "Ballet Contemporáneo del Teatro San Martín",
    venue: "Teatro San Martín",
    date: "2025-05-15",
    time: "20:30",
    price: 0.029,
    currency: "ETH",
    category: "Show",
    genre: "Danza",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description: "Una velada de danza contemporánea con el prestigioso Ballet del Teatro San Martín. Una propuesta artística que fusiona técnica clásica con movimientos modernos, creando una experiencia visual y emocional única. Coreografías innovadoras que exploran temas universales a través del lenguaje del cuerpo.",
    tags: ["danza", "contemporáneo", "arte"],
    available: 600,
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "teatro",
    timeOfDay: "noche"
  }
]

function TicketSafer() {
  const { address, isConnected } = useAccount()
  const [currentView, setCurrentView] = useState('home')
  
  // Preload crítico de imágenes destacadas al montar el componente
  useEffect(() => {
    const preloadCriticalImages = async () => {
      const criticalImages = mockEvents.slice(0, 3).map(event => event.image)
      await Promise.allSettled(criticalImages.map(src => preloadImage(src)))
    }
    preloadCriticalImages()
  }, []) // 'home', 'events', 'my-tickets', 'create-event', 'dashboard'
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [filteredEvents, setFilteredEvents] = useState(mockEvents)
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    genre: [],
    priceRange: [0, 0.25],
    dateRange: '',
    location: '',
    sortBy: 'date',
    availability: 'all', // 'all', 'high', 'medium', 'low'
    timeOfDay: 'all', // 'all', 'morning', 'afternoon', 'evening', 'night'
    venueType: 'all', // 'all', 'stadium', 'arena', 'theater', 'club', 'outdoor'
    distance: 50, // km radius
    favorites: false // solo mostrar favoritos
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [savedSearches, setSavedSearches] = useState([
    { id: 1, name: "Conciertos Económicos", filters: { category: ['Concierto'], priceRange: [0, 0.05] } },
    { id: 2, name: "Festivales de Verano", filters: { category: ['Festival'], dateRange: 'this-month' } }
  ])
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [favorites, setFavorites] = useState(() => {
    // Cargar favoritos del localStorage
    const savedFavorites = localStorage.getItem('ticketsafer-favorites')
    return savedFavorites ? JSON.parse(savedFavorites) : []
  })
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1) // 1: Tickets, 2: Info, 3: Pago, 4: Confirmación
  const [selectedTickets, setSelectedTickets] = useState([])
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: ''
  })
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'crypto', // 'crypto', 'card'
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cryptoWallet: ''
  })

  // Dashboard states
  const [dashboardView, setDashboardView] = useState('overview')
 // 'overview', 'profile', 'settings', 'favorites'
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '', // Sin avatar por defecto - mostrará iniciales
    location: '',
    website: '',
    twitter: '',
    instagram: '',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      showEmail: false,
      showLocation: true,
      showActivity: true
    }
  })

  // Search suggestions
  const getSearchSuggestions = () => {
    if (!searchQuery) return []
    
    const suggestions = []
    mockEvents.forEach(event => {
      if (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.genre.toLowerCase().includes(searchQuery.toLowerCase())) {
        suggestions.push(event)
      }
    })
    return suggestions.slice(0, 5)
  }

  // Advanced filter logic
  useEffect(() => {
    let filtered = mockEvents

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (activeFilters.category.length > 0) {
      filtered = filtered.filter(event =>
        activeFilters.category.includes(event.category)
      )
    }

    // Genre filter
    if (activeFilters.genre.length > 0) {
      filtered = filtered.filter(event =>
        activeFilters.genre.includes(event.genre)
      )
    }

    // Price range filter
    filtered = filtered.filter(event =>
      event.price >= activeFilters.priceRange[0] &&
      event.price <= activeFilters.priceRange[1]
    )

    // Location filter
    if (activeFilters.location) {
      filtered = filtered.filter(event =>
        event.city.toLowerCase().includes(activeFilters.location.toLowerCase()) ||
        event.country.toLowerCase().includes(activeFilters.location.toLowerCase()) ||
        event.venue.toLowerCase().includes(activeFilters.location.toLowerCase())
      )
    }

    // Date range filter
    if (activeFilters.dateRange) {
      const now = new Date()
      const today = new Date(now.setHours(0, 0, 0, 0))
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        
        switch (activeFilters.dateRange) {
          case 'today':
            return eventDate.toDateString() === today.toDateString()
          case 'tomorrow':
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            return eventDate.toDateString() === tomorrow.toDateString()
          case 'this-week':
            const weekEnd = new Date(today)
            weekEnd.setDate(weekEnd.getDate() + 7)
            return eventDate >= today && eventDate <= weekEnd
          case 'this-month':
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            return eventDate >= today && eventDate <= monthEnd
          case 'next-month':
            const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)
            const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)
            return eventDate >= nextMonthStart && eventDate <= nextMonthEnd
          default:
            return true
        }
      })
    }

    // Availability filter
    if (activeFilters.availability !== 'all') {
      filtered = filtered.filter(event => {
        const availabilityLevel = event.available > 1000 ? 'high' : 
                                 event.available > 100 ? 'medium' : 'low'
        return availabilityLevel === activeFilters.availability
      })
    }

    // Time of day filter
    if (activeFilters.timeOfDay !== 'all') {
      filtered = filtered.filter(event => {
        const hour = parseInt(event.time.split(':')[0])
        switch (activeFilters.timeOfDay) {
          case 'morning': return hour >= 6 && hour < 12
          case 'afternoon': return hour >= 12 && hour < 18
          case 'evening': return hour >= 18 && hour < 22
          case 'night': return hour >= 22 || hour < 6
          default: return true
        }
      })
    }

    // Venue type filter (based on venue name patterns)
    if (activeFilters.venueType !== 'all') {
      filtered = filtered.filter(event => {
        const venue = event.venue.toLowerCase()
        switch (activeFilters.venueType) {
          case 'stadium': return venue.includes('estadio') || venue.includes('stadium')
          case 'arena': return venue.includes('arena') || venue.includes('coliseo')
          case 'theater': return venue.includes('teatro') || venue.includes('theater')
          case 'club': return venue.includes('club') || venue.includes('bar')
          case 'outdoor': return venue.includes('parque') || venue.includes('park') || venue.includes('hipódromo')
          default: return true
        }
      })
    }

    // Favorites filter
    if (activeFilters.favorites) {
      filtered = filtered.filter(event => favorites.includes(event.id))
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (activeFilters.sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'popularity':
          return b.available - a.available
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        case 'availability':
          return b.available - a.available
        case 'distance':
          // Simple mock distance sorting
          return a.city.localeCompare(b.city)
        default:
          return new Date(a.date) - new Date(b.date)
      }
    })

    setFilteredEvents(filtered)
  }, [searchQuery, activeFilters, favorites])

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev }
      
      if (filterType === 'category' || filterType === 'genre') {
        if (newFilters[filterType].includes(value)) {
          newFilters[filterType] = newFilters[filterType].filter(item => item !== value)
        } else {
          newFilters[filterType] = [...newFilters[filterType], value]
        }
      } else {
        newFilters[filterType] = value
      }
      
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({
      category: [],
      genre: [],
      priceRange: [0, 0.25],
      dateRange: '',
      location: '',
      sortBy: 'date',
      availability: 'all',
      timeOfDay: 'all',
      venueType: 'all',
      distance: 50,
      favorites: false
    })
    setSearchQuery('')
  }

  const getActiveFilterCount = () => {
    return activeFilters.category.length + 
           activeFilters.genre.length + 
           (activeFilters.location ? 1 : 0) +
           (activeFilters.dateRange ? 1 : 0) +
           (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 0.25 ? 1 : 0) +
           (activeFilters.availability !== 'all' ? 1 : 0) +
           (activeFilters.timeOfDay !== 'all' ? 1 : 0) +
           (activeFilters.venueType !== 'all' ? 1 : 0) +
           (activeFilters.favorites ? 1 : 0)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setCurrentView('search-results')
    setShowSearchSuggestions(false)
  }

  const handleSuggestionClick = (event) => {
    setSearchQuery(event.title)
    setShowSearchSuggestions(false)
    setCurrentView('search-results')
  }

  const openEventModal = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
    document.body.style.overflow = 'hidden' // Prevent background scroll
  }

  const closeEventModal = () => {
    setSelectedEvent(null)
    setShowEventModal(false)
    document.body.style.overflow = 'unset' // Restore scroll
  }

  const toggleFavorite = (eventId) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(eventId)
        ? prevFavorites.filter(id => id !== eventId)
        : [...prevFavorites, eventId]
      
      // Guardar en localStorage
      localStorage.setItem('ticketsafer-favorites', JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  const isFavorite = (eventId) => {
    return favorites.includes(eventId)
  }

  const openCheckout = (event, ticketType = 'general') => {
    setSelectedEvent(event)
    setSelectedTickets([{
      type: ticketType,
      price: ticketType === 'general' ? event.price : 
             ticketType === 'vip' ? Math.round(event.price * 2.5) : 
             Math.round(event.price * 4),
      quantity: 1
    }])
    setCheckoutStep(1)
    setShowCheckout(true)
    setShowEventModal(false)
    document.body.style.overflow = 'hidden'
  }

  const closeCheckout = () => {
    setShowCheckout(false)
    setCheckoutStep(1)
    setSelectedTickets([])
    setCustomerInfo({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idNumber: ''
    })
    setPaymentInfo({
      method: 'crypto',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cryptoWallet: ''
    })
    document.body.style.overflow = 'unset'
  }

  const nextCheckoutStep = () => {
    if (checkoutStep < 4) {
      setCheckoutStep(checkoutStep + 1)
    }
  }

  const prevCheckoutStep = () => {
    if (checkoutStep > 1) {
      setCheckoutStep(checkoutStep - 1)
    }
  }

  const updateTicketQuantity = (type, quantity) => {
    setSelectedTickets(prev => 
      prev.map(ticket => 
        ticket.type === type ? { ...ticket, quantity: Math.max(0, quantity) } : ticket
      ).filter(ticket => ticket.quantity > 0)
    )
  }

  const addTicketType = (type, price) => {
    const existing = selectedTickets.find(ticket => ticket.type === type)
    if (existing) {
      updateTicketQuantity(type, existing.quantity + 1)
    } else {
      setSelectedTickets(prev => [...prev, { type, price, quantity: 1 }])
    }
  }

  const getTotalPrice = () => {
    return selectedTickets.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0)
  }

  const getTotalTickets = () => {
    return selectedTickets.reduce((total, ticket) => total + ticket.quantity, 0)
  }

  // Estado para filtros de tickets
  const [ticketFilter, setTicketFilter] = useState('all') // 'all', 'active', 'used', 'expired'

  // Estado para crear eventos
  const [createEventStep, setCreateEventStep] = useState(1) // 1: Info básica, 2: Detalles, 3: Tickets, 4: Publicación
  const [eventForm, setEventForm] = useState({
    // Información básica
    title: '',
    artist: '',
    description: '',
    category: '',
    genre: '',
    
    // Lugar y fecha
    venue: '',
    address: '',
    city: '',
    country: 'Argentina',
    date: '',
    time: '',
    doors: '',
    
    // Configuración
    ageRestriction: '',
    maxCapacity: '',
    eventType: 'concert', // 'concert', 'festival', 'theater', 'sports'
    
    // Medios
    coverImage: '',
    additionalImages: [],
    
    // Tickets
    ticketTypes: [
      {
        id: 1,
        name: 'General',
        description: 'Acceso general al evento',
        price: '',
        quantity: '',
        maxPerPerson: 4,
        isActive: true
      }
    ],
    
    // Términos y condiciones
    refundPolicy: 'no-refund',
    transferable: true,
    resaleAllowed: true,
    terms: ''
  })

  // Mock de tickets NFT del usuario con ejemplos más realistas
  const userTickets = [
    {
      id: 'NFT-001',
      eventTitle: 'Bad Bunny - World Hottest Tour',
      artist: 'Bad Bunny',
      venue: 'Estadio River Plate',
      city: 'Buenos Aires, Argentina',
      date: '2025-03-15',
      time: '21:00',
      ticketType: 'VIP',
      seat: 'Campo VIP - Sector A - Posición 247',
      price: 0.15,
      purchaseDate: '2025-01-15',
      txHash: '0x8f2e4a1b3c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'active',
      qrCode: 'QR_DATA_BADBUNNY_VIP_247',
              isResaleable: true,
        originalPrice: 0.135,
        fees: 0.015
      },
    {
      id: 'NFT-002',
      eventTitle: 'Dua Lipa - Future Nostalgia Tour',
      artist: 'Dua Lipa',
      venue: 'Movistar Arena',
      city: 'Buenos Aires, Argentina',
      date: '2025-02-28',
      time: '21:30',
      ticketType: 'Platinum',
      seat: 'Platea Preferencial - Fila 8 - Butaca 15',
      price: 0.12,
      purchaseDate: '2025-01-10',
      txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'active',
      qrCode: 'QR_DATA_DUALIPA_PLAT_815',
      isResaleable: true,
              originalPrice: 0.105,
        fees: 0.015
    },
    {
      id: 'NFT-003',
      eventTitle: 'Coldplay - Music of the Spheres',
      artist: 'Coldplay',
      venue: 'Estadio Único de La Plata',
      city: 'La Plata, Argentina',
      date: '2024-12-10',
      time: '20:00',
      ticketType: 'General',
      seat: 'Campo General - Zona C',
      price: 0.075,
      purchaseDate: '2024-10-15',
      txHash: '0x9f8e7d6c5b4a3928f1e0d9c8b7a6958473625149382716450593847261738495',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'used',
      qrCode: 'QR_DATA_COLDPLAY_GEN_C003',
      isResaleable: false,
      originalPrice: 0.063,
      fees: 0.012,
      usedDate: '2024-12-10'
    },
    {
      id: 'NFT-004',
      eventTitle: 'Lollapalooza Argentina 2025',
      artist: 'Festival - 3 Días',
      venue: 'Hipódromo de San Isidro',
      city: 'San Isidro, Argentina',
      date: '2025-03-28',
      time: '12:00',
      ticketType: 'VIP',
      seat: 'Pase 3 Días - VIP Experience',
      price: 0.19,
      purchaseDate: '2024-12-01',
      txHash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'active',
      qrCode: 'QR_DATA_LOLLA25_VIP_3DAYS',
      isResaleable: true,
      originalPrice: 0.17,
      fees: 0.02
    },
    {
      id: 'NFT-005',
      eventTitle: 'Ultra Music Festival Argentina',
      artist: 'Martin Garrix, Tiësto, David Guetta',
      venue: 'Costanera Sur',
      city: 'Buenos Aires, Argentina',
      date: '2024-11-15',
      time: '15:00',
      ticketType: 'General',
      seat: 'General Admission - Day 1',
      price: 0.05,
      purchaseDate: '2024-09-20',
      txHash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'expired',
      qrCode: 'QR_DATA_ULTRA_GEN_DAY1',
      isResaleable: false,
      originalPrice: 0.042,
      fees: 0.008
    },
    {
      id: 'NFT-006',
      eventTitle: 'Taylor Swift - Eras Tour',
      artist: 'Taylor Swift',
      venue: 'Estadio River Plate',
      city: 'Buenos Aires, Argentina',
      date: '2024-11-09',
      time: '20:00',
      ticketType: 'Platinum',
      seat: 'San Martín Baja - Fila 12 - Asiento 8',
      price: 0.21,
      purchaseDate: '2024-08-15',
      txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'used',
      qrCode: 'QR_DATA_TAYLOR_PLAT_SM12_8',
      isResaleable: false,
      originalPrice: 0.19,
      fees: 0.02,
      usedDate: '2024-11-09'
    },
    {
      id: 'NFT-007',
      eventTitle: 'Bizarrap Session Live',
      artist: 'Bizarrap',
      venue: 'Vélez Sarsfield',
      city: 'Buenos Aires, Argentina',
      date: '2025-05-20',
      time: '21:00',
      ticketType: 'VIP',
      seat: 'Campo VIP - Acceso Backstage',
      price: 0.093,
      purchaseDate: '2025-01-25',
      txHash: '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'active',
      qrCode: 'QR_DATA_BZRP_VIP_BACKSTAGE',
      isResaleable: true,
      originalPrice: 0.076,
      fees: 0.017
    },
    {
      id: 'NFT-008',
      eventTitle: 'Rock in Rio Buenos Aires',
      artist: 'Foo Fighters, Red Hot Chili Peppers',
      venue: 'Autódromo de Buenos Aires',
      city: 'Buenos Aires, Argentina',
      date: '2024-10-05',
      time: '16:00',
      ticketType: 'General',
      seat: 'Pista - Sector B',
      price: 0.04,
      purchaseDate: '2024-07-10',
      txHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'expired',
      qrCode: 'QR_DATA_ROCKINRIO_GEN_B',
      isResaleable: false,
      originalPrice: 0.034,
      fees: 0.006
    },
    {
      id: 'NFT-009',
      eventTitle: 'Tini - Un Mechón de Pelo Tour',
      artist: 'Tini',
      venue: 'Luna Park',
      city: 'Buenos Aires, Argentina',
      date: '2025-04-12',
      time: '21:00',
      ticketType: 'Platinum',
      seat: 'Platea Premium - Fila 5 - Asiento 22',
      price: 0.063,
      purchaseDate: '2025-01-18',
      txHash: '0x5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'active',
      qrCode: 'QR_DATA_TINI_PLAT_P5_22',
      isResaleable: true,
      originalPrice: 0.05,
      fees: 0.013
    },
    {
      id: 'NFT-010',
      eventTitle: 'Paulo Londra - Back to the Game',
      artist: 'Paulo Londra',
      venue: 'Estadio Malvinas Argentinas',
      city: 'Mendoza, Argentina',
      date: '2025-06-15',
      time: '20:30',
      ticketType: 'General',
      seat: 'Tribuna Norte - Sector 12',
      price: 0.036,
      purchaseDate: '2025-01-22',
      txHash: '0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status: 'active',
      qrCode: 'QR_DATA_LONDRA_GEN_N12',
      isResaleable: true,
      originalPrice: 0.03,
      fees: 0.006
    }
  ]

  // Filtrar tickets según el estado seleccionado
  const getFilteredTickets = () => {
    switch (ticketFilter) {
      case 'active':
        return userTickets.filter(ticket => ticket.status === 'active')
      case 'used':
        return userTickets.filter(ticket => ticket.status === 'used')
      case 'expired':
        return userTickets.filter(ticket => ticket.status === 'expired')
      default:
        return userTickets
    }
  }

  // Funciones para crear eventos
  const updateEventForm = (field, value) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const nextCreateStep = () => {
    if (createEventStep < 4) {
      setCreateEventStep(createEventStep + 1)
    }
  }

  const prevCreateStep = () => {
    if (createEventStep > 1) {
      setCreateEventStep(createEventStep - 1)
    }
  }

  const addNewTicketType = () => {
    const newTicket = {
      id: eventForm.ticketTypes.length + 1,
      name: '',
      description: '',
      price: '',
      quantity: '',
      maxPerPerson: 4,
      isActive: true
    }
    setEventForm(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTicket]
    }))
  }

  const updateTicketType = (id, field, value) => {
    setEventForm(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map(ticket =>
        ticket.id === id ? { ...ticket, [field]: value } : ticket
      )
    }))
  }

  const removeTicketType = (id) => {
    setEventForm(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter(ticket => ticket.id !== id)
    }))
  }

  const getTotalTicketsToSell = () => {
    return eventForm.ticketTypes.reduce((total, ticket) => 
      total + (parseInt(ticket.quantity) || 0), 0
    )
  }

  const getEstimatedRevenue = () => {
    return eventForm.ticketTypes.reduce((total, ticket) => 
      total + ((parseInt(ticket.quantity) || 0) * (parseFloat(ticket.price) || 0)), 0
    )
  }

  // My Tickets View
  // Vista de Favoritos independiente
  if (currentView === 'dashboard' && dashboardView === 'favorites') {
    const favoriteEvents = mockEvents.filter(event => favorites.includes(event.id))
    
    return (
      <div className="ticket-safer">
        {/* Elementos Decorativos Metálicos */}
        <div className="wireframe-grid"></div>
        <div className="metallic-orb metallic-orb-1"></div>
        <div className="metallic-orb metallic-orb-2"></div>
        <div className="metallic-orb metallic-orb-3"></div>
        <div className="metallic-orb metallic-orb-4"></div>
        <div className="geometric-shape geometric-triangle"></div>
        <div className="geometric-shape geometric-diamond"></div>
        <div className="geometric-shape geometric-sphere"></div>
        <div className="geometric-shape geometric-cube"></div>
        
        <header className="header">
          <div className="container">
            <h1 className="logo">🎫 TicketSafer</h1>
            <nav className="nav">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('events')
                }} 
                className={currentView === 'events' || currentView === 'search-results' ? 'active' : ''}
              >
                Eventos
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('my-tickets')
                }} 
                className={currentView === 'my-tickets' ? 'active' : ''}
              >
                Mis Tickets
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('create-event')
                }} 
                className={currentView === 'create-event' ? 'active' : ''}
              >
                Crear Evento
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                  setDashboardView('favorites')
                }} 
                className={`nav-favorites ${currentView === 'dashboard' && dashboardView === 'favorites' ? 'active' : ''}`}
                title={`Mis Favoritos (${favorites.length})`}
              >
                <span className="favorites-heart">❤️</span>
                <span className="favorites-count">{favorites.length}</span>
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                  setDashboardView('overview')
                }} 
                className={currentView === 'dashboard' && dashboardView !== 'favorites' ? 'active' : ''}
              >
                Dashboard
              </a>
            </nav>
            {isConnected && (
              <div className="header-user-section">
                <div className="header-user-profile">
                  <div className="header-avatar">
                    {userProfile.avatar ? (
                      <img 
                        src={userProfile.avatar} 
                        alt="Avatar" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="header-avatar-placeholder" 
                      style={{display: userProfile.avatar ? 'none' : 'flex'}}
                    >
                      {userProfile.username?.charAt(0)?.toUpperCase() || address?.charAt(2)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="header-user-info">
                    <span className="header-username">
                      {userProfile.username || `Usuario ${address?.slice(-4)}`}
                    </span>
                    <span className="header-address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </div>
                </div>
              </div>
            )}
            <ConnectButton />
          </div>
        </header>

        <main className="main">
          <div className="container">
            <section className="favorites-section">
              <div className="favorites-header">
                <div className="back-nav">
                  <button 
                    onClick={() => {
                      setCurrentView('events')
                      setDashboardView('overview')
                    }} 
                    className="back-btn"
                  >
                    ← Volver a Eventos
                  </button>
                </div>
                
                <div className="favorites-title-section">
                  <div className="favorites-icon-title">
                    <span className="favorites-main-icon">💖</span>
                    <div className="title-content">
                      <h2>Mis Eventos Favoritos</h2>
                      <p className="favorites-subtitle">
                        {favoriteEvents.length === 0 
                          ? "Aún no tienes eventos favoritos"
                          : `${favoriteEvents.length} evento${favoriteEvents.length !== 1 ? 's' : ''} guardado${favoriteEvents.length !== 1 ? 's' : ''} para más tarde`
                        }
                      </p>
                    </div>
                  </div>
                  
                  {favoriteEvents.length > 0 && (
                    <div className="favorites-actions">
                      <button className="btn-secondary">
                        📧 Enviar Lista por Email
                      </button>
                      <button className="btn-secondary">
                        📤 Compartir Lista
                      </button>
                    </div>
                  )}
                </div>
                
                {favoriteEvents.length > 0 && (
                  <div className="favorites-stats">
                    <div className="stat-card-fav">
                      <span className="stat-icon">🎫</span>
                      <div className="stat-content">
                        <span className="stat-number">{favoriteEvents.length}</span>
                        <span className="stat-label">Eventos Favoritos</span>
                      </div>
                    </div>
                    <div className="stat-card-fav">
                      <span className="stat-icon">💰</span>
                      <div className="stat-content">
                        <span className="stat-number">
                          {favoriteEvents.reduce((total, event) => total + event.price, 0).toFixed(3)} ETH
                        </span>
                        <span className="stat-label">Valor Total</span>
                      </div>
                    </div>
                    <div className="stat-card-fav">
                      <span className="stat-icon">📅</span>
                      <div className="stat-content">
                        <span className="stat-number">
                          {favoriteEvents.filter(event => new Date(event.date) > new Date()).length}
                        </span>
                        <span className="stat-label">Próximos Eventos</span>
                      </div>
                    </div>
                    <div className="stat-card-fav">
                      <span className="stat-icon">🎵</span>
                      <div className="stat-content">
                        <span className="stat-number">
                          {[...new Set(favoriteEvents.map(event => event.genre))].length}
                        </span>
                        <span className="stat-label">Géneros Únicos</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {favoriteEvents.length === 0 ? (
                <div className="favorites-empty-state">
                  <div className="empty-favorites-container">
                    <div className="empty-favorites-icon">💔</div>
                    <h3>Tu lista de favoritos está vacía</h3>
                    <p>Descubre eventos increíbles y guárdalos como favoritos para encontrarlos fácilmente más tarde.</p>
                    
                    <div className="empty-state-tips">
                      <div className="tip-item">
                        <span className="tip-icon">👀</span>
                        <span className="tip-text">Explora eventos y haz click en el corazón ❤️</span>
                      </div>
                      <div className="tip-item">
                        <span className="tip-icon">⚡</span>
                        <span className="tip-text">Accede rápidamente desde el menú superior</span>
                      </div>
                      <div className="tip-item">
                        <span className="tip-icon">🔔</span>
                        <span className="tip-text">Nunca te pierdas un evento que te gusta</span>
                      </div>
                    </div>
                    
                    <div className="empty-state-actions">
                      <button 
                        className="btn-primary-large glow-pulse"
                        onClick={() => setCurrentView('events')}
                      >
                        🎪 Explorar Eventos
                      </button>
                      <button 
                        className="btn-secondary-large"
                        onClick={() => {
                          setSearchQuery('concierto')
                          setCurrentView('events')
                        }}
                      >
                        🎵 Ver Conciertos
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="favorites-filters">
                    <div className="filter-section">
                      <h4>Filtrar por:</h4>
                      <div className="filter-chips">
                        <button className="filter-chip active">
                          🎫 Todos ({favoriteEvents.length})
                        </button>
                        <button className="filter-chip">
                          📅 Próximos ({favoriteEvents.filter(event => new Date(event.date) > new Date()).length})
                        </button>
                        <button className="filter-chip">
                          🎵 Conciertos ({favoriteEvents.filter(event => event.category === 'Concierto').length})
                        </button>
                        <button className="filter-chip">
                          🎭 Shows ({favoriteEvents.filter(event => event.category === 'Show').length})
                        </button>
                        <button className="filter-chip">
                          🎪 Festivales ({favoriteEvents.filter(event => event.category === 'Festival').length})
                        </button>
                      </div>
                    </div>
                    
                    <div className="sort-section">
                      <h4>Ordenar por:</h4>
                      <select className="sort-select">
                        <option value="date-asc">Fecha (más próximo)</option>
                        <option value="date-desc">Fecha (más lejano)</option>
                        <option value="price-asc">Precio (menor a mayor)</option>
                        <option value="price-desc">Precio (mayor a menor)</option>
                        <option value="name-asc">Nombre A-Z</option>
                        <option value="recently-added">Agregado recientemente</option>
                      </select>
                    </div>
                  </div>

                  <div className="favorites-grid">
                    {favoriteEvents.map(event => (
                      <div key={event.id} className="favorite-event-card">
                        <div className="favorite-card-header">
                          <button 
                            className="remove-favorite-btn"
                            onClick={() => toggleFavorite(event.id)}
                            title="Quitar de favoritos"
                          >
                            ❤️
                          </button>
                          <span className="event-category-badge">{event.category}</span>
                        </div>
                        
                        <div className="favorite-event-image">
                          <OptimizedImage 
                            src={event.image} 
                            alt={event.title} 
                            priority={false}
                            className="priority"
                            sizes="400px"
                            blur={true}
                          />
                          <div className="image-overlay">
                            <button 
                              className="quick-view-btn"
                              onClick={() => openEventModal(event)}
                            >
                              👁️ Vista Rápida
                            </button>
                          </div>
                        </div>
                        
                        <div className="favorite-event-content">
                          <div className="event-date-chip">
                            <span className="date-icon">📅</span>
                            <span className="date-text">
                              {new Date(event.date).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          
                          <h3 className="favorite-event-title">{event.title}</h3>
                          <p className="favorite-event-artist">{event.artist}</p>
                          
                          <div className="favorite-event-details">
                            <div className="detail-item">
                              <span className="detail-icon">📍</span>
                              <span className="detail-text">{event.venue}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">🌆</span>
                              <span className="detail-text">{event.city}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">⏰</span>
                              <span className="detail-text">{event.time}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">🎵</span>
                              <span className="detail-text">{event.genre}</span>
                            </div>
                          </div>
                          
                          <div className="favorite-event-price">
                            <div className="price-info">
                              <span className="price-label">Desde</span>
                              <span className="price-value">{event.price} ETH</span>
                              <span className="price-usd">(~$150 USD)</span>
                            </div>
                            <div className="availability-info">
                              <span className="availability-icon">🎫</span>
                              <span className="availability-text">
                                {event.available > 1000 ? '1000+' : event.available} disponibles
                              </span>
                            </div>
                          </div>
                          
                          <div className="favorite-event-actions">
                            <button 
                              className="btn-primary-ticket"
                              onClick={() => openCheckout(event)}
                            >
                              🎫 Comprar Tickets
                            </button>
                            <button 
                              className="btn-secondary-ticket"
                              onClick={() => openEventModal(event)}
                            >
                              ℹ️ Ver Detalles
                            </button>
                          </div>
                          
                          <div className="favorite-added-info">
                            <span className="added-icon">💖</span>
                            <span className="added-text">Agregado a favoritos</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="favorites-footer">
                    <div className="favorites-summary">
                      <p>
                        Tienes <strong>{favoriteEvents.length}</strong> evento{favoriteEvents.length !== 1 ? 's' : ''} 
                        guardado{favoriteEvents.length !== 1 ? 's' : ''} en tu lista de favoritos
                      </p>
                    </div>
                    
                    <div className="quick-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => setCurrentView('events')}
                      >
                        ➕ Buscar Más Eventos
                      </button>
                      <button className="btn-secondary">
                        🔔 Notificarme de Ofertas
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    )
  }

  if (currentView === 'my-tickets') {
    const activeTickets = userTickets.filter(ticket => ticket.status === 'active')
    const usedTickets = userTickets.filter(ticket => ticket.status === 'used')
    const expiredTickets = userTickets.filter(ticket => ticket.status === 'expired')
    const filteredTickets = getFilteredTickets()

    return (
      <div className="ticket-safer">
        {/* Elementos Decorativos Metálicos */}
        <div className="wireframe-grid"></div>
        <div className="metallic-orb metallic-orb-1"></div>
        <div className="metallic-orb metallic-orb-2"></div>
        <div className="metallic-orb metallic-orb-3"></div>
        <div className="metallic-orb metallic-orb-4"></div>
        <div className="geometric-shape geometric-triangle"></div>
        <div className="geometric-shape geometric-diamond"></div>
        <div className="geometric-shape geometric-sphere"></div>
        <div className="geometric-shape geometric-cube"></div>
        
        <header className="header">
          <div className="container">
            <h1 className="logo">🎫 TicketSafer</h1>
            <nav className="nav">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('events')
                }} 
                className={currentView === 'events' || currentView === 'search-results' ? 'active' : ''}
              >
                Eventos
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('my-tickets')
                }} 
                className={currentView === 'my-tickets' ? 'active' : ''}
              >
                Mis Tickets
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('create-event')
                }} 
                className={currentView === 'create-event' ? 'active' : ''}
              >
                Crear Evento
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                  setDashboardView('favorites')
                }} 
                className={`nav-favorites ${currentView === 'dashboard' && dashboardView === 'favorites' ? 'active' : ''}`}
                title={`Mis Favoritos (${favorites.length})`}
              >
                <span className="favorites-heart">❤️</span>
                <span className="favorites-count">{favorites.length}</span>
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                }} 
                className={currentView === 'dashboard' ? 'active' : ''}
              >
                Dashboard
              </a>
            </nav>
            {isConnected && (
              <div className="header-user-section">
                <div className="header-user-profile">
                  <div className="header-avatar">
                    {userProfile.avatar ? (
                      <img 
                        src={userProfile.avatar} 
                        alt="Avatar" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="header-avatar-placeholder" 
                      style={{display: userProfile.avatar ? 'none' : 'flex'}}
                    >
                      {userProfile.username?.charAt(0)?.toUpperCase() || address?.charAt(2)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="header-user-info">
                    <span className="header-username">
                      {userProfile.username || `Usuario ${address?.slice(-4)}`}
                    </span>
                    <span className="header-address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </div>
                </div>
              </div>
            )}
            <ConnectButton />
          </div>
        </header>

        <main className="main">
          <div className="container">
            {!isConnected ? (
              <section className="my-tickets-intro">
                <div className="connect-prompt">
                  <h2>🔐 Conecta tu Wallet</h2>
                  <p>Para ver tus tickets NFT necesitas conectar tu wallet de Ethereum</p>
                  <ConnectButton />
                </div>
              </section>
            ) : (
              <section className="my-tickets">
                <div className="my-tickets-header">
                  <div className="back-nav">
                    <button onClick={() => setCurrentView('home')} className="back-btn">
                      ← Volver al Inicio
                    </button>
                  </div>
                  <h2>🎫 Mi Colección de Tickets NFT</h2>
                  <p>Gestiona tus tickets, transfiérelos o prepáralos para la reventa</p>
                  
                  <div className="tickets-stats">
                    <div className="stat-card">
                      <span className="stat-number">{activeTickets.length}</span>
                      <span className="stat-label">Tickets Activos</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number">{usedTickets.length}</span>
                      <span className="stat-label">Tickets Usados</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number">{userTickets.length}</span>
                      <span className="stat-label">Total Collection</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number">{userTickets.reduce((total, ticket) => total + ticket.price, 0).toFixed(3)} ETH</span>
                      <span className="stat-label">Valor Total</span>
                    </div>
                  </div>
                </div>

                <div className="tickets-filters">
                  <div className="filter-tabs">
                    <button 
                      className={`filter-tab ${ticketFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setTicketFilter('all')}
                    >
                      🎫 Todos ({userTickets.length})
                    </button>
                    <button 
                      className={`filter-tab ${ticketFilter === 'active' ? 'active' : ''}`}
                      onClick={() => setTicketFilter('active')}
                    >
                      ✅ Activos ({activeTickets.length})
                    </button>
                    <button 
                      className={`filter-tab ${ticketFilter === 'used' ? 'active' : ''}`}
                      onClick={() => setTicketFilter('used')}
                    >
                      ✔️ Usados ({usedTickets.length})
                    </button>
                    <button 
                      className={`filter-tab ${ticketFilter === 'expired' ? 'active' : ''}`}
                      onClick={() => setTicketFilter('expired')}
                    >
                      ⏰ Expirados ({expiredTickets.length})
                    </button>
                  </div>
                </div>

                <div className="my-tickets-grid">
                  {filteredTickets.map(ticket => (
                    <div key={ticket.id} className={`ticket-nft-card ${ticket.status}`}>
                      <div className="ticket-nft-header">
                        <div className="nft-badge">
                          <span className="nft-id">#{ticket.id}</span>
                          <span className={`status-badge ${ticket.status}`}>
                            {ticket.status === 'active' && '✅ Activo'}
                            {ticket.status === 'used' && '✔️ Usado'}
                            {ticket.status === 'expired' && '⏰ Expirado'}
                          </span>
                        </div>
                        <div className="ticket-actions">
                          {ticket.status === 'active' && (
                            <>
                              <button className="action-btn qr-btn" title="Ver QR">
                                📱
                              </button>
                              {ticket.isResaleable && (
                                <button className="action-btn resale-btn" title="Revender">
                                  💰
                                </button>
                              )}
                              <button className="action-btn transfer-btn" title="Transferir">
                                📤
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="ticket-nft-image">
                                                      <OptimizedImage 
                                src={ticket.image} 
                                alt={ticket.eventTitle}
                                priority={false}
                                sizes="300px"
                                blur={true}
                              />
                        <div className="ticket-overlay">
                          <span className="ticket-type-badge">{ticket.ticketType}</span>
                        </div>
                      </div>

                      <div className="ticket-nft-content">
                        <h3 className="ticket-event-title">{ticket.eventTitle}</h3>
                        <p className="ticket-artist">{ticket.artist}</p>
                        
                        <div className="ticket-details">
                          <div className="detail-row">
                            <span className="detail-icon">📍</span>
                            <span className="detail-text">{ticket.venue}, {ticket.city}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-icon">📅</span>
                            <span className="detail-text">
                              {new Date(ticket.date).toLocaleDateString('es-ES')} • {ticket.time}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-icon">🎫</span>
                            <span className="detail-text">{ticket.seat}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-icon">💎</span>
                            <span className="detail-text">Comprado: {new Date(ticket.purchaseDate).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>

                        <div className="ticket-nft-footer">
                          <div className="ticket-price-info">
                            <div className="price-breakdown">
                              <div className="price-item">
                                <span className="price-label">Precio base:</span>
                                <span className="price-value">{ticket.originalPrice} ETH</span>
                              </div>
                              <div className="price-item">
                                <span className="price-label">Fees:</span>
                                <span className="price-value">{ticket.fees} ETH</span>
                              </div>
                              <div className="price-item total-price">
                                <span className="price-label">Total pagado:</span>
                                <span className="price-value">{ticket.price} ETH</span>
                              </div>
                            </div>
                          </div>
                          
                          {ticket.status === 'active' && (
                            <div className="ticket-main-actions">
                              <button className="btn-primary-ticket">
                                📱 Ver QR Code
                              </button>
                              <button className="btn-secondary-ticket">
                                🔗 Ver en Blockchain
                              </button>
                            </div>
                          )}
                          
                          {ticket.status === 'used' && (
                            <div className="used-info">
                              <div className="used-details">
                                <span className="used-text">✅ Ticket utilizado</span>
                                {ticket.usedDate && (
                                  <span className="used-date">
                                    Usado el {new Date(ticket.usedDate).toLocaleDateString('es-ES')}
                                  </span>
                                )}
                              </div>
                              <button className="btn-secondary-ticket">
                                🔗 Ver en Blockchain
                              </button>
                            </div>
                          )}
                          
                          {ticket.status === 'expired' && (
                            <div className="expired-info">
                              <span className="expired-text">⏰ Ticket expirado</span>
                              <button className="btn-secondary-ticket">
                                🔗 Ver en Blockchain
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="blockchain-info">
                          <span className="tx-hash" title={ticket.txHash}>
                            🔗 {ticket.txHash.slice(0, 10)}...{ticket.txHash.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTickets.length === 0 && userTickets.length > 0 && (
                  <div className="no-filtered-tickets">
                    <div className="no-tickets-icon">🔍</div>
                    <h3>No hay tickets en esta categoría</h3>
                    <p>Prueba con otro filtro para ver tus tickets.</p>
                    <button 
                      className="btn-secondary-large"
                      onClick={() => setTicketFilter('all')}
                    >
                      Ver Todos los Tickets
                    </button>
                  </div>
                )}

                {userTickets.length === 0 && (
                  <div className="no-tickets">
                    <div className="no-tickets-icon">🎫</div>
                    <h3>No tienes tickets NFT aún</h3>
                    <p>¡Explora eventos increíbles y consigue tus primeros tickets NFT!</p>
                    <button 
                      className="btn-primary-large glow-pulse"
                      onClick={() => setCurrentView('events')}
                    >
                      🎪 Explorar Eventos
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 TicketSafer - Powered by Blockchain</p>
          </div>
        </footer>
      </div>
    )
  }

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="ticket-safer">
        {/* Elementos Decorativos Metálicos */}
        <div className="wireframe-grid"></div>
        <div className="metallic-orb metallic-orb-1"></div>
        <div className="metallic-orb metallic-orb-2"></div>
        <div className="metallic-orb metallic-orb-3"></div>
        <div className="metallic-orb metallic-orb-4"></div>
        <div className="geometric-shape geometric-triangle"></div>
        <div className="geometric-shape geometric-diamond"></div>
        <div className="geometric-shape geometric-sphere"></div>
        <div className="geometric-shape geometric-cube"></div>
        
        <header className="header">
          <div className="container">
            <h1 
              className="logo" 
              onClick={() => setCurrentView('home')}
              style={{ cursor: 'pointer' }}
            >
              🎫 TicketSafer
            </h1>
            <nav className="nav">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('events')
                }} 
                className={currentView === 'events' || currentView === 'search-results' ? 'active' : ''}
              >
                Eventos
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('my-tickets')
                }} 
                className={currentView === 'my-tickets' ? 'active' : ''}
              >
                Mis Tickets
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('create-event')
                }} 
                className={currentView === 'create-event' ? 'active' : ''}
              >
                Crear Evento
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                  setDashboardView('favorites')
                }} 
                className={`nav-favorites ${currentView === 'dashboard' && dashboardView === 'favorites' ? 'active' : ''}`}
                title={`Mis Favoritos (${favorites.length})`}
              >
                <span className="favorites-heart">❤️</span>
                <span className="favorites-count">{favorites.length}</span>
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                }} 
                className={currentView === 'dashboard' ? 'active' : ''}
              >
                Dashboard
              </a>
            </nav>
            <ConnectButton />
          </div>
        </header>

        <main className="main">
          <div className="container">
            {!isConnected ? (
              <section className="dashboard-intro">
                <div className="connect-prompt">
                  <h2>🔐 Conecta tu Wallet</h2>
                  <p>Para acceder a tu dashboard personalizado necesitas conectar tu wallet</p>
                  <ConnectButton />
                </div>
              </section>
            ) : (
              <div className="dashboard-container">
                <div className="dashboard-header">
                  <div className="back-nav">
                    <button onClick={() => setCurrentView('home')} className="back-btn">
                      ← Volver al Inicio
                    </button>
                  </div>
                  
                  {/* User Profile Header */}
                  <div className="dashboard-user-header">
                    <div className="user-avatar-large">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Avatar" onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }} />
                      ) : null}
                      <div className="avatar-placeholder-large" style={{
                        display: userProfile.avatar ? 'none' : 'flex'
                      }}>
                        {address?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="avatar-status">
                        <span className="status-dot"></span>
                      </div>
                    </div>
                    <div className="user-info-header">
                      <h2>
                        {userProfile.username || `Usuario ${address?.slice(-4)}`}
                        <span className="verification-badge">✅</span>
                      </h2>
                      <p className="user-address">{address}</p>
                      <div className="user-stats-mini">
                        <span className="mini-stat">
                          <span className="mini-stat-icon">🎫</span>
                          {userTickets.length} tickets
                        </span>
                        <span className="mini-stat">
                          <span className="mini-stat-icon">❤️</span>
                          {favorites.length} favoritos
                        </span>
                        <span className="mini-stat">
                          <span className="mini-stat-icon">💰</span>
                          {userTickets.reduce((total, ticket) => total + ticket.price, 0).toFixed(3)} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dashboard-subtitle">
                    <h3>🎛️ Panel de Control</h3>
                    <p>Gestiona tu experiencia en TicketSafer</p>
                  </div>
                </div>

                {/* Dashboard Navigation */}
                <div className="dashboard-nav">
                  <button 
                    className={`dashboard-nav-btn ${dashboardView === 'overview' ? 'active' : ''}`}
                    onClick={() => setDashboardView('overview')}
                  >
                    📊 Resumen
                  </button>
                  <button 
                    className={`dashboard-nav-btn ${dashboardView === 'profile' ? 'active' : ''}`}
                    onClick={() => setDashboardView('profile')}
                  >
                    👤 Perfil
                  </button>

                  <button 
                    className={`dashboard-nav-btn ${dashboardView === 'settings' ? 'active' : ''}`}
                    onClick={() => setDashboardView('settings')}
                  >
                    ⚙️ Configuración
                  </button>
                </div>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                  {/* Overview */}
                  {dashboardView === 'overview' && (
                    <div className="dashboard-overview">
                      <h3>📊 Resumen de Actividad</h3>
                      
                      <div className="overview-stats">
                        <div className="overview-card">
                          <div className="overview-icon">🎫</div>
                          <div className="overview-info">
                            <h4>{userTickets.length}</h4>
                            <p>Tickets Comprados</p>
                          </div>
                        </div>

                        <div className="overview-card">
                          <div className="overview-icon">💰</div>
                          <div className="overview-info">
                            <h4>{userTickets.reduce((total, ticket) => total + ticket.price, 0).toFixed(3)} ETH</h4>
                            <p>Total Invertido</p>
                          </div>
                        </div>
                        <div className="overview-card">
                          <div className="overview-icon">📅</div>
                          <div className="overview-info">
                            <h4>{userTickets.filter(t => t.status === 'active').length}</h4>
                            <p>Próximos Eventos</p>
                          </div>
                        </div>
                      </div>

                      <div className="recent-activity">
                        <h4>🕒 Actividad Reciente</h4>
                        <div className="activity-list">
                          {userTickets.slice(0, 5).map(ticket => (
                            <div key={ticket.id} className="activity-item">
                              <div className="activity-icon">🎫</div>
                              <div className="activity-details">
                                <p><strong>Ticket comprado:</strong> {ticket.eventTitle}</p>
                                <span>{new Date(ticket.purchaseDate).toLocaleDateString('es-ES')}</span>
                              </div>
                              <div className="activity-amount">{ticket.price} ETH</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profile */}
                  {dashboardView === 'profile' && (
                    <div className="profile-section-new">
                      <div className="profile-hero">
                        <div className="profile-hero-content">
                          <div className="profile-hero-avatar">
                            {userProfile.avatar ? (
                              <img 
                                src={userProfile.avatar} 
                                alt="Avatar Principal" 
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="profile-hero-initials" 
                              style={{display: userProfile.avatar ? 'none' : 'flex'}}
                            >
                              {userProfile.username?.charAt(0)?.toUpperCase() || address?.charAt(2)?.toUpperCase() || 'U'}
                            </div>
                            <div className="profile-status-indicator"></div>
                          </div>
                          <div className="profile-hero-info">
                            <h1 className="profile-name">
                              {userProfile.username || `Usuario ${address?.slice(-4)}`}
                            </h1>
                            <p className="profile-address">
                              {address?.slice(0, 8)}...{address?.slice(-6)}
                            </p>
                            <div className="profile-badges">
                              <span className="badge verified">✓ Verificado</span>
                              <span className="badge premium">⭐ Premium</span>
                            </div>
                          </div>
                        </div>
                        <div className="profile-stats-mini">
                          <div className="stat-mini">
                            <span className="stat-number">12</span>
                            <span className="stat-label">Eventos</span>
                          </div>
                          <div className="stat-mini">
                            <span className="stat-number">5</span>
                            <span className="stat-label">Favoritos</span>
                          </div>
                          <div className="stat-mini">
                            <span className="stat-number">1.5</span>
                            <span className="stat-label">ETH</span>
                          </div>
                        </div>
                      </div>

                      <div className="profile-content-grid">
                        {/* Panel de Avatar */}
                        <div className="profile-card avatar-gallery-card">
                          <div className="card-header-new">
                            <h3>
                              <span className="header-icon">🎭</span>
                              Galería de Avatares
                            </h3>
                            <p>Elige tu identidad visual perfecta</p>
                          </div>
                          
                          <div className="avatar-collection">
                            {/* Avatar con iniciales */}
                            <div 
                              className={`avatar-item ${!userProfile.avatar ? 'selected' : ''}`}
                              onClick={() => setUserProfile(prev => ({...prev, avatar: ''}))}
                            >
                              <div className="avatar-preview-new initials-avatar">
                                <div className="initials-display">
                                  {userProfile.username?.charAt(0)?.toUpperCase() || address?.charAt(2)?.toUpperCase() || 'U'}
                                </div>
                              </div>
                              <span className="avatar-name">Iniciales</span>
                              <div className="selection-ring"></div>
                            </div>

                            {/* 10 avatares únicos */}
                            {[
                              { style: 'avataaars', name: 'Cartoon', color: '#FF6B6B' },
                              { style: 'personas', name: 'Personas', color: '#4ECDC4' },
                              { style: 'pixel-art', name: 'Pixel Art', color: '#45B7D1' },
                              { style: 'bottts', name: 'Robot', color: '#FFA07A' },
                              { style: 'identicon', name: 'Geométrico', color: '#98D8C8' },
                              { style: 'miniavs', name: 'Minimal', color: '#F7DC6F' },
                              { style: 'open-peeps', name: 'Ilustrado', color: '#BB8FCE' },
                              { style: 'adventurer', name: 'Aventurero', color: '#85C1E9' },
                              { style: 'big-smile', name: 'Sonriente', color: '#F8C471' },
                              { style: 'fun-emoji', name: 'Emoji', color: '#82E0AA' }
                            ].map((avatarType, index) => {
                              const avatarUrl = `https://api.dicebear.com/7.x/${avatarType.style}/svg?seed=${address}&size=100&backgroundColor=${avatarType.color.replace('#', '')}&scale=110`;
                              return (
                                <div 
                                  key={avatarType.style}
                                  className={`avatar-item ${userProfile.avatar === avatarUrl ? 'selected' : ''}`}
                                  onClick={() => setUserProfile(prev => ({...prev, avatar: avatarUrl}))}
                                >
                                  <div className="avatar-preview-new">
                                    <img src={avatarUrl} alt={avatarType.name} />
                                    <div className="avatar-overlay">
                                      <span className="avatar-number">{index + 1}</span>
                                    </div>
                                  </div>
                                  <span className="avatar-name">{avatarType.name}</span>
                                  <div className="selection-ring"></div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="custom-avatar-section-new">
                            <div className="custom-header">
                              <h4>
                                <span className="custom-icon">🌐</span>
                                Avatar Personalizado
                              </h4>
                            </div>
                            <div className="custom-input-group">
                              <input
                                type="url"
                                placeholder="https://tu-imagen.com/avatar.jpg"
                                value={userProfile.customUrl || ''}
                                onChange={(e) => setUserProfile(prev => ({...prev, customUrl: e.target.value}))}
                                className="custom-url-input-new"
                              />
                              <button 
                                className="apply-custom-btn"
                                onClick={() => {
                                  if (userProfile.customUrl) {
                                    setUserProfile(prev => ({...prev, avatar: userProfile.customUrl}));
                                  }
                                }}
                                disabled={!userProfile.customUrl}
                              >
                                <span className="apply-icon">✨</span>
                                Aplicar
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Panel de Información Personal */}
                        <div className="profile-card personal-info-card-new">
                          <div className="card-header-new">
                            <h3>
                              <span className="header-icon">📝</span>
                              Información Personal
                            </h3>
                            <p>Completa tu perfil público</p>
                          </div>
                          
                          <div className="form-grid-new">
                            <div className="form-field-new">
                              <label className="field-label">
                                <span className="label-icon">👤</span>
                                Nombre de Usuario
                              </label>
                              <div className="input-container">
                                <input
                                  type="text"
                                  value={userProfile.username || ''}
                                  onChange={(e) => {
                                    if (e.target.value.length <= 20) {
                                      setUserProfile(prev => ({...prev, username: e.target.value}));
                                    }
                                  }}
                                  placeholder="Tu nombre único"
                                  className="form-input-new"
                                  maxLength="20"
                                />
                                <span className="char-counter-new">{(userProfile.username || '').length}/20</span>
                              </div>
                            </div>

                            <div className="form-field-new">
                              <label className="field-label">
                                <span className="label-icon">📧</span>
                                Email
                              </label>
                              <input
                                type="email"
                                value={userProfile.email || ''}
                                onChange={(e) => setUserProfile(prev => ({...prev, email: e.target.value}))}
                                placeholder="tu@email.com"
                                className="form-input-new"
                              />
                            </div>

                            <div className="form-field-new">
                              <label className="field-label">
                                <span className="label-icon">📍</span>
                                Ubicación
                              </label>
                              <input
                                type="text"
                                value={userProfile.location || ''}
                                onChange={(e) => setUserProfile(prev => ({...prev, location: e.target.value}))}
                                placeholder="Ciudad, País"
                                className="form-input-new"
                              />
                            </div>

                            <div className="form-field-new">
                              <label className="field-label">
                                <span className="label-icon">🌐</span>
                                Sitio Web
                              </label>
                              <input
                                type="url"
                                value={userProfile.website || ''}
                                onChange={(e) => setUserProfile(prev => ({...prev, website: e.target.value}))}
                                placeholder="https://tuweb.com"
                                className="form-input-new"
                              />
                            </div>

                            <div className="form-field-new">
                              <label className="field-label">
                                <span className="label-icon">🐦</span>
                                Twitter
                              </label>
                              <input
                                type="text"
                                value={userProfile.twitter || ''}
                                onChange={(e) => setUserProfile(prev => ({...prev, twitter: e.target.value}))}
                                placeholder="@tu_usuario"
                                className="form-input-new"
                              />
                            </div>

                            <div className="form-field-new full-width">
                              <label className="field-label">
                                <span className="label-icon">📖</span>
                                Biografía
                              </label>
                              <div className="textarea-container">
                                <textarea
                                  value={userProfile.bio || ''}
                                  onChange={(e) => {
                                    if (e.target.value.length <= 200) {
                                      setUserProfile(prev => ({...prev, bio: e.target.value}));
                                    }
                                  }}
                                  placeholder="Cuéntanos sobre ti, tus pasiones, tu experiencia con eventos..."
                                  className="form-textarea-new"
                                  rows="4"
                                  maxLength="200"
                                />
                                <span className="char-counter-new">{(userProfile.bio || '').length}/200</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Panel de Configuración */}
                        <div className="profile-card settings-card-new">
                          <div className="card-header-new">
                            <h3>
                              <span className="header-icon">⚙️</span>
                              Configuración
                            </h3>
                            <p>Personaliza tu experiencia</p>
                          </div>
                          
                          <div className="settings-list">
                            <div className="setting-row">
                              <div className="setting-info">
                                <h4>🌍 Perfil Público</h4>
                                <p>Permite que otros usuarios vean tu perfil</p>
                              </div>
                              <div className="toggle-switch-new">
                                <input type="checkbox" id="public-profile" defaultChecked />
                                <label htmlFor="public-profile" className="toggle-label"></label>
                              </div>
                            </div>

                            <div className="setting-row">
                              <div className="setting-info">
                                <h4>📧 Notificaciones Email</h4>
                                <p>Recibe actualizaciones de eventos favoritos</p>
                              </div>
                              <div className="toggle-switch-new">
                                <input type="checkbox" id="email-notifications" defaultChecked />
                                <label htmlFor="email-notifications" className="toggle-label"></label>
                              </div>
                            </div>

                            <div className="setting-row">
                              <div className="setting-info">
                                <h4>🎯 Recomendaciones</h4>
                                <p>Eventos personalizados basados en tu historial</p>
                              </div>
                              <div className="toggle-switch-new">
                                <input type="checkbox" id="recommendations" defaultChecked />
                                <label htmlFor="recommendations" className="toggle-label"></label>
                              </div>
                            </div>

                            <div className="setting-row">
                              <div className="setting-info">
                                <h4>📱 Notificaciones Push</h4>
                                <p>Alertas instantáneas en tu dispositivo</p>
                              </div>
                              <div className="toggle-switch-new">
                                <input type="checkbox" id="push-notifications" />
                                <label htmlFor="push-notifications" className="toggle-label"></label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Panel de Estadísticas */}
                        <div className="profile-card stats-card-new">
                          <div className="card-header-new">
                            <h3>
                              <span className="header-icon">📊</span>
                              Estadísticas
                            </h3>
                            <p>Tu actividad en TicketSafer</p>
                          </div>
                          
                          <div className="stats-grid">
                            <div className="stat-box">
                              <div className="stat-icon">🎫</div>
                              <div className="stat-data">
                                <span className="stat-number">12</span>
                                <span className="stat-label">Tickets Comprados</span>
                              </div>
                            </div>

                            <div className="stat-box">
                              <div className="stat-icon">❤️</div>
                              <div className="stat-data">
                                <span className="stat-number">5</span>
                                <span className="stat-label">Eventos Favoritos</span>
                              </div>
                            </div>

                            <div className="stat-box">
                              <div className="stat-icon">💰</div>
                              <div className="stat-data">
                                <span className="stat-number">1.5</span>
                                <span className="stat-label">ETH Gastados</span>
                              </div>
                            </div>

                            <div className="stat-box">
                              <div className="stat-icon">🏆</div>
                              <div className="stat-data">
                                <span className="stat-number">Gold</span>
                                <span className="stat-label">Nivel</span>
                              </div>
                            </div>
                          </div>

                          <div className="achievements-section">
                            <h4>🏅 Logros Recientes</h4>
                            <div className="achievements-list">
                              <div className="achievement-item">
                                <span className="achievement-icon">🎵</span>
                                <span className="achievement-text">Primer Concierto</span>
                              </div>
                              <div className="achievement-item">
                                <span className="achievement-icon">⭐</span>
                                <span className="achievement-text">Coleccionista</span>
                              </div>
                              <div className="achievement-item">
                                <span className="achievement-icon">🔥</span>
                                <span className="achievement-text">Usuario Activo</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="profile-actions-new">
                        <button 
                          className="action-btn-new primary"
                          onClick={() => {
                            console.log('Perfil guardado:', userProfile);
                            alert('✅ Perfil actualizado correctamente!');
                          }}
                        >
                          <span className="btn-icon-new">💾</span>
                          <span className="btn-text-new">Guardar Cambios</span>
                          <div className="btn-shimmer"></div>
                        </button>

                        <button 
                          className="action-btn-new secondary"
                          onClick={() => {
                            setUserProfile({
                              username: '',
                              email: '',
                              bio: '',
                              avatar: '',
                              location: '',
                              website: '',
                              twitter: '',
                              customUrl: '',
                              notifications: {
                                email: true,
                                push: true,
                                sms: false
                              }
                            });
                          }}
                        >
                          <span className="btn-icon-new">🔄</span>
                          <span className="btn-text-new">Restablecer</span>
                        </button>

                        <button className="action-btn-new tertiary">
                          <span className="btn-icon-new">📤</span>
                          <span className="btn-text-new">Exportar Datos</span>
                        </button>

                        <button className="action-btn-new danger">
                          <span className="btn-icon-new">🗑️</span>
                          <span className="btn-text-new">Eliminar Cuenta</span>
                        </button>
                      </div>
                    </div>
                  )}



                  {/* Settings */}
                  {dashboardView === 'settings' && (
                    <div className="dashboard-settings">
                      <h3>⚙️ Configuración</h3>
                      
                      <div className="settings-sections">
                        <div className="settings-section">
                          <h4>🔔 Notificaciones</h4>
                          <div className="settings-options">
                            <div className="setting-item">
                              <div className="setting-info">
                                <h5>Notificaciones por Email</h5>
                                <p>Recibe actualizaciones de tus eventos por email</p>
                              </div>
                              <label className="toggle">
                                <input 
                                  type="checkbox" 
                                  checked={userProfile.notifications.email}
                                  onChange={(e) => setUserProfile(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, email: e.target.checked }
                                  }))}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="setting-item">
                              <div className="setting-info">
                                <h5>Notificaciones Push</h5>
                                <p>Recibe notificaciones en tu navegador</p>
                              </div>
                              <label className="toggle">
                                <input 
                                  type="checkbox" 
                                  checked={userProfile.notifications.push}
                                  onChange={(e) => setUserProfile(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, push: e.target.checked }
                                  }))}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="setting-item">
                              <div className="setting-info">
                                <h5>SMS</h5>
                                <p>Recibe recordatorios por mensaje de texto</p>
                              </div>
                              <label className="toggle">
                                <input 
                                  type="checkbox" 
                                  checked={userProfile.notifications.sms}
                                  onChange={(e) => setUserProfile(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, sms: e.target.checked }
                                  }))}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="setting-item">
                              <div className="setting-info">
                                <h5>Marketing</h5>
                                <p>Recibe promociones y eventos recomendados</p>
                              </div>
                              <label className="toggle">
                                <input 
                                  type="checkbox" 
                                  checked={userProfile.notifications.marketing}
                                  onChange={(e) => setUserProfile(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, marketing: e.target.checked }
                                  }))}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="settings-section">
                          <h4>🔒 Privacidad</h4>
                          <div className="settings-options">
                            <div className="setting-item">
                              <div className="setting-info">
                                <h5>Mostrar Email Público</h5>
                                <p>Otros usuarios pueden ver tu email</p>
                              </div>
                              <label className="toggle">
                                <input 
                                  type="checkbox" 
                                  checked={userProfile.privacy.showEmail}
                                  onChange={(e) => setUserProfile(prev => ({
                                    ...prev,
                                    privacy: { ...prev.privacy, showEmail: e.target.checked }
                                  }))}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="setting-item">
                              <div className="setting-info">
                                <h5>Mostrar Ubicación</h5>
                                <p>Otros usuarios pueden ver tu ubicación</p>
                              </div>
                              <label className="toggle">
                                <input 
                                  type="checkbox" 
                                  checked={userProfile.privacy.showLocation}
                                  onChange={(e) => setUserProfile(prev => ({
                                    ...prev,
                                    privacy: { ...prev.privacy, showLocation: e.target.checked }
                                  }))}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="setting-item">
                              <div className="setting-info">
                                <h5>Mostrar Actividad</h5>
                                <p>Otros usuarios pueden ver tu actividad reciente</p>
                              </div>
                              <label className="toggle">
                                <input 
                                  type="checkbox" 
                                  checked={userProfile.privacy.showActivity}
                                  onChange={(e) => setUserProfile(prev => ({
                                    ...prev,
                                    privacy: { ...prev.privacy, showActivity: e.target.checked }
                                  }))}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="settings-section">
                          <h4>🌐 Blockchain</h4>
                          <div className="blockchain-settings">
                            <div className="setting-item">
                              <div className="setting-info">
                                <h5>Wallet Conectada</h5>
                                <p>{address}</p>
                              </div>
                              <ConnectButton />
                            </div>
                            <div className="setting-item">
                              <div className="setting-info">
                                <h5>Red</h5>
                                <p>Base Sepolia Testnet</p>
                              </div>
                              <span className="network-status connected">✅ Conectado</span>
                            </div>
                          </div>
                        </div>

                        <div className="settings-actions">
                          <button className="btn-primary">Guardar Configuración</button>
                          <button className="btn-secondary">Restablecer</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 TicketSafer - Powered by Blockchain</p>
          </div>
        </footer>
      </div>
    )
  }

  // Create Event View
  if (currentView === 'create-event') {
    return (
      <div className="ticket-safer">
        {/* Elementos Decorativos Metálicos */}
        <div className="wireframe-grid"></div>
        <div className="metallic-orb metallic-orb-1"></div>
        <div className="metallic-orb metallic-orb-2"></div>
        <div className="metallic-orb metallic-orb-3"></div>
        <div className="metallic-orb metallic-orb-4"></div>
        <div className="geometric-shape geometric-triangle"></div>
        <div className="geometric-shape geometric-diamond"></div>
        <div className="geometric-shape geometric-sphere"></div>
        <div className="geometric-shape geometric-cube"></div>
        
        <header className="header">
          <div className="container">
            <h1 className="logo">🎫 TicketSafer</h1>
            <nav className="nav">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('events')
                }} 
                className={currentView === 'events' || currentView === 'search-results' ? 'active' : ''}
              >
                Eventos
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('my-tickets')
                }} 
                className={currentView === 'my-tickets' ? 'active' : ''}
              >
                Mis Tickets
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('create-event')
                }} 
                className={currentView === 'create-event' ? 'active' : ''}
              >
                Crear Evento
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                  setDashboardView('favorites')
                }} 
                className={`nav-favorites ${currentView === 'dashboard' && dashboardView === 'favorites' ? 'active' : ''}`}
                title={`Mis Favoritos (${favorites.length})`}
              >
                <span className="favorites-heart">❤️</span>
                <span className="favorites-count">{favorites.length}</span>
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                }} 
                className={currentView === 'dashboard' ? 'active' : ''}
              >
                Dashboard
              </a>
            </nav>
            {isConnected && (
              <div className="header-user-section">
                <div className="header-user-profile">
                  <div className="header-avatar">
                    {userProfile.avatar ? (
                      <img 
                        src={userProfile.avatar} 
                        alt="Avatar" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="header-avatar-placeholder" 
                      style={{display: userProfile.avatar ? 'none' : 'flex'}}
                    >
                      {userProfile.username?.charAt(0)?.toUpperCase() || address?.charAt(2)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="header-user-info">
                    <span className="header-username">
                      {userProfile.username || `Usuario ${address?.slice(-4)}`}
                    </span>
                    <span className="header-address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </div>
                </div>
              </div>
            )}
            <ConnectButton />
          </div>
        </header>

        <main className="main">
          <div className="container">
            {!isConnected ? (
              <section className="create-event-intro">
                <div className="connect-prompt">
                  <h2>🔐 Conecta tu Wallet</h2>
                  <p>Para crear eventos con tickets NFT necesitas conectar tu wallet de Ethereum</p>
                  <ConnectButton />
                </div>
              </section>
            ) : (
              <div className="create-event-container">
                <div className="create-event-content">
                  <div className="create-event-header">
                    <div className="back-nav">
                      <button onClick={() => setCurrentView('home')} className="back-btn">
                        ← Volver al Inicio
                      </button>
                    </div>
                    <h2>🎟️ Crear Nuevo Evento</h2>
                    <p>Organiza tu evento y vende tickets NFT de forma segura</p>
                  </div>
                  
                  {/* Indicador de progreso */}
                  <div className="progress-indicator">
                    <div className={`step ${createEventStep >= 1 ? 'active' : ''} ${createEventStep === 1 ? 'current' : ''}`}>
                      <span className="step-number">1</span>
                      <label>Información Básica</label>
                    </div>
                    <div className={`step ${createEventStep >= 2 ? 'active' : ''} ${createEventStep === 2 ? 'current' : ''}`}>
                      <span className="step-number">2</span>
                      <label>Lugar y Fecha</label>
                    </div>
                    <div className={`step ${createEventStep >= 3 ? 'active' : ''} ${createEventStep === 3 ? 'current' : ''}`}>
                      <span className="step-number">3</span>
                      <label>Configurar Tickets</label>
                    </div>
                    <div className={`step ${createEventStep >= 4 ? 'active' : ''} ${createEventStep === 4 ? 'current' : ''}`}>
                      <span className="step-number">4</span>
                      <label>Publicar Evento</label>
                    </div>
                  </div>

                  {/* Paso 1: Información Básica */}
                  {createEventStep === 1 && (
                    <div className="form-step">
                      <h3>📋 Información Básica del Evento</h3>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Título del Evento *</label>
                          <input
                            type="text"
                            value={eventForm.title}
                            onChange={(e) => updateEventForm('title', e.target.value)}
                            placeholder="Ej: Concierto de Bad Bunny - World Hottest Tour"
                          />
                        </div>

                        <div className="form-group">
                          <label>Artista/Performer *</label>
                          <input
                            type="text"
                            value={eventForm.artist}
                            onChange={(e) => updateEventForm('artist', e.target.value)}
                            placeholder="Ej: Bad Bunny"
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Descripción del Evento</label>
                          <textarea
                            value={eventForm.description}
                            onChange={(e) => updateEventForm('description', e.target.value)}
                            placeholder="Describe tu evento: qué pueden esperar los asistentes, artistas invitados, etc."
                            rows="4"
                          />
                        </div>

                        <div className="form-group">
                          <label>Tipo de Evento *</label>
                          <select
                            value={eventForm.eventType}
                            onChange={(e) => updateEventForm('eventType', e.target.value)}
                          >
                            <option value="concert">Concierto</option>
                            <option value="festival">Festival</option>
                            <option value="theater">Teatro</option>
                            <option value="sports">Deportes</option>
                            <option value="conference">Conferencia</option>
                            <option value="other">Otro</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Categoría *</label>
                          <select
                            value={eventForm.category}
                            onChange={(e) => updateEventForm('category', e.target.value)}
                          >
                            <option value="">Seleccionar categoría</option>
                            <option value="Música">Música</option>
                            <option value="Teatro">Teatro</option>
                            <option value="Deportes">Deportes</option>
                            <option value="Entretenimiento">Entretenimiento</option>
                            <option value="Familia">Familia</option>
                            <option value="Cultura">Cultura</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Género Musical</label>
                          <input
                            type="text"
                            value={eventForm.genre}
                            onChange={(e) => updateEventForm('genre', e.target.value)}
                            placeholder="Ej: Reggaeton, Rock, Pop, etc."
                          />
                        </div>

                        <div className="form-group">
                          <label>Restricción de Edad</label>
                          <select
                            value={eventForm.ageRestriction}
                            onChange={(e) => updateEventForm('ageRestriction', e.target.value)}
                          >
                            <option value="">Sin restricción</option>
                            <option value="13+">13+ años</option>
                            <option value="16+">16+ años</option>
                            <option value="18+">18+ años</option>
                            <option value="21+">21+ años</option>
                          </select>
                        </div>

                        <div className="form-group full-width">
                          <label>Imagen de Portada (URL)</label>
                          <input
                            type="url"
                            value={eventForm.coverImage}
                            onChange={(e) => updateEventForm('coverImage', e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                          />
                          {eventForm.coverImage && (
                            <div className="image-preview">
                              <OptimizedImage src={eventForm.coverImage} alt="Vista previa" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-actions">
                        <button onClick={() => setCurrentView('events')} className="btn-secondary">
                          Cancelar
                        </button>
                        <button 
                          onClick={nextCreateStep} 
                          className="btn-primary"
                          disabled={!eventForm.title || !eventForm.artist || !eventForm.category}
                        >
                          Siguiente: Lugar y Fecha →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Paso 2: Lugar y Fecha */}
                  {createEventStep === 2 && (
                    <div className="form-step">
                      <h3>📍 Lugar y Fecha del Evento</h3>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Nombre del Venue *</label>
                          <input
                            type="text"
                            value={eventForm.venue}
                            onChange={(e) => updateEventForm('venue', e.target.value)}
                            placeholder="Ej: Estadio River Plate"
                          />
                        </div>

                        <div className="form-group">
                          <label>Capacidad Máxima *</label>
                          <input
                            type="number"
                            value={eventForm.maxCapacity}
                            onChange={(e) => updateEventForm('maxCapacity', e.target.value)}
                            placeholder="Ej: 65000"
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Dirección Completa *</label>
                          <input
                            type="text"
                            value={eventForm.address}
                            onChange={(e) => updateEventForm('address', e.target.value)}
                            placeholder="Ej: Av. Presidente Figueroa Alcorta 7597"
                          />
                        </div>

                        <div className="form-group">
                          <label>Ciudad *</label>
                          <input
                            type="text"
                            value={eventForm.city}
                            onChange={(e) => updateEventForm('city', e.target.value)}
                            placeholder="Ej: Buenos Aires"
                          />
                        </div>

                        <div className="form-group">
                          <label>País *</label>
                          <select
                            value={eventForm.country}
                            onChange={(e) => updateEventForm('country', e.target.value)}
                          >
                            <option value="Argentina">Argentina</option>
                            <option value="Chile">Chile</option>
                            <option value="Uruguay">Uruguay</option>
                            <option value="Paraguay">Paraguay</option>
                            <option value="Brasil">Brasil</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Fecha del Evento *</label>
                          <input
                            type="date"
                            value={eventForm.date}
                            onChange={(e) => updateEventForm('date', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Hora de Inicio *</label>
                          <input
                            type="time"
                            value={eventForm.time}
                            onChange={(e) => updateEventForm('time', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Apertura de Puertas</label>
                          <input
                            type="time"
                            value={eventForm.doors}
                            onChange={(e) => updateEventForm('doors', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button onClick={prevCreateStep} className="btn-secondary">
                          ← Volver
                        </button>
                        <button 
                          onClick={nextCreateStep} 
                          className="btn-primary"
                          disabled={!eventForm.venue || !eventForm.maxCapacity || !eventForm.address || !eventForm.city || !eventForm.date || !eventForm.time}
                        >
                          Siguiente: Configurar Tickets →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Paso 3: Configurar Tickets */}
                  {createEventStep === 3 && (
                    <div className="form-step">
                      <h3>🎫 Configuración de Tickets</h3>
                      
                      <div className="tickets-summary">
                        <div className="summary-card">
                          <h4>📊 Resumen</h4>
                          <div className="summary-stats">
                            <div className="stat">
                              <span className="stat-label">Total Tickets:</span>
                              <span className="stat-value">{getTotalTicketsToSell().toLocaleString()}</span>
                            </div>
                            <div className="stat">
                              <span className="stat-label">Ingresos Estimados:</span>
                              <span className="stat-value">{getEstimatedRevenue().toFixed(3)} ETH</span>
                            </div>
                            <div className="stat">
                              <span className="stat-label">Tipos de Ticket:</span>
                              <span className="stat-value">{eventForm.ticketTypes.length}</span>
                            </div>
                            <div className="stat">
                              <span className="stat-label">% de Capacidad:</span>
                              <span className="stat-value">
                                {eventForm.maxCapacity ? Math.round((getTotalTicketsToSell() / parseInt(eventForm.maxCapacity)) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ticket-types">
                        {eventForm.ticketTypes.map((ticket, index) => (
                          <div key={ticket.id} className="ticket-type-card">
                            <div className="ticket-type-header">
                              <h4>🎫 Ticket Tipo {index + 1}</h4>
                              {eventForm.ticketTypes.length > 1 && (
                                <button 
                                  onClick={() => removeTicketType(ticket.id)}
                                  className="btn-remove"
                                >
                                  ❌ Eliminar
                                </button>
                              )}
                            </div>

                            <div className="ticket-form-grid">
                              <div className="form-group">
                                <label>Nombre del Ticket *</label>
                                <input
                                  type="text"
                                  value={ticket.name}
                                  onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                                  placeholder="Ej: General, VIP, Platinum"
                                />
                              </div>

                              <div className="form-group">
                                <label>Precio (ETH) *</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={ticket.price}
                                  onChange={(e) => updateTicketType(ticket.id, 'price', e.target.value)}
                                  placeholder="0.00"
                                />
                              </div>

                              <div className="form-group">
                                <label>Cantidad Disponible *</label>
                                <input
                                  type="number"
                                  value={ticket.quantity}
                                  onChange={(e) => updateTicketType(ticket.id, 'quantity', e.target.value)}
                                  placeholder="Ej: 1000"
                                />
                              </div>

                              <div className="form-group">
                                <label>Máximo por Persona</label>
                                <select
                                  value={ticket.maxPerPerson}
                                  onChange={(e) => updateTicketType(ticket.id, 'maxPerPerson', parseInt(e.target.value))}
                                >
                                  <option value={1}>1 ticket</option>
                                  <option value={2}>2 tickets</option>
                                  <option value={4}>4 tickets</option>
                                  <option value={6}>6 tickets</option>
                                  <option value={8}>8 tickets</option>
                                  <option value={10}>10 tickets</option>
                                </select>
                              </div>

                              <div className="form-group full-width">
                                <label>Descripción/Beneficios</label>
                                <textarea
                                  value={ticket.description}
                                  onChange={(e) => updateTicketType(ticket.id, 'description', e.target.value)}
                                  placeholder="Describe qué incluye este tipo de ticket..."
                                  rows="2"
                                />
                              </div>
                            </div>

                            <div className="ticket-preview">
                              <div className="ticket-stats">
                                <span>💰 Ingresos: {((parseInt(ticket.quantity) || 0) * (parseFloat(ticket.price) || 0)).toFixed(3)} ETH</span>
                                <span>📊 % del Total: {getTotalTicketsToSell() > 0 ? Math.round(((parseInt(ticket.quantity) || 0) / getTotalTicketsToSell()) * 100) : 0}%</span>
                                <span>🎫 {ticket.price} ETH/ticket</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button onClick={addNewTicketType} className="btn-add-ticket">
                          + Agregar Otro Tipo de Ticket
                        </button>
                      </div>

                      <div className="form-actions">
                        <button onClick={prevCreateStep} className="btn-secondary">
                          ← Volver
                        </button>
                        <button 
                          onClick={nextCreateStep} 
                          className="btn-primary"
                          disabled={!eventForm.ticketTypes.some(t => t.name && t.price && t.quantity)}
                        >
                          Siguiente: Publicar Evento →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Paso 4: Publicar Evento */}
                  {createEventStep === 4 && (
                    <div className="form-step">
                      <h3>🚀 Términos y Publicación</h3>
                      
                      <div className="final-review">
                        <div className="event-preview-card">
                          <h4>👁️ Vista Previa del Evento</h4>
                          <div className="preview-content">
                            <div className="preview-image">
                              {eventForm.coverImage ? (
                                <OptimizedImage src={eventForm.coverImage} alt="Preview" />
                              ) : (
                                <div className="placeholder-image">📸 Sin imagen</div>
                              )}
                            </div>
                            <div className="preview-info">
                              <h5>{eventForm.title || 'Título del evento'}</h5>
                              <p><strong>🎤 Artista:</strong> {eventForm.artist || 'Sin especificar'}</p>
                              <p><strong>📍 Lugar:</strong> {eventForm.venue}, {eventForm.city}</p>
                              <p><strong>📅 Fecha:</strong> {eventForm.date} a las {eventForm.time}</p>
                              <p><strong>👥 Capacidad:</strong> {parseInt(eventForm.maxCapacity).toLocaleString()} personas</p>
                              <p><strong>🏷️ Categoría:</strong> {eventForm.category}</p>
                              <div className="preview-tickets">
                                <h6>🎫 Tickets Disponibles:</h6>
                                {eventForm.ticketTypes.map(ticket => (
                                  <div key={ticket.id} className="preview-ticket">
                                    <strong>{ticket.name}</strong> - {ticket.price} ETH ({parseInt(ticket.quantity).toLocaleString()} disponibles)
                                  </div>
                                ))}
                                <div className="preview-totals">
                                  <div><strong>Total tickets:</strong> {getTotalTicketsToSell().toLocaleString()}</div>
                                  <div><strong>Ingresos estimados:</strong> {getEstimatedRevenue().toFixed(3)} ETH</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="terms-section">
                          <h4>📋 Políticas del Evento</h4>
                          
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Política de Reembolso</label>
                              <select
                                value={eventForm.refundPolicy}
                                onChange={(e) => updateEventForm('refundPolicy', e.target.value)}
                              >
                                <option value="no-refund">Sin reembolso</option>
                                <option value="partial-refund">Reembolso parcial (hasta 7 días antes)</option>
                                <option value="full-refund">Reembolso completo (hasta 24 horas antes)</option>
                              </select>
                            </div>

                            <div className="form-group checkbox-group">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={eventForm.transferable}
                                  onChange={(e) => updateEventForm('transferable', e.target.checked)}
                                />
                                Tickets transferibles
                              </label>
                            </div>

                            <div className="form-group checkbox-group">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={eventForm.resaleAllowed}
                                  onChange={(e) => updateEventForm('resaleAllowed', e.target.checked)}
                                />
                                Permitir reventa
                              </label>
                            </div>

                            <div className="form-group full-width">
                              <label>Términos y Condiciones Adicionales</label>
                              <textarea
                                value={eventForm.terms}
                                onChange={(e) => updateEventForm('terms', e.target.value)}
                                placeholder="Agrega términos específicos para tu evento..."
                                rows="4"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="blockchain-info">
                          <h4>⛓️ Información Blockchain</h4>
                          <div className="blockchain-details">
                            <div className="blockchain-item">
                              <span className="label">Red:</span>
                              <span className="value">Base Network (L2)</span>
                            </div>
                            <div className="blockchain-item">
                              <span className="label">Testnet:</span>
                              <span className="value">Base Sepolia</span>
                            </div>
                            <div className="blockchain-item">
                              <span className="label">Moneda:</span>
                              <span className="value">ETH en Base</span>
                            </div>
                            <div className="blockchain-item">
                              <span className="label">Estándar:</span>
                              <span className="value">ERC-721 (NFT)</span>
                            </div>
                            <div className="blockchain-item">
                              <span className="label">Gas Estimado:</span>
                              <span className="value">~$0.01-0.50 USD</span>
                            </div>
                            <div className="blockchain-item">
                              <span className="label">Tiempo de Confirmación:</span>
                              <span className="value">1-2 minutos</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button onClick={prevCreateStep} className="btn-secondary">
                          ← Volver
                        </button>
                        <button 
                          onClick={() => {
                            alert('🎉 ¡Evento publicado exitosamente! Los tickets NFT están siendo minteados en la blockchain.')
                            setCurrentView('events')
                            setCreateEventStep(1)
                            // Reset form
                            setEventForm({
                              title: '', artist: '', description: '', category: '', genre: '',
                              venue: '', address: '', city: '', country: 'Argentina', date: '', time: '', doors: '',
                              ageRestriction: '', maxCapacity: '', eventType: 'concert',
                              coverImage: '', additionalImages: [],
                              ticketTypes: [{
                                id: 1, name: 'General', description: 'Acceso general al evento',
                                price: '', quantity: '', maxPerPerson: 4, isActive: true
                              }],
                              refundPolicy: 'no-refund', transferable: true, resaleAllowed: true, terms: ''
                            })
                          }}
                          className="btn-publish"
                        >
                          🚀 Publicar Evento y Mintear NFTs
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 TicketSafer - Powered by Blockchain</p>
          </div>
        </footer>
      </div>
    )
  }

  // Events/Search Results View
  if (currentView === 'events' || currentView === 'search-results') {
    return (
      <div className="ticket-safer">
        {/* Elementos Decorativos Metálicos */}
        <div className="wireframe-grid"></div>
        <div className="metallic-orb metallic-orb-1"></div>
        <div className="metallic-orb metallic-orb-2"></div>
        <div className="metallic-orb metallic-orb-3"></div>
        <div className="metallic-orb metallic-orb-4"></div>
        <div className="geometric-shape geometric-triangle"></div>
        <div className="geometric-shape geometric-diamond"></div>
        <div className="geometric-shape geometric-sphere"></div>
        <div className="geometric-shape geometric-cube"></div>
        
        <header className="header">
          <div className="container">
            <h1 
              className="logo" 
              onClick={() => setCurrentView('home')}
              style={{ cursor: 'pointer' }}
            >
              🎫 TicketSafer
            </h1>
            <nav className="nav">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('events')
                }} 
                className={currentView === 'events' || currentView === 'search-results' ? 'active' : ''}
              >
                Eventos
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('my-tickets')
                }} 
                className={currentView === 'my-tickets' ? 'active' : ''}
              >
                Mis Tickets
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('create-event')
                }} 
                className={currentView === 'create-event' ? 'active' : ''}
              >
                Crear Evento
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                  setDashboardView('favorites')
                }} 
                className={`nav-favorites ${currentView === 'dashboard' && dashboardView === 'favorites' ? 'active' : ''}`}
                title={`Mis Favoritos (${favorites.length})`}
              >
                <span className="favorites-heart">❤️</span>
                <span className="favorites-count">{favorites.length}</span>
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                }} 
                className={currentView === 'dashboard' ? 'active' : ''}
              >
                Dashboard
              </a>
            </nav>
            {isConnected && (
              <div className="header-user-section">
                <div className="header-user-profile">
                  <div className="header-avatar">
                    {userProfile.avatar ? (
                      <img 
                        src={userProfile.avatar} 
                        alt="Avatar" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="header-avatar-placeholder" 
                      style={{display: userProfile.avatar ? 'none' : 'flex'}}
                    >
                      {userProfile.username?.charAt(0)?.toUpperCase() || address?.charAt(2)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="header-user-info">
                    <span className="header-username">
                      {userProfile.username || `Usuario ${address?.slice(-4)}`}
                    </span>
                    <span className="header-address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </div>
                </div>
              </div>
            )}
            <ConnectButton />
          </div>
        </header>

        {/* Advanced Search Bar */}
        <section className="search-section">
          <div className="container">
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <div className="search-input-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar eventos, artistas, venues..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchSuggestions(true)
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                />
                <button type="submit" className="search-btn">
                  🔍
                </button>
                
                {showSearchSuggestions && searchQuery && (
                  <div className="search-suggestions">
                    <div className="suggestions-header">
                      <span>Sugerencias</span>
                      <span className="suggestions-count">{getSearchSuggestions().length} resultados</span>
                    </div>
                    {getSearchSuggestions().map(event => (
                      <div 
                        key={event.id} 
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(event)}
                      >
                        <div className="suggestion-content">
                          <span className="suggestion-title">{event.title}</span>
                          <span className="suggestion-details">{event.artist} • {event.venue}</span>
                        </div>
                        <span className="suggestion-price">{event.price} ETH</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="filters-bar">
          <div className="container">
            <div className="filters-header">
              <div className="filters-left">
                <button 
                  className={`filter-toggle ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  🎛️ Filtros {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
                </button>
                
                <div className="active-filters">
                  {activeFilters.category.map(cat => (
                    <span key={cat} className="filter-pill">
                      {cat} <button onClick={() => handleFilterChange('category', cat)}>×</button>
                    </span>
                  ))}
                  {activeFilters.genre.map(genre => (
                    <span key={genre} className="filter-pill">
                      {genre} <button onClick={() => handleFilterChange('genre', genre)}>×</button>
                    </span>
                  ))}
                  {activeFilters.location && (
                    <span className="filter-pill">
                      📍 {activeFilters.location} <button onClick={() => handleFilterChange('location', '')}>×</button>
                    </span>
                  )}
                  {activeFilters.availability !== 'all' && (
                    <span className="filter-pill">
                      🎫 {activeFilters.availability === 'high' ? 'Alta disponibilidad' : 
                          activeFilters.availability === 'medium' ? 'Media disponibilidad' : 'Poca disponibilidad'} 
                      <button onClick={() => handleFilterChange('availability', 'all')}>×</button>
                    </span>
                  )}
                  {activeFilters.timeOfDay !== 'all' && (
                    <span className="filter-pill">
                      🕐 {activeFilters.timeOfDay === 'morning' ? 'Mañana' :
                          activeFilters.timeOfDay === 'afternoon' ? 'Tarde' :
                          activeFilters.timeOfDay === 'evening' ? 'Noche' : 'Madrugada'}
                      <button onClick={() => handleFilterChange('timeOfDay', 'all')}>×</button>
                    </span>
                  )}
                  {activeFilters.venueType !== 'all' && (
                    <span className="filter-pill">
                      🏟️ {activeFilters.venueType === 'stadium' ? 'Estadio' :
                           activeFilters.venueType === 'arena' ? 'Arena' :
                           activeFilters.venueType === 'theater' ? 'Teatro' :
                           activeFilters.venueType === 'club' ? 'Club' : 'Al aire libre'}
                      <button onClick={() => handleFilterChange('venueType', 'all')}>×</button>
                    </span>
                  )}
                  {activeFilters.favorites && (
                    <span className="filter-pill">
                      ❤️ Mis Favoritos
                      <button onClick={() => handleFilterChange('favorites', false)}>×</button>
                    </span>
                  )}
                  {getActiveFilterCount() > 0 && (
                    <>
                      <button className="save-search" onClick={() => setShowSaveSearch(true)}>
                        💾 Guardar búsqueda
                      </button>
                      <button className="clear-filters" onClick={clearAllFilters}>
                        Limpiar todo
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="filters-right">
                <div className="view-controls">
                  <button 
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                  >
                    ⊞
                  </button>
                  <button 
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                  >
                    ☰
                  </button>
                </div>
                
                <select 
                  className="sort-select"
                  value={activeFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="date">Fecha</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                  <option value="popularity">Popularidad</option>
                  <option value="availability">Disponibilidad</option>
                  <option value="distance">Distancia</option>
                  <option value="alphabetical">A-Z</option>
                </select>
                
                <span className="results-count">
                  {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {showFilters && (
              <div className="filters-panel">
                {/* Saved Searches */}
                <div className="saved-searches">
                  <h4>⭐ Búsquedas Guardadas</h4>
                  <div className="saved-search-buttons">
                    {savedSearches.map(search => (
                      <button 
                        key={search.id}
                        className="saved-search-btn"
                        onClick={() => {
                          setActiveFilters(prev => ({ ...prev, ...search.filters }))
                        }}
                      >
                        {search.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Quick Filters */}
                <div className="quick-filters">
                  <h4>🚀 Filtros Rápidos</h4>
                  <div className="quick-filter-buttons">
                    <button 
                      className={`quick-filter-btn ${activeFilters.priceRange[1] <= 0.02 ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priceRange', [0, 0.02])}
                    >
                      💰 Económicos (&lt;0.02 ETH)
                    </button>
                    <button 
                      className={`quick-filter-btn ${activeFilters.dateRange === 'this-week' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('dateRange', 'this-week')}
                    >
                      📅 Esta Semana
                    </button>
                    <button 
                      className={`quick-filter-btn ${activeFilters.availability === 'high' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('availability', 'high')}
                    >
                      🎫 Alta Disponibilidad
                    </button>
                    <button 
                      className={`quick-filter-btn ${activeFilters.timeOfDay === 'evening' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('timeOfDay', 'evening')}
                    >
                      🌙 Eventos Nocturnos
                    </button>
                    <button 
                      className={`quick-filter-btn ${activeFilters.category.includes('Festival') ? 'active' : ''}`}
                      onClick={() => handleFilterChange('category', 'Festival')}
                    >
                      🎪 Festivales
                    </button>
                    <button 
                      className={`quick-filter-btn ${activeFilters.venueType === 'outdoor' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('venueType', 'outdoor')}
                    >
                      🌳 Al Aire Libre
                    </button>
                    <button 
                      className={`quick-filter-btn ${activeFilters.favorites ? 'active' : ''}`}
                      onClick={() => handleFilterChange('favorites', true)}
                    >
                      ❤️ Mis Favoritos ({favorites.length})
                    </button>
                  </div>
                </div>
                
                <div className="filters-grid">
                  <div className="filter-group">
                    <h4>Categoría</h4>
                    {['Concierto', 'Festival', 'Show', 'Teatro', 'Deportes'].map(category => (
                      <label key={category} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={activeFilters.category.includes(category)}
                          onChange={() => handleFilterChange('category', category)}
                        />
                        <span className="checkmark"></span>
                        {category}
                      </label>
                    ))}
                  </div>
                  
                  <div className="filter-group">
                    <h4>Género Musical</h4>
                    {['Rock/Pop', 'Electrónica', 'Tango', 'Pop/Folk', 'Múltiple', 'Jazz', 'Musical', 'Fútbol'].map(genre => (
                      <label key={genre} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={activeFilters.genre.includes(genre)}
                          onChange={() => handleFilterChange('genre', genre)}
                        />
                        <span className="checkmark"></span>
                        {genre}
                      </label>
                    ))}
                  </div>
                  
                  <div className="filter-group">
                    <h4>Rango de Precio (ETH)</h4>
                    <div className="price-range">
                      <input
                        type="range"
                        min="0"
                        max="0.25"
                        step="0.001"
                        value={activeFilters.priceRange[0]}
                        onChange={(e) => handleFilterChange('priceRange', [parseFloat(e.target.value), activeFilters.priceRange[1]])}
                        className="range-slider"
                      />
                      <input
                        type="range"
                        min="0"
                        max="0.25"
                        step="0.001"
                        value={activeFilters.priceRange[1]}
                        onChange={(e) => handleFilterChange('priceRange', [activeFilters.priceRange[0], parseFloat(e.target.value)])}
                        className="range-slider"
                      />
                      <div className="price-display">
                        {activeFilters.priceRange[0]} - {activeFilters.priceRange[1]} ETH
                      </div>
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <h4>Ubicación</h4>
                    <input
                      type="text"
                      className="location-input"
                      placeholder="Ciudad o país..."
                      value={activeFilters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-group">
                    <h4>Fecha</h4>
                    <select 
                      value={activeFilters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="date-select"
                    >
                      <option value="">Cualquier fecha</option>
                      <option value="today">Hoy</option>
                      <option value="tomorrow">Mañana</option>
                      <option value="this-week">Esta semana</option>
                      <option value="this-month">Este mes</option>
                      <option value="next-month">Próximo mes</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <h4>Disponibilidad</h4>
                    <select 
                      value={activeFilters.availability}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      className="date-select"
                    >
                      <option value="all">Cualquier disponibilidad</option>
                      <option value="high">Alta disponibilidad (1000+)</option>
                      <option value="medium">Media disponibilidad (100-999)</option>
                      <option value="low">Poca disponibilidad (&lt;100)</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <h4>Horario del Evento</h4>
                    <select 
                      value={activeFilters.timeOfDay}
                      onChange={(e) => handleFilterChange('timeOfDay', e.target.value)}
                      className="date-select"
                    >
                      <option value="all">Cualquier horario</option>
                      <option value="morning">Mañana (06:00 - 12:00)</option>
                      <option value="afternoon">Tarde (12:00 - 18:00)</option>
                      <option value="evening">Noche (18:00 - 22:00)</option>
                      <option value="night">Madrugada (22:00 - 06:00)</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <h4>Tipo de Venue</h4>
                    <select 
                      value={activeFilters.venueType}
                      onChange={(e) => handleFilterChange('venueType', e.target.value)}
                      className="date-select"
                    >
                      <option value="all">Cualquier venue</option>
                      <option value="stadium">🏟️ Estadio</option>
                      <option value="arena">🏢 Arena/Coliseo</option>
                      <option value="theater">🎭 Teatro</option>
                      <option value="club">🍻 Club/Bar</option>
                      <option value="outdoor">🌳 Al aire libre</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Events Results */}
        <section className="events-results">
          <div className="container">
            {filteredEvents.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🎭</div>
                <h3>No encontramos eventos</h3>
                <p>Prueba ajustando tus filtros o busca términos diferentes</p>
                <button className="btn glow-pulse" onClick={clearAllFilters}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className={`events-grid ${viewMode}`}>
                {filteredEvents.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-image">
                      <OptimizedImage 
                        src={event.image} 
                        alt={event.title}
                        priority={false}
                        sizes="400px"
                        blur={true}
                      />
                      <div className="event-overlay">
                        <span className="event-category">{event.category}</span>
                        <span className="event-available">{event.available.toLocaleString()} disponibles</span>
                      </div>
                    </div>
                    <div className="event-content">
                      <div className="event-header">
                        <h3 className="event-title">{event.title}</h3>
                        <div className="event-price">
                          <span className="price">{event.price} ETH</span>
                          <span className="currency">Base Network</span>
                        </div>
                      </div>
                      <div className="event-details">
                        <p className="event-artist">🎤 {event.artist}</p>
                        <p className="event-venue">📍 {event.venue}, {event.city}</p>
                        <p className="event-datetime">🗓️ {new Date(event.date).toLocaleDateString('es-ES')} • {event.time}</p>
                        <p className="event-genre">🎵 {event.genre}</p>
                      </div>
                      <div className="event-tags">
                        {event.tags.map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                      <div className="event-actions">
                        <button 
                          className="btn-primary glow-pulse"
                          onClick={() => openEventModal(event)}
                        >
                          Comprar Ticket
                        </button>
                        <button 
                          className={`btn-secondary ${isFavorite(event.id) ? 'favorite-active' : ''}`}
                          onClick={() => toggleFavorite(event.id)}
                          title={isFavorite(event.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        >
                          {isFavorite(event.id) ? '❤️' : '♡'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 TicketSafer - Powered by Blockchain</p>
          </div>
        </footer>

        {/* Event Detail Modal */}
        {showEventModal && selectedEvent && (
          <div className="modal-overlay" onClick={closeEventModal}>
            <div className="event-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeEventModal}>×</button>
              
              <div className="modal-content">
                <div className="modal-header">
                  <div className="modal-image">
                    <OptimizedImage 
                      src={selectedEvent.image} 
                      alt={selectedEvent.title}
                      priority={true}
                      sizes="600px"
                      blur={true}
                    />
                    <div className="modal-image-overlay">
                      <span className="modal-category">{selectedEvent.category}</span>
                      <span className="modal-available">{selectedEvent.available.toLocaleString()} disponibles</span>
                    </div>
                  </div>
                  
                  <div className="modal-info">
                    <h2 className="modal-title">{selectedEvent.title}</h2>
                    <div className="modal-price">
                      <span className="price-label">Desde</span>
                      <span className="price-amount">{selectedEvent.price} ETH</span>
                      <span className="price-currency">Base Network</span>
                    </div>
                    
                    <div className="modal-details">
                      <div className="detail-item">
                        <span className="detail-icon">🎤</span>
                        <div className="detail-text">
                          <span className="detail-label">Artista</span>
                          <span className="detail-value">{selectedEvent.artist}</span>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <div className="detail-text">
                          <span className="detail-label">Venue</span>
                          <span className="detail-value">{selectedEvent.venue}, {selectedEvent.city}</span>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">🗓️</span>
                        <div className="detail-text">
                          <span className="detail-label">Fecha y Hora</span>
                          <span className="detail-value">
                            {new Date(selectedEvent.date).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })} • {selectedEvent.time}
                          </span>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">🎵</span>
                        <div className="detail-text">
                          <span className="detail-label">Género</span>
                          <span className="detail-value">{selectedEvent.genre}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="modal-description">
                      <h4>Descripción del Evento</h4>
                      <p>{selectedEvent.description}</p>
                    </div>
                    
                    <div className="modal-tags">
                      {selectedEvent.tags.map(tag => (
                        <span key={tag} className="modal-tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="modal-ticket-selection">
                  <h3>Selecciona tu Ticket</h3>
                  
                  <div className="ticket-options">
                    <div className="ticket-option">
                      <div className="ticket-info">
                        <span className="ticket-type">General</span>
                        <span className="ticket-description">Acceso general al evento</span>
                      </div>
                      <div className="ticket-price">
                                                    <span className="ticket-amount">{selectedEvent.price} ETH</span>
                        <button 
                          className="ticket-select-btn"
                          onClick={() => openCheckout(selectedEvent, 'general')}
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                    
                    <div className="ticket-option premium">
                      <div className="ticket-info">
                        <span className="ticket-type">VIP ⭐</span>
                        <span className="ticket-description">Acceso VIP + Meet & Greet</span>
                      </div>
                      <div className="ticket-price">
                                                    <span className="ticket-amount">{(selectedEvent.price * 2.5).toFixed(3)} ETH</span>
                        <button 
                          className="ticket-select-btn premium"
                          onClick={() => openCheckout(selectedEvent, 'vip')}
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                    
                    <div className="ticket-option exclusive">
                      <div className="ticket-info">
                        <span className="ticket-type">Platinum 💎</span>
                        <span className="ticket-description">Experiencia completa + Backstage</span>
                      </div>
                      <div className="ticket-price">
                                                    <span className="ticket-amount">{(selectedEvent.price * 4).toFixed(3)} ETH</span>
                        <button 
                          className="ticket-select-btn exclusive"
                          onClick={() => openCheckout(selectedEvent, 'platinum')}
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <div className="modal-info-section">
                    <div className="availability-status">
                      <span className="status-icon">🎫</span>
                      <span>
                        {selectedEvent.available > 1000 ? 'Alta disponibilidad' : 
                         selectedEvent.available > 100 ? 'Disponibilidad media' : 'Últimos tickets'}
                      </span>
                    </div>
                    
                    <div className="secure-info">
                      <span className="secure-icon">🔒</span>
                      <span>Compra segura con Blockchain</span>
                    </div>
                  </div>
                  
                  <div className="action-buttons">
                    <button 
                      className={`btn-favorite-large ${isFavorite(selectedEvent.id) ? 'favorite-active' : ''}`}
                      onClick={() => toggleFavorite(selectedEvent.id)}
                      title={isFavorite(selectedEvent.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      {isFavorite(selectedEvent.id) ? '❤️ Favorito' : '♡ Agregar a Favoritos'}
                    </button>
                    <button className="btn-secondary-large" onClick={closeEventModal}>
                      Cerrar
                    </button>
                    <button 
                      className="btn-primary-large glow-pulse"
                      onClick={() => openCheckout(selectedEvent, 'general')}
                    >
                      🛒 Proceder al Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Checkout Modal */}
        {showCheckout && selectedEvent && (
          <div className="modal-overlay" onClick={closeCheckout}>
            <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeCheckout}>×</button>
              
              <div className="checkout-header">
                <h2>🛒 Checkout - {selectedEvent.title}</h2>
                <div className="checkout-steps">
                  <div className={`step ${checkoutStep >= 1 ? 'active' : ''} ${checkoutStep > 1 ? 'completed' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Tickets</span>
                  </div>
                  <div className={`step ${checkoutStep >= 2 ? 'active' : ''} ${checkoutStep > 2 ? 'completed' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Información</span>
                  </div>
                  <div className={`step ${checkoutStep >= 3 ? 'active' : ''} ${checkoutStep > 3 ? 'completed' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-label">Pago</span>
                  </div>
                  <div className={`step ${checkoutStep >= 4 ? 'active' : ''}`}>
                    <span className="step-number">4</span>
                    <span className="step-label">Confirmación</span>
                  </div>
                </div>
              </div>

              <div className="checkout-content">
                {/* Paso 1: Selección de Tickets */}
                {checkoutStep === 1 && (
                  <div className="checkout-step">
                    <h3>Selecciona tus Tickets</h3>
                    <div className="ticket-selection">
                      <div className="ticket-types">
                        <div className="ticket-type-card">
                          <div className="ticket-type-info">
                            <h4>🎫 General</h4>
                            <p>Acceso general al evento</p>
                            <div className="ticket-price-large">{selectedEvent.price} ETH</div>
                          </div>
                          <div className="ticket-quantity">
                            <button 
                              onClick={() => updateTicketQuantity('general', 
                                (selectedTickets.find(t => t.type === 'general')?.quantity || 0) - 1)}
                              disabled={!(selectedTickets.find(t => t.type === 'general')?.quantity > 0)}
                            >-</button>
                            <span>{selectedTickets.find(t => t.type === 'general')?.quantity || 0}</span>
                            <button onClick={() => addTicketType('general', selectedEvent.price)}>+</button>
                          </div>
                        </div>

                        <div className="ticket-type-card vip">
                          <div className="ticket-type-info">
                            <h4>⭐ VIP</h4>
                            <p>Acceso VIP + Meet & Greet</p>
                            <div className="ticket-price-large">{(selectedEvent.price * 2.5).toFixed(3)} ETH</div>
                          </div>
                          <div className="ticket-quantity">
                            <button 
                              onClick={() => updateTicketQuantity('vip', 
                                (selectedTickets.find(t => t.type === 'vip')?.quantity || 0) - 1)}
                              disabled={!(selectedTickets.find(t => t.type === 'vip')?.quantity > 0)}
                            >-</button>
                            <span>{selectedTickets.find(t => t.type === 'vip')?.quantity || 0}</span>
                            <button onClick={() => addTicketType('vip', (selectedEvent.price * 2.5))}>+</button>
                          </div>
                        </div>

                        <div className="ticket-type-card platinum">
                          <div className="ticket-type-info">
                            <h4>💎 Platinum</h4>
                            <p>Experiencia completa + Backstage</p>
                            <div className="ticket-price-large">{(selectedEvent.price * 4).toFixed(3)} ETH</div>
                          </div>
                          <div className="ticket-quantity">
                            <button 
                              onClick={() => updateTicketQuantity('platinum', 
                                (selectedTickets.find(t => t.type === 'platinum')?.quantity || 0) - 1)}
                              disabled={!(selectedTickets.find(t => t.type === 'platinum')?.quantity > 0)}
                            >-</button>
                            <span>{selectedTickets.find(t => t.type === 'platinum')?.quantity || 0}</span>
                            <button onClick={() => addTicketType('platinum', (selectedEvent.price * 4))}>+</button>
                          </div>
                        </div>
                      </div>

                      <div className="order-summary">
                        <h4>Resumen del Pedido</h4>
                        {selectedTickets.map(ticket => (
                          <div key={ticket.type} className="order-item">
                            <span>{ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)} x{ticket.quantity}</span>
                            <span>{(ticket.price * ticket.quantity).toFixed(3)} ETH</span>
                          </div>
                        ))}
                        <div className="order-total">
                          <span>Total: ${getTotalPrice()}</span>
                          <span>{getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 2: Información Personal */}
                {checkoutStep === 2 && (
                  <div className="checkout-step">
                    <h3>Información Personal</h3>
                    <div className="customer-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nombre *</label>
                          <input
                            type="text"
                            value={customerInfo.firstName}
                            onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                            placeholder="Tu nombre"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Apellido *</label>
                          <input
                            type="text"
                            value={customerInfo.lastName}
                            onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                            placeholder="Tu apellido"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Teléfono *</label>
                          <input
                            type="tel"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                            placeholder="+54 11 1234-5678"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Documento de Identidad *</label>
                          <input
                            type="text"
                            value={customerInfo.idNumber}
                            onChange={(e) => setCustomerInfo({...customerInfo, idNumber: e.target.value})}
                            placeholder="DNI, Pasaporte, etc."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 3: Información de Pago */}
                {checkoutStep === 3 && (
                  <div className="checkout-step">
                    <h3>Método de Pago</h3>
                    <div className="payment-methods">
                      <div className="payment-tabs">
                        <button 
                          className={`payment-tab ${paymentInfo.method === 'crypto' ? 'active' : ''}`}
                          onClick={() => setPaymentInfo({...paymentInfo, method: 'crypto'})}
                        >
                          🚀 Crypto (Recomendado)
                        </button>
                        <button 
                          className={`payment-tab ${paymentInfo.method === 'card' ? 'active' : ''}`}
                          onClick={() => setPaymentInfo({...paymentInfo, method: 'card'})}
                        >
                          💳 Tarjeta de Crédito
                        </button>
                      </div>

                      {paymentInfo.method === 'crypto' && (
                        <div className="crypto-payment">
                          <div className="crypto-info">
                            <h4>🔒 Pago Seguro con Blockchain</h4>
                            <p>Conecta tu wallet para un pago rápido y seguro en Base Network. Fees súper bajos (~$0.01) comparado con Ethereum (~$50). Los tickets se generarán como NFTs únicos.</p>
                          </div>
                          <div className="crypto-options">
                            <div className="crypto-option">
                              <span>🔵</span>
                              <span>Ethereum Mainnet</span>
                              <span className="crypto-price">{getTotalPrice()} ETH (~$50 fees)</span>
                            </div>
                            <div className="crypto-option selected">
                              <span>🔷</span>
                              <span>Base Network (Recomendado)</span>
                              <span className="crypto-price">{getTotalPrice()} ETH (~$0.01 fees)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentInfo.method === 'card' && (
                        <div className="card-payment">
                          <div className="form-group">
                            <label>Número de Tarjeta *</label>
                            <input
                              type="text"
                              value={paymentInfo.cardNumber}
                              onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                              placeholder="1234 5678 9012 3456"
                              maxLength="19"
                              required
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Fecha de Vencimiento *</label>
                              <input
                                type="text"
                                value={paymentInfo.expiryDate}
                                onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                                placeholder="MM/YY"
                                maxLength="5"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>CVV *</label>
                              <input
                                type="text"
                                value={paymentInfo.cvv}
                                onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                                placeholder="123"
                                maxLength="4"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 4: Confirmación */}
                {checkoutStep === 4 && (
                  <div className="checkout-step">
                    <div className="confirmation-success">
                      <div className="success-icon">🎉</div>
                      <h3>¡Compra Exitosa!</h3>
                      <p>Tu orden ha sido procesada exitosamente. Los tickets han sido generados como NFTs únicos.</p>
                      
                      <div className="order-confirmation">
                        <h4>Detalles del Pedido</h4>
                        <div className="confirmation-detail">
                          <span>Evento:</span>
                          <span>{selectedEvent.title}</span>
                        </div>
                        <div className="confirmation-detail">
                          <span>Fecha:</span>
                          <span>{new Date(selectedEvent.date).toLocaleDateString('es-ES')} • {selectedEvent.time}</span>
                        </div>
                        <div className="confirmation-detail">
                          <span>Venue:</span>
                          <span>{selectedEvent.venue}, {selectedEvent.city}</span>
                        </div>
                        <div className="confirmation-detail">
                          <span>Tickets:</span>
                          <span>{getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="confirmation-detail total">
                          <span>Total Pagado:</span>
                          <span>{getTotalPrice()} ETH</span>
                        </div>
                      </div>

                      <div className="confirmation-actions">
                        <button className="btn-primary-large">
                          📧 Enviar por Email
                        </button>
                        <button className="btn-secondary-large">
                          📱 Ver en Wallet
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="checkout-footer">
                <div className="checkout-nav">
                  {checkoutStep > 1 && checkoutStep < 4 && (
                    <button className="btn-secondary-large" onClick={prevCheckoutStep}>
                      ← Anterior
                    </button>
                  )}
                  
                  <div className="checkout-total">
                    <span>Total: {getTotalPrice()} ETH</span>
                    <span>{getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''}</span>
                  </div>

                  {checkoutStep < 3 && (
                    <button 
                      className="btn-primary-large glow-pulse" 
                      onClick={nextCheckoutStep}
                      disabled={checkoutStep === 1 && selectedTickets.length === 0}
                    >
                      Continuar →
                    </button>
                  )}
                  
                  {checkoutStep === 3 && (
                    <button 
                      className="btn-primary-large glow-pulse" 
                      onClick={nextCheckoutStep}
                    >
                      💳 Confirmar Pago
                    </button>
                  )}

                  {checkoutStep === 4 && (
                    <button 
                      className="btn-primary-large glow-pulse" 
                      onClick={closeCheckout}
                    >
                      ✅ Finalizar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="ticket-safer">
      {/* Elementos Decorativos Metálicos */}
      <div className="wireframe-grid"></div>
      <div className="metallic-orb metallic-orb-1"></div>
      <div className="metallic-orb metallic-orb-2"></div>
      <div className="metallic-orb metallic-orb-3"></div>
      <div className="metallic-orb metallic-orb-4"></div>
      <div className="geometric-shape geometric-triangle"></div>
      <div className="geometric-shape geometric-diamond"></div>
      <div className="geometric-shape geometric-sphere"></div>
      <div className="geometric-shape geometric-cube"></div>
      
      <header className="header">
        <div className="container">
          <h1 className="logo">🎫 TicketSafer</h1>
                      <nav className="nav">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('events')
                }} 
                className={currentView === 'events' || currentView === 'search-results' ? 'active' : ''}
              >
                Eventos
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('my-tickets')
                }} 
                className={currentView === 'my-tickets' ? 'active' : ''}
              >
                Mis Tickets
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('create-event')
                }} 
                className={currentView === 'create-event' ? 'active' : ''}
              >
                Crear Evento
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                  setDashboardView('favorites')
                }} 
                className={`nav-favorites ${currentView === 'dashboard' && dashboardView === 'favorites' ? 'active' : ''}`}
                title={`Mis Favoritos (${favorites.length})`}
              >
                <span className="favorites-heart">❤️</span>
                <span className="favorites-count">{favorites.length}</span>
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentView('dashboard')
                }} 
                className={currentView === 'dashboard' ? 'active' : ''}
              >
                Dashboard
              </a>
            </nav>
          <div className="header-user-section">
            {isConnected ? (
              <div className="header-user-profile">
                <div className="header-avatar">
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt="Avatar" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                  ) : null}
                  <div className="header-avatar-placeholder" style={{
                    display: userProfile.avatar ? 'none' : 'flex'
                  }}>
                    {address?.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="header-user-info">
                  <span className="header-username">
                    {userProfile.username || `Usuario ${address?.slice(-4)}`}
                  </span>
                  <span className="header-address">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <ConnectButton />
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <h2 className="neon-flicker">Tickets NFT Seguros y Verificables</h2>
            <p>Compra, vende y transfiere tickets de eventos usando <strong>Base Network</strong>. 
               Pagos en ETH con fees súper bajos. Sin falsificaciones, sin problemas.</p>
            
            <div className="network-info">
              <div className="network-card">
                <span className="network-icon">🔷</span>
                <div className="network-details">
                  <h4>Base Network (L2)</h4>
                  <p>Layer 2 de Ethereum con fees ultra bajos</p>
                  <span className="network-benefit">~$0.01 por transacción</span>
                </div>
              </div>
              <div className="network-card">
                <span className="network-icon">⚡</span>
                <div className="network-details">
                  <h4>Confirmación Rápida</h4>
                  <p>Transacciones confirmadas en 1-2 minutos</p>
                  <span className="network-benefit">10x más rápido que Ethereum</span>
                </div>
              </div>
              <div className="network-card">
                <span className="network-icon">💎</span>
                <div className="network-details">
                  <h4>Mismo ETH</h4>
                  <p>Misma moneda, red más eficiente</p>
                  <span className="network-benefit">Compatible con wallets Ethereum</span>
                </div>
              </div>
            </div>
            
            {/* Hero Search Bar */}
            <div className="hero-search">
              <form className="search-form hero-search-form" onSubmit={handleSearchSubmit}>
                <div className="search-input-container">
                  <input
                    type="text"
                    className="search-input hero-search-input"
                    placeholder="🔍 Buscar eventos, artistas, venues..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowSearchSuggestions(true)
                    }}
                    onFocus={() => setShowSearchSuggestions(true)}
                  />
                  <button type="submit" className="search-btn hero-search-btn">
                    Buscar
                  </button>
                  
                  {showSearchSuggestions && searchQuery && (
                    <div className="search-suggestions hero-suggestions">
                      <div className="suggestions-header">
                        <span>Eventos sugeridos</span>
                        <span className="suggestions-count">{getSearchSuggestions().length} encontrados</span>
                      </div>
                      {getSearchSuggestions().map(event => (
                        <div 
                          key={event.id} 
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(event)}
                        >
                          <div className="suggestion-content">
                            <span className="suggestion-title">{event.title}</span>
                            <span className="suggestion-details">{event.artist} • {event.city}</span>
                          </div>
                          <span className="suggestion-price">{event.price} ETH</span>
                        </div>
                      ))}
                      <div className="suggestions-footer">
                        <button onClick={() => setCurrentView('events')} className="view-all-btn">
                          Ver todos los eventos →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {!isConnected && (
              <div className="cta">
                <p>Conecta tu wallet para comenzar</p>
              </div>
            )}
          </section>

          {/* Featured Events Preview */}
          <section className="featured-events">
            <div className="section-header">
              <h3>🔥 Eventos Destacados</h3>
              <button 
                className="btn-secondary"
                onClick={() => setCurrentView('events')}
              >
                Ver todos
              </button>
            </div>
            <div className="events-preview">
              {mockEvents.slice(0, 3).map(event => (
                <div key={event.id} className="event-card-preview">
                  <div className="event-image">
                    <OptimizedImage 
                      src={event.image} 
                      alt={event.title}
                      priority={true}
                      sizes="350px"
                      blur={true}
                    />
                    <div className="event-overlay">
                      <span className="event-category">{event.category}</span>
                    </div>
                  </div>
                  <div className="event-content">
                    <h4 className="event-title">{event.title}</h4>
                    <p className="event-artist">{event.artist}</p>
                    <p className="event-date">{new Date(event.date).toLocaleDateString('es-ES')}</p>
                    <div className="event-price-preview">
                      <span>{event.price} ETH</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {isConnected && (
            <section className="dashboard">
              <h3>Bienvenido, {address?.slice(0, 6)}...{address?.slice(-4)}</h3>
              
              <div className="grid">
                <div className="card">
                  <h4>🎪 Próximos Eventos</h4>
                  <p>Descubre eventos increíbles con tickets NFT</p>
                  <button 
                    className="btn glow-pulse"
                    onClick={() => setCurrentView('events')}
                  >
                    Ver Eventos
                  </button>
                </div>
                
                <div className="card">
                  <h4>🎫 Mis Tickets</h4>
                  <p>Gestiona tus tickets NFT</p>
                  <button 
                    className="btn glow-pulse"
                    onClick={() => setCurrentView('my-tickets')}
                  >
                    Ver Collection
                  </button>
                </div>
                
                <div className="card">
                  <h4>✨ Crear Evento</h4>
                  <p>Organiza tu evento con tickets NFT</p>
                  <button 
                    className="btn glow-pulse"
                    onClick={() => setCurrentView('create-event')}
                  >
                    Crear Evento
                  </button>
                </div>
                
                <div className="card">
                  <h4>🎛️ Dashboard</h4>
                  <p>Gestiona tu perfil y configuración</p>
                  <button 
                    className="btn glow-pulse"
                    onClick={() => setCurrentView('dashboard')}
                  >
                    Ir al Dashboard
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="features">
            <h3>¿Por qué TicketSafer?</h3>
            <div className="features-grid">
              <div className="feature">
                <span className="icon">🔒</span>
                <h4>Seguro</h4>
                <p>Blockchain garantiza autenticidad</p>
              </div>
              <div className="feature">
                <span className="icon">🌐</span>
                <h4>Descentralizado</h4>
                <p>Tú controlas tus tickets</p>
              </div>
              <div className="feature">
                <span className="icon">💎</span>
                <h4>Coleccionable</h4>
                <p>Tickets como NFTs únicos</p>
              </div>
              <div className="feature">
                <span className="icon">🔄</span>
                <h4>Transferible</h4>
                <p>Revende de forma segura</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 TicketSafer - Powered by Blockchain</p>
        </div>
      </footer>
    </div>
  )
}

export default TicketSafer 