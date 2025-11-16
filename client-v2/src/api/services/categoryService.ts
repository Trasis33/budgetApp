import { apiClient } from '../axios';

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

export const categoryService = {
  async getCategories() {
    return apiClient.get<Category[]>('/categories');
  },

  async createCategory(data: { name: string; icon?: string; color?: string }) {
    return apiClient.post('/categories', data);
  },

  async updateCategory(id: number, data: { name?: string; icon?: string; color?: string }) {
    return apiClient.put(`/categories/${id}`, data);
  },

  async deleteCategory(id: number) {
    return apiClient.delete(`/categories/${id}`);
  },
};
