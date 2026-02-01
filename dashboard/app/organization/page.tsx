'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Star, Mail, TrendingUp, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStats {
  business: any;
  total_reviews: number;
  average_rating: number | null;
  total_contact_requests: number;
  recent_reviews: any[];
  recent_contact_requests: any[];
}

export default function OrganizationDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/organization/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">{t('common.loading')}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats || !stats.business) {
    return (
      <DashboardLayout>
        <div className="text-red-600">{t('organization.noBusiness')}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('organization.dashboard')}</h1>

        {/* Business Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{stats.business.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{t('common.category')}</p>
              <p className="text-lg font-semibold text-gray-900">{stats.business.category?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{t('common.rating')}</p>
              <p className="text-lg font-semibold text-gray-900">{stats.average_rating != null ? Number(stats.average_rating).toFixed(1) : '0.0'} ⭐</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500 mb-1">{t('common.address')}</p>
              <p className="text-lg font-semibold text-gray-900">{stats.business.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{t('common.status')}</p>
              <p className="text-lg font-semibold">
                {stats.business.is_open ? (
                  <span className="text-green-600">{t('common.open')}</span>
                ) : (
                  <span className="text-red-600">{t('common.closed')}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 bg-yellow-500 rounded-lg p-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">{t('organization.totalReviews')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_reviews}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 bg-indigo-500 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">{t('organization.averageRating')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.average_rating != null ? Number(stats.average_rating).toFixed(1) : '0.0'} ⭐</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 bg-red-500 rounded-lg p-3">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">{t('organization.contactRequests')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_contact_requests}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/organization/business"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-indigo-500"
          >
            <Building2 className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('business.editBusiness')}</h3>
            <p className="text-sm text-gray-600">{t('organization.updateBusinessInfo')}</p>
          </a>
          <a
            href="/organization/reviews"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-indigo-500"
          >
            <Star className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('reviews.title')}</h3>
            <p className="text-sm text-gray-600">{t('organization.seeAllReviews')}</p>
          </a>
          <a
            href="/organization/contact-requests"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-indigo-500"
          >
            <Mail className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('contactRequests.title')}</h3>
            <p className="text-sm text-gray-600">{t('organization.viewInquiries')}</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
