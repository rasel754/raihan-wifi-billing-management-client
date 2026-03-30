import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

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

// Mock users
const MOCK_USERS = [
  { id: '1', phone: '01700000001', password: 'admin123', role: 'admin' as Role, name: 'Admin User' },
  { id: '2', phone: '01700000002', password: 'emp123', role: 'employee' as Role, name: 'Employee User' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('rs_wifi_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('rs_wifi_user'); }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.phone === phone && u.password === password);
    if (!found) throw new Error('Invalid phone number or password');
    const { password: _, ...userData } = found;
    localStorage.setItem('rs_wifi_token', 'mock-jwt-token');
    localStorage.setItem('rs_wifi_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('rs_wifi_token');
    localStorage.removeItem('rs_wifi_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
