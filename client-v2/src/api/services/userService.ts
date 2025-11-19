import { apiClient } from '../axios';
import { User } from '../../types';

export const userService = {
  async getUsers() {
    return apiClient.get<User[]>('/users');
  },
};
