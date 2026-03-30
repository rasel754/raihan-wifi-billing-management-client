import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/auth.service';
import api from '@/services/api';

export type Role = 'admin' | 'employee';

interface User {
  id: string;
  phone: string;
  role: Role;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('rs_wifi_user');
    const storedToken = localStorage.getItem('rs_wifi_token');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Make sure the token is set on the api instance header for subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch {
        localStorage.removeItem('rs_wifi_user');
        localStorage.removeItem('rs_wifi_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const response = await AuthService.login(phone, password);

    // Backend returns: { success, message, data: { token, role } }
    const payload = response?.data ?? response;
    const accessToken: string = payload?.accessToken ?? payload?.token;

    if (!accessToken) {
      throw new Error('Invalid response from server');
    }

    // Decode JWT to get user info (backend doesn't return a user object)
    let userData = payload?.user;
    if (!userData) {
      try {
        const jwtPayload = JSON.parse(atob(accessToken.split('.')[1]));
        userData = {
          _id: jwtPayload.id,
          phone: jwtPayload.phone,
          role: jwtPayload.role,
          name: jwtPayload.name ?? 'User',
        };
      } catch {
        throw new Error('Failed to parse authentication token');
      }
    }

    const normalizedUser: User = {
      id: userData._id ?? userData.id,
      phone: userData.phone,
      // Backend sends uppercase role ("ADMIN"), normalize to lowercase
      role: (userData.role as string).toLowerCase() as Role,
      name: userData.name,
    };

    localStorage.setItem('rs_wifi_token', accessToken);
    localStorage.setItem('rs_wifi_user', JSON.stringify(normalizedUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem('rs_wifi_token');
    localStorage.removeItem('rs_wifi_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
