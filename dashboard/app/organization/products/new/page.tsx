'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Upload, X } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    product_category: '',
    sort_order: '0',
    is_available: true,
    image_url: '',
  });

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
      setFormData((prev) => ({ ...prev, image_url: '' }));
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
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    const price = Number(formData.price);
    if (formData.price === '' || isNaN(price) || price < 0) {
      alert('Price must be 0 or greater');
      return;
    }
    setSaving(true);
    try {
      if (imageFile) {
        const body = new FormData();
        body.append('name', formData.name.trim());
        body.append('description', formData.description.trim());
        body.append('price', String(price));
        body.append('product_category', formData.product_category.trim());
        body.append('sort_order', formData.sort_order);
        body.append('is_available', formData.is_available ? '1' : '0');
        body.append('image', imageFile);
        await api.post('/organization/products', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/organization/products', {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          price,
          product_category: formData.product_category.trim() || undefined,
          sort_order: Number(formData.sort_order) || 0,
          is_available: formData.is_available,
          image_url: formData.image_url.trim() || undefined,
        });
      }
      router.push('/organization/products');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <Link href="/organization/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">New Product</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="e.g. Margherita Pizza"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Short description"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
              <input
                type="text"
                value={formData.product_category}
                onChange={(e) => setFormData({ ...formData, product_category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Main, Dessert, Appetizer"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
              <input
                type="number"
                min={0}
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_available" className="text-sm font-medium text-gray-700">Available</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-40 w-auto rounded-lg border object-cover" />
                <button type="button" onClick={clearImage} className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-gray-600 hover:border-indigo-400 hover:bg-indigo-50">
                <Upload className="h-5 w-5" />
                Choose image
              </button>
            )}
            <div className="mt-2">
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Or paste image URL"
                disabled={!!imageFile}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Product'}
            </button>
            <Link href="/organization/products" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
