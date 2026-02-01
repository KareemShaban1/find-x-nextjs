'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(user.role === 'super_admin' ? '/admin' : '/organization');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-gray-600">Redirecting...</div>
    </div>
  );
}
