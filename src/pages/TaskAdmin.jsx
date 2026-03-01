import { useState } from 'react'
import { useApp } from '../context/useApp'
import Modal from '../components/Modal'

export default function TaskAdmin() {
  const { currentUser, tasks, addTask, editTask, removeTask, updateUserName } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', points: '', recurrence_days: '' })

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', points: '', recurrence_days: '' })
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditing(task)
    setForm({
      name: task.name,
      points: String(task.points),
      recurrence_days: String(task.recurrence_days),
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      name: form.name.trim(),
      points: parseInt(form.points, 10) || 0,
      recurrence_days: parseInt(form.recurrence_days, 10) || 1,
    }
    if (!data.name) return

    if (editing) {
      await editTask(editing.id, data)
    } else {
      await addTask(data)
    }
    setModalOpen(false)
  }

  const handleDelete = async (task) => {
    if (window.confirm(`Supprimer "${task.name}" ?`)) {
      await removeTask(task.id)
    }
  }

  const handleUpdateFirstName = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('firstName') || '').trim()
    if (!name || !currentUser) return
    await updateUserName(currentUser.id, name)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-700">Gérer les Tâches</h2>
        <button
          onClick={openNew}
          className="bg-teal-500 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-teal-600 active:scale-95 transition-all"
        >
          + Ajouter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
          Modifier ton prénom
        </h3>
        <form key={currentUser?.id} onSubmit={handleUpdateFirstName} className="flex justify-between gap-2">
          <input
            type="text"
            name="firstName"
            defaultValue={currentUser?.name || ''}
            className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 max-w-[180px]"
            placeholder="Ton prénom"
            required
          />
          <button
            type="submit"
            className="bg-teal-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-teal-600 active:scale-95 transition-all"
          >
            Enregistrer
          </button>
        </form>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">📝</span>
          <p className="text-stone-400">Aucune tâche pour le moment</p>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-xl border border-stone-200 px-4 py-3"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-stone-700">{task.name}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(task)}
                  className="text-stone-400 hover:text-teal-600 text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(task)}
                  className="text-stone-400 hover:text-rose-500 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-stone-400">
              <span>⭐ {task.points} points</span>
              <span>
                🔄 Tous les {task.recurrence_days} jour{task.recurrence_days > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier la tâche' : 'Nouvelle tâche'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              placeholder="Ex: Passer l'aspirateur"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Points</label>
              <input
                type="number"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
                placeholder="10"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Récurrence (jours)
              </label>
              <input
                type="number"
                value={form.recurrence_days}
                onChange={(e) => setForm({ ...form, recurrence_days: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
                placeholder="3"
                min="1"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white rounded-xl py-3 font-medium hover:bg-teal-600 active:scale-[0.98] transition-all"
          >
            {editing ? 'Enregistrer' : 'Créer la tâche'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
