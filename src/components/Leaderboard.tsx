import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface LeaderboardEntry {
  id: string
  dog_name: string
  weekly_steps: number
  weekly_walks: number
  weekly_ux: number
  streak_days: number
  rank: number
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly')

  useEffect(() => {
    // Load mock leaderboard data
    const mockData: LeaderboardEntry[] = [
      { id: '1', dog_name: 'Luna', weekly_steps: 45000, weekly_walks: 12, weekly_ux: 450, streak_days: 30, rank: 1 },
      { id: '2', dog_name: 'Max', weekly_steps: 38000, weekly_walks: 10, weekly_ux: 380, streak_days: 21, rank: 2 },
      { id: '3', dog_name: 'Charlie', weekly_steps: 32000, weekly_walks: 9, weekly_ux: 320, streak_days: 14, rank: 3 },
      { id: '4', dog_name: 'Bella', weekly_steps: 28000, weekly_walks: 8, weekly_ux: 280, streak_days: 10, rank: 4 },
      { id: '5', dog_name: 'Cooper', weekly_steps: 25000, weekly_walks: 7, weekly_ux: 250, streak_days: 7, rank: 5 },
      { id: '6', dog_name: 'Daisy', weekly_steps: 22000, weekly_walks: 6, weekly_ux: 220, streak_days: 5, rank: 6 },
      { id: '7', dog_name: 'Rocky', weekly_steps: 18000, weekly_walks: 5, weekly_ux: 180, streak_days: 3, rank: 7 },
      { id: '8', dog_name: 'Molly', weekly_steps: 15000, weekly_walks: 4, weekly_ux: 150, streak_days: 2, rank: 8 },
      { id: '9', dog_name: 'Bear', weekly_steps: 12000, weekly_walks: 3, weekly_ux: 120, streak_days: 1, rank: 9 },
      { id: '10', dog_name: 'XCOOBY', weekly_steps: 8000, weekly_walks: 2, weekly_ux: 80, streak_days: 1, rank: 10 },
    ]
    
    setEntries(mockData)
    
    // Get current user's dog name from localStorage
    const dogName = localStorage.getItem('dog_name') || 'XCOOBY'
    const userEntry = mockData.find(e => e.dog_name === dogName)
    if (userEntry) {
      setUserRank(userEntry)
    }
    
    setLoading(false)
  }, [timeframe])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-amber-600'
    return 'text-xmuted'
  }

  return (
    <div className="min-h-screen bg-xdark pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-xlime/20 to-xcyan/20 p-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="text-xlime text-xl">
            ←
          </button>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        </div>
        <p className="text-xmuted">Compete with the pack</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 p-4 border-b border-xborder">
        {(['weekly', 'monthly', 'alltime'] as const).map(option => (
          <button
            key={option}
            onClick={() => setTimeframe(option)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold ${
              timeframe === option 
                ? 'bg-xlime text-xdark' 
                : 'bg-xcard text-xmuted'
            }`}
          >
            {option === 'weekly' ? 'This Week' : option === 'monthly' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* User's Rank Card */}
      {userRank && (
        <div className="m-4 bg-gradient-to-r from-xlime/10 to-xcyan/10 rounded-2xl p-4 border border-xlime/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-xcard flex items-center justify-center text-2xl">
                🐕
              </div>
              <div>
                <p className="font-bold">{userRank.dog_name}</p>
                <p className="text-xs text-xmuted">Your rank</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-2xl">{getRankIcon(userRank.rank)}</span>
                <span className="text-xl font-bold text-xlime">#{userRank.rank}</span>
              </div>
              <p className="text-xs text-xmuted">{userRank.weekly_ux} Ux this week</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="px-4 space-y-2">
        <h2 className="font-bold text-xlime mb-3 flex items-center gap-2">
          🏆 Top Pack Members
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-xlime border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          entries.map(entry => (
            <div
              key={entry.id}
              className={`bg-xcard rounded-2xl p-4 flex items-center justify-between ${
                userRank?.dog_name === entry.dog_name ? 'border border-xlime' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 text-center font-bold ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <p className="font-bold">{entry.dog_name}</p>
                  <div className="flex items-center gap-2 text-xs text-xmuted">
                    <span>🔥 {entry.streak_days} day streak</span>
                    <span>⭐ {entry.weekly_ux} Ux</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xlime font-bold">{entry.weekly_steps.toLocaleString()}</p>
                <p className="text-xs text-xmuted">steps</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* How to Earn Points */}
      <div className="p-5 mt-4">
        <div className="bg-xcard rounded-2xl p-4">
          <h3 className="font-bold text-sm mb-3">📈 How to Earn Ux</h3>
          <div className="space-y-2 text-xs text-xmuted">
            <div className="flex justify-between">
              <span>🚶 Complete a walk</span>
              <span className="text-xlime">+10 Ux</span>
            </div>
            <div className="flex justify-between">
              <span>⚠️ Log a friction moment</span>
              <span className="text-xlime">+2 Ux each</span>
            </div>
            <div className="flex justify-between">
              <span>📓 Sync a journal page</span>
              <span className="text-xlime">+5 Ux</span>
            </div>
            <div className="flex justify-between">
              <span>🔥 Maintain streak (7+ days)</span>
              <span className="text-xlime">+25 Ux</span>
            </div>
            <div className="flex justify-between">
              <span>🤝 Refer a friend</span>
              <span className="text-xlime">+50 Ux</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-xsurface border-t border-xborder flex justify-around py-3">
        <button onClick={() => navigate('/')} className="text-xs text-xmuted">Home</button>
        <button onClick={() => navigate('/walk')} className="text-xs text-xmuted">Walk</button>
        <button onClick={() => navigate('/store')} className="text-xs text-xmuted">Store</button>
        <button onClick={() => navigate('/journal')} className="text-xs text-xmuted">Journal</button>
      </div>
    </div>
  )
}
