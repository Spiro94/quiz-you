// src/components/auth/LogoutButton.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function LogoutButton() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()   // Wait for session destruction before redirecting
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  )
}
