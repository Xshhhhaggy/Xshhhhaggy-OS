import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function WalkSession() {
  const navigate = useNavigate()
  const [isActive, setIsActive] = useState(true)
  const [duration, setDuration] = useState(0)
  const [distance, setDistance] = useState(0)
  const [frictionCount, setFrictionCount] = useState(0)
  const [showPreWalk, setShowPreWalk] = useState(true)
  const [showCompletion, setShowCompletion] = useState(false)
  const [postWalkMessage, setPostWalkMessage] = useState('')
  const [watchId, setWatchId] = useState<number | null>(null)
  const [positions, setPositions] = useState<{lat: number, lng: number}[]>([])
  const startTimeRef = useRef(Date.now())

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  // Start GPS tracking
  useEffect(() => {
    if (!isActive || showPreWalk) return

    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setPositions(prev => {
            if (prev.length > 0) {
              const last = prev[prev.length - 1]
              const newDistance = calculateDistance(last.lat, last.lng, newPos.lat, newPos.lng)
              setDistance(d => d + newDistance)
            }
            return [...prev, newPos]
          })
        },
        (err) => console.warn(err),
        { enableHighAccuracy: true }
      )
      setWatchId(id)
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [isActive, showPreWalk])

  // Timer
  useEffect(() => {
    if (!isActive || showPreWalk) return
    const timer = setInterval(() => setDuration(d => d + 1), 1000)
    return () => clearInterval(timer)
  }, [isActive, showPreWalk])

  // Log friction moment
  const logFriction = () => {
    setFrictionCount(prev => prev + 1)
    if (navigator.vibrate) navigator.vibrate(100)
  }

  // End walk
  const endWalk = () => {
    setIsActive(false)
    const actualDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const uxEarned = 10 + frictionCount * 2 + Math.floor(actualDuration / 60)
    
    setPostWalkMessage(`Great walk! ${frictionCount} insights, ${distance.toFixed(1)}km. +${uxEarned} Ux`)
    
    // Save to localStorage
    const currentUx = parseInt(localStorage.getItem('ux_balance') || '100')
    localStorage.setItem('ux_balance', (currentUx + uxEarned).toString())
    
    const currentStreak = parseInt(localStorage.getItem('streak') || '0')
    localStorage.setItem('streak', (currentStreak + 1).toString())
    
    setShowCompletion(true)
    if (navigator.vibrate) navigator.vibrate(200)
  }

  // Pre-walk screen
  if (showPreWalk) {
    return (
      <div className="min-h-screen bg-xdark flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐕</div>
          <h1 className="text-3xl font-bold text-xlime">Ready to Walk?</h1>
        </div>
        
        <div className="bg-xcard rounded-3xl p-6 w-full max-w-sm mb-6 space-y-4">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold">Friction Moments</p>
              <p className="text-xmuted text-sm">Tap when your dog reacts to triggers</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🎙️</span>
            <div>
              <p className="font-bold">Voice Notes</p>
              <p className="text-xmuted text-sm">Record observations (coming soon)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">📸</span>
            <div>
              <p className="font-bold">Snap Moments</p>
              <p className="text-xmuted text-sm">Capture body language (coming soon)</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowPreWalk(false)}
          className="w-full max-w-sm bg-xlime text-xdark py-4 rounded-2xl font-bold text-lg"
        >
          Start Walk
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="w-full max-w-sm mt-3 text-xmuted text-sm"
        >
          Cancel
        </button>
      </div>
    )
  }

  // Completion screen
  if (showCompletion) {
    return (
      <div className="min-h-screen bg-xdark flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 rounded-full bg-xcard border-2 border-xlime flex items-center justify-center text-5xl mb-6">
          🐕
        </div>
        <div className="bg-xcard rounded-3xl p-6 max-w-sm text-center mb-6">
          <p className="text-white text-lg">{postWalkMessage}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-xlime">{Math.floor(duration / 60)}</p>
            <p className="text-xmuted text-xs">minutes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-xlime">{distance.toFixed(1)}</p>
            <p class="text-xmuted text-xs">km</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-xred">{frictionCount}</p>
            <p className="text-xmuted text-xs">insights</p>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/')}
          className="w-full max-w-sm bg-xlime text-xdark py-3 rounded-2xl font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  // Active walk screen
  return (
    <div className="fixed inset-0 bg-xdark">
      {/* Simple map placeholder - Leaflet will be added later */}
      <div className="absolute inset-0 bg-gradient-to-br from-xsurface to-xdark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-2">🗺️</div>
          <p className="text-xmuted text-sm">GPS tracking active</p>
          <p className="text-xs text-xmuted mt-1">{positions.length} locations recorded</p>
        </div>
      </div>
      
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-xcard flex items-center justify-center text-xl">
            🐕
          </div>
          <span className="font-mono text-xl font-bold text-xlime">
            {formatTime(duration)}
          </span>
        </div>
        <button
          onClick={endWalk}
          className="bg-xred/90 text-white px-4 py-2 rounded-full text-sm font-bold"
        >
          End Walk
        </button>
      </div>
      
      {/* Stats overlay */}
      <div className="absolute top-20 right-4 bg-black/60 backdrop-blur-md rounded-xl px-3 py-2">
        <div className="text-xs text-xmuted">Distance</div>
        <div className="text-sm font-bold text-xlime">{distance.toFixed(2)} km</div>
      </div>
      
      {frictionCount > 0 && (
        <div className="absolute top-20 left-4 bg-xred/80 backdrop-blur-md rounded-xl px-3 py-2">
          <div className="text-xs text-white">Moments</div>
          <div className="text-sm font-bold text-white">{frictionCount}</div>
        </div>
      )}
      
      {/* Bottom controls */}
      <div className="absolute bottom-6 left-4 right-4 bg-black/70 backdrop-blur-lg rounded-3xl p-4">
        <div className="flex justify-around">
          <button
            onClick={logFriction}
            className="bg-xcard px-6 py-3 rounded-2xl flex flex-col items-center"
          >
            <span className="text-2xl">⚠️</span>
            <span className="text-xs mt-1">Friction</span>
          </button>
          <button className="bg-xcard px-6 py-3 rounded-2xl flex flex-col items-center opacity-50">
            <span className="text-2xl">🎙️</span>
            <span className="text-xs mt-1">Voice</span>
          </button>
          <button className="bg-xcard px-6 py-3 rounded-2xl flex flex-col items-center opacity-50">
            <span className="text-2xl">📸</span>
            <span className="text-xs mt-1">Snap</span>
          </button>
        </div>
      </div>
    </div>
  )
}
