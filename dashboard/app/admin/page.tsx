'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, FolderTree, Users, Star, Mail, TrendingUp } from 'lucide-react';

interface DashboardStats {
  total_businesses: number;
  total_categories: number;
  total_users: number;
  total_reviews: number;
  total_contact_requests: number;
  featured_businesses: number;
  recent_businesses: any[];
  recent_users: any[];
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
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
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-red-600">Failed to load dashboard data</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-lg p-3">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Businesses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_businesses}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
                  <FolderTree className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_categories}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-lg p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-lg p-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_reviews}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">Featured Businesses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.featured_businesses}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-lg p-3">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">Contact Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_contact_requests}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <a
            href="/admin/businesses"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-indigo-500"
          >
            <Building2 className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Businesses</h3>
            <p className="text-sm text-gray-600">View and manage all businesses</p>
          </a>
          <a
            href="/admin/categories"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-indigo-500"
          >
            <FolderTree className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Categories</h3>
            <p className="text-sm text-gray-600">View and manage categories</p>
          </a>
          <a
            href="/admin/users"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-indigo-500"
          >
            <Users className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage users</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
