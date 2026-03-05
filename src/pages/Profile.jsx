import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { User, Edit3, Save, Github, BookOpen, Target, Flame } from 'lucide-react'

export default function Profile({ session }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [college, setCollege] = useState('')
  const [logs, setLogs] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const userId = session.user.id

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileData) {
      setProfile(profileData)
      setFullName(profileData.full_name || '')
      setBio(profileData.bio || '')
      setCollege(profileData.college || '')
    }

    const { data: logsData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    setLogs(logsData || [])

    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
    setGoals(goalsData || [])

    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ full_name: fullName, bio, college })
      .eq('id', session.user.id)
    setProfile({ ...profile, full_name: fullName, bio, college })
    setEditing(false)
    setSaving(false)
  }

  // build contribution graph — last 52 weeks
  const buildGraph = () => {
    const weeks = []
    const today = new Date()
    const logDates = new Set(logs.map(l => l.date))

    for (let w = 51; w >= 0; w--) {
      const week = []
      for (let d = 6; d >= 0; d--) {
        const date = new Date(today)
        date.setDate(today.getDate() - (w * 7 + d))
        const dateStr = date.toISOString().split('T')[0]
        week.push({
          date: dateStr,
          active: logDates.has(dateStr),
          future: date > today
        })
      }
      weeks.push(week)
    }
    return weeks
  }

  const completedGoals = goals.filter(g => g.completed).length
  const totalGoals = goals.length
  const weeks = buildGraph()

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-emerald-400 font-mono text-sm animate-pulse">loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar session={session} />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* profile card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <User size={28} className="text-emerald-400" />
              </div>
              <div>
                {editing ? (
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-lg font-bold outline-none focus:border-emerald-500 mb-1 block"
                  />
                ) : (
                  <h1 className="text-white text-xl font-bold">{profile?.full_name || 'Your Name'}</h1>
                )}
                <p className="text-gray-400 text-sm">@{profile?.username}</p>
                <p className="text-gray-500 text-xs">{session.user.email}</p>
              </div>
            </div>

            <button
              onClick={() => editing ? saveProfile() : setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              {editing ? (
                saving ? 'saving...' : <><Save size={14} /> save</>
              ) : (
                <><Edit3 size={14} /> edit</>
              )}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {editing ? (
              <>
                <input
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  placeholder="college / university"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500"
                />
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="write something about yourself..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500 resize-none"
                />
              </>
            ) : (
              <>
                {profile?.college && <p className="text-gray-400 text-sm">🎓 {profile.college}</p>}
                {profile?.bio && <p className="text-gray-300 text-sm">{profile.bio}</p>}
              </>
            )}
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-emerald-400 text-2xl font-bold">{logs.length}</div>
            <div className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1">
              <BookOpen size={12} /> logs
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-orange-400 text-2xl font-bold">{completedGoals}</div>
            <div className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1">
              <Target size={12} /> goals done
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-blue-400 text-2xl font-bold">
              {totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0}%
            </div>
            <div className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1">
              <Flame size={12} /> completion
            </div>
          </div>
        </div>

        {/* contribution graph */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">
            {logs.length} logs in the last year
          </h2>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      title={day.date}
                      className={`w-3 h-3 rounded-sm transition-colors ${
                        day.future
                          ? 'bg-gray-800'
                          : day.active
                          ? 'bg-emerald-500'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-gray-500 text-xs">less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-800" />
            <div className="w-3 h-3 rounded-sm bg-emerald-900" />
            <div className="w-3 h-3 rounded-sm bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-gray-500 text-xs">more</span>
          </div>
        </div>

        {/* recent logs */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Recent Logs</h2>
          <div className="space-y-3">
            {logs.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">no logs yet — start writing daily!</p>
            )}
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="border-b border-gray-800 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-xs">{log.date}</span>
                  <span className="text-base">
                    {['😞','😕','😐','🙂','😄'][log.mood - 1]}
                  </span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">{log.summary}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
