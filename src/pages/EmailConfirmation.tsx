import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      if (token_hash && type) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          })

          if (error) {
            setStatus('error')
            setMessage(error.message)
          } else {
            setStatus('success')
            setMessage('Your email has been confirmed successfully!')
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate('/dashboard')
            }, 3000)
          }
        } catch (err) {
          setStatus('error')
          setMessage('An unexpected error occurred during email confirmation.')
        }
      } else {
        setStatus('error')
        setMessage('Invalid confirmation link.')
      }
    }

    handleEmailConfirmation()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h1 className="text-2xl font-bold">Confirming your email...</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-600">Email Confirmed!</h1>
              <p className="text-muted-foreground">
                {message}
              </p>
              <p className="text-sm text-muted-foreground">
                You will be redirected to your dashboard in a few seconds...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-red-600">Confirmation Failed</h1>
              <p className="text-muted-foreground">
                {message}
              </p>
            </>
          )}
        </div>

        {status === 'success' && (
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="w-full btn-gradient"
          >
            Go to Dashboard
          </Button>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full btn-gradient"
            >
              Back to Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}