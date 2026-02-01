'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Save } from 'lucide-react';
import dynamic from 'next/dynamic';
import BusinessHours from '@/components/BusinessHours';
import AmenitiesSelector from '@/components/AmenitiesSelector';
import BusinessPhotosManager from '@/components/BusinessPhotosManager';

// Dynamically import map component to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

type BusinessType = 'restaurant' | 'retail' | 'service' | 'other';

const BUSINESS_TYPE_SECTIONS: Record<BusinessType, ('amenities' | 'gallery' | 'hours')[]> = {
  restaurant: ['amenities', 'gallery', 'hours'],
  retail: ['gallery', 'hours'],
  service: ['amenities', 'hours'],
  other: ['amenities', 'gallery', 'hours'],
};

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant: 'Restaurant / Food',
  retail: 'Retail / Shop',
  service: 'Service',
  other: 'Other',
};

interface Category {
  id: number;
  name: string;
}

interface Business {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  price_range: number;
  is_open: boolean;
  category_id: number;
  latitude: number;
  longitude: number;
  business_type?: BusinessType;
  photos?: Array<{ id: number; url: string; is_primary: boolean }>;
}

export default function BusinessEditPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [businessHours, setBusinessHours] = useState<Array<{
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }>>([]);
  const [formData, setFormData] = useState<Partial<Business & { subcategory: string }>>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchBusiness();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/public/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBusiness = async () => {
    try {
      const response = await api.get('/organization/business');
      const businessData = response.data;
      setBusiness(businessData);
      setFormData(businessData);
      
      // Set amenities
      if (businessData.amenities && businessData.amenities.length > 0) {
        setSelectedAmenities(businessData.amenities.map((a: any) => a.id));
      }
      
      // Set business hours
      if (businessData.hours && businessData.hours.length > 0) {
        setBusinessHours(businessData.hours.map((h: any) => ({
          day_of_week: h.day_of_week,
          open_time: h.open_time || '',
          close_time: h.close_time || '',
          is_closed: h.is_closed || false,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        amenity_ids: selectedAmenities,
        hours: businessHours.length > 0 ? businessHours : undefined,
      };
      await api.put('/organization/business', payload);
      alert('Business updated successfully!');
      fetchBusiness();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update business');
    } finally {
      setSaving(false);
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
        <div className="text-red-600">No business found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Business</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category_id ?? ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
              <input
                type="text"
                value={(formData as any).subcategory || ''}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                placeholder="e.g., Italian • Fine Dining"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Additional category information</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business type</label>
              <select
                value={(formData as any).business_type || 'other'}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value as BusinessType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {(Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]).map((type) => (
                  <option key={type} value={type}>{BUSINESS_TYPE_LABELS[type]}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Controls which sections (Amenities, Gallery, Hours) appear on your page</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input
                type="text"
                value={formData.postal_code || ''}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
              />
            </div>

            {/* Map Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-gray-500 text-xs">(Click on map to set location)</span>
              </label>
              <LocationMap
                latitude={formData.latitude || null}
                longitude={formData.longitude || null}
                onLocationChange={handleLocationChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                placeholder="e.g., 37.7749"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Set by clicking on map</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                placeholder="e.g., -122.4194"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Set by clicking on map</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={formData.price_range || 1}
                onChange={(e) => setFormData({ ...formData, price_range: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>$</option>
                <option value={2}>$$</option>
                <option value={3}>$$$</option>
                <option value={4}>$$$$</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.is_open ? '1' : '0'}
                onChange={(e) => setFormData({ ...formData, is_open: e.target.value === '1' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">Open</option>
                <option value="0">Closed</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                placeholder="Describe your business..."
              />
            </div>

            {/* Gallery / Menu images - shown based on business type */}
            {business && BUSINESS_TYPE_SECTIONS[(business.business_type as BusinessType) || 'other']?.includes('gallery') && (
              <div className="md:col-span-2">
                <BusinessPhotosManager
                  photos={business.photos || []}
                  onUpdate={fetchBusiness}
                />
              </div>
            )}

            {/* Amenities Section - shown based on business type */}
            {business && BUSINESS_TYPE_SECTIONS[(business.business_type as BusinessType) || 'other']?.includes('amenities') && (
              <div className="md:col-span-2">
                <AmenitiesSelector
                  selectedAmenities={selectedAmenities}
                  onAmenitiesChange={setSelectedAmenities}
                />
              </div>
            )}

            {/* Business Hours Section - shown based on business type */}
            {business && BUSINESS_TYPE_SECTIONS[(business.business_type as BusinessType) || 'other']?.includes('hours') && (
              <div className="md:col-span-2">
                <BusinessHours
                  hours={businessHours}
                  onChange={setBusinessHours}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
