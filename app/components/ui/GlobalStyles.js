'use client';

// This component does NOT use useTheme - it just injects CSS that responds to the dark class
export default function GlobalStyles() {
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

        --text-primary: #1e293b;
        --text-secondary: #475569;
        --text-tertiary: #64748b;
        --text-muted: #94a3b8;
        --text-white: #ffffff;

        --bg-primary: #ffffff;
        --bg-secondary: #f8fafc;
        --bg-tertiary: #f1f5f9;
        --bg-quaternary: #e2e8f0;

        --card-bg: #ffffff;
        --card-border: #e2e8f0;
        --card-hover: #f8fafb;
        --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        --border-light: #e2e8f0;
        --border-medium: #cbd5e1;
        --border-dark: #94a3b8;

        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }

      /* Dark Mode - Applied when html has class 'dark' */
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

        --text-primary: #f1f5f9;
        --text-secondary: #cbd5e1;
        --text-tertiary: #94a3b8;
        --text-muted: #64748b;
        --text-white: #ffffff;

        --bg-primary: #0f172a;
        --bg-secondary: #0f172a;
        --bg-tertiary: #1e293b;
        --bg-quaternary: #334155;

        --card-bg: #1e293b;
        --card-border: #334155;
        --card-hover: #334155;
        --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

        --border-light: #334155;
        --border-medium: #475569;
        --border-dark: #64748b;
      }

      /* Base Styles */
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html { font-size: 16px; scroll-behavior: smooth; }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        line-height: 1.5;
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      /* Typography */
      h1, h2, h3, h4, h5, h6 { font-weight: 600; line-height: 1.25; color: var(--text-primary); }
      h1 { font-size: 2rem; margin-bottom: 1rem; }
      h2 { font-size: 1.5rem; margin-bottom: 0.75rem; }
      h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
      p, span, li { color: var(--text-secondary); }

      /* Container */
      .container { max-width: 1280px; margin: 0 auto; padding: 2rem; }
      @media (max-width: 768px) { .container { padding: 1rem; } }

      /* Page Header */
      .page-header { margin-bottom: 2rem; }
      .page-header h1 { font-size: 1.875rem; font-weight: 600; margin-bottom: 0.25rem; }
      .page-header p { color: var(--text-tertiary); }

      /* Cards */
      .card, .stat-card, .module-card, .job-card, .quote-card, .client-card,
      .dashboard-widget, .settings-card, .activity-feed, .table-container,
      .modal-content, .quick-action-card, .report-card {
        background: var(--card-bg) !important;
        border: 1px solid var(--card-border) !important;
        border-radius: 0.75rem;
        transition: all 0.2s;
      }
      .card:hover, .stat-card:hover, .module-card:hover, .job-card:hover,
      .quote-card:hover, .client-card:hover, .dashboard-widget:hover,
      .quick-action-card:hover {
        box-shadow: var(--card-shadow);
        border-color: var(--primary-light) !important;
        transform: translateY(-2px);
      }

      /* Stats */
      .stat-value { color: var(--text-primary) !important; font-size: 1.75rem; font-weight: 700; }
      .stat-label { color: var(--text-tertiary) !important; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }

      /* Stats Grid */
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
      @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } }

      /* Cards Grid */
      .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
      @media (max-width: 768px) { .cards-grid { grid-template-columns: 1fr; } }

      /* Buttons */
      .btn-primary {
        background: var(--primary) !important;
        color: white !important;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        border: none;
        cursor: pointer;
        font-weight: 500;
        display: inline-block;
        transition: all 0.2s;
      }
      .btn-primary:hover { background: var(--primary-dark) !important; }
      .btn-secondary {
        background: var(--secondary) !important;
        color: white !important;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }
      .btn-secondary:hover { background: var(--secondary-dark) !important; }
      .btn-danger { background: var(--danger) !important; color: white !important; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }

      /* Form Elements */
      input, select, textarea {
        width: 100%;
        padding: 0.625rem;
        border: 1px solid var(--border-medium) !important;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        background: var(--bg-primary) !important;
        color: var(--text-primary) !important;
      }
      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      label { display: block; margin-bottom: 0.375rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary); }

      /* Tables */
      table { width: 100%; border-collapse: collapse; }
      th {
        text-align: left;
        padding: 0.75rem 1rem;
        background: var(--bg-tertiary) !important;
        font-weight: 600;
        font-size: 0.7rem;
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
      tr:hover td { background: var(--bg-tertiary) !important; }

      /* Status Badges */
      .status-badge, .status { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
      .status-approved, .status-completed, .status-paid, .status.valid { background: var(--success-bg) !important; color: var(--success-dark) !important; }
      .status-pending, .status-draft, .status.expired { background: var(--warning-bg) !important; color: var(--warning-dark) !important; }
      .status-rejected { background: var(--danger-bg) !important; color: var(--danger-dark) !important; }
      .status-in-progress { background: var(--primary-bg) !important; color: var(--primary-dark) !important; }

      /* Loading */
      .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
      .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Empty State */
      .empty-state { text-align: center; padding: 3rem; color: var(--text-tertiary); }

      /* Dashboard Widget */
      .dashboard-widget .widget-header { padding: 1rem; border-bottom: 1px solid var(--border-light); }
      .dashboard-widget .widget-header h3 { margin: 0; font-size: 0.9rem; }
      .dashboard-widget .widget-stats { padding: 1rem; display: flex; justify-content: space-between; gap: 1rem; }
      .dashboard-widget .widget-footer { padding: 0.5rem 1rem; border-top: 1px solid var(--border-light); background: var(--bg-tertiary); }

      /* Activity Feed */
      .activity-feed .feed-header { padding: 1rem; border-bottom: 1px solid var(--border-light); }
      .activity-feed .feed-item { padding: 0.5rem 1rem; transition: background 0.2s; }
      .activity-feed .feed-item:hover { background: var(--bg-tertiary); }

      /* Back Link */
      .back-link { color: var(--text-tertiary); text-decoration: none; display: inline-block; margin-bottom: 0.5rem; font-size: 0.875rem; }
      .back-link:hover { color: var(--primary); }

      /* Responsive */
      @media (max-width: 768px) {
        h1 { font-size: 1.5rem; }
        h2 { font-size: 1.25rem; }
        .stat-value { font-size: 1.25rem; }
      }
    `}</style>
  );
}