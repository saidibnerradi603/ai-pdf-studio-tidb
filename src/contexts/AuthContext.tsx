import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'
import { authService } from '@/services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      const { user: sessionUser } = await authService.getCurrentSession()
      setUser(sessionUser)
      setLoading(false)
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { user: signedInUser, error } = await authService.signIn(email, password)
    
    if (error) {
      setLoading(false)
      return { error: error.message }
    }

    setUser(signedInUser)
    setLoading(false)
    return { error: null }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    const { user: newUser, error } = await authService.signUp(email, password)
    
    if (error) {
      setLoading(false)
      return { error: error.message }
    }

    // For sign up, we don't set the user immediately since they need to confirm email
    setLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    setLoading(true)
    await authService.signOut()
    setUser(null)
    setLoading(false)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}