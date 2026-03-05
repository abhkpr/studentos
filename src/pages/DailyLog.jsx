import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { BookOpen, Sparkles, Save } from 'lucide-react'

export default function DailyLog({ session }) {
  const [summary, setSummary] = useState('')
  const [mood, setMood] = useState(3)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [existingLog, setExistingLog] = useState(null)
  const today = new Date().toISOString().split('T')[0]

  const moods = ['😞', '😕', '😐', '🙂', '😄']

  useEffect(() => {
    fetchTodayLog()
  }, [])

  const fetchTodayLog = async () => {
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', today)
      .single()

    if (data) {
      setExistingLog(data)
      setSummary(data.summary || '')
      setMood(data.mood || 3)
    }
  }

  const saveLog = async () => {
    setLoading(true)
    const logData = {
      user_id: session.user.id,
      date: today,
      summary,
      mood
    }

    if (existingLog) {
      await supabase.from('daily_logs').update(logData).eq('id', existingLog.id)
    } else {
      const { data } = await supabase.from('daily_logs').insert(logData).select().single()
      setExistingLog(data)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  const getAiSuggestion = async () => {
    if (!summary.trim()) {
      setAiSuggestion('write your daily summary first, then get AI suggestions')
      return
    }

    setAiLoading(true)
    setAiSuggestion('')

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `You are a helpful student productivity coach. A student wrote this daily learning summary:

"${summary}"

Their mood today: ${moods[mood - 1]} (${mood}/5)

Give them:
1. One specific thing they did well
2. One actionable suggestion for tomorrow
3. One motivational insight

Keep it concise, encouraging and practical. Plain text, no markdown.`
          }]
        })
      })

      const data = await response.json()
      setAiSuggestion(data.choices[0].message.content)
    } catch (err) {
      console.log(err)
      setAiSuggestion('could not get AI suggestion right now, try again later')
    }

    setAiLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar session={session} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <BookOpen size={24} className="text-emerald-400" />
            Daily Log
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* mood */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <h2 className="text-white font-semibold mb-4">How was your day?</h2>
          <div className="flex gap-4">
            {moods.map((m, i) => (
              <button
                key={i}
                onClick={() => setMood(i + 1)}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  mood === i + 1
                    ? 'bg-emerald-500/20 scale-110'
                    : 'hover:bg-gray-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <h2 className="text-white font-semibold mb-4">What did you learn today?</h2>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="summarize what you learned, built, or accomplished today..."
            rows={8}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors resize-none"
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={saveLog}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              <Save size={14} />
              {saved ? 'saved!' : loading ? 'saving...' : 'save log'}
            </button>

            <button
              onClick={getAiSuggestion}
              disabled={aiLoading}
              className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg px-4 py-2 text-sm transition-colors"
            >
              <Sparkles size={14} />
              {aiLoading ? 'thinking...' : 'get AI feedback'}
            </button>
          </div>
        </div>

        {/* ai suggestion */}
        {aiSuggestion && (
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              AI Coach
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{aiSuggestion}</p>
          </div>
        )}
      </div>
    </div>
  )
}
