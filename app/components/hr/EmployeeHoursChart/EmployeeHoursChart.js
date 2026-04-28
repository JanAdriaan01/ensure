// components/hr/EmployeeHoursChart/EmployeeHoursChart.js
'use client';

import { useState, useEffect, useRef } from 'react';

export default function EmployeeHoursChart({ 
  data = [],
  title = 'Employee Hours',
  period = 'week',
  height = 400,
  showLegend = true 
}) {
  const [selectedView, setSelectedView] = useState('bar');
  const [hoveredBar, setHoveredBar] = useState(null);
  const canvasRef = useRef(null);
  
  const views = ['bar', 'line'];
  
  useEffect(() => {
    drawChart();
  }, [data, selectedView, hoveredBar]);
  
  const formatHours = (hours) => {
    return `${hours.toFixed(1)} hrs`;
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
    
    const padding = { top: 20, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxHours = Math.max(...data.map(d => d.regular + d.overtime + (d.holiday || 0)), 40);
    const yScale = chartHeight / maxHours;
    const barWidth = chartWidth / data.length * 0.7;
    const barSpacing = chartWidth / data.length * 0.3;
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();
    
    // Draw grid lines and Y labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + chartHeight - (i / 5) * chartHeight;
      const hours = (i / 5) * maxHours;
      
      ctx.beginPath();
      ctx.strokeStyle = '#f3f4f6';
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      
      ctx.fillStyle = '#6b7280';
      ctx.fillText(formatHours(hours), padding.left - 5, y + 3);
    }
    
    if (selectedView === 'bar') {
      // Stacked bar chart
      data.forEach((item, i) => {
        const x = padding.left + i * (barWidth + barSpacing) + barSpacing / 2;
        
        // Regular hours
        const regularHeight = (item.regular || 0) * yScale;
        const regularY = padding.top + chartHeight - regularHeight;
        
        ctx.fillStyle = hoveredBar === i ? '#60a5fa' : '#3b82f6';
        ctx.fillRect(x, regularY, barWidth, regularHeight);
        
        // Overtime hours
        const overtimeHeight = (item.overtime || 0) * yScale;
        const overtimeY = regularY - overtimeHeight;
        
        ctx.fillStyle = hoveredBar === i ? '#fbbf24' : '#f59e0b';
        ctx.fillRect(x, overtimeY, barWidth, overtimeHeight);
        
        // Holiday hours
        if (item.holiday) {
          const holidayHeight = (item.holiday || 0) * yScale;
          const holidayY = overtimeY - holidayHeight;
          
          ctx.fillStyle = hoveredBar === i ? '#34d399' : '#10b981';
          ctx.fillRect(x, holidayY, barWidth, holidayHeight);
        }
        
        // Draw label
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, padding.top + chartHeight + 20);
      });
      
      // Draw hover tooltip
      if (hoveredBar !== null && data[hoveredBar]) {
        const item = data[hoveredBar];
        const x = padding.left + hoveredBar * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2;
        const total = (item.regular || 0) + (item.overtime || 0) + (item.holiday || 0);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - 70, padding.top + chartHeight - (total * yScale) - 50, 140, 45);
        
        ctx.fillStyle = 'white';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${item.label}`, x, padding.top + chartHeight - (total * yScale) - 40);
        ctx.fillText(`Total: ${formatHours(total)}`, x, padding.top + chartHeight - (total * yScale) - 28);
      }
    } else {
      // Line chart for regular hours
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      
      data.forEach((item, i) => {
        const x = padding.left + i * (chartWidth / (data.length - 1));
        const y = padding.top + chartHeight - ((item.regular || 0) * yScale);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Line chart for overtime hours
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      
      data.forEach((item, i) => {
        const x = padding.left + i * (chartWidth / (data.length - 1));
        const y = padding.top + chartHeight - ((item.overtime || 0) * yScale);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Draw points
      data.forEach((item, i) => {
        const x = padding.left + i * (chartWidth / (data.length - 1));
        const regularY = padding.top + chartHeight - ((item.regular || 0) * yScale);
        const overtimeY = padding.top + chartHeight - ((item.overtime || 0) * yScale);
        
        ctx.beginPath();
        ctx.fillStyle = hoveredBar === i ? '#ef4444' : '#3b82f6';
        ctx.arc(x, regularY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = hoveredBar === i ? '#ef4444' : '#f59e0b';
        ctx.arc(x, overtimeY, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };
  
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !data.length || selectedView !== 'bar') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    const padding = { left: 50, right: 30 };
    const chartWidth = width - padding.left - padding.right;
    const barWidth = chartWidth / data.length * 0.7;
    const barSpacing = chartWidth / data.length * 0.3;
    
    for (let i = 0; i < data.length; i++) {
      const barX = padding.left + i * (barWidth + barSpacing) + barSpacing / 2;
      if (x >= barX && x <= barX + barWidth) {
        setHoveredBar(i);
        return;
      }
    }
    
    setHoveredBar(null);
  };
  
  const handleMouseLeave = () => {
    setHoveredBar(null);
  };
  
  return (
    <div className="employee-hours-chart">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-tools">
          {views.map(view => (
            <button
              key={view}
              className={`view-btn ${selectedView === view ? 'active' : ''}`}
              onClick={() => setSelectedView(view)}
            >
              {view === 'bar' ? 'Bar Chart' : 'Line Chart'}
            </button>
          ))}
        </div>
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
            <span>Regular Hours</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#f59e0b' }}></span>
            <span>Overtime</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#10b981' }}></span>
            <span>Holiday</span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .employee-hours-chart {
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
          width: 100%;
          cursor: crosshair;
        }
        
        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          padding-top: 0.75rem;
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