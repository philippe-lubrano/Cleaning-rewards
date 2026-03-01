import { useState, useCallback, useEffect } from 'react'
import { AppContext } from './AppContext'
import * as store from '../lib/store'

export function AppProvider({ children }) {
  const [foyerPseudo, setFoyerPseudo] = useState(() => store.getCurrentFoyerPseudo())
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [rewards, setRewards] = useState([])
  const [history, setHistory] = useState([])
  const [notifications, setNotifications] = useState([])
  const currentUserId = currentUser?.id || null

  const refreshAll = useCallback(async () => {
    if (!foyerPseudo) {
      setUsers([])
      setTasks([])
      setRewards([])
      setHistory([])
      setNotifications([])
      setCurrentUser(null)
      return
    }

    const [nextUsers, nextTasks, nextRewards, nextHistory] = await Promise.all([
      store.getUsers(),
      store.getTasks(),
      store.getRewards(),
      store.getHistory(),
    ])

    setUsers(nextUsers)
    setTasks(nextTasks)
    setRewards(nextRewards)
    setHistory(nextHistory)

    if (currentUserId) {
      const refreshedUser = nextUsers.find((user) => user.id === currentUserId) || null
      setCurrentUser(refreshedUser)
      if (refreshedUser) {
        setNotifications(await store.getNotifications(refreshedUser.id))
      } else {
        setNotifications([])
      }
    }
  }, [currentUserId, foyerPseudo])

  useEffect(() => {
    if (!foyerPseudo) return

    let isMounted = true

    const loadInitialData = async () => {
      const [nextUsers, nextTasks, nextRewards, nextHistory] = await Promise.all([
        store.getUsers(),
        store.getTasks(),
        store.getRewards(),
        store.getHistory(),
      ])

      if (!isMounted) return

      setUsers(nextUsers)
      setTasks(nextTasks)
      setRewards(nextRewards)
      setHistory(nextHistory)

      if (currentUserId) {
        const refreshedUser = nextUsers.find((user) => user.id === currentUserId) || null
        setCurrentUser(refreshedUser)
        if (refreshedUser) {
          setNotifications(await store.getNotifications(refreshedUser.id))
        } else {
          setNotifications([])
        }
      }
    }

    void loadInitialData()

    return () => {
      isMounted = false
    }
  }, [currentUserId, foyerPseudo])

  const loginWithPseudo = useCallback(async (pseudo) => {
    const normalized = await store.setCurrentFoyerPseudo(pseudo)
    if (!normalized) return null

    setFoyerPseudo(normalized)
    setCurrentUser(null)
    setNotifications([])

    const [nextUsers, nextTasks, nextRewards, nextHistory] = await Promise.all([
      store.getUsers(),
      store.getTasks(),
      store.getRewards(),
      store.getHistory(),
    ])

    setUsers(nextUsers)
    setTasks(nextTasks)
    setRewards(nextRewards)
    setHistory(nextHistory)

    return normalized
  }, [])

  const logoutFoyer = useCallback(() => {
    store.clearCurrentFoyerPseudo()
    setFoyerPseudo(null)
    setCurrentUser(null)
    setUsers([])
    setTasks([])
    setRewards([])
    setHistory([])
    setNotifications([])
  }, [])

  const selectUser = useCallback(
    async (userId) => {
      const user = await store.getUser(userId)
      setCurrentUser(user)
      if (!user) {
        setNotifications([])
        return null
      }
      setNotifications(await store.getNotifications(userId))
      return user
    },
    []
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setNotifications([])
  }, [])

  const completeTask = useCallback(
    async (taskId) => {
      if (!currentUser) return null
      const result = await store.completeTask(taskId, currentUser.id)
      if (result) {
        await refreshAll()
      }
      return result
    },
    [currentUser, refreshAll]
  )

  const undoTaskCompletion = useCallback(
    async (historyEntryId) => {
      if (!currentUser) return null
      const result = await store.undoTaskCompletion(historyEntryId)
      if (result) {
        await refreshAll()
      }
      return result
    },
    [currentUser, refreshAll]
  )

  const addTask = useCallback(
    async (taskData) => {
      const task = await store.createTask(taskData)
      await refreshAll()
      return task
    },
    [refreshAll]
  )

  const editTask = useCallback(
    async (taskId, updates) => {
      const task = await store.updateTask(taskId, updates)
      await refreshAll()
      return task
    },
    [refreshAll]
  )

  const removeTask = useCallback(
    async (taskId) => {
      await store.deleteTask(taskId)
      await refreshAll()
    },
    [refreshAll]
  )

  const addReward = useCallback(
    async (rewardData) => {
      const reward = await store.createReward(rewardData)
      await refreshAll()
      return reward
    },
    [refreshAll]
  )

  const editReward = useCallback(
    async (rewardId, updates) => {
      const reward = await store.updateReward(rewardId, updates)
      await refreshAll()
      return reward
    },
    [refreshAll]
  )

  const removeReward = useCallback(
    async (rewardId) => {
      await store.deleteReward(rewardId)
      await refreshAll()
    },
    [refreshAll]
  )

  const buyReward = useCallback(
    async (rewardId) => {
      if (!currentUser) return null
      const result = await store.purchaseReward(rewardId, currentUser.id)
      if (result) {
        await refreshAll()
      }
      return result
    },
    [currentUser, refreshAll]
  )

  const donatePoints = useCallback(
    async ({ points, comment }) => {
      if (!currentUser) return null
      const result = await store.givePointsToPartner(currentUser.id, points, comment)
      if (result) {
        setCurrentUser(result.fromUser)
        await refreshAll()
      }
      return result
    },
    [currentUser, refreshAll]
  )

  const dismissNotification = useCallback(
    async (notifId) => {
      await store.markNotificationRead(notifId)
      if (currentUser) {
        setNotifications(await store.getNotifications(currentUser.id))
      }
    },
    [currentUser]
  )

  const clearNotifications = useCallback(async () => {
    if (currentUser) {
      await store.clearAllNotifications(currentUser.id)
      setNotifications([])
    }
  }, [currentUser])

  const updateUserName = useCallback(
    async (userId, name) => {
      await store.updateUserName(userId, name)
      await refreshAll()
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(await store.getUser(userId))
      }
    },
    [currentUser, refreshAll]
  )

  const value = {
    foyerPseudo,
    currentUser,
    users,
    tasks,
    rewards,
    history,
    notifications,
    loginWithPseudo,
    logoutFoyer,
    selectUser,
    logout,
    completeTask,
    undoTaskCompletion,
    addTask,
    editTask,
    removeTask,
    addReward,
    editReward,
    removeReward,
    buyReward,
    donatePoints,
    dismissNotification,
    clearNotifications,
    updateUserName,
    refreshAll,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
