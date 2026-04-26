// components/financial/ExpenseChart/ExpenseChart.js
'use client';

import { useState } from 'react';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function ExpenseChart({ 
  data = [],
  title = 'Expense Breakdown',
  showPercentages = true 
}) {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];
  
  const getPercentage = (value) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };
  
  return (
    <div className="expense-chart">
      <h3 className="chart-title">{title}</h3>
      
      <div className="chart-container">
        <div className="legend-section">
          {data.map((category, index) => (
            <div
              key={category.label}
              className={`legend-item ${hoveredCategory === index ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div 
                className="legend-color" 
                style={{ background: colors[index % colors.length] }}
              />
              <div className="legend-content">
                <span className="legend-label">{category.label}</span>
                <CurrencyAmount amount={category.value} className="legend-value" />
                {showPercentages && (
                  <span className="legend-percentage">
                    ({getPercentage(category.value)}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="chart-visual">
          <div className="pie-chart">
            {data.map((category, index) => {
              const percentage = getPercentage(category.value);
              const rotation = data.slice(0, index).reduce((sum, item) => 
                sum + getPercentage(item.value), 0
              ) * 3.6;
              
              return (
                <div
                  key={category.label}
                  className={`pie-segment ${hoveredCategory === index ? 'hovered' : ''}`}
                  style={{
                    background: `conic-gradient(${colors[index % colors.length]} 0deg ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg 360deg)`,
                    transform: hoveredCategory === index ? 'scale(1.05)' : 'scale(1)',
                    zIndex: hoveredCategory === index ? 10 : 1
                  }}
                />
              );
            })}
            <div className="pie-center">
              <div className="pie-total">
                <span className="total-label">Total</span>
                <CurrencyAmount amount={total} className="total-value" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .expense-chart {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
        }
        
        .chart-title {
          margin: 0 0 1.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        
        .chart-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        
        .legend-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .legend-item.hovered {
          background: #f9fafb;
          transform: translateX(4px);
        }
        
        .legend-color {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 9999px;
          flex-shrink: 0;
        }
        
        .legend-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .legend-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .legend-value {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .legend-percentage {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .chart-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .pie-chart {
          position: relative;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          overflow: hidden;
        }
        
        .pie-segment {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .pie-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .pie-total {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .total-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .total-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }
        
        @media (max-width: 768px) {
          .chart-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .pie-chart {
            width: 200px;
            height: 200px;
          }
          
          .pie-center {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
}