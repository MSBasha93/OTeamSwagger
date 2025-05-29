"use client";
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
  const { user, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !hasRole(Role.PLATFORM_ADMIN)) {
      // Or any other admin-level roles like OPERATION_ADMIN, SDM
      router.push('/dashboard/client'); // Or a generic unauthorized page
    }
  }, [user, hasRole, router]);


  if (!user || !hasRole(Role.PLATFORM_ADMIN)) {
    return <p>Access Denied. You need admin privileges.</p>; // Or redirect
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-4">Welcome, {user.firstName || user.email}!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p>View and manage all platform users.</p>
          {/* TODO: Link to user management page */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Ticket Overview</h2>
          <p>Monitor all tickets across the platform.</p>
          {/* TODO: Link to ticket overview page */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">System Settings</h2>
          <p>Configure platform-wide settings.</p>
          {/* TODO: Link to settings page */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Billing & Subscriptions</h2>
          <p>Manage client subscriptions and billing.</p>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Expert Payroll</h2>
          <p>Monitor and manage expert payroll calculations.</p>
        </div>
      </div>
    </div>
  );
}