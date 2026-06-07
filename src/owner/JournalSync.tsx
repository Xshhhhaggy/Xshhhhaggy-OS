import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function JournalSync() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [journalPages, setJournalPages] = useState<any[]>([])
  const [qrCode, setQrCode] = useState('')
  const [syncing, setSyncing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Generate QR code for this user
    const userId = localStorage.getItem('user_id') || 'guest'
    const qrData = `${window.location.origin}/sync/${userId}/${Date.now()}`
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`)
    
    // Load existing journal pages
    const saved = localStorage.getItem('journal_pages')
    if (saved) {
      setJournalPages(JSON.parse(saved))
    }
  }, [])

  const startScanner = async () => {
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      console.error('Camera error:', err)
      alert('Please allow camera access to scan QR codes')
      setScanning(false)
    }
  }

  const captureAndSync = async () => {
    if (!videoRef.current || !canvasRef.current) return
    
    setSyncing(true)
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    
    const imageData = canvas.toDataURL('image/jpeg')
    
    // Simulate OCR/text extraction (in production, use actual OCR API)
    setTimeout(() => {
      const newPage = {
        id: Date.now(),
        image: imageData,
        text: `Journal entry from ${new Date().toLocaleDateString()}\n\nWalked for 30 minutes. No reactivity. Practiced engage-disengage at the park.`,
        date: new Date().toLocaleDateString(),
        syncedAt: new Date().toISOString()
      }
      
      const updatedPages = [newPage, ...journalPages]
      setJournalPages(updatedPages)
      localStorage.setItem('journal_pages', JSON.stringify(updatedPages))
      
      setSyncing(false)
      setScanning(false)
      
      // Stop camera
      const stream = videoRef.current?.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      
      if (navigator.vibrate) navigator.vibrate(200)
    }, 2000)
  }

  const stopScanner = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setScanning(false)
  }

  return (
    <div className="min-h-screen bg-xdark pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-xdark/95 backdrop-blur-md border-b border-xborder p-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-xlime text-xl">
            ←
          </button>
          <h1 className="text-xl font-bold text-xlime">Smart Journal</h1>
        </div>
      </div>

      <div className="p-5">
        {/* QR Code Section */}
        <div className="bg-xcard rounded-3xl p-6 text-center mb-6">
          <h2 className="font-bold text-lg mb-3">Your Sync QR Code</h2>
          {qrCode && (
            <img 
              src={qrCode} 
              alt="Sync QR Code" 
              className="w-48 h-48 mx-auto mb-3 bg-white rounded-xl p-2"
            />
          )}
          <p className="text-xs text-xmuted">
            Scan this QR code from your XCOOBY journal to sync pages
          </p>
          <p className="text-xs text-xmuted mt-2">
            📓 Works with any Rocketbook-style notebook
          </p>
        </div>

        {/* Scanner Section */}
        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full bg-xlime text-xdark py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mb-6"
          >
            📷 Scan Journal Page
          </button>
        ) : (
          <div className="bg-xcard rounded-3xl p-4 mb-6">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-2xl"
                autoPlay
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-xlime rounded-2xl pointer-events-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={captureAndSync}
                disabled={syncing}
                className="flex-1 bg-xlime text-xdark py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {syncing ? '⏳ Syncing...' : '📸 Sync This Page'}
              </button>
              <button
                onClick={stopScanner}
                className="flex-1 bg-xcard border border-xborder py-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Synced Pages History */}
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            📚 Synced Pages ({journalPages.length})
          </h2>
          
          {journalPages.length === 0 ? (
            <div className="text-center py-12 text-xmuted bg-xcard rounded-3xl">
              <div className="text-5xl mb-3">📓</div>
              <p>No pages synced yet</p>
              <p className="text-xs mt-2">Scan your journal to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journalPages.map(page => (
                <div key={page.id} className="bg-xcard rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xlime">✅</span>
                      <span className="text-xs text-xmuted">{page.date}</span>
                    </div>
                    <span className="text-xs bg-xsurface px-2 py-1 rounded-full">
                      Synced
                    </span>
                  </div>
                  <p className="text-sm text-xmuted">{page.text}</p>
                  {page.image && (
                    <img 
                      src={page.image} 
                      alt="Journal page" 
                      className="mt-3 rounded-xl max-h-32 w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-xsurface border-t border-xborder flex justify-around py-3">
        <button onClick={() => navigate('/')} className="text-xs text-xmuted">Home</button>
        <button onClick={() => navigate('/walk')} className="text-xs text-xmuted">Walk</button>
        <button onClick={() => navigate('/store')} className="text-xs text-xmuted">Store</button>
        <button className="text-xs text-xlime">Journal</button>
      </div>
    </div>
  )
}
