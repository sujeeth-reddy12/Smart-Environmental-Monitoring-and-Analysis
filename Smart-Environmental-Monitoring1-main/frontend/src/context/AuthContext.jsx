import { createContext, useContext, useEffect, useState } from 'react'

const SESSION_KEY = 'ecopulse_session'
const AuthContext = createContext(null)

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [session])

  useEffect(() => {
    const handleExpiredSession = () => setSession(null)
    window.addEventListener('ecopulse-auth-expired', handleExpiredSession)
    return () => window.removeEventListener('ecopulse-auth-expired', handleExpiredSession)
  }, [])

  const signIn = (authResponse) => setSession(authResponse)
  const signOut = () => setSession(null)

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        token: session?.access_token ?? null,
        isAuthenticated: Boolean(session?.access_token),
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
