import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/useApp'
import Navigation from './Navigation'
import NotificationBanner from './NotificationBanner'

export default function Layout() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <h1 className="text-lg font-semibold text-stone-700">Cleaning Rewards</h1>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              ⭐ {currentUser.points} pts
            </span>
            <button
              onClick={handleLogout}
              className="text-stone-400 hover:text-stone-600 text-sm"
              title="Changer de profil"
            >
              👋
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      <NotificationBanner />

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      {location.pathname !== '/' && <Navigation />}
    </div>
  )
}
