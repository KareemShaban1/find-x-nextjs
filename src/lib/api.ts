import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/** Base URL of the business dashboard (Next.js app). Used to redirect after login/register. */
export const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3008';

/** Build URL to redirect business user to dashboard with auth token. */
export function getDashboardAuthRedirect(token: string): string {
  return `${DASHBOARD_URL}/auth/callback?token=${encodeURIComponent(token)}`;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach stored token to requests
const token = localStorage.getItem('auth_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  business_name?: string;
  plan_id?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly?: number;
  features: string[];
  highlighted?: boolean;
}

export const AUTH_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    slug: 'basic',
    name: 'Basic',
    price_monthly: 29,
    price_yearly: 290,
    features: ['1 business listing', 'Contact form', 'Basic analytics', 'Email support'],
  },
  {
    id: 'pro',
    slug: 'pro',
    name: 'Pro',
    price_monthly: 79,
    price_yearly: 790,
    highlighted: true,
    features: ['Up to 5 listings', 'Priority placement', 'Advanced analytics', 'Photo gallery', 'Reviews management', 'Phone support'],
  },
  {
    id: 'enterprise',
    slug: 'enterprise',
    name: 'Enterprise',
    price_monthly: 199,
    price_yearly: 1990,
    features: ['Unlimited listings', 'API access', 'Dedicated account manager', 'Custom branding', 'White-label options', '24/7 support'],
  },
];

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/login', { email, password });
    const { user, token } = response.data;
    if (token) {
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return { user, token };
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    business_name?: string;
    business_address?: string;
    business_phone?: string;
    plan_id?: string;
    role?: string;
  }): Promise<{ user: User; token: string }> => {
    const payload = { ...data, role: data.role ?? 'organization_owner' };
    const response = await api.post('/register', payload);
    const { user, token } = response.data;
    if (token) {
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return { user, token };
  },

  registerCustomer: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await api.post('/register', {
      ...data,
      role: 'customer',
    });
    const { user, token } = response.data;
    if (token) {
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return { user, token };
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      return null;
    }
  },
};

export const favoritesApi = {
  list: async (): Promise<{ id: number; name: string; slug: string; category?: string; rating: number; review_count: number; address?: string; city?: string; image?: string }[]> => {
    const response = await api.get('/user/favorites');
    return response.data;
  },
  add: async (businessId: number): Promise<void> => {
    await api.post(`/user/favorites/${businessId}`);
  },
  remove: async (businessId: number): Promise<void> => {
    await api.delete(`/user/favorites/${businessId}`);
  },
};

export const reviewsApi = {
  create: async (businessId: number, data: { rating: number; content: string }): Promise<unknown> => {
    const response = await api.post(`/businesses/${businessId}/reviews`, data);
    return response.data;
  },
};

/** Business type controls which sections (amenities, gallery, hours) are shown on the detail page. */
export type BusinessType = 'restaurant' | 'retail' | 'service' | 'other';

/** Sections shown per business type: restaurant (all), retail (gallery + hours), service (amenities + hours), other (all). */
export const BUSINESS_TYPE_SECTIONS: Record<BusinessType, ('amenities' | 'gallery' | 'hours')[]> = {
  restaurant: ['amenities', 'gallery', 'hours'],
  retail: ['gallery', 'hours'],
  service: ['amenities', 'hours'],
  other: ['amenities', 'gallery', 'hours'],
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant: 'Restaurant / Food',
  retail: 'Retail / Shop',
  service: 'Service',
  other: 'Other',
};

export interface Business {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  business_type?: BusinessType;
  rating: number;
  reviews: number;
  distance?: number;
  distanceText?: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  tags: string[];
  featured: boolean;
  priceRange: number;
  image: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

export interface BusinessDetail extends Business {
  totalReviews: number;
  priceRange: string;
  images: string[];
  hours?: Array<{
    day: string;
    open: string | null;
    close: string | null;
    isClosed: boolean;
  }>;
  amenities?: string[];
  reviews?: Array<{
    id: number;
    author: string;
    avatar: string;
    rating: number;
    date: string;
    content: string;
    helpful: number;
    images: string[];
  }>;
  offers?: Offer[];
  products?: Product[];
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  productCategory: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  businesses_count?: number;
}

export interface Offer {
  id: number;
  title: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  terms: string | null;
  business?: {
    id: number;
    name: string;
    slug: string;
    city?: string;
    address?: string;
  };
}

export const offersApi = {
  list: async (params?: { limit?: number }): Promise<Offer[]> => {
    const response = await api.get('/public/offers', { params: params || { limit: 12 } });
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },
};

export const businessApi = {
  // Get all businesses with filters
  getBusinesses: async (params?: {
    search?: string;
    category?: string;
    min_rating?: number;
    price_range?: string;
    featured?: boolean;
    sort_by?: string;
    per_page?: number;
    page?: number;
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    radius_km?: number;
    location?: string;
  }): Promise<{ data: Business[]; current_page: number; last_page: number; total: number }> => {
    const response = await api.get('/public/businesses', { params });
    return {
      data: response.data.data || response.data,
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1,
      total: response.data.total || response.data.data?.length || 0,
    };
  },

  // Get single business by ID
  getBusiness: async (id: number | string): Promise<BusinessDetail> => {
    const response = await api.get(`/public/businesses/${id}`);
    return response.data;
  },

  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/public/categories');
    return response.data;
  },
};

export default api;
