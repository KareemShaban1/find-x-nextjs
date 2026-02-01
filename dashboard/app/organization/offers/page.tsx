'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, Tag, Calendar } from 'lucide-react';
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
  admin_notes: string | null;
  terms: string | null;
  created_at: string;
}

export default function OrganizationOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await api.get('/organization/offers');
      setOffers(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await api.delete(`/organization/offers/${id}`);
      fetchOffers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete offer');
    }
  };

  const formatDiscount = (o: Offer) => {
    if (o.discount_type === 'percentage') return `${o.discount_value}% off`;
    return `${o.discount_value} off`;
  };

  const statusBadge = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Offers</h1>
          <Link
            href="/organization/offers/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            New Offer
          </Link>
        </div>

        <p className="text-gray-600 mb-6">
          Create offers for your business. They must be approved by an administrator before they appear on the website and on your business page.
        </p>

        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              <Tag className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No offers yet. Create one to get started.</p>
              <Link href="/organization/offers/new" className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:underline">
                <Plus size={18} />
                Create offer
              </Link>
            </div>
          ) : (
            offers.map((offer) => (
              <div key={offer.id} className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{offer.title}</h2>
                      {statusBadge(offer.status)}
                    </div>
                    <p className="text-indigo-600 font-medium mb-1">{formatDiscount(offer)}</p>
                    {offer.description && <p className="text-gray-600 text-sm mb-2">{offer.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(offer.start_date).toLocaleDateString()} – {new Date(offer.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    {offer.status === 'rejected' && offer.admin_notes && (
                      <p className="mt-2 text-sm text-red-600">Admin note: {offer.admin_notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {offer.status === 'pending' && (
                      <>
                        <Link
                          href={`/organization/offers/${offer.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={16} />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
