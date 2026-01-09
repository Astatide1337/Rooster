import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"

import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import ProfileSetup from './components/ProfileSetup'
import Dashboard from './pages/Dashboard'
import ClassDetail from './pages/ClassDetail'
import { getUser } from './api/apiClient'

// Temporary loading spinner until we migrate to Shadcn Skeleton
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    const res = await getUser()
    if (res.ok) setUser(res.user)
    else setUser(null)
    setLoading(false)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  // Handle Authentication Callback separately
  if (window.location.pathname === '/auth-callback') {
    return (
      <AuthCallback onAuth={async () => {
        await fetchUser()
        window.history.replaceState(null, '', '/')
      }} />
    )
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          {user ? (
            // Authenticated Flow
            !user.student_id ? (
              // If profile is incomplete, force setup
              <ProfileSetup user={user} onComplete={fetchUser} />
            ) : (
              <>
                <Navbar user={user} onLogout={() => setUser(null)} />
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/class/:id" element={<ClassDetail user={user} />} />
                  <Route path="/profile" element={<ProfileSetup user={user} onComplete={fetchUser} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </>
            )
          ) : (
            // Guest Flow
            <Login />
          )}
        </div>
      </BrowserRouter>
      <Toaster />
    </ErrorBoundary>
  )
}

export default App