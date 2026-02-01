'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import api from '@/lib/api';

interface Amenity {
  id: number;
  name: string;
}

interface AmenitiesSelectorProps {
  selectedAmenities: number[];
  onAmenitiesChange: (amenityIds: number[]) => void;
  /** When true, show "Create new amenity" and allow POST (admin only). Default false for org owners. */
  allowCreate?: boolean;
}

export default function AmenitiesSelector({ selectedAmenities, onAmenitiesChange, allowCreate = false }: AmenitiesSelectorProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [newAmenityName, setNewAmenityName] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchAmenities = async () => {
    try {
      const response = await api.get('/public/amenities');
      setAmenities(response.data);
    } catch (error) {
      console.error('Failed to fetch amenities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchAmenities();
    }
  }, [mounted]);

  const handleCreateAmenity = async () => {
    if (!newAmenityName.trim()) return;
    try {
      const response = await api.post('/admin/amenities', { name: newAmenityName });
      setAmenities([...amenities, response.data]);
      onAmenitiesChange([...selectedAmenities, response.data.id]);
      setNewAmenityName('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create amenity');
    }
  };

  const toggleAmenity = (amenityId: number) => {
    if (selectedAmenities.includes(amenityId)) {
      onAmenitiesChange(selectedAmenities.filter(id => id !== amenityId));
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId]);
    }
  };

  if (!mounted || loading) {
    return <div className="text-sm text-gray-500">Loading amenities...</div>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
      <div className="space-y-3">
        {/* Create new amenity (admin only) */}
        {allowCreate && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newAmenityName}
              onChange={(e) => setNewAmenityName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateAmenity())}
              placeholder="Create new amenity..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={handleCreateAmenity}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus size={20} />
            </button>
          </div>
        )}

        {/* Amenities grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {amenities.map((amenity) => (
            <label
              key={amenity.id}
              className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                selectedAmenities.includes(amenity.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity.id)}
                onChange={() => toggleAmenity(amenity.id)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{amenity.name}</span>
            </label>
          ))}
        </div>

        {/* Selected amenities chips */}
        {selectedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAmenities.map((amenityId) => {
              const amenity = amenities.find(a => a.id === amenityId);
              return amenity ? (
                <span
                  key={amenityId}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {amenity.name}
                  <button
                    type="button"
                    onClick={() => toggleAmenity(amenityId)}
                    className="hover:text-green-600"
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
  );
}
