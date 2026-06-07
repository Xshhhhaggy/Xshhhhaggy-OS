import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './auth/Auth'
import Dashboard from './owner/Dashboard'
import WalkSession from './owner/WalkSession'
import Store from './owner/Store'
import JournalSync from './owner/JournalSync'
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/walk" element={<WalkSession />} />
        <Route path="/store" element={<Store />} />
        <Route path="/journal" element={<JournalSync />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
