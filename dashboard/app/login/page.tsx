'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      console.log('Login response:', response);
      
      if (response.user && response.token) {
        console.log('Setting auth state...');
        setAuth(response.user, response.token);
        
        // Use router so basePath is applied (e.g. /dashboard/admin not /admin on main site)
        const redirectPath = response.user.role === 'super_admin' ? '/admin' : '/organization';
        router.push(redirectPath);
      } else {
        setError(t('login.errorInvalidResponse'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = t('login.errorDefault');
      if (err.response) {
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.email) {
          errorMessage = Array.isArray(err.response.data.email)
            ? err.response.data.email[0]
            : err.response.data.email;
        }
      } else if (err.request) {
        errorMessage = t('login.errorNoConnection');
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow relative">
        <div className="absolute top-4 right-4 flex rounded-lg overflow-hidden border border-gray-300">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-sm font-medium ${language === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`px-3 py-1.5 text-sm font-medium ${language === 'ar' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            AR
          </button>
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('login.subtitle')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t('login.email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t('login.password')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            {t('login.forCustomer')}{' '}
            <a
              href={typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t('login.signInOnMainSite')}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
