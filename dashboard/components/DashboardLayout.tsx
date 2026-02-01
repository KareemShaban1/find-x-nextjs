'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/contexts/LanguageContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ProtectedRoute from './ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);
  const { isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!user) return null;

  return (
    <ProtectedRoute requiredRole={user.role}>
      <div className="min-h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
        <Sidebar
          role={user.role}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
        />
        {/* Content area: margin on sidebar side (left in LTR, right in RTL) */}
        <div className={isRtl ? 'lg:mr-64' : 'lg:ml-64'}>
          <TopBar
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
          />
          <main className="p-6 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
