import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './auth/Auth'
import './index.css'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-xdark flex flex-col items-center justify-center p-5">
      <div className="text-6xl mb-4">🐕</div>
      <h1 className="text-4xl font-bold text-xlime mb-2">Welcome Back!</h1>
      <p className="text-xmuted text-center mb-6">Your dog training companion</p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="bg-xcard border border-xborder text-xmuted px-6 py-3 rounded-full"
      >
        Sign Out
      </button>
    </div>
  )
}

export default App
