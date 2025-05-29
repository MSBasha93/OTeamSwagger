"use client";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui
import { LogOut, UserCircle, LayoutDashboard, Ticket, Bot } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <nav className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">OTeam</Link>
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-slate-300 transition-colors">
          OTeam
        </Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              {hasRole("PLATFORM_ADMIN") && <Link href="/dashboard/admin" className="hover:text-slate-300">Admin Dashboard</Link>}
              {hasRole("EXPERT") && <Link href="/dashboard/expert" className="hover:text-slate-300">Expert Dashboard</Link>}
              {(hasRole("CLIENT_ADMIN") || hasRole("CLIENT_SUB_USER")) && <Link href="/dashboard/client" className="hover:text-slate-300">Client Dashboard</Link>}
              
              <Link href="/tickets/new" className="hover:text-slate-300 flex items-center">
                <Ticket size={18} className="mr-1"/> New Ticket
              </Link>
              <Link href="/chat" className="hover:text-slate-300 flex items-center">
                <Bot size={18} className="mr-1"/> AI Chat
              </Link>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="font-medium hidden sm:inline">{user.firstName || user.email}</span>
              <Button variant="ghost" size="sm" onClick={logout} className="hover:bg-slate-700">
                <LogOut size={18} className="mr-1 sm:mr-2"/> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-slate-300">Login</Link>
              <Link href="/register" className="hover:text-slate-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;