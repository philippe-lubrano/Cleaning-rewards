import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { useState } from 'react'

export default function SelectUser() {
  const { users, selectUser, updateUserName } = useApp()
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const handleSelect = (userId) => {
    selectUser(userId)
    navigate('/dashboard')
  }

  const startEdit = (e, user) => {
    e.stopPropagation()
    setEditingId(user.id)
    setEditName(user.name)
  }

  const saveEdit = (e) => {
    e.preventDefault()
    if (editName.trim()) {
      updateUserName(editingId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-stone-50 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <span className="text-5xl mb-4 block">🏠</span>
        <h1 className="text-2xl font-bold text-stone-700 mb-2">Cleaning Rewards</h1>
        <p className="text-stone-400 text-sm">Qui fait le ménage aujourd'hui ?</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
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
              <button
                onClick={() => handleSelect(user.id)}
                className="w-full bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex items-center justify-between hover:shadow-md hover:border-teal-200 transition-all active:scale-[0.98]"
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
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-stone-300 mt-10">
        Appuyez sur votre prénom pour commencer
      </p>
    </div>
  )
}
