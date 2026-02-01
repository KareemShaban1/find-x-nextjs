'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';

interface Offer {
  id: number;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: string;
  start_date: string;
  end_date: string;
  image_url: string | null;
  status: string;
  terms: string | null;
}

export default function EditOfferPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    image_url: '',
    terms: '',
  });

  useEffect(() => {
    let cancelled = false;
    api
      .get('/organization/offers')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        const offer = list.find((o: Offer) => o.id === id);
        if (!cancelled && offer) {
          setFormData({
            title: offer.title,
            description: offer.description || '',
            discount_type: offer.discount_type,
            discount_value: String(offer.discount_value),
            start_date: offer.start_date,
            end_date: offer.end_date,
            image_url: offer.image_url || '',
            terms: offer.terms || '',
          });
        } else if (!cancelled) {
          router.replace('/organization/offers');
        }
      })
      .catch(() => router.replace('/organization/offers'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, WebP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be 5MB or less.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.discount_value || Number(formData.discount_value) < 0) {
      alert('Discount value must be 0 or greater');
      return;
    }
    if (formData.discount_type === 'percentage' && Number(formData.discount_value) > 100) {
      alert('Percentage discount cannot exceed 100');
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      alert('Start and end dates are required');
      return;
    }
    setSaving(true);
    try {
      if (imageFile) {
        const body = new FormData();
        body.append('title', formData.title.trim());
        body.append('description', formData.description.trim());
        body.append('discount_type', formData.discount_type);
        body.append('discount_value', String(formData.discount_value));
        body.append('start_date', formData.start_date);
        body.append('end_date', formData.end_date);
        body.append('terms', formData.terms.trim());
        body.append('image', imageFile);
        await api.post(`/organization/offers/${id}`, body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.put(`/organization/offers/${id}`, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          discount_type: formData.discount_type,
          discount_value: Number(formData.discount_value),
          start_date: formData.start_date,
          end_date: formData.end_date,
          image_url: formData.image_url.trim() || undefined,
          terms: formData.terms.trim() || undefined,
        });
      }
      router.push('/organization/offers');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update offer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <Link href="/organization/offers" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} />
          Back to Offers
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Offer</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount type *</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount value *</label>
                <input
                  type="number"
                  min={0}
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                  step={formData.discount_type === 'percentage' ? 1 : 0.01}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End date *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer image</label>
              <p className="text-xs text-gray-500 mb-2">Upload a new image (JPEG, PNG, GIF, WebP, max 5MB) or use URL below. Current image is shown if no new file is selected.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="New preview" className="h-40 w-auto rounded-lg border border-gray-200 object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    aria-label="Remove new image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : formData.image_url ? (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Current image</p>
                  <img src={formData.image_url} alt="Current" className="h-40 w-auto rounded-lg border border-gray-200 object-cover" />
                </div>
              ) : null}
              {!imagePreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-gray-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 mb-2"
                >
                  <Upload className="h-5 w-5" />
                  {formData.image_url ? 'Replace image' : 'Choose image to upload'}
                </button>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Or use image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="https://..."
                  disabled={!!imageFile}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms (max 500 chars)</label>
              <input
                type="text"
                maxLength={500}
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/organization/offers" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
