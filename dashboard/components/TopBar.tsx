'use client';

import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TopBarProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export default function TopBar({ mobileMenuOpen, onToggleMobileMenu }: TopBarProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* Left: mobile menu button + title (mobile only) */}
      <div className="flex items-center gap-3 lg:flex-1">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-lg font-bold text-gray-900 lg:hidden">{t('sidebar.findXDashboard')}</h1>
      </div>

      {/* Right: language switcher */}
      <div className="flex items-center gap-2">
        <Globe size={18} className="text-gray-500 shrink-0" aria-hidden />
        <div className="flex rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-sm font-medium ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`px-3 py-1.5 text-sm font-medium ${language === 'ar' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            AR
          </button>
        </div>
      </div>
    </div>
  );
}
