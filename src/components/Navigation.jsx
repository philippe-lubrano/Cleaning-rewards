import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Accueil', icon: '🏠' },
  { to: '/tasks', label: 'Tâches', icon: '✅' },
  { to: '/admin', label: 'Gérer', icon: '⚙️' },
  { to: '/rewards', label: 'Boutique', icon: '🎁' },
  { to: '/history', label: 'Historique', icon: '📋' },
]

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-30">
      <div className="max-w-lg mx-auto flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                isActive
                  ? 'text-teal-600 font-semibold'
                  : 'text-stone-400 hover:text-stone-600'
              }`
            }
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
