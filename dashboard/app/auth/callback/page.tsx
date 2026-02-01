'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import type { User } from '@/lib/auth';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (!token) {
      setError('Missing token');
      router.replace('/login');
      return;
    }

    const finishAuth = (user: User) => {
      setAuth(user, token);
      const isSuperAdmin = user.role === 'super_admin';
      router.replace(isSuperAdmin ? '/admin' : '/organization');
    };

    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam)) as User;
        if (user?.id && user?.email && (user.role === 'super_admin' || user.role === 'organization_owner')) {
          finishAuth(user);
          return;
        }
      } catch {
        // Fall through to fetch user
      }
    }

    // Store token so API can use it, then fetch user
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    authApi
      .getCurrentUser()
      .then((user) => finishAuth(user))
      .catch(() => {
        setError('Invalid token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        router.replace('/login');
      });
  }, [searchParams, setAuth, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{error}. Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Signing you in…</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
