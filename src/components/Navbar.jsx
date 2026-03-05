import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, BookOpen, User, LogOut } from 'lucide-react'

export default function Navbar({ session }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/log', icon: BookOpen, label: 'Daily Log' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-gray-950 font-bold text-xs">S</span>
          </div>
          <span className="text-white font-bold">StudentOS</span>
        </Link>

        {/* links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                location.pathname === to
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:block">{label}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors ml-2"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
