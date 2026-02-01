'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Check, X, Tag, Calendar, Building2 } from 'lucide-react';

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
  business: { id: number; name: string; slug: string };
  created_at: string;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionOffer, setActionOffer] = useState<Offer | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOffers = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/admin/offers', { params });
      const data = response.data.data ?? response.data;
      setOffers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [statusFilter]);

  const handleConfirm = async () => {
    if (!actionOffer || !actionType) return;
    setSubmitting(true);
    try {
      await api.patch(`/admin/offers/${actionOffer.id}`, {
        status: actionType,
        admin_notes: adminNotes.trim() || undefined,
      });
      setActionOffer(null);
      setActionType(null);
      setAdminNotes('');
      fetchOffers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update offer');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setActionOffer(null);
    setActionType(null);
    setAdminNotes('');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Offers</h1>
        <p className="text-gray-600 mb-6">
          Approve or reject offers submitted by businesses. Approved offers appear on the home page and on business detail pages.
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              <Tag className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              No offers found.
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
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Building2 size={16} />
                      {offer.business?.name ?? '—'}
                    </div>
                    <p className="text-indigo-600 font-medium mb-1">{formatDiscount(offer)}</p>
                    {offer.description && <p className="text-gray-600 text-sm mb-2">{offer.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(offer.start_date).toLocaleDateString()} – {new Date(offer.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    {offer.admin_notes && (
                      <p className="mt-2 text-sm text-gray-600">Admin note: {offer.admin_notes}</p>
                    )}
                  </div>
                  {offer.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setActionOffer(offer);
                          setActionType('approved');
                          setAdminNotes('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setActionOffer(offer);
                          setActionType('rejected');
                          setAdminNotes('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {actionOffer && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {actionType === 'approved' ? 'Approve' : 'Reject'} offer: {actionOffer.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {actionType === 'rejected' ? 'Optional note (e.g. reason for rejection):' : 'Optional admin note:'}
              </p>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
                placeholder="Admin notes..."
              />
              <div className="flex gap-3 justify-end">
                <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${actionType === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {submitting ? 'Saving...' : actionType === 'approved' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
