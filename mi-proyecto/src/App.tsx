import './App.css'
import { useState } from 'react'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/forum/Home'
import CreateThread from './pages/forum/CreateThread'
import ThreadDetail from './pages/forum/ThreadDetail'
import EditPost from './pages/forum/EditPost'
import Notifications from './pages/forum/Notifications'
import AdminLayout from './layouts/AdminLayout'
import { Navigate, Route, Routes } from 'react-router-dom'
import { hasSession, isAdmin, logout } from './lib/api'

function App() {
  const [authView, setAuthView] = useState<'login' | 'register' | 'home'>(
    hasSession() ? 'home' : 'login',
  )

  const handleLogout = () => {
    logout();
    setAuthView('login');
  }

  if (authView === 'home') {
    return (
      <Routes>
        <Route path="/" element={<Home onLogout={handleLogout} />} />
        <Route path="/crear-hilo" element={<CreateThread />} />
        <Route path="/hilo/:id" element={<ThreadDetail />} />
        <Route path="/editar/:id" element={<EditPost />} />
        <Route path="/notificaciones" element={<Notifications />} />
        <Route
          path="/admin/*"
          element={isAdmin() ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return authView === 'login' ? (
    <Login
      onRegister={() => setAuthView('register')}
      onLogin={() => setAuthView('home')}
    />
  ) : (
    <Register onLogin={() => setAuthView('login')} />
  )
}

export default App

