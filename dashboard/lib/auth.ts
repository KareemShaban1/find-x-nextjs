import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'organization_owner';
  business_id?: number;
  business?: {
    id: number;
    name: string;
  };
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/login', { email, password });
      console.log('Login API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'super_admin' | 'organization_owner';
    business_id?: number;
  }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/user');
    return response.data;
  },
};
