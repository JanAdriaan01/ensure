
'use client';

import { useFetch } from '@/app/hooks/useFetch';
import PageHeader from '@/app/components/layout/PageHeader/PageHeader';
import StatCard from '@/app/components/ui/StatCard/StatCard';
import QuickActionsGrid from '@/app/components/dashboard/QuickActionsGrid/QuickActionsGrid';
import ManagementCenters from '@/app/components/dashboard/ManagementCenters/ManagementCenters';
import RecentActivityList from '@/app/components/dashboard/RecentActivityList/RecentActivityList';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner/LoadingSpinner';

export default function Home() {
  const { data: summary, loading: summaryLoading } = useFetch('/api/reports/monthly');
  const { data: jobs, loading: jobsLoading } = useFetch('/api/jobs');
  const { data: employees, loading: employeesLoading } = useFetch('/api/employees');
  const { data: clients, loading: clientsLoading } = useFetch('/api/clients');
  const { data: quotes, loading: quotesLoading } = useFetch('/api/quotes');

  const loading = summaryLoading || jobsLoading || employeesLoading || clientsLoading || quotesLoading;

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calculate stats
  const activeJobs = jobs?.filter(j => j.completion_status !== 'completed').length || 0;
  const totalEmployees = employees?.length || 0;
  const totalClients = clients?.length || 0;
  
  const monthlyInvoiced = summary?.monthlyInvoiced || 0;
  const productiveHours = summary?.productiveHours || 0;
  const unproductiveHours = summary?.unproductiveHours || 0;
  const poTotal = summary?.poTotal || 0;
  const invoicedTotal = summary?.invoicedTotal || 0;
  const poPercentage = poTotal > 0 ? ((invoicedTotal / poTotal) * 100).toFixed(1) : 0;

  const recentJobs = jobs?.slice(0, 5) || [];
  const recentEmployees = employees?.slice(0, 5) || [];
  const recentQuotes = quotes?.slice(0, 5) || [];

  if (loading) {
    return <LoadingSpinner text="Loading ENSURE Dashboard..." />;
  }

  return (
    <div className="dashboard-container">
      <PageHeader 
        title="🔧 ENSURE System"
        description="Complete Project & Workforce Management Platform"
        date={currentMonth}
      />

      {/* Monthly Stats Cards */}
      <div className="stats-grid">
        <StatCard 
          icon="💰"
          title="Total Monthly Invoicing"
          value={monthlyInvoiced}
          valueIsCurrency={true}
          subValue="1st to last day of month"
        />
        
        <StatCard 
          icon="⏰"
          title="Productive Labor"
          value={`${productiveHours} hrs`}
          subValue={`${unproductiveHours} hrs unproductive`}
        />
        
        <StatCard 
          icon="📋"
          title="PO vs Invoiced"
          value={`${poPercentage}%`}
          subValue={`${invoicedTotal.toLocaleString()} / ${poTotal.toLocaleString()}`}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="quick-stat-value">{activeJobs}</span>
          <span className="quick-stat-label">Active Jobs</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-value">{totalEmployees}</span>
          <span className="quick-stat-label">Employees</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-value">{totalClients}</span>
          <span className="quick-stat-label">Clients</span>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid />

      {/* Management Centers */}
      <ManagementCenters />

      {/* Recent Activity */}
      <div className="recent-section">
        <RecentActivityList 
          title="📋 Recent Jobs"
          viewAllLink="/jobs"
          items={recentJobs}
          type="jobs"
        />
        <RecentActivityList 
          title="👥 Recent Employees"
          viewAllLink="/employees"
          items={recentEmployees}
          type="employees"
        />
        <RecentActivityList 
          title="💰 Recent Quotes"
          viewAllLink="/quotes"
          items={recentQuotes}
          type="quotes"
        />
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .quick-stat {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .quick-stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          display: block;
          color: #111827;
        }
        .quick-stat-label {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .recent-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .recent-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}