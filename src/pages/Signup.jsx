import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username,
        full_name: fullName,
      })

    if (profileError) setError(profileError.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-gray-950 font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-xl">StudentOS</span>
          </div>
          <p className="text-gray-400 text-sm">track your progress. build your future.</p>
        </div>

        {/* card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-lg mb-6">Create account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Abhishek Kumar"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="abhkpr"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              {loading ? 'creating account...' : 'Create account'}
            </button>
          </div>

          <p className="text-gray-500 text-sm text-center mt-6">
            already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300">sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
