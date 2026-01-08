import { useEffect } from 'react'
import { getUser } from '../api/apiClient'

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
    <div>
      <p>Completing sign-in...</p>
    </div>
  )
}
