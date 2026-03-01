import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { useState } from 'react'

export default function SelectUser() {
  const { foyerPseudo, users, loginWithPseudo, logoutFoyer, selectUser, updateUserName } = useApp()
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [pseudo, setPseudo] = useState('')

  const handleSelect = async (userId) => {
    const selected = await selectUser(userId)
    if (selected) {
      navigate('/dashboard')
    }
  }

  const startEdit = (e, user) => {
    e.stopPropagation()
    setEditingId(user.id)
    setEditName(user.name)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (editName.trim()) {
      await updateUserName(editingId, editName.trim())
    }
    setEditingId(null)
  }

  const handlePseudoSubmit = async (e) => {
    e.preventDefault()
    const normalized = await loginWithPseudo(pseudo)
    if (normalized) {
      setPseudo('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-stone-50 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <span className="text-5xl mb-4 block">🏠</span>
        <h1 className="text-2xl font-bold text-stone-700 mb-2">Cleaning Rewards</h1>
        <p className="text-stone-400 text-sm">
          {foyerPseudo ? "Qui fait le ménage aujourd'hui ?" : 'Entre le pseudo de ton foyer'}
        </p>
      </div>

      {!foyerPseudo && (
        <form onSubmit={handlePseudoSubmit} className="w-full max-w-sm space-y-3">
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="ex: maison-dupond"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
          <button
            type="submit"
            className="w-full bg-teal-500 text-white rounded-xl px-4 py-3 font-medium hover:bg-teal-600"
          >
            Continuer
          </button>
        </form>
      )}

      {foyerPseudo && (
        <div className="w-full max-w-sm mb-4 flex items-center justify-between bg-white/70 border border-stone-200 rounded-xl px-3 py-2">
          <p className="text-xs text-stone-500 truncate">Foyer: {foyerPseudo}</p>
          <button
            type="button"
            onClick={logoutFoyer}
            className="text-xs text-rose-500 hover:text-rose-600"
          >
            Changer
          </button>
        </div>
      )}

      {foyerPseudo && <div className="w-full max-w-sm space-y-4">
        {users.map((user) => (
          <div key={user.id}>
            {editingId === user.id ? (
              <form onSubmit={saveEdit} className="flex gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-teal-500 text-white rounded-xl px-4 py-3 font-medium"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="bg-stone-200 text-stone-600 rounded-xl px-4 py-3"
                >
                  ✕
                </button>
              </form>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(user.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(user.id)}
                className="w-full bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex items-center justify-between hover:shadow-md hover:border-teal-200 transition-all active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-stone-700">{user.name}</p>
                    <p className="text-sm text-amber-500">⭐ {user.points} points</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => startEdit(e, user)}
                    className="text-stone-300 hover:text-stone-500 text-sm p-1"
                    title="Modifier le prénom"
                  >
                    ✏️
                  </button>
                  <span className="text-stone-300 text-xl">›</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>}

      {foyerPseudo && (
        <p className="text-xs text-stone-300 mt-10">
          Appuyez sur votre prénom pour commencer
        </p>
      )}
    </div>
  )
}
