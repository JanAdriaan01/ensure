// components/financial/FinancialSummary/FinancialSummary.js
'use client';

import { useState } from 'react';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function FinancialSummary({ 
  data = {},
  period = 'month',
  showComparison = true,
  onPeriodChange 
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  
  const periods = ['day', 'week', 'month', 'quarter', 'year'];
  
  const calculateTotals = () => {
    const revenue = data.revenue || 0;
    const expenses = data.expenses || 0;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    return { revenue, expenses, profit, profitMargin };
  };
  
  const { revenue, expenses, profit, profitMargin } = calculateTotals();
  
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };
  
  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    if (onPeriodChange) onPeriodChange(newPeriod);
  };
  
  const SummaryCard = ({ title, amount, change, type, color, isPercentage = false }) => (
    <div className={`summary-card ${type}`}>
      <div className="card-header">
        <h4 className="card-title">{title}</h4>
        <span className={`card-icon ${color}`}>
          {type === 'revenue' && '💰'}
          {type === 'expenses' && '💸'}
          {type === 'profit' && '📈'}
          {type === 'margin' && '🎯'}
        </span>
      </div>
      <div className="card-amount">
        {isPercentage ? formatPercentage(amount) : <CurrencyAmount amount={amount} />}
      </div>
      {showComparison && change !== undefined && (
        <div className={`card-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs last {selectedPeriod}
        </div>
      )}
      <div className="card-footer">
        {type === 'revenue' && 'Total income generated'}
        {type === 'expenses' && 'Total costs incurred'}
        {type === 'profit' && 'Net earnings'}
        {type === 'margin' && 'Profitability ratio'}
      </div>
    </div>
  );
  
  return (
    <div className="financial-summary">
      <div className="summary-header">
        <h2 className="summary-title">Financial Summary</h2>
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
      
      <div className="summary-grid">
        <SummaryCard 
          title="Total Revenue" 
          amount={revenue}
          change={data.revenueChange}
          type="revenue"
          color="green"
        />
        <SummaryCard 
          title="Total Expenses" 
          amount={expenses}
          change={data.expensesChange}
          type="expenses"
          color="red"
        />
        <SummaryCard 
          title="Net Profit" 
          amount={profit}
          change={data.profitChange}
          type="profit"
          color="blue"
        />
        <SummaryCard 
          title="Profit Margin" 
          amount={profitMargin}
          change={data.marginChange}
          type="margin"
          color="purple"
          isPercentage={true}
        />
      </div>
      
      {showComparison && data.comparison && (
        <div className="comparison-section">
          <h4 className="comparison-title">Period Comparison</h4>
          <div className="comparison-grid">
            <div className="comparison-item">
              <span>Previous {selectedPeriod}:</span>
              <strong><CurrencyAmount amount={data.comparison.previous || 0} /></strong>
            </div>
            <div className="comparison-item">
              <span>Growth:</span>
              <strong className={profit >= 0 ? 'positive' : 'negative'}>
                {profit >= 0 ? '+' : ''}{formatPercentage(profitMargin - (data.comparison.previousMargin || 0))}
              </strong>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .financial-summary {
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
          font-size: 1.25rem;
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
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        
        .summary-card {
          background: white;
          border-radius: 0.625rem;
          padding: 1.25rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: all 0.2s;
          border: 1px solid #e5e7eb;
        }
        
        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .card-title {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .card-icon {
          font-size: 1.5rem;
        }
        
        .card-icon.green { color: #10b981; }
        .card-icon.red { color: #ef4444; }
        .card-icon.blue { color: #3b82f6; }
        .card-icon.purple { color: #8b5cf6; }
        
        .card-amount {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .card-change {
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .card-change.positive {
          color: #10b981;
        }
        
        .card-change.negative {
          color: #ef4444;
        }
        
        .card-footer {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .comparison-section {
          background: #f9fafb;
          border-radius: 0.5rem;
          padding: 1rem;
        }
        
        .comparison-title {
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .comparison-grid {
          display: flex;
          justify-content: space-between;
          gap: 1.25rem;
        }
        
        .comparison-item {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .comparison-item span {
          color: #6b7280;
        }
        
        .comparison-item strong {
          color: #111827;
        }
        
        .positive {
          color: #10b981;
        }
        
        .negative {
          color: #ef4444;
        }
        
        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .comparison-grid {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}