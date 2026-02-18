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
    <button onClick={handleLogout} disabled={loading}>
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  )
}
