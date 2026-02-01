'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  product_category: string | null;
  sort_order: number;
  is_available: boolean;
}

export default function OrganizationProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/organization/products');
      setProducts(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/organization/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <Link href="/organization/products/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            <Plus size={20} />
            New Product
          </Link>
        </div>
        <p className="text-gray-600 mb-6">
          Add products, menu items, or services depending on your business type. They appear on your business page.
        </p>
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No products yet. Add one to get started.</p>
              <Link href="/organization/products/new" className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:underline">
                <Plus size={18} /> Add product
              </Link>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white shadow rounded-lg p-6 border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="h-24 w-24 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
                  <p className="text-indigo-600 font-medium">${Number(product.price).toFixed(2)}</p>
                  {product.product_category && <span className="text-xs text-gray-500">{product.product_category}</span>}
                  {product.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>}
                  {!product.is_available && <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">Unavailable</span>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/organization/products/${product.id}/edit`} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Pencil size={16} /> Edit
                  </Link>
                  <button onClick={() => handleDelete(product.id)} className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
