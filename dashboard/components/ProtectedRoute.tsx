'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'organization_owner';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      const redirectPath = user.role === 'super_admin' ? '/admin' : '/organization';
      router.push(redirectPath);
      return;
    }
  }, [isAuthenticated, user, requiredRole, router]);

  // Show loading or nothing while checking
  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600">Redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
}
