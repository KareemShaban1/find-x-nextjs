'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Mail, Phone, Calendar } from 'lucide-react';

interface ContactRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/organization/contact-requests');
      setRequests(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch contact requests:', error);
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

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Requests</h1>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              No contact requests yet
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail size={16} />
                        {request.email}
                      </div>
                      {request.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={16} />
                          {request.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">From: </span>
                  <span className="text-sm text-gray-900">{request.name}</span>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{request.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
