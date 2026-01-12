import { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"

import ErrorBoundary from './components/feedback/ErrorBoundary'
import Navbar from './components/layout/Navbar'
import { getUser } from './api/apiClient'
import { useTheme } from "@/components/providers/theme-provider"

// Lazy load pages for performance
const Login = lazy(() => import('./pages/Login'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ClassDetail = lazy(() => import('./pages/ClassDetail'))

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
  const { resolvedTheme } = useTheme()

  const fetchUser = async () => {
    const res = await getUser()
    if (res.ok) setUser(res.user)
    else setUser(null)
    setLoading(false)
  }

  // Update favicon dynamically based on theme
  useEffect(() => {
    const iconPath = resolvedTheme === 'dark' ? '/RoosterDark.ico' : '/RoosterLight.ico'
    const link = document.querySelector("link[rel~='icon']")
    if (link) {
      link.href = iconPath
    }
  }, [resolvedTheme])

  useEffect(() => {
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  // Handle Authentication Callback separately
  if (window.location.pathname === '/auth-callback') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AuthCallback onAuth={async () => {
          await fetchUser()
          window.history.replaceState(null, '', '/')
        }} />
      </Suspense>
    )
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-background flex flex-col">
          <Suspense fallback={<LoadingSpinner />}>
            {user ? (
              // Authenticated Flow
              !user.student_id ? (
                // If profile is incomplete, force setup
                <ProfileSetup user={user} onComplete={fetchUser} />
              ) : (
                <>
                  <Navbar user={user} onLogout={() => setUser(null)} />
                  <main className="flex-1" role="main">
                    <Routes>
                      <Route path="/" element={<Dashboard user={user} />} />
                      <Route path="/class/:id" element={<ClassDetail />} />
                      <Route path="/profile" element={<ProfileSetup user={user} onComplete={fetchUser} />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </>
              )
            ) : (
              // Guest Flow
              <Login />
            )}
          </Suspense>
        </div>
      </BrowserRouter>
      <Toaster />
    </ErrorBoundary>
  )
}

export default App