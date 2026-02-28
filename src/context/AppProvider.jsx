import { useState, useCallback } from 'react'
import { AppContext } from './AppContext'
import * as store from '../lib/store'

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState(() => store.getUsers())
  const [tasks, setTasks] = useState(() => store.getTasks())
  const [rewards, setRewards] = useState(() => store.getRewards())
  const [history, setHistory] = useState(() => store.getHistory())
  const [notifications, setNotifications] = useState([])

  const refreshAll = useCallback(() => {
    setUsers(store.getUsers())
    setTasks(store.getTasks())
    setRewards(store.getRewards())
    setHistory(store.getHistory())
    if (currentUser) {
      setNotifications(store.getNotifications(currentUser.id))
    }
  }, [currentUser])

  const selectUser = useCallback(
    (userId) => {
      const user = store.getUser(userId)
      setCurrentUser(user)
      setNotifications(store.getNotifications(userId))
    },
    []
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setNotifications([])
  }, [])

  const completeTask = useCallback(
    (taskId) => {
      if (!currentUser) return null
      const result = store.completeTask(taskId, currentUser.id)
      if (result) {
        refreshAll()
        setCurrentUser(store.getUser(currentUser.id))
      }
      return result
    },
    [currentUser, refreshAll]
  )

  const addTask = useCallback(
    (taskData) => {
      const task = store.createTask(taskData)
      refreshAll()
      return task
    },
    [refreshAll]
  )

  const editTask = useCallback(
    (taskId, updates) => {
      const task = store.updateTask(taskId, updates)
      refreshAll()
      return task
    },
    [refreshAll]
  )

  const removeTask = useCallback(
    (taskId) => {
      store.deleteTask(taskId)
      refreshAll()
    },
    [refreshAll]
  )

  const addReward = useCallback(
    (rewardData) => {
      const reward = store.createReward(rewardData)
      refreshAll()
      return reward
    },
    [refreshAll]
  )

  const editReward = useCallback(
    (rewardId, updates) => {
      const reward = store.updateReward(rewardId, updates)
      refreshAll()
      return reward
    },
    [refreshAll]
  )

  const removeReward = useCallback(
    (rewardId) => {
      store.deleteReward(rewardId)
      refreshAll()
    },
    [refreshAll]
  )

  const buyReward = useCallback(
    (rewardId) => {
      if (!currentUser) return null
      const result = store.purchaseReward(rewardId, currentUser.id)
      if (result) {
        refreshAll()
        setCurrentUser(store.getUser(currentUser.id))
      }
      return result
    },
    [currentUser, refreshAll]
  )

  const dismissNotification = useCallback(
    (notifId) => {
      store.markNotificationRead(notifId)
      if (currentUser) {
        setNotifications(store.getNotifications(currentUser.id))
      }
    },
    [currentUser]
  )

  const clearNotifications = useCallback(() => {
    if (currentUser) {
      store.clearAllNotifications(currentUser.id)
      setNotifications([])
    }
  }, [currentUser])

  const updateUserName = useCallback(
    (userId, name) => {
      store.updateUserName(userId, name)
      refreshAll()
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(store.getUser(userId))
      }
    },
    [currentUser, refreshAll]
  )

  const value = {
    currentUser,
    users,
    tasks,
    rewards,
    history,
    notifications,
    selectUser,
    logout,
    completeTask,
    addTask,
    editTask,
    removeTask,
    addReward,
    editReward,
    removeReward,
    buyReward,
    dismissNotification,
    clearNotifications,
    updateUserName,
    refreshAll,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
