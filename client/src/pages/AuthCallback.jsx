import { useEffect } from 'react'
import { getUser } from '@/api/apiClient'

export default function AuthCallback({ onAuth }) {
  useEffect(() => {
    async function finish() {
      await getUser()
      if (onAuth) onAuth()
      else window.location.replace('/')
    }
    finish()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign-in...</p>
      </div>
    </div>
  )
}
