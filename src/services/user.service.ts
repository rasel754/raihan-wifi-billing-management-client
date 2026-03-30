import api from './api';

export interface User {
  _id: string;
  name: string;
  phone: string;
  role: 'ADMIN' | 'EMPLOYEE';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  name: string;
  phone: string;
  password: string;
  role?: 'ADMIN' | 'EMPLOYEE';
}

// Backend wraps responses as: { success: boolean; message: string; data: T }
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const UserService = {
  /**
   * GET /api/v1/users  — Admin only
   * Returns all users (employees).
   */
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const res = await api.get<ApiResponse<User[]>>('/users');
    return res.data;
  },

  /**
   * POST /api/v1/users  — Admin only
   * Create a new user/employee.
   */
  createUser: async (data: CreateUserData): Promise<ApiResponse<User>> => {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data;
  },

  /**
   * PATCH /api/v1/users/:id  — Any authenticated user
   * Update an existing user by ID.
   */
  updateUser: async (
    id: string,
    data: Partial<CreateUserData>
  ): Promise<ApiResponse<User>> => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },

  /**
   * DELETE /api/v1/users/:id  — Any authenticated user
   * Delete a user by ID.
   */
  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return res.data;
  },
};
