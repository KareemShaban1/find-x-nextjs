'use client';

import { useState } from 'react';
import { Upload, X, Star, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';

export interface BusinessPhotoType {
  id: number;
  url: string;
  is_primary: boolean;
}

interface BusinessPhotosManagerProps {
  photos: BusinessPhotoType[];
  onUpdate: () => void;
  maxPhotos?: number;
}

export default function BusinessPhotosManager({
  photos,
  onUpdate,
  maxPhotos = 20,
}: BusinessPhotosManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (photos.length + files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} images allowed. You have ${photos.length}.`);
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('is_primary', i === 0 && photos.length === 0 ? '1' : '0');
        await api.post('/organization/business/photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload image(s)');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!confirm('Remove this image from your gallery?')) return;
    setDeletingId(photoId);
    try {
      await api.delete(`/organization/business/photos/${photoId}`);
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    setSettingPrimaryId(photoId);
    try {
      await api.patch(`/organization/business/photos/${photoId}/primary`);
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to set primary');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Gallery / Menu images
      </label>
      <p className="text-xs text-gray-500 mb-3">
        These images appear on your business detail page (e.g. products, menu, interior). First image is used as the main cover.
      </p>

      <div className="space-y-4">
        {/* Upload */}
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center py-4">
              {uploading ? (
                <div className="text-gray-500 text-sm">Uploading...</div>
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-1 text-gray-500" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 5MB • max {maxPhotos} images</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading || photos.length >= maxPhotos}
            />
          </label>
        </div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="Gallery"
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                {photo.is_primary && (
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Star size={12} className="fill-current" /> Cover
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {!photo.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={settingPrimaryId !== null}
                      className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50"
                      title="Set as cover"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId !== null}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 disabled:opacity-50"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
                {(deletingId === photo.id || settingPrimaryId === photo.id) && (
                  <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-600">...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
