// components/hr/PayrollSummary/PayrollSummary.js
'use client';

import { useState } from 'react';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function PayrollSummary({ 
  data = {},
  period = 'month',
  onPeriodChange 
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  
  const periods = ['week', 'month', 'quarter'];
  
  const summaryData = {
    grossPay: data.grossPay || 0,
    deductions: data.deductions || 0,
    netPay: data.netPay || 0,
    employerTax: data.employerTax || 0,
    totalPayroll: data.totalPayroll || 0,
    employeeCount: data.employeeCount || 0,
    averageSalary: data.averageSalary || 0
  };
  
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };
  
  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
  
  return (
    <div className="payroll-summary">
      <div className="summary-header">
        <h3 className="summary-title">Payroll Summary</h3>
        <div className="period-selector">
          {periods.map(p => (
            <button
              key={p}
              className={`period-btn ${selectedPeriod === p ? 'active' : ''}`}
              onClick={() => handlePeriodChange(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="stats-grid">
        <StatCard 
          title="Gross Pay" 
          value={<CurrencyAmount amount={summaryData.grossPay} />}
          subtitle="Before deductions"
          icon="💰"
          color="blue"
        />
        <StatCard 
          title="Deductions" 
          value={<CurrencyAmount amount={summaryData.deductions} />}
          subtitle={`${formatPercentage(summaryData.deductions / summaryData.grossPay)} of gross`}
          icon="📉"
          color="red"
        />
        <StatCard 
          title="Net Pay" 
          value={<CurrencyAmount amount={summaryData.netPay} />}
          subtitle="Take home pay"
          icon="💵"
          color="green"
        />
        <StatCard 
          title="Employer Tax" 
          value={<CurrencyAmount amount={summaryData.employerTax} />}
          subtitle="Additional cost"
          icon="🏛️"
          color="orange"
        />
      </div>
      
      <div className="summary-footer">
        <div className="footer-item">
          <span className="footer-label">Total Payroll Cost:</span>
          <span className="footer-value">
            <CurrencyAmount amount={summaryData.totalPayroll} />
          </span>
        </div>
        <div className="footer-item">
          <span className="footer-label">Employees Processed:</span>
          <span className="footer-value">{summaryData.employeeCount}</span>
        </div>
        <div className="footer-item">
          <span className="footer-label">Average Salary:</span>
          <span className="footer-value">
            <CurrencyAmount amount={summaryData.averageSalary} />
          </span>
        </div>
      </div>
      
      <style jsx>{`
        .payroll-summary {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
        }
        
        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .summary-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        
        .period-selector {
          display: flex;
          gap: 0.5rem;
          background: #f3f4f6;
          padding: 0.25rem;
          border-radius: 0.5rem;
        }
        
        .period-btn {
          padding: 0.375rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .period-btn:hover {
          background: #e5e7eb;
        }
        
        .period-btn.active {
          background: #3b82f6;
          color: white;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .stat-card {
          padding: 1rem;
          border-radius: 0.5rem;
          background: #f9fafb;
        }
        
        .stat-card.blue { border-left: 3px solid #3b82f6; }
        .stat-card.red { border-left: 3px solid #ef4444; }
        .stat-card.green { border-left: 3px solid #10b981; }
        .stat-card.orange { border-left: 3px solid #f59e0b; }
        
        .stat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .stat-icon {
          font-size: 1.25rem;
        }
        
        .stat-title {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .stat-subtitle {
          font-size: 0.7rem;
          color: #6b7280;
        }
        
        .summary-footer {
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .footer-item {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .footer-label {
          color: #6b7280;
        }
        
        .footer-value {
          font-weight: 600;
          color: #111827;
        }
      `}</style>
    </div>
  );
}