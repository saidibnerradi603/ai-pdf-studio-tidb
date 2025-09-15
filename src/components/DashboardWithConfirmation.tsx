import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle } from 'lucide-react'
import Dashboard from '@/pages/Dashboard'

export default function DashboardWithConfirmation() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isConfirming, setIsConfirming] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check for hash parameters (Supabase auth callback)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const access_token = hashParams.get('access_token')
      const refresh_token = hashParams.get('refresh_token')
      const type = hashParams.get('type')
      
      // Also check search parameters for backward compatibility
      const token_hash = searchParams.get('token_hash')
      const search_type = searchParams.get('type')

      if (access_token && refresh_token && type === 'signup') {
        setIsConfirming(true)
        
        try {
          // Set the session with the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })

          if (error) {
            toast({
              title: "Email confirmation failed",
              description: error.message,
              variant: "destructive",
            })
          } else {
            toast({
              title: "Email confirmed successfully!",
              description: "Welcome to AI PDF Studio. Your account is now active.",
              duration: 5000,
            })
            
            // Clean up URL by navigating to clean dashboard
            navigate('/dashboard', { replace: true })
          }
        } catch (err) {
          toast({
            title: "Confirmation error",
            description: "An unexpected error occurred during email confirmation.",
            variant: "destructive",
          })
        } finally {
          setIsConfirming(false)
        }
      } else if (token_hash && search_type) {
        // Handle legacy token_hash method
        setIsConfirming(true)
        
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: search_type as any
          })

          if (error) {
            toast({
              title: "Email confirmation failed",
              description: error.message,
              variant: "destructive",
            })
          } else {
            toast({
              title: "Email confirmed successfully!",
              description: "Welcome to AI PDF Studio. Your account is now active.",
              duration: 5000,
            })
          }
        } catch (err) {
          toast({
            title: "Confirmation error",
            description: "An unexpected error occurred during email confirmation.",
            variant: "destructive",
          })
        } finally {
          setIsConfirming(false)
          // Clean up URL parameters
          setSearchParams({})
        }
      }
    }

    handleEmailConfirmation()
  }, [searchParams, setSearchParams, navigate, toast])

  if (isConfirming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold">Confirming your email...</h2>
          <p className="text-muted-foreground">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    )
  }

  return <Dashboard />
}