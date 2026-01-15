import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; password: string; email: string; fullName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      const { token: authToken, userId, role, email, fullName } = response.data;
      
      const userData: User = { userId, username, email, fullName, role };
      
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  };

  const register = async (data: { username: string; password: string; email: string; fullName: string }) => {
    try {
      await authApi.register(data);
      // Auto-login after registration
      await login(data.username, data.password);
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
