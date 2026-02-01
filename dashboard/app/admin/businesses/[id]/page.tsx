'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

interface Business {
  id: number;
  name: string;
  category: { name: string; id: number };
  rating: number | null;
  review_count: number;
  price_range: number;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  description: string;
  featured: boolean;
  is_open: boolean;
  tags: Array<{ id: number; name: string }>;
  amenities: Array<{ id: number; name: string }>;
  photos: Array<{ id: number; url: string; is_primary: boolean }>;
  hours: Array<{ id: number; day_of_week: number; open_time: string; close_time: string; is_closed: boolean }>;
}

export default function BusinessViewPage() {
  const params = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBusiness();
    }
  }, [params.id]);

  const fetchBusiness = async () => {
    try {
      const response = await api.get(`/admin/businesses/${params.id}`);
      setBusiness(response.data);
    } catch (error) {
      console.error('Failed to fetch business:', error);
      alert('Failed to load business');
      router.push('/admin/businesses');
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

  if (!business) {
    return (
      <DashboardLayout>
        <div className="text-red-600">Business not found</div>
      </DashboardLayout>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/businesses"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
            {business.featured && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                Featured
              </span>
            )}
          </div>
          <Link
            href={`/admin/businesses/${business.id}/edit`}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Edit size={20} />
            Edit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-lg font-semibold text-gray-900">{business.category.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price Range</p>
                  <p className="text-lg font-semibold text-gray-900">{'$'.repeat(business.price_range)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="text-lg font-semibold text-gray-900">{business.rating != null ? Number(business.rating).toFixed(1) : '0.0'} ⭐ ({business.review_count || 0} reviews)</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-lg font-semibold">
                    {business.is_open ? (
                      <span className="text-green-600">Open</span>
                    ) : (
                      <span className="text-red-600">Closed</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {business.description && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700">{business.description}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {business.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">{business.address}</p>
                    {(business.city || business.state || business.postal_code) && (
                      <p className="text-gray-600">
                        {[business.city, business.state, business.postal_code].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {business.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{business.phone}</p>
                  </div>
                )}
                {business.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{business.email}</p>
                  </div>
                )}
                {business.website && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      {business.website}
                    </a>
                  </div>
                )}
                {(business.latitude && business.longitude) && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Coordinates</p>
                    <p className="text-gray-900">{business.latitude}, {business.longitude}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hours */}
            {business.hours && business.hours.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h2>
                <div className="space-y-2">
                  {business.hours.map((hour) => (
                    <div key={hour.id} className="flex justify-between">
                      <span className="text-gray-700">{daysOfWeek[hour.day_of_week - 1]}</span>
                      {hour.is_closed ? (
                        <span className="text-red-600">Closed</span>
                      ) : (
                        <span className="text-gray-900">{hour.open_time} - {hour.close_time}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {business.tags && business.tags.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {business.tags.map((tag) => (
                    <span key={tag.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {business.amenities && business.amenities.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <ul className="space-y-2">
                  {business.amenities.map((amenity) => (
                    <li key={amenity.id} className="text-gray-700">• {amenity.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Photos */}
            {business.photos && business.photos.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {business.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={business.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
