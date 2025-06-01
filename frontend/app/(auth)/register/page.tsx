// oteam/frontend/app/(auth)/register/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService, RegisterPayload, UserProfile } from '@/services/auth.service'; // Import service
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Role } from '@/lib/types'; // Import Role

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

 useEffect(() => {
    // If user is already authenticated, redirect from register page
    if (!authIsLoading && isAuthenticated) {
      router.push(determineDashboardRoute()); // Or a default dashboard
    }
  }, [isAuthenticated, authIsLoading, router]);

  // Simplified dashboard route determination
  const determineDashboardRoute = (userRoles?: Role[]): string => {
    if (userRoles?.includes(Role.PLATFORM_ADMIN)) return '/dashboard/admin';
    if (userRoles?.includes(Role.EXPERT) || userRoles?.includes(Role.TDM)) return '/dashboard/expert';
    // For self-registration, users will likely be CLIENT_SUB_USER or CLIENT_ADMIN
    // Defaulting to client dashboard after registration is common.
    return '/dashboard/client'; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast({ title: "Registration Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const payload: RegisterPayload = { email, password, firstName, lastName };
      // The backend assigns default roles (e.g., CLIENT_SUB_USER) on self-registration
      const { accessToken, user } = await authService.register(payload);
      login(accessToken, user); // Update AuthContext

      toast({ title: "Registration Successful", description: `Welcome, ${user.firstName || user.email}! Your account has been created.` });
      router.push(determineDashboardRoute(user.roles)); // Redirect after successful registration
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <div className="mx-auto grid w-[400px] gap-6 bg-white p-8 sm:p-10 rounded-lg shadow-xl dark:bg-slate-800">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-balance text-slate-600 dark:text-slate-400">
            Enter your information to create an account.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300">First Name</Label>
              <Input
                id="firstName" type="text" placeholder="John" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} required
                className="bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300">Last Name</Label>
              <Input
                id="lastName" type="text" placeholder="Doe" value={lastName}
                onChange={(e) => setLastName(e.target.value)} required
                className="bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
            <Input
              id="email" type="email" placeholder="m@example.com" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
            <Input
              id="password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} minLength={8}
              className="bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Confirm Password</Label>
            <Input
              id="confirmPassword" type="password" required value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} minLength={8}
              className="bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : 'Create Account'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-blue-600 dark:hover:text-blue-400">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}