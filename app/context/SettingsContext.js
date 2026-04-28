'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // General settings
    companyName: 'ENSURE System',
    companyLogo: '/logo.png',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    timezone: 'Africa/Johannesburg',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    desktopNotifications: true,
    
    // Module settings
    defaultJobStatus: 'not_started',
    defaultQuoteStatus: 'pending',
    autoApproveQuotes: false,
    requirePONumber: true,
    
    // Display settings
    itemsPerPage: 25,
    defaultCurrency: 'ZAR',
    compactView: false,
    showWeekNumbers: false,
    
    // Security settings
    sessionTimeout: 60, // minutes
    twoFactorAuth: false,
    loginNotifications: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const updateSettings = async (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
    
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const resetSettings = async () => {
    const defaultSettings = {
      companyName: 'ENSURE System',
      companyLogo: '/logo.png',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      timezone: 'Africa/Johannesburg',
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      desktopNotifications: true,
      defaultJobStatus: 'not_started',
      defaultQuoteStatus: 'pending',
      autoApproveQuotes: false,
      requirePONumber: true,
      itemsPerPage: 25,
      defaultCurrency: 'ZAR',
      compactView: false,
      showWeekNumbers: false,
      sessionTimeout: 60,
      twoFactorAuth: false,
      loginNotifications: true,
    };
    
    setSettings(defaultSettings);
    
    try {
      await fetch('/api/settings/reset', { method: 'POST' });
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const value = {
    settings,
    loading,
    updateSetting,
    updateSettings,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}