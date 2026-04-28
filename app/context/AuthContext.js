'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, removeToken, setToken } from '@/lib/auth'; // Fixed import path

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        removeToken();
        setUser(null);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { token, user: userData } = await response.json();
      setToken(token);
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeToken();
      setUser(null);
      router.push('/login');
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const { token, user: newUser } = await response.json();
      setToken(token);
      setUser(newUser);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return { success: true };
      }
      throw new Error('Update failed');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    isEmployee: user?.role === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}