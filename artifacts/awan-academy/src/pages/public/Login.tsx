import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, GraduationCap } from 'lucide-react';
import logo from '@assets/logo_1782659947703.jpeg';
import type { Profile } from '@/lib/supabase';

function roleRedirect(profile: Profile) {
  if (profile.role === 'admin' || profile.role === 'owner') {
    window.location.href = '/dashboard/admin';
  } else if (profile.role === 'teacher') {
    window.location.href = '/dashboard/teacher';
  } else if (profile.role === 'parent') {
    window.location.href = '/dashboard/parent';
  } else {
    window.location.href = '/dashboard/student';
  }
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();

  // If already logged in, redirect immediately
  if (user) {
    roleRedirect(user);
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const profile = await signIn(email, password);
      if (profile) {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${profile.full_name}!`,
        });
        roleRedirect(profile);
      } else {
        // Auth succeeded but no profile row found
        toast({
          variant: 'destructive',
          title: 'Profile Not Set Up',
          description:
            'Your account exists but has no portal profile. Please contact the administrator.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid email or password.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-muted">
      {/* Maroon top half */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-primary" />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-border bg-gradient-to-b from-card to-muted/30">
            <img
              src={logo}
              alt="The Awan Academy"
              className="w-20 h-20 mx-auto rounded-full border-2 border-accent mb-4 shadow-md object-cover"
            />
            <h2 className="text-2xl font-serif font-bold text-foreground">Portal Login</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your dashboard — Admin, Teacher, Parent or Student
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="bg-background"
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background"
                  disabled={submitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-6 font-bold text-base"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <GraduationCap className="mr-2 h-5 w-5" />
                )}
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </div>

          <div className="p-4 bg-muted text-center text-xs text-muted-foreground border-t border-border">
            Secure Access • The Awan Academy
          </div>
        </div>
      </motion.div>
    </div>
  );
}
