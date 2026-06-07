import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [dogName, setDogName] = useState('XCOOBY')
  const [streak, setStreak] = useState(0)
  const [uxBalance, setUxBalance] = useState(100)

  useEffect(() => {
    setDogName(localStorage.getItem('dog_name') || 'XCOOBY')
    setStreak(parseInt(localStorage.getItem('streak') || '0'))
    setUxBalance(parseInt(localStorage.getItem('ux_balance') || '100'))
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-xdark pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-xlime/10 to-xcyan/10 p-5">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-xlime">SLOW</h1>
          <button onClick={signOut} className="text-xs text-xmuted bg-xcard px-3 py-1 rounded-full">
            Sign Out
          </button>
        </div>
        
        {/* Dog Profile Card */}
        <div className="bg-xcard/50 backdrop-blur rounded-3xl p-5 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-xlime to-xcyan flex items-center justify-center text-3xl">
              🐕
            </div>
            <div>
              <h2 className="text-2xl font-bold">{dogName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-xorange">🔥 {streak} day streak</span>
                <span className="text-sm text-xlime">⚡ {uxBalance} Ux</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/walk')}
            className="bg-xlime text-xdark p-4 rounded-2xl font-bold"
          >
            🚶 Start Walk
          </button>
          <button 
            onClick={() => navigate('/store')}
            className="bg-xcard border border-xborder p-4 rounded-2xl"
          >
            🛍️ Shop
          </button>
          <button 
            onClick={() => navigate('/journal')}
            className="bg-xcard border border-xborder p-4 rounded-2xl"
          >
            📓 Journal
          </button>
          <button className="bg-xcard border border-xborder p-4 rounded-2xl">
            🏆 Leaderboard
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-xsurface border-t border-xborder flex justify-around py-3">
        <button className="text-xs text-xlime">Home</button>
        <button onClick={() => navigate('/walk')} className="text-xs text-xmuted">Walk</button>
        <button onClick={() => navigate('/store')} className="text-xs text-xmuted">Store</button>
        <button onClick={() => navigate('/journal')} className="text-xs text-xmuted">Journal</button>
      </div>
    </div>
  )
}
