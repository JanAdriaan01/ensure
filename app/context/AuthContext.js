'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mark when component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe toast function - avoids circular dependency
  const showSafeToast = useCallback((message, type = 'info') => {
    if (typeof window !== 'undefined' && mounted) {
      // Try to import toast dynamically to avoid circular dependency
      import('@/app/context/ToastContext').then(({ useToast }) => {
        try {
          const toast = useToast();
          if (toast && toast[type]) {
            toast[type](message);
          } else if (toast && toast.showToast) {
            toast.showToast(message, type);
          }
        } catch (e) {
          console.log(`[${type}] ${message}`);
        }
      }).catch(() => {
        console.log(`[${type}] ${message}`);
      });
    } else {
      console.log(`[${type}] ${message}`);
    }
  }, [mounted]);

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedPermissions = localStorage.getItem('user_permissions');
        
        if (storedToken) {
          setToken(storedToken);
          if (storedPermissions) {
            setPermissions(JSON.parse(storedPermissions));
          }
          await fetchUser(storedToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_permissions');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    
    if (mounted) {
      initAuth();
    }
  }, [mounted]);

  // Fetch user data with token
  const fetchUser = async (authToken) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPermissions(data.permissions || []);
        localStorage.setItem('user_permissions', JSON.stringify(data.permissions || []));
      } else {
        console.warn('Token invalid, clearing auth state');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_permissions');
        setToken(null);
        setUser(null);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_permissions');
      setToken(null);
      setUser(null);
      setPermissions([]);
    }
  };

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('auth_token');
    if (currentToken) {
      await fetchUser(currentToken);
    }
  }, []);

  // Login
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        if (data.permissions) {
          localStorage.setItem('user_permissions', JSON.stringify(data.permissions));
        }
        
        setToken(data.token);
        setUser(data.user);
        setPermissions(data.permissions || []);
        
        showSafeToast(`Welcome back, ${data.user.name}!`, 'success');
        
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else if (data.user.role === 'manager') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
        
        return { success: true, user: data.user };
      } else {
        showSafeToast(data.error || 'Login failed', 'error');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      showSafeToast('Login failed. Please check your connection.', 'error');
      return { success: false, error: error.message };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        if (data.permissions) {
          localStorage.setItem('user_permissions', JSON.stringify(data.permissions));
        }
        
        setToken(data.token);
        setUser(data.user);
        setPermissions(data.permissions || []);
        
        showSafeToast('Registration successful! Welcome aboard!', 'success');
        router.push('/');
        
        return { success: true, user: data.user };
      } else {
        showSafeToast(data.error || 'Registration failed', 'error');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      showSafeToast('Registration failed. Please try again.', 'error');
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = useCallback(async (redirectTo = '/login') => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_permissions');
      setToken(null);
      setUser(null);
      setPermissions([]);
      showSafeToast('Logged out successfully', 'info');
      router.push(redirectTo);
    }
  }, [router, showSafeToast]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user?.role === 'admin') return true;
    return permissions.includes(permission);
  }, [user, permissions]);

  const hasAnyPermission = useCallback((permissionList) => {
    if (!user) return false;
    if (user?.role === 'admin') return true;
    return permissionList.some(p => permissions.includes(p));
  }, [user, permissions]);

  const hasAllPermissions = useCallback((permissionList) => {
    if (!user) return false;
    if (user?.role === 'admin') return true;
    return permissionList.every(p => permissions.includes(p));
  }, [user, permissions]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (user?.role === 'admin') return true;
    return user?.role === role;
  }, [user]);

  const hasRoleMinimum = useCallback((minRole) => {
    if (!user) return false;
    const roleLevels = { viewer: 1, user: 2, supervisor: 3, manager: 4, admin: 5 };
    const userLevel = roleLevels[user.role] || 0;
    const requiredLevel = roleLevels[minRole] || 0;
    return userLevel >= requiredLevel;
  }, [user]);

  const getUserName = useCallback(() => {
    if (!user) return 'Guest';
    return user.name || user.email?.split('@')[0] || 'User';
  }, [user]);

  const getUserInitials = useCallback(() => {
    if (!user) return '?';
    if (user.name) {
      const parts = user.name.split(' ');
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  }, [user]);

  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  const updatePermissions = useCallback((newPermissions) => {
    setPermissions(newPermissions);
    localStorage.setItem('user_permissions', JSON.stringify(newPermissions));
  }, []);

  const value = {
    user,
    token,
    loading,
    permissions,
    initialized,
    mounted,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isSupervisor: user?.role === 'supervisor',
    login,
    register,
    logout,
    refreshUser,
    updateUser,
    updatePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasRoleMinimum,
    getUserName,
    getUserInitials,
    userRole: user?.role,
    userEmail: user?.email,
    userId: user?.id,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Safe useAuth hook for prerendering
export function useAuth() {
  const context = useContext(AuthContext);
  // Return safe defaults during prerender
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      permissions: [],
      initialized: false,
      mounted: false,
      isAuthenticated: false,
      isAdmin: false,
      isManager: false,
      isSupervisor: false,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      logout: async () => {},
      refreshUser: async () => {},
      updateUser: () => {},
      updatePermissions: () => {},
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      hasRole: () => false,
      hasRoleMinimum: () => false,
      getUserName: () => 'Guest',
      getUserInitials: () => '?',
      userRole: null,
      userEmail: null,
      userId: null,
    };
  }
  return context;
}

// HOCs remain the same but need to use the safe hook internally
export function withAuth(Component, options = {}) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (!loading && !isAuthenticated) {
        const redirectTo = options.redirectTo || '/login';
        router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    }, [isAuthenticated, loading, router]);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-tertiary">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return null;
    }
    
    return <Component {...props} />;
  };
}

// Similar for withRole and withPermission...
export function withRole(Component, requiredRole) {
  return function RoleBasedComponent(props) {
    const { hasRole, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (!loading && !hasRole(requiredRole)) {
        router.push('/unauthorized');
      }
    }, [hasRole, loading, router, requiredRole]);
    
    if (loading) return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner mx-auto mb-4"></div>
      </div>
    );
    if (!hasRole(requiredRole)) return null;
    return <Component {...props} />;
  };
}

export function withPermission(Component, requiredPermission) {
  return function PermissionBasedComponent(props) {
    const { hasPermission, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (!loading && !hasPermission(requiredPermission)) {
        router.push('/unauthorized');
      }
    }, [hasPermission, loading, router, requiredPermission]);
    
    if (loading) return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner mx-auto mb-4"></div>
      </div>
    );
    if (!hasPermission(requiredPermission)) return null;
    return <Component {...props} />;
  };
}