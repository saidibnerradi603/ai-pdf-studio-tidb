import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowEmailConfirmation(false);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error,
            variant: "destructive",
          });
        } else {
          // Navigation will be handled by the useEffect above
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.includes('confirmation link')) {
            setShowEmailConfirmation(true);
            toast({
              title: "Check your email",
              description: error,
            });
          } else {
            toast({
              title: "Registration failed",
              description: error,
              variant: "destructive",
            });
          }
        } else {
          setShowEmailConfirmation(true);
          toast({
            title: "Registration successful",
            description: "Please check your email and click the confirmation link to complete your registration.",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showEmailConfirmation) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Check your email</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We've sent a confirmation link to <strong>{email}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            Click the link in your email to complete your registration and access your dashboard.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground p-4 rounded-lg bg-muted/50 border border-border">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Email sent successfully</span>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setShowEmailConfirmation(false);
            setIsLogin(true);
          }}
          className="w-full"
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isLogin ? 'Sign in to access your AI-powered PDF studio' : 'Start transforming your PDFs today'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="glass-card border-glass-border focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"}
            className="glass-card border-glass-border focus:ring-primary focus:border-primary"
            minLength={isLogin ? undefined : 6}
            required
          />
        </div>
        <Button 
          type="submit" 
          className="w-full btn-gradient" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLogin ? 'Signing in...' : 'Creating account...'}
            </>
          ) : (
            isLogin ? 'Sign In' : 'Create Account'
          )}
        </Button>
      </form>
      
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setShowEmailConfirmation(false);
          }}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>

      {isLogin && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            Enter your email and password to sign in to your account.
          </p>
        </div>
      )}
    </div>
  );
}