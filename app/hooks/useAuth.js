// hooks/useAuth.js
'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Verify token with backend
        const response = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          setPermissions(userData.permissions || []);
        } else {
          logout();
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      setPermissions(data.permissions || []);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setPermissions([]);
    // Optional: call logout endpoint
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };
  
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };
  
  const hasRole = (role) => {
    return user?.role === role;
  };
  
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(p => permissions.includes(p));
  };
  
  const hasAllPermissions = (permissionList) => {
    return permissionList.every(p => permissions.includes(p));
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      hasPermission,
      hasRole,
      hasAnyPermission,
      hasAllPermissions,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}