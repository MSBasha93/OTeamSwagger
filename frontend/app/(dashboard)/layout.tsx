"use client";
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // For loading spinner

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=' + window.location.pathname); // Redirect to login if not authenticated
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
        <p className="ml-4 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  // User is authenticated, render the children (specific dashboard page)
  return <>{children}</>;
}