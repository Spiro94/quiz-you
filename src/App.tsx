// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { QuizProvider } from './context/QuizContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import DashboardPage from './pages/Dashboard'
import QuizSetupPage from './pages/QuizSetup'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/setup"
            element={
              <ProtectedRoute>
                <QuizSetupPage />
              </ProtectedRoute>
            }
          />
          {/* Quiz session route — QuizProvider is session-scoped (not app-scoped) */}
          <Route
            path="/quiz/:sessionId"
            element={
              <ProtectedRoute>
                <QuizProvider>
                  {/* QuizSessionPage added in Plan 02-04 */}
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-500">Loading quiz session...</p>
                  </div>
                </QuizProvider>
              </ProtectedRoute>
            }
          />
          {/* Redirect root to dashboard — ProtectedRoute handles unauthenticated redirect to /login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
