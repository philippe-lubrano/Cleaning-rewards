import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/useApp'
import Layout from './components/Layout'
import SelectUser from './pages/SelectUser'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import TaskAdmin from './pages/TaskAdmin'
import Rewards from './pages/Rewards'
import History from './pages/History'

function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SelectUser />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/admin" element={<TaskAdmin />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/history" element={<History />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
