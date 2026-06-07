import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Challenge {
  id: string
  name: string
  description: string
  requirement_type: string
  requirement_amount: number
  reward_ux: number
  progress: number
  completed: boolean
}

export default function DailyChallenge() {
  const navigate = useNavigate()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load streak from localStorage
    const currentStreak = parseInt(localStorage.getItem('streak') || '0')
    setStreak(currentStreak)

    // Load challenges
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        name: 'Morning Sniffari',
        description: 'Let your dog sniff for 10 minutes on your walk',
        requirement_type: 'sniff_time',
        requirement_amount: 10,
        reward_ux: 25,
        progress: 0,
        completed: false
      },
      {
        id: '2',
        name: 'Friction Finder',
        description: 'Log 3 friction moments',
        requirement_type: 'friction_logs',
        requirement_amount: 3,
        reward_ux: 30,
        progress: 0,
        completed: false
      },
      {
        id: '3',
        name: 'Pack Walker',
        description: 'Walk 5000 steps with your dog',
        requirement_type: 'steps',
        requirement_amount: 5000,
        reward_ux: 40,
        progress: 0,
        completed: false
      }
    ]

    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem('challenge_progress')
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress)
      const updatedChallenges = mockChallenges.map(challenge => ({
        ...challenge,
        progress: parsed[challenge.id]?.progress || 0,
        completed: parsed[challenge.id]?.completed || false
      }))
      setChallenges(updatedChallenges)
    } else {
      setChallenges(mockChallenges)
    }

    setLoading(false)
  }, [])

  const claimReward = (challengeId: string, rewardUx: number) => {
    // Update challenge completion
    const updatedChallenges = challenges.map(challenge =>
      challenge.id === challengeId
        ? { ...challenge, completed: true }
        : challenge
    )
    setChallenges(updatedChallenges)

    // Save to localStorage
    const progressToSave: Record<string, any> = {}
    updatedChallenges.forEach(c => {
      progressToSave[c.id] = { progress: c.progress, completed: c.completed }
    })
    localStorage.setItem('challenge_progress', JSON.stringify(progressToSave))

    // Add Ux to user balance
    const currentUx = parseInt(localStorage.getItem('ux_balance') || '100')
    localStorage.setItem('ux_balance', (currentUx + rewardUx).toString())

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(200)

    alert(`🎉 You earned +${rewardUx} Ux!`)
  }

  const getRequirementIcon = (type: string) => {
    switch(type) {
      case 'sniff_time': return '👃'
      case 'friction_logs': return '⚠️'
      case 'steps': return '👣'
      default: return '🎯'
    }
  }

  const getRequirementText = (type: string, amount: number) => {
    switch(type) {
      case 'sniff_time': return `${amount} minutes of sniffing`
      case 'friction_logs': return `${amount} friction moments`
      case 'steps': return `${amount.toLocaleString()} steps`
      default: return `${amount}`
    }
  }

  // Simulate progress update from walk (in real app, this comes from WalkSession)
  const updateProgress = (challengeId: string, increment: number) => {
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        const newProgress = Math.min(challenge.progress + increment, challenge.requirement_amount)
        return { ...challenge, progress: newProgress }
      }
      return challenge
    })
    setChallenges(updatedChallenges)

    // Save to localStorage
    const progressToSave: Record<string, any> = {}
    updatedChallenges.forEach(c => {
      progressToSave[c.id] = { progress: c.progress, completed: c.completed }
    })
    localStorage.setItem('challenge_progress', JSON.stringify(progressToSave))
  }

  // For demo, add buttons to simulate progress
  const simulateProgress = (challengeId: string) => {
    updateProgress(challengeId, 1)
  }

  return (
    <div className="bg-xcard rounded-3xl p-5">
      {/* Streak Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-bold text-lg">{streak}</p>
            <p className="text-xs text-xmuted">day streak</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-xmuted">
          <span>⏰</span>
          <span>Resets daily at midnight</span>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎯</span>
        <h2 className="font-bold text-lg">Daily Challenges</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-xlime border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map(challenge => (
            <div
              key={challenge.id}
              className={`bg-xsurface rounded-2xl p-4 transition ${
                challenge.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getRequirementIcon(challenge.requirement_type)}</span>
                  <div>
                    <p className="font-bold text-sm">{challenge.name}</p>
                    <p className="text-xs text-xmuted">{challenge.description}</p>
                  </div>
                </div>
                {challenge.completed ? (
                  <span className="text-xlime text-xl">✅</span>
                ) : (
                  <span className="text-xlime text-sm font-bold">+{challenge.reward_ux} Ux</span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-xmuted mb-1">
                  <span>Progress</span>
                  <span>{challenge.progress} / {challenge.requirement_amount}</span>
                </div>
                <div className="h-2 bg-xcard rounded-full overflow-hidden">
                  <div
                    className="h-full bg-xlime rounded-full transition-all"
                    style={{ width: `${(challenge.progress / challenge.requirement_amount) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-xmuted mt-1">
                  Goal: {getRequirementText(challenge.requirement_type, challenge.requirement_amount)}
                </p>
              </div>

              {/* Action Buttons */}
              {!challenge.completed && (
                <div className="flex gap-2 mt-3">
                  {challenge.progress >= challenge.requirement_amount ? (
                    <button
                      onClick={() => claimReward(challenge.id, challenge.reward_ux)}
                      className="w-full bg-xlime text-xdark py-2 rounded-xl text-sm font-bold"
                    >
                      Claim +{challenge.reward_ux} Ux
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/walk')}
                      className="w-full bg-xcard border border-xlime text-xlime py-2 rounded-xl text-sm font-bold"
                    >
                      Go for a Walk →
                    </button>
                  )}
                </div>
              )}

              {/* Demo progress buttons (remove in production) */}
              {process.env.NODE_ENV === 'development' && !challenge.completed && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => simulateProgress(challenge.id)}
                    className="w-full bg-xsurface text-xs py-1 rounded text-xmuted"
                  >
                    Simulate +1
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Streak Bonus Info */}
      <div className="mt-4 pt-3 border-t border-xborder">
        <div className="flex items-center justify-between text-xs">
          <span className="text-xmuted">7-day streak bonus</span>
          <span className="text-xlime">+25 Ux</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-xmuted">14-day streak bonus</span>
          <span className="text-xlime">+50 Ux</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-xmuted">30-day streak bonus</span>
          <span className="text-xlime">+100 Ux + Badge</span>
        </div>
      </div>
    </div>
  )
}
