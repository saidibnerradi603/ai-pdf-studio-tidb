import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export interface AuthError {
  message: string
  status?: number
}

export interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        return { user: null, error: { message: error.message } }
      }

      if (data.user && !data.user.email_confirmed_at) {
        return { 
          user: null, 
          error: { 
            message: 'Please check your email and click the confirmation link to complete your registration.' 
          } 
        }
      }

      const user: User = {
        name: data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || 'User',
        email: data.user?.email || email,
        profilePicUrl: data.user?.user_metadata?.avatar_url
      }

      return { user, error: null }
    } catch (err) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during registration' } 
      }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: { message: error.message } }
      }

      const user: User = {
        name: data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || 'User',
        email: data.user?.email || email,
        profilePicUrl: data.user?.user_metadata?.avatar_url
      }

      return { user, error: null }
    } catch (err) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during sign in' } 
      }
    }
  },

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { error: { message: error.message } }
      }
      return { error: null }
    } catch (err) {
      return { error: { message: 'An unexpected error occurred during sign out' } }
    }
  },

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        return { user: null, session: null, error: { message: error.message } }
      }

      if (!session) {
        return { user: null, session: null, error: null }
      }

      const user: User = {
        name: session.user?.user_metadata?.name || session.user?.email?.split('@')[0] || 'User',
        email: session.user?.email || '',
        profilePicUrl: session.user?.user_metadata?.avatar_url
      }

      return { user, session, error: null }
    } catch (err) {
      return { 
        user: null, 
        session: null, 
        error: { message: 'An unexpected error occurred while checking session' } 
      }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user: User = {
          name: session.user?.user_metadata?.name || session.user?.email?.split('@')[0] || 'User',
          email: session.user?.email || '',
          profilePicUrl: session.user?.user_metadata?.avatar_url
        }
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}