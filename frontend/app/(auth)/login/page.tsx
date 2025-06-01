// oteam/frontend/app/(auth)/login/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams for redirect
import { useAuth } from '@/contexts/AuthContext';
import { authService, LoginPayload } from '@/services/auth.service'; // Import service
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isLoading to avoid conflict
  const { login, isAuthenticated, isLoading: authIsLoading } = useAuth(); // Get isAuthenticated and authIsLoading
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already authenticated and not in auth loading state, redirect from login page
    if (!authIsLoading && isAuthenticated) {
      const redirectUrl = searchParams.get('redirect') || determineDashboardRoute();
      router.push(redirectUrl);
    }
  }, [isAuthenticated, authIsLoading, router, searchParams]);


  // Helper to determine dashboard route based on user (if already logged in)
  // This needs access to user.roles from useAuth(), so it's a bit tricky here if user is not yet set
  // We'll simplify and rely on the handleSubmit redirect for now.
  // The useEffect above handles existing sessions.
  const determineDashboardRoute = (userRoles?: Role[]): string => {
    // This is a simplified version. A more robust one would be in useAuth or a helper.
    if (userRoles?.includes(Role.PLATFORM_ADMIN)) return '/dashboard/admin';
    if (userRoles?.includes(Role.EXPERT) || userRoles?.includes(Role.TDM)) return '/dashboard/expert'; // TDM grouped with Expert for now
    if (userRoles?.includes(Role.CLIENT_ADMIN) || userRoles?.includes(Role.CLIENT_SUB_USER)) return '/dashboard/client';
    return '/dashboard/client'; // Default fallback
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const payload: LoginPayload = { email, password };
      const { accessToken, user } = await authService.login(payload); // Use authService
      login(accessToken, user); // Update AuthContext
      
      toast({ title: "Login Successful", description: `Welcome back, ${user.firstName || user.email}!` });
      
      const redirectUrl = searchParams.get('redirect') || determineDashboardRoute(user.roles);
      router.push(redirectUrl); // Redirect after successful login

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner if auth is still loading or user is already authenticated and redirecting
  if (authIsLoading) {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
      </div>
    );
  }
  // If authenticated and not loading, useEffect will redirect.
  // This prevents brief flash of login form if already logged in.


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="mx-auto grid w-[380px] gap-6 bg-white p-8 sm:p-10 rounded-lg shadow-xl dark:bg-slate-800">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Login</h1>
          <p className="text-balance text-slate-600 dark:text-slate-400">
            Enter your email below to login to your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline hover:text-blue-600 dark:hover:text-blue-400">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}