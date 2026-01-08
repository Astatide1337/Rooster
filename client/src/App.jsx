import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'

import Navbar from './components/Navbar'
import LoginButton from './components/LoginButton'
import AuthCallback from './pages/AuthCallback'
import ProfileSetup from './components/ProfileSetup'
import Dashboard from './pages/Dashboard'
import ClassDetail from './pages/ClassDetail'
import { getUser } from './api/apiClient'

import { Box, Container, Typography, CircularProgress } from '@mui/material'

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div className="App">
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
              <Container maxWidth="xs" sx={{ mt: 15 }}>
                <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 4, boxShadow: 3 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Class Roster</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Sign in with your Google account to manage your classes.
                  </Typography>
                  <LoginButton />
                </Box>
              </Container>
            )}
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default App