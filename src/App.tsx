import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './auth/Auth'
import Dashboard from './owner/Dashboard'
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

  return <Dashboard />
}

export default App
