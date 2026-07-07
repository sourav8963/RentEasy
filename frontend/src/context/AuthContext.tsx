import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosInstance } from 'axios';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  phone?: string;
  address?: string;
  businessName?: string;
  serviceAreas?: string[];
  referralCode?: string;
  easeCredits?: number;
  verifyStatus?: 'Unverified' | 'Pending' | 'Verified';
  verifyDocUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  registerUser: (userData: any) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<UserProfile>;
  api: AxiosInstance;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('rentease_token'));
  const [loading, setLoading] = useState(true);

  // Configure Axios Instance
  const api = axios.create({
    baseURL: API_URL
  });

  // Intercept requests to add JWT token
  api.interceptors.request.use((config) => {
    const activeToken = localStorage.getItem('rentease_token');
    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user profile, logging out', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: loggedUser } = res.data;
    localStorage.setItem('rentease_token', receivedToken);
    setToken(receivedToken);
    setUser(loggedUser);
    return loggedUser;
  };

  const registerUser = async (userData: any): Promise<UserProfile> => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: loggedUser } = res.data;
    localStorage.setItem('rentease_token', receivedToken);
    setToken(receivedToken);
    setUser(loggedUser);
    return loggedUser;
  };

  const updateProfile = async (profileData: any): Promise<UserProfile> => {
    const res = await api.put('/auth/profile', profileData);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('rentease_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout, updateProfile, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
