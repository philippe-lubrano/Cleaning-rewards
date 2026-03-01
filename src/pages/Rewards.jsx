import { useState } from 'react'
import { useApp } from '../context/useApp'
import Modal from '../components/Modal'

export default function Rewards() {
  const { currentUser, users, rewards, history, addReward, editReward, removeReward, buyReward } =
    useApp()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', cost: '' })
  const [purchasedId, setPurchasedId] = useState(null)

  const partner = users.find((u) => u.id !== currentUser.id)

  // Rewards created by the current user = things the partner can buy
  // Rewards created by the partner = things the current user can buy
  const myCreated = rewards.filter((r) => r.created_by === currentUser.id)
  const forMe = rewards.filter((r) => r.created_by !== currentUser.id)
  const purchasedRewardIds = new Set(
    history
      .filter((entry) => entry.type === 'reward' && entry.user_id === currentUser.id)
      .map((entry) => entry.reference_id)
  )
  const availableForMe = forMe.filter((reward) => !purchasedRewardIds.has(reward.id))
  const purchasedForMe = forMe.filter((reward) => purchasedRewardIds.has(reward.id))

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', cost: '' })
    setModalOpen(true)
  }

  const openEdit = (reward) => {
    setEditing(reward)
    setForm({ name: reward.name, cost: String(reward.cost) })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      name: form.name.trim(),
      cost: parseInt(form.cost, 10) || 0,
    }
    if (!data.name || data.cost <= 0) return

    if (editing) {
      editReward(editing.id, data)
    } else {
      addReward({ ...data, created_by: currentUser.id })
    }
    setModalOpen(false)
  }

  const handleBuy = (reward) => {
    if (currentUser.points < reward.cost) return
    const result = buyReward(reward.id)
    if (result) {
      setPurchasedId(reward.id)
      setTimeout(() => setPurchasedId(null), 2000)
    }
  }

  const handleDelete = (reward) => {
    if (window.confirm(`Supprimer "${reward.name}" ?`)) {
      removeReward(reward.id)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-stone-700">🎁 Boutique</h2>

      {/* Rewards I can buy */}
      <div>
        <h3 className="text-xs font-semibold text-teal-500 uppercase tracking-wide mb-3">
          Récompenses disponibles pour toi
        </h3>
        {availableForMe.length === 0 ? (
          <div className="text-center py-6 bg-white/60 rounded-xl border border-stone-100">
            <p className="text-stone-400 text-sm">
              {partner?.name || 'Ton partenaire'} n'a pas encore créé de récompenses
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableForMe.map((reward) => (
              <div
                key={reward.id}
                className={`bg-white rounded-xl border px-4 py-4 transition-all ${
                  purchasedId === reward.id
                    ? 'border-green-300 bg-green-50'
                    : 'border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-700">{reward.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Créé par {users.find((u) => u.id === reward.created_by)?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleBuy(reward)}
                    disabled={
                      currentUser.points < reward.cost || purchasedId === reward.id
                    }
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      purchasedId === reward.id
                        ? 'bg-green-100 text-green-600'
                        : currentUser.points >= reward.cost
                        ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {purchasedId === reward.id
                      ? '🎉 Acheté !'
                      : `🛒 ${reward.cost} pts`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
          Récompenses déjà achetées
        </h3>
        {purchasedForMe.length === 0 ? (
          <div className="text-center py-6 bg-white/60 rounded-xl border border-stone-100">
            <p className="text-stone-400 text-sm">Aucune récompense achetée pour le moment</p>
          </div>
        ) : (
          <div className="space-y-2">
            {purchasedForMe.map((reward) => (
              <div key={reward.id} className="bg-stone-50 rounded-xl border border-stone-200 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-600">{reward.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Créé par {users.find((u) => u.id === reward.created_by)?.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="rounded-xl px-4 py-2 text-sm font-medium bg-stone-100 text-stone-400 cursor-not-allowed"
                  >
                    🛒 {reward.cost} pts
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rewards I created */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            Mes récompenses créées (pour {partner?.name || 'ton partenaire'})
          </h3>
          <button
            onClick={openNew}
            className="bg-teal-500 text-white rounded-xl px-3 py-1.5 text-xs font-medium hover:bg-teal-600 active:scale-95 transition-all"
          >
            + Créer
          </button>
        </div>
        {myCreated.length === 0 ? (
          <div className="text-center py-6 bg-white/60 rounded-xl border border-stone-100">
            <p className="text-stone-400 text-sm">
              Crée des récompenses pour {partner?.name || 'ton partenaire'} !
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {myCreated.map((reward) => (
              <div
                key={reward.id}
                className="bg-white rounded-xl border border-stone-200 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-700">{reward.name}</p>
                    <p className="text-xs text-stone-400">🏷️ {reward.cost} points</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(reward)}
                      className="text-stone-400 hover:text-teal-600 text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(reward)}
                      className="text-stone-400 hover:text-rose-500 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier la récompense' : 'Nouvelle récompense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              placeholder="Ex: Massage d'1 heure"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Coût (en points)
            </label>
            <input
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              placeholder="100"
              min="1"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white rounded-xl py-3 font-medium hover:bg-teal-600 active:scale-[0.98] transition-all"
          >
            {editing ? 'Enregistrer' : 'Créer la récompense'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
