import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getToken, setToken, clearToken } from './services/api'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MechanicsPage from './pages/MechanicsPage'
import UsersPage from './pages/UsersPage'
import BookingsPage from './pages/BookingsPage'
import FeedbackPage from './pages/FeedbackPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())

  const handleLogin = (token) => {
    setToken(token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    clearToken()
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/mechanics" element={<MechanicsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
