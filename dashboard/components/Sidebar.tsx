'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  FolderTree,
  Users,
  Star,
  Mail,
  LogOut,
  X,
  Tag,
  Package,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarProps {
  role: 'super_admin' | 'organization_owner';
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export default function Sidebar({ role, mobileMenuOpen, onToggleMobileMenu }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isRtl } = useLanguage();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors
    }
    clearAuth();
    router.push('/login');
  };

  const adminMenuItems = [
    { href: '/admin', labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
    { href: '/admin/businesses', labelKey: 'sidebar.businesses', icon: Building2 },
    { href: '/admin/categories', labelKey: 'sidebar.categories', icon: FolderTree },
    { href: '/admin/offers', labelKey: 'sidebar.offers', icon: Tag },
    { href: '/admin/users', labelKey: 'sidebar.users', icon: Users },
  ];

  const orgMenuItems = [
    { href: '/organization', labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
    { href: '/organization/business', labelKey: 'sidebar.myBusiness', icon: Building2 },
    { href: '/organization/products', labelKey: 'sidebar.products', icon: Package },
    { href: '/organization/offers', labelKey: 'sidebar.offers', icon: Tag },
    { href: '/organization/reviews', labelKey: 'sidebar.reviews', icon: Star },
    { href: '/organization/contact-requests', labelKey: 'sidebar.contactRequests', icon: Mail },
  ];

  const menuItems = role === 'super_admin' ? adminMenuItems : orgMenuItems;

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/organization') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar: left in LTR, right in RTL */}
      <div
        className={`
          fixed inset-y-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
          ${isRtl ? 'right-0' : 'left-0'}
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <h1 className="text-xl font-bold">{t('sidebar.findX')}</h1>
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onToggleMobileMenu}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors
                    ${active
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} className={isRtl ? 'ml-3' : 'mr-3'} />
                  <span className="font-medium">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut size={20} className={isRtl ? 'ml-3' : 'mr-3'} />
              <span className="font-medium">{t('sidebar.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggleMobileMenu}
        />
      )}
    </>
  );
}
