'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ImageUpload';
import BusinessHours from '@/components/BusinessHours';
import AmenitiesSelector from '@/components/AmenitiesSelector';
import TagsSelector from '@/components/TagsSelector';

// Dynamically import map component to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function NewBusinessPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [businessHours, setBusinessHours] = useState<Array<{
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }>>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subcategory: '',
    price_range: '1',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    featured: false,
    is_open: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        category_ids: selectedCategories,
        price_range: parseInt(formData.price_range),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        tag_ids: selectedTags,
        amenity_ids: selectedAmenities,
        hours: businessHours.length > 0 ? businessHours : undefined,
      };
      const response = await api.post('/admin/businesses', payload);
      const businessId = response.data.id;

      // Upload images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageData = images[i];
          // Convert base64 to blob
          const response = await fetch(imageData);
          const blob = await response.blob();
          const file = new File([blob], `image-${i}.jpg`, { type: blob.type || 'image/jpeg' });
          
          const uploadFormData = new FormData();
          uploadFormData.append('image', file);
          uploadFormData.append('is_primary', i === 0 ? '1' : '0');
          
          try {
            await api.post(`/admin/businesses/${businessId}/photos`, uploadFormData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        }
      }

      router.push('/admin/businesses');
    } catch (error: any) {
      console.error('Failed to create business:', error);
      alert(error.response?.data?.message || 'Failed to create business');
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

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/businesses"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Business</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                placeholder="e.g., Italian • Fine Dining"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Additional category information</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <select
                  multiple
                  value={selectedCategories.map(String)}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                    setSelectedCategories(values);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  required
                  suppressHydrationWarning
                  data-form-type="other"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple categories</p>
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategories.map((catId) => {
                      const cat = categories.find(c => c.id === catId);
                      return cat ? (
                        <span
                          key={catId}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                        >
                          {cat.name}
                          <button
                            type="button"
                            onClick={() => setSelectedCategories(selectedCategories.filter(id => id !== catId))}
                            className="hover:text-indigo-600"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
                suppressHydrationWarning
                data-form-type="other"
              >
                <option value="1">$</option>
                <option value="2">$$</option>
                <option value="3">$$$</option>
                <option value="4">$$$$</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Map Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-gray-500 text-xs">(Click on map to set location)</span>
              </label>
              <LocationMap
                latitude={formData.latitude ? parseFloat(formData.latitude) : null}
                longitude={formData.longitude ? parseFloat(formData.longitude) : null}
                onLocationChange={handleLocationChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
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
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                placeholder="e.g., -122.4194"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Set by clicking on map</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
            </div>

            {/* Tags Section */}
            <div className="md:col-span-2">
              <TagsSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>

            {/* Amenities Section */}
            <div className="md:col-span-2">
              <AmenitiesSelector
                selectedAmenities={selectedAmenities}
                onAmenitiesChange={setSelectedAmenities}
                allowCreate
              />
            </div>

            {/* Business Hours Section */}
            <div className="md:col-span-2">
              <BusinessHours
                hours={businessHours}
                onChange={setBusinessHours}
              />
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={10}
                label="Business Images (First image will be primary)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                placeholder="Business description..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured Business</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_open}
                  onChange={(e) => setFormData({ ...formData, is_open: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Currently Open</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Link
              href="/admin/businesses"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Creating...' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
