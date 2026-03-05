import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import DailyLog from './pages/DailyLog'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-emerald-400 font-mono text-sm animate-pulse">loading...</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} />
      <Route path="/profile" element={session ? <Profile session={session} /> : <Navigate to="/login" />} />
      <Route path="/log" element={session ? <DailyLog session={session} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
