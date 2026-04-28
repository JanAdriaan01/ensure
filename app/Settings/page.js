'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/app/context/SettingsContext';
import { useTheme } from '@/app/context/ThemeContext';
import { useNotifications } from '@/app/context/NotificationContext';
import { useAuth } from '@/app/context/AuthContext';
import { usePermissions } from '@/app/context/PermissionContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import PageHeader from '@/app/components/layout/PageHeader';
import Card from '@/app/components/ui/Card/Card';
import Button from '@/app/components/ui/Button/Button';
import Tabs from '@/app/components/ui/Tabs';
import { FormInput, FormSelect, FormSwitch, FormTextarea, FormCurrencyInput } from '@/app/components/ui/Form';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import { useToast } from '@/app/hooks/useToast';

export default function SettingsPage() {
  const { settings, updateSetting, updateSettings, resetSettings, loading } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, setSoundEnabled, desktopEnabled, setDesktopEnabled, requestDesktopPermission } = useNotifications();
  const { user, updateUser, logout } = useAuth();
  const { can } = usePermissions();
  const { currency, setCurrency, zarToUsdRate, setZarToUsdRate } = useCurrency();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const tabs = [
    { id: 'general', label: '⚙️ General', icon: '⚙️' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { id: 'modules', label: '📦 Modules', icon: '📦' },
    { id: 'display', label: '🎨 Display', icon: '🎨' },
    { id: 'security', label: '🔒 Security', icon: '🔒' },
    { id: 'profile', label: '👤 Profile', icon: '👤' },
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate save delay
    setTimeout(() => {
      setSaving(false);
      showToast('Settings saved successfully', 'success');
    }, 500);
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      await resetSettings();
      showToast('Settings reset to default', 'success');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        showToast('Profile updated successfully', 'success');
      } else {
        const error = await res.json();
        showToast(error.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });
      
      if (res.ok) {
        showToast('Password changed successfully', 'success');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        const error = await res.json();
        showToast(error.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      showToast('Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/settings/export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ensure-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Data exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const res = await fetch('/api/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        showToast('Data imported successfully', 'success');
        window.location.reload();
      } else {
        showToast('Failed to import data', 'error');
      }
    } catch (error) {
      showToast('Invalid file format', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading settings..." />;

  if (!can('settings:edit')) {
    return (
      <div className="unauthorized-page">
        <div className="unauthorized-content">
          <span className="unauthorized-icon">🔒</span>
          <h1>Unauthorized Access</h1>
          <p>You don't have permission to access system settings.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
        <style jsx>{`
          .unauthorized-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
          }
          .unauthorized-content {
            text-align: center;
            padding: 2rem;
          }
          .unauthorized-icon {
            font-size: 4rem;
            display: block;
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <PageHeader 
          title="⚙️ System Settings"
          description="Configure system preferences, defaults, and user preferences"
          action={
            <div className="header-actions">
              <Button variant="secondary" onClick={handleReset}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </div>
          }
        />
      </div>

      <div className="settings-container">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <Card>
              <h3>Company Information</h3>
              <div className="settings-grid">
                <FormInput
                  label="Company Name"
                  value={settings.companyName}
                  onChange={e => updateSetting('companyName', e.target.value)}
                />
                <FormSelect
                  label="Date Format"
                  value={settings.dateFormat}
                  onChange={e => updateSetting('dateFormat', e.target.value)}
                  options={[
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
                <FormSelect
                  label="Time Format"
                  value={settings.timeFormat}
                  onChange={e => updateSetting('timeFormat', e.target.value)}
                  options={[
                    { value: '12h', label: '12-hour (AM/PM)' },
                    { value: '24h', label: '24-hour' },
                  ]}
                />
                <FormSelect
                  label="Timezone"
                  value={settings.timezone}
                  onChange={e => updateSetting('timezone', e.target.value)}
                  options={[
                    { value: 'Africa/Johannesburg', label: 'South Africa (SAST)' },
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'US Eastern' },
                    { value: 'Europe/London', label: 'UK (GMT)' },
                    { value: 'Asia/Dubai', label: 'Gulf (GST)' },
                  ]}
                />
              </div>
            </Card>

            <Card>
              <h3>Currency Settings</h3>
              <div className="settings-grid">
                <FormSelect
                  label="Default Currency"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  options={[
                    { value: 'ZAR', label: 'South African Rand (ZAR)' },
                    { value: 'USD', label: 'US Dollar (USD)' },
                    { value: 'EUR', label: 'Euro (EUR)' },
                    { value: 'GBP', label: 'British Pound (GBP)' },
                  ]}
                />
                {currency === 'USD' && (
                  <FormCurrencyInput
                    label="ZAR to USD Exchange Rate"
                    value={zarToUsdRate}
                    onChange={e => setZarToUsdRate(parseFloat(e.target.value))}
                  />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <Card>
              <h3>Notification Preferences</h3>
              <div className="settings-grid">
                <FormSwitch
                  label="Email Notifications"
                  checked={settings.emailNotifications}
                  onChange={e => updateSetting('emailNotifications', e.target.checked)}
                />
                <FormSwitch
                  label="Push Notifications"
                  checked={settings.pushNotifications}
                  onChange={e => updateSetting('pushNotifications', e.target.checked)}
                />
                <FormSwitch
                  label="Sound Effects"
                  checked={soundEnabled}
                  onChange={e => setSoundEnabled(e.target.checked)}
                />
                <FormSwitch
                  label="Desktop Notifications"
                  checked={desktopEnabled}
                  onChange={e => setDesktopEnabled(e.target.checked)}
                />
                {desktopEnabled && Notification.permission !== 'granted' && (
                  <Button size="sm" onClick={requestDesktopPermission}>
                    Enable Desktop Notifications
                  </Button>
                )}
              </div>
            </Card>

            <Card>
              <h3>Event Notifications</h3>
              <div className="settings-grid">
                <FormSwitch
                  label="Job Status Changes"
                  checked={settings.notifyJobUpdates}
                  onChange={e => updateSetting('notifyJobUpdates', e.target.checked)}
                />
                <FormSwitch
                  label="Quote Approvals"
                  checked={settings.notifyQuoteApprovals}
                  onChange={e => updateSetting('notifyQuoteApprovals', e.target.checked)}
                />
                <FormSwitch
                  label="Tool Overdue Alerts"
                  checked={settings.notifyToolOverdue}
                  onChange={e => updateSetting('notifyToolOverdue', e.target.checked)}
                />
                <FormSwitch
                  label="Low Stock Alerts"
                  checked={settings.notifyLowStock}
                  onChange={e => updateSetting('notifyLowStock', e.target.checked)}
                />
                <FormSwitch
                  label="Training Expiry Alerts"
                  checked={settings.notifyTrainingExpiry}
                  onChange={e => updateSetting('notifyTrainingExpiry', e.target.checked)}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Modules Settings */}
        {activeTab === 'modules' && (
          <div className="settings-section">
            <Card>
              <h3>Job Management</h3>
              <div className="settings-grid">
                <FormSelect
                  label="Default Job Status"
                  value={settings.defaultJobStatus}
                  onChange={e => updateSetting('defaultJobStatus', e.target.value)}
                  options={[
                    { value: 'not_started', label: 'Not Started' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'pending', label: 'Pending' },
                  ]}
                />
                <FormSwitch
                  label="Auto-finalize Items"
                  checked={settings.autoFinalizeItems}
                  onChange={e => updateSetting('autoFinalizeItems', e.target.checked)}
                />
                <FormSwitch
                  label="Require PO for Jobs"
                  checked={settings.requirePOForJobs}
                  onChange={e => updateSetting('requirePOForJobs', e.target.checked)}
                />
              </div>
            </Card>

            <Card>
              <h3>Quote Management</h3>
              <div className="settings-grid">
                <FormSelect
                  label="Default Quote Status"
                  value={settings.defaultQuoteStatus}
                  onChange={e => updateSetting('defaultQuoteStatus', e.target.value)}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'approved', label: 'Approved' },
                  ]}
                />
                <FormSwitch
                  label="Auto-create Job on Approval"
                  checked={settings.autoCreateJobOnApproval}
                  onChange={e => updateSetting('autoCreateJobOnApproval', e.target.checked)}
                />
                <FormSwitch
                  label="Require PO Number"
                  checked={settings.requirePONumber}
                  onChange={e => updateSetting('requirePONumber', e.target.checked)}
                />
              </div>
            </Card>

            <Card>
              <h3>Inventory & Tools</h3>
              <div className="settings-grid">
                <FormInput
                  label="Low Stock Alert Threshold"
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={e => updateSetting('lowStockThreshold', parseInt(e.target.value))}
                />
                <FormInput
                  label="Tool Return Reminder (days)"
                  type="number"
                  value={settings.toolReturnReminderDays}
                  onChange={e => updateSetting('toolReturnReminderDays', parseInt(e.target.value))}
                />
                <FormSwitch
                  label="Auto-generate PO Numbers"
                  checked={settings.autoGeneratePONumbers}
                  onChange={e => updateSetting('autoGeneratePONumbers', e.target.checked)}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Display Settings */}
        {activeTab === 'display' && (
          <div className="settings-section">
            <Card>
              <h3>Appearance</h3>
              <div className="settings-grid">
                <FormSwitch
                  label="Dark Mode"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  labelLeft="Light"
                  labelRight="Dark"
                />
                <FormSwitch
                  label="Compact View"
                  checked={settings.compactView}
                  onChange={e => updateSetting('compactView', e.target.checked)}
                />
                <FormSwitch
                  label="Show Week Numbers in Calendar"
                  checked={settings.showWeekNumbers}
                  onChange={e => updateSetting('showWeekNumbers', e.target.checked)}
                />
                <FormSelect
                  label="Items Per Page"
                  value={settings.itemsPerPage}
                  onChange={e => updateSetting('itemsPerPage', parseInt(e.target.value))}
                  options={[
                    { value: 10, label: '10 items' },
                    { value: 25, label: '25 items' },
                    { value: 50, label: '50 items' },
                    { value: 100, label: '100 items' },
                  ]}
                />
                <FormSelect
                  label="Table Row Density"
                  value={settings.tableDensity}
                  onChange={e => updateSetting('tableDensity', e.target.value)}
                  options={[
                    { value: 'compact', label: 'Compact' },
                    { value: 'comfortable', label: 'Comfortable' },
                    { value: 'spacious', label: 'Spacious' },
                  ]}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <Card>
              <h3>Security Preferences</h3>
              <div className="settings-grid">
                <FormInput
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={e => updateSetting('sessionTimeout', parseInt(e.target.value))}
                />
                <FormSwitch
                  label="Two-Factor Authentication"
                  checked={settings.twoFactorAuth}
                  onChange={e => updateSetting('twoFactorAuth', e.target.checked)}
                />
                <FormSwitch
                  label="Login Notifications"
                  checked={settings.loginNotifications}
                  onChange={e => updateSetting('loginNotifications', e.target.checked)}
                />
                <FormSwitch
                  label="Require Strong Passwords"
                  checked={settings.requireStrongPasswords}
                  onChange={e => updateSetting('requireStrongPasswords', e.target.checked)}
                />
              </div>
            </Card>

            <Card>
              <h3>Data Management</h3>
              <div className="settings-grid">
                <div className="button-group">
                  <Button variant="secondary" onClick={handleExportData}>
                    📥 Export Data
                  </Button>
                  <label className="import-button">
                    📤 Import Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <p className="import-hint">
                  Import/Export your data in JSON format for backup or migration.
                </p>
              </div>
            </Card>

            <Card className="danger-zone">
              <h3>Danger Zone</h3>
              <div className="danger-zone-content">
                <p>These actions are irreversible. Please proceed with caution.</p>
                <div className="danger-actions">
                  <Button variant="danger" onClick={() => {
                    if (confirm('Clear all notifications? This action cannot be undone.')) {
                      // Clear notifications logic
                    }
                  }}>
                    Clear All Notifications
                  </Button>
                  <Button variant="danger" onClick={() => {
                    if (confirm('Delete all activity logs? This action cannot be undone.')) {
                      // Clear activity logs logic
                    }
                  }}>
                    Clear Activity Logs
                  </Button>
                  <Button variant="danger" onClick={logout}>
                    Logout All Devices
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <Card>
              <h3>Profile Information</h3>
              <div className="settings-grid">
                <FormInput
                  label="Full Name"
                  value={profileData.name}
                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                />
                <FormInput
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                />
                <div className="full-width">
                  <Button onClick={handleUpdateProfile}>
                    Update Profile
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <h3>Change Password</h3>
              <div className="settings-grid">
                <FormInput
                  label="Current Password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                />
                <FormInput
                  label="New Password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                />
                <FormInput
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                />
                <div className="full-width">
                  <Button onClick={handleChangePassword} loading={changingPassword}>
                    Change Password
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <h3>Session Information</h3>
              <div className="session-info">
                <div className="session-detail">
                  <span className="label">Logged in as:</span>
                  <span className="value">{user?.email}</span>
                </div>
                <div className="session-detail">
                  <span className="label">Role:</span>
                  <span className="value">{user?.role}</span>
                </div>
                <div className="session-detail">
                  <span className="label">Member since:</span>
                  <span className="value">{new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="session-detail">
                  <span className="label">Last login:</span>
                  <span className="value">{new Date(user?.lastLogin).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <style jsx>{`
        .settings-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .settings-header {
          margin-bottom: 1.5rem;
        }
        
        .header-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .settings-container {
          background: transparent;
        }
        
        .settings-section {
          margin-top: 1.5rem;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .full-width {
          grid-column: span 2;
        }
        
        .button-group {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .import-button {
          background: var(--secondary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
        }
        
        .import-button:hover {
          background: var(--secondary-dark);
        }
        
        .import-hint {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-top: 0.5rem;
        }
        
        .danger-zone {
          border: 1px solid #dc2626;
          background: #fef2f2;
        }
        
        .danger-zone h3 {
          color: #dc2626;
        }
        
        .danger-zone-content {
          margin-top: 1rem;
        }
        
        .danger-zone-content p {
          font-size: 0.875rem;
          color: #991b1b;
          margin-bottom: 1rem;
        }
        
        .danger-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .session-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .session-detail {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        
        .session-detail .label {
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .session-detail .value {
          color: var(--text-primary);
        }
        
        @media (max-width: 768px) {
          .settings-page {
            padding: 1rem;
          }
          .settings-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
          .danger-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}