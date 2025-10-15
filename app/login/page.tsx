'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/src/lib/auth-context';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const router = useRouter();

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors, isSubmitting: isSubmittingLogin },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors, isSubmitting: isSubmittingSignup },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Failed to login');
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      setError('');
      await signup(data.email, data.password, data.fullName);
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignup ? 'Sign Up' : 'Login'}</CardTitle>
          <CardDescription>
            {isSignup
              ? 'Create a new account to start purchasing AI bots'
              : 'Login to your account to continue shopping'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isSignup ? (
            <form onSubmit={handleSubmitSignup(onSignupSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  {...registerSignup('fullName')}
                  placeholder="John Doe"
                />
                {signupErrors.fullName && (
                  <p className="text-sm text-destructive">{signupErrors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  {...registerSignup('email')}
                  placeholder="you@example.com"
                />
                {signupErrors.email && (
                  <p className="text-sm text-destructive">{signupErrors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  {...registerSignup('password')}
                  placeholder="••••••••"
                />
                {signupErrors.password && (
                  <p className="text-sm text-destructive">{signupErrors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmittingSignup}>
                {isSubmittingSignup ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  {...registerLogin('email')}
                  placeholder="you@example.com"
                />
                {loginErrors.email && (
                  <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  {...registerLogin('password')}
                  placeholder="••••••••"
                />
                {loginErrors.password && (
                  <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmittingLogin}>
                {isSubmittingLogin ? 'Logging In...' : 'Login'}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-primary hover:underline"
            >
              {isSignup
                ? 'Already have an account? Login'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
