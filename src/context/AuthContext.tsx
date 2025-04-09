import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/types';
import apiClient from '@/lib/apiClient'; // Import the configured axios instance

// Define the structure of the user data coming from the backend API
interface BackendUser {
  _id: string; // Backend uses _id
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // Assuming backend sends ISO string
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null; // Keep track of the access token
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>; // Role is optional for buyer
  logout: () => void;
  checkAuthStatus: () => Promise<void>; // Add function to explicitly check auth status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to map backend user to frontend user type
const mapBackendUserToFrontend = (backendUser: BackendUser): User => ({
  id: backendUser._id, // Map _id to id
  name: backendUser.name,
  email: backendUser.email,
  role: backendUser.role,
  createdAt: backendUser.createdAt,
  isBanned: !backendUser.isActive, // Map isActive to isBanned
  // avatar is optional, handle if backend provides it
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('kichu_lagbe_user');

    if (token && storedUser) {
        try {
            // Optional: Verify token validity with a lightweight backend endpoint
            // If token is invalid/expired, the interceptor in apiClient will handle refresh or logout
            // For now, assume if token and user exist, they are likely valid (refresh handled on API call)
            setUser(JSON.parse(storedUser));
            setAccessToken(token);
        } catch (error) {
            console.error('Error parsing stored user:', error);
            // Clear potentially corrupted data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('kichu_lagbe_user');
            setUser(null);
            setAccessToken(null);
        }
    } else {
        // Clear any partial data if one is missing
        localStorage.removeItem('accessToken');
        localStorage.removeItem('kichu_lagbe_user');
        setUser(null);
        setAccessToken(null);
    }
    setIsLoading(false);
  }, []);

  // Initial check on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function using apiClient
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{ user: BackendUser; accessToken: string }>('/api/auth/login', { email, password });
      const { user: backendUser, accessToken: receivedToken } = response.data;

      const frontendUser = mapBackendUserToFrontend(backendUser);

      localStorage.setItem('accessToken', receivedToken);
      localStorage.setItem('kichu_lagbe_user', JSON.stringify(frontendUser));
      setAccessToken(receivedToken);
      setUser(frontendUser);

    } catch (error: any) {
      console.error('Login error:', error.response?.data?.message || error.message);
      // Clear any potentially stale data on failed login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('kichu_lagbe_user');
      setAccessToken(null);
      setUser(null);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function using apiClient
  const register = async (name: string, email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      // Role is optional in the backend, defaults to buyer
      const payload: { name: string; email: string; password: string; role?: UserRole } = { name, email, password };
      if (role) {
        payload.role = role;
      }
      // Assuming the register endpoint returns the created user (without password)
      const response = await apiClient.post<{ user: BackendUser; message: string }>('/api/auth/register', payload);

      console.log(response.data.message); // Log success message
      // Optionally log the user in automatically after registration
      // await login(email, password);

    } catch (error: any) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
        // Call backend logout to clear httpOnly cookie
        await apiClient.post('/api/auth/logout');
    } catch (error: any) { 
        // Log error but proceed with client-side cleanup
        console.error('Backend logout error:', error.response?.data?.message || error.message); 
    } finally {
        // Always clear client-side state and token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('kichu_lagbe_user');
        setAccessToken(null);
        setUser(null);
        setIsLoading(false);
        // Optionally redirect to login page
        // window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        register,
        logout,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
