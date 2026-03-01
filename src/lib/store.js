const STORAGE_KEY = 'cleaning-rewards-data'

const DEFAULT_TASKS = [
  { id: crypto.randomUUID(), name: 'Vider le lave-vaisselle', points: 10, recurrence_days: 1, next_due: new Date().toISOString() },
  { id: crypto.randomUUID(), name: "Passer l'aspirateur", points: 30, recurrence_days: 3, next_due: new Date().toISOString() },
  { id: crypto.randomUUID(), name: 'Sortir les poubelles', points: 5, recurrence_days: 2, next_due: new Date().toISOString() },
  { id: crypto.randomUUID(), name: 'Nettoyer la salle de bain', points: 50, recurrence_days: 7, next_due: new Date().toISOString() },
  { id: crypto.randomUUID(), name: 'Lancer une machine', points: 15, recurrence_days: 3, next_due: new Date().toISOString() },
]

function getDefaultData() {
  const foyerId = crypto.randomUUID()
  const user1Id = crypto.randomUUID()
  const user2Id = crypto.randomUUID()
  return {
    foyer: { id: foyerId },
    users: [
      { id: user1Id, foyer_id: foyerId, name: 'Partenaire 1', points: 0 },
      { id: user2Id, foyer_id: foyerId, name: 'Partenaire 2', points: 0 },
    ],
    tasks: DEFAULT_TASKS.map((t) => ({ ...t, foyer_id: foyerId })),
    rewards: [],
    history: [],
    notifications: [],
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  const data = getDefaultData()
  saveData(data)
  return data
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ---- Public API ----

export function getUsers() {
  return loadData().users
}

export function getUser(userId) {
  return loadData().users.find((u) => u.id === userId) || null
}

export function updateUserName(userId, name) {
  const data = loadData()
  const user = data.users.find((u) => u.id === userId)
  if (user) {
    user.name = name
    saveData(data)
  }
  return user
}

// Tasks
export function getTasks() {
  return loadData().tasks
}

export function getTask(taskId) {
  return loadData().tasks.find((t) => t.id === taskId) || null
}

export function createTask({ name, points, recurrence_days }) {
  const data = loadData()
  const task = {
    id: crypto.randomUUID(),
    foyer_id: data.foyer.id,
    name,
    points,
    recurrence_days,
    next_due: new Date().toISOString(),
  }
  data.tasks.push(task)
  saveData(data)
  return task
}

export function updateTask(taskId, updates) {
  const data = loadData()
  const idx = data.tasks.findIndex((t) => t.id === taskId)
  if (idx !== -1) {
    data.tasks[idx] = { ...data.tasks[idx], ...updates }
    saveData(data)
    return data.tasks[idx]
  }
  return null
}

export function deleteTask(taskId) {
  const data = loadData()
  data.tasks = data.tasks.filter((t) => t.id !== taskId)
  saveData(data)
}

export function completeTask(taskId, userId) {
  const data = loadData()
  const task = data.tasks.find((t) => t.id === taskId)
  const user = data.users.find((u) => u.id === userId)
  if (!task || !user) return null

  user.points += task.points

  const nextDue = new Date()
  nextDue.setDate(nextDue.getDate() + task.recurrence_days)
  task.next_due = nextDue.toISOString()

  const entry = {
    id: crypto.randomUUID(),
    foyer_id: data.foyer.id,
    user_id: userId,
    type: 'task',
    reference_id: taskId,
    description: task.name,
    points: task.points,
    created_at: new Date().toISOString(),
  }
  data.history.push(entry)
  saveData(data)
  return { task, user, entry }
}

// Rewards
export function getRewards() {
  return loadData().rewards
}

export function createReward({ name, cost, created_by }) {
  const data = loadData()
  const reward = {
    id: crypto.randomUUID(),
    foyer_id: data.foyer.id,
    name,
    cost,
    created_by,
    created_at: new Date().toISOString(),
  }
  data.rewards.push(reward)
  saveData(data)
  return reward
}

export function updateReward(rewardId, updates) {
  const data = loadData()
  const idx = data.rewards.findIndex((r) => r.id === rewardId)
  if (idx !== -1) {
    data.rewards[idx] = { ...data.rewards[idx], ...updates }
    saveData(data)
    return data.rewards[idx]
  }
  return null
}

export function deleteReward(rewardId) {
  const data = loadData()
  data.rewards = data.rewards.filter((r) => r.id !== rewardId)
  saveData(data)
}

export function purchaseReward(rewardId, userId) {
  const data = loadData()
  const reward = data.rewards.find((r) => r.id === rewardId)
  const user = data.users.find((u) => u.id === userId)
  const alreadyPurchased = data.history.some(
    (entry) =>
      entry.type === 'reward' &&
      entry.user_id === userId &&
      entry.reference_id === rewardId
  )
  if (!reward || !user || user.points < reward.cost || alreadyPurchased) return null

  user.points -= reward.cost

  const entry = {
    id: crypto.randomUUID(),
    foyer_id: data.foyer.id,
    user_id: userId,
    type: 'reward',
    reference_id: rewardId,
    description: reward.name,
    points: -reward.cost,
    created_at: new Date().toISOString(),
  }
  data.history.push(entry)

  const partner = data.users.find((u) => u.id !== userId)
  if (partner) {
    data.notifications.push({
      id: crypto.randomUUID(),
      for_user: partner.id,
      message: `${user.name} a réclamé sa récompense : "${reward.name}" ! C'est l'heure de payer ! 🎉`,
      read: false,
      created_at: new Date().toISOString(),
    })
  }

  saveData(data)
  return { reward, user, entry }
}

// History
export function getHistory() {
  return loadData().history.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )
}

// Notifications
export function getNotifications(userId) {
  return loadData()
    .notifications.filter((n) => n.for_user === userId && !n.read)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function markNotificationRead(notifId) {
  const data = loadData()
  const notif = data.notifications.find((n) => n.id === notifId)
  if (notif) {
    notif.read = true
    saveData(data)
  }
}

export function clearAllNotifications(userId) {
  const data = loadData()
  data.notifications.forEach((n) => {
    if (n.for_user === userId) n.read = true
  })
  saveData(data)
}

// Reset data
export function resetAllData() {
  localStorage.removeItem(STORAGE_KEY)
  return loadData()
}
