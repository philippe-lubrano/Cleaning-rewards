import { supabase, isSupabaseConfigured } from './supabase'

const STORAGE_KEY = 'cleaning-rewards-data'
const FOYER_PSEUDO_KEY = 'cleaning-rewards-foyer-pseudo'

function normalizePseudo(pseudo) {
  return String(pseudo || '').trim().toLowerCase()
}

let currentFoyerPseudo = normalizePseudo(localStorage.getItem(FOYER_PSEUDO_KEY)) || null

function hashTo8Hex(input) {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function pseudoToFoyerId(pseudo) {
  const normalized = normalizePseudo(pseudo)
  if (!normalized) return null

  const hex = [0, 1, 2, 3].map((item) => hashTo8Hex(`${normalized}:${item}`)).join('')
  const chars = hex.split('')
  chars[12] = '4'
  chars[16] = ['8', '9', 'a', 'b'][parseInt(chars[16], 16) % 4]
  const uuid = chars.join('')

  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20, 32)}`
}

function getStorageKey() {
  return currentFoyerPseudo ? `${STORAGE_KEY}:${currentFoyerPseudo}` : STORAGE_KEY
}

export function getCurrentFoyerPseudo() {
  return currentFoyerPseudo
}

export function hasCurrentFoyerPseudo() {
  return Boolean(currentFoyerPseudo)
}

export async function setCurrentFoyerPseudo(pseudo) {
  const normalized = normalizePseudo(pseudo)
  if (!normalized) return null

  currentFoyerPseudo = normalized
  localStorage.setItem(FOYER_PSEUDO_KEY, normalized)
  initPromise = null

  if (isSupabaseConfigured()) {
    await ensureRemoteInitialized()
  }

  return normalized
}

export function clearCurrentFoyerPseudo() {
  currentFoyerPseudo = null
  localStorage.removeItem(FOYER_PSEUDO_KEY)
  initPromise = null
}

const DEFAULT_TASKS = [
  { name: 'Vider le lave-vaisselle', points: 10, recurrence_days: 1 },
  { name: "Passer l'aspirateur", points: 30, recurrence_days: 3 },
  { name: 'Sortir les poubelles', points: 5, recurrence_days: 2 },
  { name: 'Nettoyer la salle de bain', points: 50, recurrence_days: 7 },
  { name: 'Lancer une machine', points: 15, recurrence_days: 3 },
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
    tasks: DEFAULT_TASKS.map((task) => ({
      ...task,
      id: crypto.randomUUID(),
      foyer_id: foyerId,
      next_due: new Date().toISOString(),
    })),
    rewards: [],
    history: [],
    notifications: [],
  }
}

function loadLocalData() {
  if (!hasCurrentFoyerPseudo()) return null
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  const data = getDefaultData()
  saveLocalData(data)
  return data
}

function saveLocalData(data) {
  if (!hasCurrentFoyerPseudo()) return
  localStorage.setItem(getStorageKey(), JSON.stringify(data))
}

let initPromise = null

async function ensureRemoteInitialized() {
  if (!isSupabaseConfigured()) return null
  if (!hasCurrentFoyerPseudo()) return null
  if (initPromise) return initPromise

  initPromise = (async () => {
    const foyerId = pseudoToFoyerId(currentFoyerPseudo)
    if (!foyerId) return null

    const { data: foyerExists, error: foyerExistsError } = await supabase
      .from('foyer')
      .select('id')
      .eq('id', foyerId)
      .maybeSingle()

    if (foyerExistsError) throw foyerExistsError

    if (!foyerExists) {
      const { error: foyerError } = await supabase
        .from('foyer')
        .insert({ id: foyerId })

      if (foyerError) throw foyerError
    }

    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('foyer_id', foyerId)

    if (!users || users.length === 0) {
      await supabase.from('users').insert([
        { foyer_id: foyerId, name: 'Partenaire 1', points: 0 },
        { foyer_id: foyerId, name: 'Partenaire 2', points: 0 },
      ])
    }

    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('foyer_id', foyerId)

    if (!tasks || tasks.length === 0) {
      const nextDue = new Date().toISOString()
      await supabase.from('tasks').insert(
        DEFAULT_TASKS.map((task) => ({
          foyer_id: foyerId,
          name: task.name,
          points: task.points,
          recurrence_days: task.recurrence_days,
          next_due: nextDue,
        }))
      )
    }

    return foyerId
  })()

  try {
    return await initPromise
  } catch (error) {
    initPromise = null
    throw error
  }
}

async function getFoyerId() {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) return loadLocalData()?.foyer?.id || null
  return ensureRemoteInitialized()
}

// ---- Users ----

export async function getUsers() {
  if (!hasCurrentFoyerPseudo()) return []
  if (!isSupabaseConfigured()) return loadLocalData()?.users || []

  const foyerId = await getFoyerId()
  if (!foyerId) return []
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('foyer_id', foyerId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getUser(userId) {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) {
    return loadLocalData()?.users.find((user) => user.id === userId) || null
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data || null
}

export async function updateUserName(userId, name) {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return null
    const user = data.users.find((item) => item.id === userId)
    if (user) {
      user.name = name
      saveLocalData(data)
    }
    return user || null
  }

  const { data, error } = await supabase
    .from('users')
    .update({ name })
    .eq('id', userId)
    .select('*')
    .maybeSingle()

  if (error) throw error
  return data || null
}

// ---- Tasks ----

export async function getTasks() {
  if (!hasCurrentFoyerPseudo()) return []
  if (!isSupabaseConfigured()) return loadLocalData()?.tasks || []

  const foyerId = await getFoyerId()
  if (!foyerId) return []
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('foyer_id', foyerId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createTask({ name, points, recurrence_days }) {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return null
    const task = {
      id: crypto.randomUUID(),
      foyer_id: data.foyer.id,
      name,
      points,
      recurrence_days,
      next_due: new Date().toISOString(),
    }
    data.tasks.push(task)
    saveLocalData(data)
    return task
  }

  const foyerId = await getFoyerId()
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      foyer_id: foyerId,
      name,
      points,
      recurrence_days,
      next_due: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateTask(taskId, updates) {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return null
    const taskIndex = data.tasks.findIndex((task) => task.id === taskId)
    if (taskIndex === -1) return null
    data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates }
    saveLocalData(data)
    return data.tasks[taskIndex]
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select('*')
    .maybeSingle()

  if (error) throw error
  return data || null
}

export async function deleteTask(taskId) {
  if (!hasCurrentFoyerPseudo()) return
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return
    data.tasks = data.tasks.filter((task) => task.id !== taskId)
    saveLocalData(data)
    return
  }

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error
}

export async function completeTask(taskId, userId) {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return null
    const task = data.tasks.find((item) => item.id === taskId)
    const user = data.users.find((item) => item.id === userId)
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
    saveLocalData(data)
    return { task, user, entry }
  }

  const foyerId = await getFoyerId()
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .maybeSingle()

  if (taskError) throw taskError
  if (!task) return null

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (userError) throw userError
  if (!user) return null

  const updatedPoints = Number(user.points || 0) + Number(task.points || 0)
  const { data: updatedUser, error: updateUserError } = await supabase
    .from('users')
    .update({ points: updatedPoints })
    .eq('id', userId)
    .select('*')
    .single()

  if (updateUserError) throw updateUserError

  const nextDueDate = new Date()
  nextDueDate.setDate(nextDueDate.getDate() + Number(task.recurrence_days || 1))
  const { data: updatedTask, error: updateTaskError } = await supabase
    .from('tasks')
    .update({ next_due: nextDueDate.toISOString() })
    .eq('id', taskId)
    .select('*')
    .single()

  if (updateTaskError) throw updateTaskError

  const { data: entry, error: historyError } = await supabase
    .from('history')
    .insert({
      foyer_id: foyerId,
      user_id: userId,
      type: 'task',
      reference_id: taskId,
      description: task.name,
      points: Number(task.points || 0),
    })
    .select('*')
    .single()

  if (historyError) throw historyError
  return { task: updatedTask, user: updatedUser, entry }
}

export async function undoTaskCompletion(historyEntryId) {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return null
    const entryIndex = data.history.findIndex(
      (entry) =>
        entry.id === historyEntryId &&
        entry.type === 'task'
    )

    if (entryIndex === -1) return null

    const entry = data.history[entryIndex]
    const user = data.users.find((item) => item.id === entry.user_id)
    const task = data.tasks.find((item) => item.id === entry.reference_id)
    if (!user || !task) return null

    user.points -= Number(entry.points || 0)

    const nextDue = new Date(task.next_due)
    nextDue.setDate(nextDue.getDate() - Number(task.recurrence_days || 1))
    task.next_due = nextDue.toISOString()

    data.history.splice(entryIndex, 1)
    saveLocalData(data)

    return { task, user }
  }

  const { data: entry, error: entryError } = await supabase
    .from('history')
    .select('*')
    .eq('id', historyEntryId)
    .eq('type', 'task')
    .maybeSingle()

  if (entryError) throw entryError
  if (!entry) return null

  const foyerId = await getFoyerId()
  if (entry.foyer_id !== foyerId) return null

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', entry.user_id)
    .maybeSingle()

  if (userError) throw userError
  if (!user) return null

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', entry.reference_id)
    .maybeSingle()

  if (taskError) throw taskError
  if (!task) return null

  const updatedPoints = Number(user.points || 0) - Number(entry.points || 0)
  const { data: updatedUser, error: updateUserError } = await supabase
    .from('users')
    .update({ points: updatedPoints })
    .eq('id', entry.user_id)
    .select('*')
    .single()

  if (updateUserError) throw updateUserError

  const nextDue = new Date(task.next_due)
  nextDue.setDate(nextDue.getDate() - Number(task.recurrence_days || 1))
  const { data: updatedTask, error: updateTaskError } = await supabase
    .from('tasks')
    .update({ next_due: nextDue.toISOString() })
    .eq('id', task.id)
    .select('*')
    .single()

  if (updateTaskError) throw updateTaskError

  const { error: deleteHistoryError } = await supabase
    .from('history')
    .delete()
    .eq('id', historyEntryId)

  if (deleteHistoryError) throw deleteHistoryError

  return { task: updatedTask, user: updatedUser }
}

// ---- Rewards ----

export async function getRewards() {
  if (!hasCurrentFoyerPseudo()) return []
  if (!isSupabaseConfigured()) return loadLocalData()?.rewards || []

  const foyerId = await getFoyerId()
  if (!foyerId) return []
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('foyer_id', foyerId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createReward({ name, cost, created_by }) {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return null
    const reward = {
      id: crypto.randomUUID(),
      foyer_id: data.foyer.id,
      name,
      cost,
      created_by,
      created_at: new Date().toISOString(),
    }
    data.rewards.push(reward)
    saveLocalData(data)
    return reward
  }

  const foyerId = await getFoyerId()
  const { data, error } = await supabase
    .from('rewards')
    .insert({ foyer_id: foyerId, name, cost, created_by })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateReward(rewardId, updates) {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return null
    const rewardIndex = data.rewards.findIndex((reward) => reward.id === rewardId)
    if (rewardIndex === -1) return null
    data.rewards[rewardIndex] = { ...data.rewards[rewardIndex], ...updates }
    saveLocalData(data)
    return data.rewards[rewardIndex]
  }

  const { data, error } = await supabase
    .from('rewards')
    .update(updates)
    .eq('id', rewardId)
    .select('*')
    .maybeSingle()

  if (error) throw error
  return data || null
}

export async function deleteReward(rewardId) {
  if (!hasCurrentFoyerPseudo()) return
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return
    data.rewards = data.rewards.filter((reward) => reward.id !== rewardId)
    saveLocalData(data)
    return
  }

  const { error } = await supabase.from('rewards').delete().eq('id', rewardId)
  if (error) throw error
}

export async function purchaseReward(rewardId, userId) {
  if (!hasCurrentFoyerPseudo()) return null
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return null
    const reward = data.rewards.find((item) => item.id === rewardId)
    const user = data.users.find((item) => item.id === userId)
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

    const partner = data.users.find((item) => item.id !== userId)
    if (partner) {
      data.notifications.push({
        id: crypto.randomUUID(),
        for_user: partner.id,
        message: `${user.name} a réclamé sa récompense : "${reward.name}" ! C'est l'heure de payer ! 🎉`,
        read: false,
        created_at: new Date().toISOString(),
      })
    }

    saveLocalData(data)
    return { reward, user, entry }
  }

  const foyerId = await getFoyerId()

  const { data: reward, error: rewardError } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', rewardId)
    .maybeSingle()

  if (rewardError) throw rewardError
  if (!reward) return null

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (userError) throw userError
  if (!user) return null

  const { data: alreadyPurchased, error: alreadyPurchasedError } = await supabase
    .from('history')
    .select('id')
    .eq('type', 'reward')
    .eq('user_id', userId)
    .eq('reference_id', rewardId)
    .limit(1)

  if (alreadyPurchasedError) throw alreadyPurchasedError

  const hasPurchased = Boolean(alreadyPurchased && alreadyPurchased.length > 0)
  if (Number(user.points || 0) < Number(reward.cost || 0) || hasPurchased) return null

  const updatedPoints = Number(user.points || 0) - Number(reward.cost || 0)
  const { data: updatedUser, error: updateUserError } = await supabase
    .from('users')
    .update({ points: updatedPoints })
    .eq('id', userId)
    .select('*')
    .single()

  if (updateUserError) throw updateUserError

  const { data: entry, error: historyError } = await supabase
    .from('history')
    .insert({
      foyer_id: foyerId,
      user_id: userId,
      type: 'reward',
      reference_id: rewardId,
      description: reward.name,
      points: -Number(reward.cost || 0),
    })
    .select('*')
    .single()

  if (historyError) throw historyError

  const { data: partner } = await supabase
    .from('users')
    .select('id')
    .eq('foyer_id', foyerId)
    .neq('id', userId)
    .limit(1)
    .maybeSingle()

  if (partner?.id) {
    await supabase.from('notifications').insert({
      foyer_id: foyerId,
      for_user: partner.id,
      message: `${updatedUser.name} a réclamé sa récompense : "${reward.name}" ! C'est l'heure de payer ! 🎉`,
      read: false,
    })
  }

  return { reward, user: updatedUser, entry }
}

// ---- History ----

export async function getHistory() {
  if (!hasCurrentFoyerPseudo()) return []
  if (!isSupabaseConfigured()) {
    return (loadLocalData()?.history || []).sort(
      (left, right) => new Date(right.created_at) - new Date(left.created_at)
    )
  }

  const foyerId = await getFoyerId()
  if (!foyerId) return []
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('foyer_id', foyerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ---- Notifications ----

export async function getNotifications(userId) {
  if (!hasCurrentFoyerPseudo()) return []
  if (!isSupabaseConfigured()) {
    return (loadLocalData()?.notifications || [])
      .filter((notification) => notification.for_user === userId && !notification.read)
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('for_user', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function markNotificationRead(notifId) {
  if (!hasCurrentFoyerPseudo()) return
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return
    const notification = data.notifications.find((item) => item.id === notifId)
    if (notification) {
      notification.read = true
      saveLocalData(data)
    }
    return
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notifId)

  if (error) throw error
}

export async function clearAllNotifications(userId) {
  if (!hasCurrentFoyerPseudo()) return
  if (!isSupabaseConfigured()) {
    const data = loadLocalData()
    if (!data) return
    data.notifications.forEach((notification) => {
      if (notification.for_user === userId) notification.read = true
    })
    saveLocalData(data)
    return
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('for_user', userId)
    .eq('read', false)

  if (error) throw error
}

// ---- Reset ----

export async function resetAllData() {
  if (!hasCurrentFoyerPseudo()) {
    return {
      users: [],
      tasks: [],
      rewards: [],
      history: [],
      notifications: [],
    }
  }

  if (!isSupabaseConfigured()) {
    localStorage.removeItem(getStorageKey())
    return loadLocalData() || {
      users: [],
      tasks: [],
      rewards: [],
      history: [],
      notifications: [],
    }
  }

  const foyerId = await getFoyerId()

  await supabase.from('notifications').delete().eq('foyer_id', foyerId)
  await supabase.from('history').delete().eq('foyer_id', foyerId)
  await supabase.from('rewards').delete().eq('foyer_id', foyerId)
  await supabase.from('tasks').delete().eq('foyer_id', foyerId)
  await supabase.from('users').delete().eq('foyer_id', foyerId)

  initPromise = null
  await ensureRemoteInitialized()

  return {
    users: await getUsers(),
    tasks: await getTasks(),
    rewards: await getRewards(),
    history: await getHistory(),
    notifications: [],
  }
}
