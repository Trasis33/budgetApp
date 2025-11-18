import { apiClient } from '../axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/register', userData);
  },

  async getCurrentUser() {
    return apiClient.get('/auth/user');
  },

  async updateProfile(data: { name?: string; email?: string; currentPassword?: string; newPassword?: string; color?: string }) {
    return apiClient.put('/auth/profile', data);
  },

  async invitePartner(email: string) {
    return apiClient.post('/auth/invite-partner', { email });
  },

  async getUsers() {
    return apiClient.get('/auth/users');
  },
};
