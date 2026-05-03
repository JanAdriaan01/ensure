'use client';

import { useTheme } from '@/app/context/ThemeContext';

export default function GlobalStyles() {
  const { theme } = useTheme();
  
  return (
    <style jsx global>{`
      /* ============================================
         GLOBAL THEME VARIABLES
         ============================================ */
      :root {
        /* Light Mode (Default) */
        --primary: #2563eb;
        --primary-dark: #1d4ed8;
        --primary-light: #3b82f6;
        --primary-bg: #eff6ff;

        --secondary: #64748b;
        --secondary-dark: #475569;
        --secondary-light: #94a3b8;
        --secondary-bg: #f1f5f9;

        --success: #10b981;
        --success-dark: #059669;
        --success-light: #34d399;
        --success-bg: #d1fae5;

        --warning: #f59e0b;
        --warning-dark: #d97706;
        --warning-light: #fbbf24;
        --warning-bg: #fef3c7;

        --danger: #ef4444;
        --danger-dark: #dc2626;
        --danger-light: #f87171;
        --danger-bg: #fee2e2;

        --info: #8b5cf6;
        --info-dark: #7c3aed;
        --info-light: #a78bfa;
        --info-bg: #ede9fe;

        /* Text Colors */
        --text-primary: #1e293b;
        --text-secondary: #475569;
        --text-tertiary: #64748b;
        --text-muted: #94a3b8;
        --text-white: #ffffff;

        /* Background Colors */
        --bg-primary: #ffffff;
        --bg-secondary: #f8fafc;
        --bg-tertiary: #f1f5f9;
        --bg-quaternary: #e2e8f0;

        /* Card Colors */
        --card-bg: #ffffff;
        --card-border: #e2e8f0;
        --card-hover: #f8fafb;
        --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        /* Border Colors */
        --border-light: #e2e8f0;
        --border-medium: #cbd5e1;
        --border-dark: #94a3b8;

        /* Shadows */
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

        /* Spacing */
        --spacing-xs: 0.25rem;
        --spacing-sm: 0.5rem;
        --spacing-md: 1rem;
        --spacing-lg: 1.5rem;
        --spacing-xl: 2rem;
        --spacing-2xl: 3rem;

        /* Border Radius */
        --radius-sm: 0.25rem;
        --radius-md: 0.375rem;
        --radius-lg: 0.5rem;
        --radius-xl: 0.75rem;
        --radius-2xl: 1rem;

        /* Transitions */
        --transition-fast: 150ms;
        --transition-normal: 250ms;
        --transition-slow: 350ms;
      }

      /* Dark Mode Variables - Applied when html has class 'dark' */
      html.dark {
        --primary: #3b82f6;
        --primary-dark: #2563eb;
        --primary-light: #60a5fa;
        --primary-bg: #1e3a5f;

        --secondary: #94a3b8;
        --secondary-dark: #64748b;
        --secondary-light: #cbd5e1;
        --secondary-bg: #1e293b;

        --success: #34d399;
        --success-dark: #10b981;
        --success-light: #6ee7b7;
        --success-bg: #064e3b;

        --warning: #fbbf24;
        --warning-dark: #f59e0b;
        --warning-light: #fcd34d;
        --warning-bg: #451a03;

        --danger: #f87171;
        --danger-dark: #ef4444;
        --danger-light: #fca5a5;
        --danger-bg: #450a0a;

        --info: #a78bfa;
        --info-dark: #8b5cf6;
        --info-light: #c4b5fd;
        --info-bg: #2e1065;

        /* Dark Mode Text Colors */
        --text-primary: #f1f5f9;
        --text-secondary: #cbd5e1;
        --text-tertiary: #94a3b8;
        --text-muted: #64748b;
        --text-white: #ffffff;

        /* Dark Mode Background Colors */
        --bg-primary: #0f172a;
        --bg-secondary: #0f172a;
        --bg-tertiary: #1e293b;
        --bg-quaternary: #334155;

        /* Dark Mode Card Colors */
        --card-bg: #1e293b;
        --card-border: #334155;
        --card-hover: #334155;
        --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

        /* Dark Mode Border Colors */
        --border-light: #334155;
        --border-medium: #475569;
        --border-dark: #64748b;
      }

      /* ============================================
         GLOBAL RESET & BASE STYLES
         ============================================ */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        font-size: 16px;
        scroll-behavior: smooth;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        line-height: 1.5;
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      /* ============================================
         TYPOGRAPHY
         ============================================ */
      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        line-height: 1.25;
        color: var(--text-primary);
      }

      h1 { font-size: 2rem; margin-bottom: var(--spacing-md); }
      h2 { font-size: 1.5rem; margin-bottom: var(--spacing-sm); }
      h3 { font-size: 1.25rem; margin-bottom: var(--spacing-sm); }
      h4 { font-size: 1rem; margin-bottom: var(--spacing-sm); }

      p, span, li {
        color: var(--text-secondary);
      }

      /* ============================================
         CARD COMPONENTS - Universal
         ============================================ */
      .card,
      .stat-card,
      .module-card,
      .job-card,
      .quote-card,
      .client-card,
      .invoice-card,
      .dashboard-widget,
      .settings-card,
      .activity-feed,
      .table-container,
      .modal-content,
      .quick-action-card,
      .report-card,
      .backup-item,
      .client-card,
      .job-card,
      .quote-card {
        background: var(--card-bg) !important;
        border: 1px solid var(--card-border) !important;
        border-radius: var(--radius-xl);
        transition: all var(--transition-normal);
      }

      .card:hover,
      .stat-card:hover,
      .module-card:hover,
      .job-card:hover,
      .quote-card:hover,
      .client-card:hover,
      .dashboard-widget:hover,
      .quick-action-card:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--primary-light) !important;
        transform: translateY(-2px);
      }

      /* Card text colors */
      .card p, .card span,
      .stat-card p, .stat-card span,
      .job-card p, .job-card span,
      .quote-card p, .quote-card span,
      .client-card p, .client-card span,
      .dashboard-widget p, .dashboard-widget span,
      .activity-feed p, .activity-feed span {
        color: var(--text-secondary) !important;
      }

      .card h1, .card h2, .card h3, .card h4,
      .stat-card h1, .stat-card h2, .stat-card h3, .stat-card h4,
      .job-card h1, .job-card h2, .job-card h3,
      .quote-card h1, .quote-card h2, .quote-card h3,
      .client-card h1, .client-card h2, .client-card h3,
      .dashboard-widget h1, .dashboard-widget h2, .dashboard-widget h3,
      .activity-feed h1, .activity-feed h2, .activity-feed h3 {
        color: var(--text-primary) !important;
      }

      /* Stat values */
      .stat-value {
        color: var(--text-primary) !important;
        font-size: 1.75rem;
        font-weight: 700;
      }

      .stat-label {
        color: var(--text-tertiary) !important;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* ============================================
         BUTTONS - Universal
         ============================================ */
      .btn-primary,
      button[class*="btn-primary"] {
        background: var(--primary) !important;
        color: white !important;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: all var(--transition-fast);
      }

      .btn-primary:hover {
        background: var(--primary-dark) !important;
      }

      .btn-secondary {
        background: var(--secondary) !important;
        color: white !important;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        border: none;
        cursor: pointer;
      }

      .btn-outline {
        background: transparent !important;
        border: 1px solid var(--border-medium) !important;
        color: var(--text-secondary) !important;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        cursor: pointer;
      }

      /* ============================================
         FORM ELEMENTS - Universal
         ============================================ */
      input, select, textarea {
        width: 100%;
        padding: 0.625rem;
        border: 1px solid var(--border-medium) !important;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        background: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        transition: all var(--transition-fast);
      }

      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      label {
        display: block;
        margin-bottom: 0.375rem;
        font-weight: 500;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      /* ============================================
         TABLES - Universal
         ============================================ */
      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        text-align: left;
        padding: 0.75rem 1rem;
        background: var(--bg-tertiary) !important;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-secondary) !important;
        border-bottom: 1px solid var(--border-light);
      }

      td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-light);
        color: var(--text-secondary) !important;
      }

      tr:hover td {
        background: var(--bg-tertiary) !important;
      }

      /* ============================================
         STATUS BADGES - Universal
         ============================================ */
      .status-badge,
      .status {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 500;
        line-height: 1;
      }

      .status-approved, .status-completed, .status-paid,
      .badge-success {
        background: var(--success-bg) !important;
        color: var(--success-dark) !important;
      }

      .status-pending, .status-draft,
      .badge-warning {
        background: var(--warning-bg) !important;
        color: var(--warning-dark) !important;
      }

      .status-rejected, .status-cancelled,
      .badge-danger {
        background: var(--danger-bg) !important;
        color: var(--danger-dark) !important;
      }

      .status-in-progress,
      .badge-info {
        background: var(--primary-bg) !important;
        color: var(--primary-dark) !important;
      }

      /* ============================================
         DASHBOARD WIDGETS
         ============================================ */
      .dashboard-widget {
        overflow: hidden;
      }

      .dashboard-widget .widget-header {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--border-light);
      }

      .dashboard-widget .widget-header h3 {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-primary);
      }

      .dashboard-widget .widget-stats {
        padding: var(--spacing-md);
        display: flex;
        justify-content: space-between;
        gap: var(--spacing-md);
      }

      .dashboard-widget .widget-footer {
        padding: var(--spacing-sm) var(--spacing-md);
        border-top: 1px solid var(--border-light);
        background: var(--bg-tertiary);
      }

      /* ============================================
         ACTIVITY FEED
         ============================================ */
      .activity-feed .feed-header {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--border-light);
      }

      .activity-feed .feed-item {
        padding: var(--spacing-sm) var(--spacing-md);
        transition: background var(--transition-fast);
      }

      .activity-feed .feed-item:hover {
        background: var(--bg-tertiary);
      }

      /* ============================================
         MODAL
         ============================================ */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
      }

      /* ============================================
         LOADING STATES
         ============================================ */
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-light);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* ============================================
         RESPONSIVE UTILITIES
         ============================================ */
      .container {
        max-width: 1280px;
        margin: 0 auto;
        padding: var(--spacing-xl);
      }

      .page-header {
        margin-bottom: var(--spacing-xl);
      }

      .page-header h1 {
        font-size: 1.875rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .page-header p {
        color: var(--text-tertiary);
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
      }

      /* Cards Grid */
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: var(--spacing-lg);
      }

      /* ============================================
         RESPONSIVE BREAKPOINTS
         ============================================ */
      @media (max-width: 768px) {
        .container {
          padding: var(--spacing-md);
        }
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .cards-grid {
          grid-template-columns: 1fr;
        }
        h1 { font-size: 1.5rem; }
        h2 { font-size: 1.25rem; }
        .stat-value { font-size: 1.25rem; }
      }

      @media (max-width: 480px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}