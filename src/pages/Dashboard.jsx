import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { Target, BookOpen, Flame, Plus, Check, Trash2 } from 'lucide-react'

export default function Dashboard({ session }) {
  const [goals, setGoals] = useState([])
  const [newGoal, setNewGoal] = useState('')
  const [profile, setProfile] = useState(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const userId = session.user.id

    // fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(profileData)

    // fetch today's goals
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: true })
    setGoals(goalsData || [])

    // calculate streak
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (logs) {
      let s = 0
      let current = new Date()
      for (let log of logs) {
        const logDate = new Date(log.date)
        const diff = Math.floor((current - logDate) / (1000 * 60 * 60 * 24))
        if (diff <= 1) { s++; current = logDate }
        else break
      }
      setStreak(s)
    }

    setLoading(false)
  }

  const addGoal = async () => {
    if (!newGoal.trim()) return
    const { data } = await supabase
      .from('goals')
      .insert({ user_id: session.user.id, date: today, title: newGoal })
      .select()
      .single()
    setGoals([...goals, data])
    setNewGoal('')
  }

  const toggleGoal = async (goal) => {
    await supabase
      .from('goals')
      .update({ completed: !goal.completed })
      .eq('id', goal.id)
    setGoals(goals.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g))
  }

  const deleteGoal = async (id) => {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(goals.filter(g => g.id !== id))
  }

  const completed = goals.filter(g => g.completed).length
  const progress = goals.length ? Math.round((completed / goals.length) * 100) : 0

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-emerald-400 font-mono text-sm animate-pulse">loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar session={session} />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-emerald-400">{profile?.full_name?.split(' ')[0] || 'there'}</span> ✈
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Target size={16} className="text-emerald-400" />
              </div>
              <span className="text-gray-400 text-sm">Today's Goals</span>
            </div>
            <div className="text-white text-2xl font-bold">{completed}/{goals.length}</div>
            <div className="mt-2 bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Flame size={16} className="text-orange-400" />
              </div>
              <span className="text-gray-400 text-sm">Day Streak</span>
            </div>
            <div className="text-white text-2xl font-bold">{streak} <span className="text-orange-400">🔥</span></div>
            <p className="text-gray-500 text-xs mt-1">keep it going</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <BookOpen size={16} className="text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Daily Log</span>
            </div>
            <Link
              to="/log"
              className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
            >
              write today's log →
            </Link>
          </div>
        </div>

        {/* goals */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target size={16} className="text-emerald-400" />
            Today's Micro Goals
          </h2>

          {/* add goal */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGoal()}
              placeholder="add a goal for today..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              onClick={addGoal}
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* goals list */}
          <div className="space-y-2">
            {goals.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">no goals yet — add one above</p>
            )}
            {goals.map(goal => (
              <div
                key={goal.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  goal.completed
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-gray-800 bg-gray-800/50'
                }`}
              >
                <button
                  onClick={() => toggleGoal(goal)}
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    goal.completed
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-gray-600 hover:border-emerald-500'
                  }`}
                >
                  {goal.completed && <Check size={12} className="text-gray-950" />}
                </button>
                <span className={`flex-1 text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                  {goal.title}
                </span>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
