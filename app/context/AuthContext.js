'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/hooks/useToast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        await fetchUser(storedToken);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Fetch user data with token
  const fetchUser = async (authToken) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPermissions(data.permissions || []);
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast('Login successful!', 'success');
        router.push('/');
        return { success: true };
      } else {
        showToast(data.error || 'Login failed', 'error');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Login failed. Please try again.', 'error');
      return { success: false, error: error.message };
    }
  };

  // Register
  const register = async (name, email, password, role = 'user') => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast('Registration successful!', 'success');
        router.push('/');
        return { success: true };
      } else {
        showToast(data.error || 'Registration failed', 'error');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast('Registration failed. Please try again.', 'error');
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setPermissions([]);
      showToast('Logged out successfully', 'info');
      router.push('/login');
    }
  }, [router, showToast]);

  // Check permission
  const hasPermission = useCallback((permission) => {
    if (user?.role === 'admin') return true;
    return permissions.includes(permission);
  }, [user, permissions]);

  // Check role
  const hasRole = useCallback((role) => {
    if (user?.role === 'admin') return true;
    return user?.role === role;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      permissions,
      login,
      register,
      logout,
      hasPermission,
      hasRole,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}