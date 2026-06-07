import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Cutler Bay, FL location
const HOME_LOCATION = { lat: 25.56965, lng: -80.327372 }

interface ScentLocation {
  id: string
  lat: number
  lng: number
  scentType: 'fear' | 'excitement' | 'calm' | 'curiosity'
  points: number
  collected: boolean
  fact: string
}

const SCENT_LOCATIONS: ScentLocation[] = [
  {
    id: '1',
    lat: 25.56965,
    lng: -80.327372,
    scentType: 'calm',
    points: 50,
    collected: false,
    fact: "🐕 A dog's nose has 300 million scent receptors (humans have 5 million)"
  },
  {
    id: '2',
    lat: 25.57100,
    lng: -80.325000,
    scentType: 'curiosity',
    points: 40,
    collected: false,
    fact: '👃 Dogs can smell in 3D - each nostril samples air independently'
  },
  {
    id: '3',
    lat: 25.56800,
    lng: -80.329000,
    scentType: 'excitement',
    points: 30,
    collected: false,
    fact: '⚡ The part of a dog\'s brain dedicated to smell is 40x larger than humans'
  },
  {
    id: '4',
    lat: 25.57200,
    lng: -80.326000,
    scentType: 'fear',
    points: 60,
    collected: false,
    fact: '😨 Dogs can smell human emotions - fear releases adrenaline they detect'
  },
  {
    id: '5',
    lat: 25.56700,
    lng: -80.328000,
    scentType: 'calm',
    points: 45,
    collected: false,
    fact: '🌿 Sniffing lowers a dog\'s heart rate - it\'s their meditation'
  }
]

function MapController({ center, onLocationChange }: { center: [number, number]; onLocationChange: (lat: number, lng: number) => void }) {
  const map = useMap()
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    map.setView(center, 16)

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newLocation: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          map.setView(newLocation, 18)
          onLocationChange(pos.coords.latitude, pos.coords.longitude)
        },
        (err) => console.warn(err),
        { enableHighAccuracy: true }
      )
    }

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [map, center, onLocationChange])

  return null
}

export default function Sniffari() {
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState<[number, number]>([HOME_LOCATION.lat, HOME_LOCATION.lng])
  const [scentLocations, setScentLocations] = useState<ScentLocation[]>(SCENT_LOCATIONS)
  const [score, setScore] = useState(0)
  const [collectedCount, setCollectedCount] = useState(0)
  const [showFact, setShowFact] = useState<{ fact: string; points: number } | null>(null)
  const [timeLeft, setTimeLeft] = useState(300)
  const [gameActive, setGameActive] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)

  // Timer
  useEffect(() => {
    if (!gameActive || showInstructions) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameActive, showInstructions])

  // Check proximity to scent locations
  useEffect(() => {
    if (!gameActive || showInstructions) return

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    }

    scentLocations.forEach(scent => {
      if (!scent.collected) {
        const distance = calculateDistance(userLocation[0], userLocation[1], scent.lat, scent.lng)
        if (distance < 0.03) {
          collectScent(scent.id)
        }
      }
    })
  }, [userLocation, scentLocations, gameActive, showInstructions])

  const collectScent = (scentId: string) => {
    const scent = scentLocations.find(s => s.id === scentId)
    if (!scent || scent.collected) return

    setScentLocations(prev => prev.map(s =>
      s.id === scentId ? { ...s, collected: true } : s
    ))
    setScore(prev => prev + scent.points)
    setCollectedCount(prev => prev + 1)
    setShowFact({ fact: scent.fact, points: scent.points })

    // Add Ux to main app
    const currentUx = parseInt(localStorage.getItem('ux_balance') || '100')
    localStorage.setItem('ux_balance', (currentUx + scent.points).toString())

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(200)

    // Auto-hide fact after 3 seconds
    setTimeout(() => setShowFact(null), 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScentEmoji = (type: string) => {
    switch(type) {
      case 'fear': return '😨'
      case 'excitement': return '⚡'
      case 'calm': return '😌'
      case 'curiosity': return '🤔'
      default: return '👃'
    }
  }

  const getScentColor = (type: string) => {
    switch(type) {
      case 'fear': return '#C0392B'
      case 'excitement': return '#B7FF00'
      case 'calm': return '#00D5FF'
      case 'curiosity': return '#7A00FF'
      default: return '#B7FF00'
    }
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-xdark flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👃</div>
          <h1 className="text-3xl font-bold text-xlime mb-2">XCOOBY's Sniffari</h1>
          <p className="text-xmuted">A scent-hunting adventure</p>
        </div>

        <div className="bg-xcard rounded-3xl p-6 w-full max-w-sm mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🗺️</span>
            <div>
              <p className="font-bold">Walk to find scents</p>
              <p className="text-xmuted text-sm">Real GPS tracks your movement</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-bold">Collect all 5 scents</p>
              <p className="text-xmuted text-sm">Each teaches a dog behavior fact</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-bold">Earn Ux + Streak</p>
              <p className="text-xmuted text-sm">30-60 Ux per scent collected</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowInstructions(false)}
          className="w-full max-w-sm bg-xlime text-xdark py-4 rounded-2xl font-bold text-lg"
        >
          Start Sniffari
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full max-w-sm mt-3 text-xmuted text-sm"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (!gameActive) {
    const totalPossible = SCENT_LOCATIONS.reduce((sum, s) => sum + s.points, 0)
    const percentage = (score / totalPossible) * 100

    return (
      <div className="min-h-screen bg-xdark flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '🌱'}</div>
          <h1 className="text-3xl font-bold text-xlime mb-2">Sniffari Complete!</h1>
        </div>

        <div className="bg-xcard rounded-3xl p-6 w-full max-w-sm text-center mb-6">
          <p className="text-4xl font-bold text-xlime mb-2">{score}</p>
          <p className="text-xmuted">Ux earned</p>
          <div className="mt-4 h-2 bg-xsurface rounded-full overflow-hidden">
            <div className="h-full bg-xlime rounded-full" style={{ width: `${percentage}%` }} />
          </div>
          <p className="text-sm text-xmuted mt-2">{collectedCount}/5 scents found</p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full max-w-sm bg-xlime text-xdark py-3 rounded-2xl font-bold mb-3"
        >
          Play Again
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full max-w-sm bg-xcard border border-xborder text-xmuted py-3 rounded-2xl"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-xdark">
      <MapContainer
        center={userLocation}
        zoom={16}
        className="h-full w-full"
        style={{ background: '#0A0D12' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Scent markers */}
        {scentLocations.map(scent => !scent.collected && (
          <Marker
            key={scent.id}
            position={[scent.lat, scent.lng]}
            icon={L.divIcon({
              html: `<div style="background: ${getScentColor(scent.scentType)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; animation: pulse 1s infinite;">${getScentEmoji(scent.scentType)}</div>`,
              className: 'custom-marker',
              iconSize: [30, 30]
            })}
          >
            <Popup>+{scent.points} Ux</Popup>
          </Marker>
        ))}
        
        {/* User marker */}
        <Marker
          position={userLocation}
          icon={L.divIcon({
            html: '<div style="background: #00D5FF; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #00D5FF;"></div>',
            className: 'user-marker',
            iconSize: [20, 20]
          })}
        />
        
        <MapController center={userLocation} onLocationChange={(lat, lng) => setUserLocation([lat, lng])} />
      </MapContainer>

      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-md p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="font-bold text-xlime">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-mono text-xl font-bold text-white">{formatTime(timeLeft)}</span>
          </div>
          <button onClick={() => setGameActive(false)} className="bg-xred/80 p-2 rounded-full">
            <span className="text-white">✕</span>
          </button>
        </div>

        {/* Progress */}
        <div className="mt-2 h-1 bg-xcard rounded-full overflow-hidden">
          <div
            className="h-full bg-xlime rounded-full transition-all"
            style={{ width: `${(collectedCount / scentLocations.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Fact popup */}
      {showFact && (
        <div className="absolute bottom-24 left-4 right-4 bg-xlime rounded-2xl p-4 animate-slideUp">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-xdark font-bold">+{showFact.points} Ux</p>
              <p className="text-xdark text-sm">{showFact.fact}</p>
            </div>
          </div>
        </div>
      )}

      {/* Compass indicator */}
      <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md rounded-full p-3">
        <span className="text-2xl animate-pulse">🧭</span>
      </div>

      {/* Remaining scents count */}
      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md rounded-full px-4 py-2">
        <span className="text-xlime font-bold">{scentLocations.filter(s => !s.collected).length}</span>
        <span className="text-xmuted text-sm ml-1">scents left</span>
      </div>
    </div>
  )
}
