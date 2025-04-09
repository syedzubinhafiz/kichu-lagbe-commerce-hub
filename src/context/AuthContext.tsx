
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would fetch user data from the server
        const userData = localStorage.getItem('kichu_lagbe_user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mock login function - in production this would call an API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data for demo purposes
      let mockUser: User;
      
      // For demo purposes, we'll use specific emails to determine role
      if (email === 'admin@kichulage.com') {
        mockUser = {
          id: '1',
          name: 'Admin User',
          email: 'admin@kichulage.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
      } else if (email === 'seller@kichulage.com') {
        mockUser = {
          id: '2',
          name: 'Seller User',
          email: 'seller@kichulage.com',
          role: 'seller',
          createdAt: new Date().toISOString()
        };
      } else {
        mockUser = {
          id: '3',
          name: 'Buyer User',
          email: email,
          role: 'buyer',
          createdAt: new Date().toISOString()
        };
      }
      
      setUser(mockUser);
      localStorage.setItem('kichu_lagbe_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user creation
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      };
      
      setUser(newUser);
      localStorage.setItem('kichu_lagbe_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kichu_lagbe_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
