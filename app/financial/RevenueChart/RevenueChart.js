// components/financial/RevenueChart/RevenueChart.js
'use client';

import { useState, useEffect, useRef } from 'react';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function RevenueChart({ 
  data = [],
  title = 'Revenue Trends',
  height = 400,
  showLegend = true,
  showTools = true
}) {
  const [selectedView, setSelectedView] = useState('line');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const canvasRef = useRef(null);
  
  const views = ['line', 'bar', 'area'];
  
  useEffect(() => {
    drawChart();
  }, [data, selectedView, hoveredPoint]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (!data.length) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', width / 2, height / 2);
      return;
    }
    
    const padding = { top: 20, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value || 0), 1000);
    const yScale = chartHeight / maxValue;
    const xStep = chartWidth / (data.length - 1);
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    
    // X-axis
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();
    
    // Draw grid lines and Y labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + chartHeight - (i / 5) * chartHeight;
      const value = (i / 5) * maxValue;
      
      ctx.beginPath();
      ctx.strokeStyle = '#f3f4f6';
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      
      ctx.fillStyle = '#6b7280';
      ctx.fillText(formatCurrency(value), padding.left - 5, y + 3);
    }
    
    // Draw X labels
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    data.forEach((point, i) => {
      const x = padding.left + i * xStep;
      ctx.fillText(point.label, x, padding.top + chartHeight + 20);
    });
    
    // Draw chart based on selected view
    if (selectedView === 'line') {
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      
      data.forEach((point, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + chartHeight - (point.value || 0) * yScale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Draw points
      data.forEach((point, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + chartHeight - (point.value || 0) * yScale;
        
        ctx.beginPath();
        ctx.fillStyle = hoveredPoint === i ? '#ef4444' : '#3b82f6';
        ctx.arc(x, y, hoveredPoint === i ? 6 : 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    } else if (selectedView === 'bar') {
      const barWidth = xStep * 0.6;
      
      data.forEach((point, i) => {
        const x = padding.left + i * xStep - barWidth / 2;
        const height_bar = (point.value || 0) * yScale;
        const y = padding.top + chartHeight - height_bar;
        
        ctx.fillStyle = hoveredPoint === i ? '#ef4444' : '#3b82f6';
        ctx.fillRect(x, y, barWidth, height_bar);
      });
    } else if (selectedView === 'area') {
      ctx.beginPath();
      
      data.forEach((point, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + chartHeight - (point.value || 0) * yScale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.lineTo(padding.left, padding.top + chartHeight);
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.stroke();
    }
    
    // Draw hover tooltip
    if (hoveredPoint !== null && data[hoveredPoint]) {
      const point = data[hoveredPoint];
      const x = padding.left + hoveredPoint * xStep;
      const y = padding.top + chartHeight - (point.value || 0) * yScale;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x - 50, y - 35, 100, 30);
      
      ctx.fillStyle = 'white';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${point.label}: ${formatCurrency(point.value)}`, x, y - 15);
    }
  };
  
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !data.length) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    const padding = { left: 60, right: 30 };
    const chartWidth = width - padding.left - padding.right;
    const xStep = chartWidth / (data.length - 1);
    
    for (let i = 0; i < data.length; i++) {
      const pointX = padding.left + i * xStep;
      if (Math.abs(x - pointX) < 15) {
        setHoveredPoint(i);
        return;
      }
    }
    
    setHoveredPoint(null);
  };
  
  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };
  
  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {showTools && (
          <div className="chart-tools">
            {views.map(view => (
              <button
                key={view}
                className={`view-btn ${selectedView === view ? 'active' : ''}`}
                onClick={() => setSelectedView(view)}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="chart-container">
        <canvas
          ref={canvasRef}
          className="chart-canvas"
          style={{ height: `${height}px`, width: '100%' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      
      {showLegend && (
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#3b82f6' }}></span>
            <span>Revenue</span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .revenue-chart {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .chart-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        
        .chart-tools {
          display: flex;
          gap: 0.5rem;
        }
        
        .view-btn {
          padding: 0.375rem 0.75rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .view-btn:hover {
          background: #f3f4f6;
        }
        
        .view-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .chart-container {
          position: relative;
          margin-bottom: 1rem;
        }
        
        .chart-canvas {
          display: block;
          cursor: crosshair;
        }
        
        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .legend-color {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}