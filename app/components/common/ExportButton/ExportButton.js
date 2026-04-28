// components/common/ExportButton/ExportButton.js
'use client';

import { useState } from 'react';

export default function ExportButton({ 
  data, 
  filename = 'export',
  formats = ['csv', 'excel', 'pdf'],
  onExport,
  buttonText = 'Export',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const exportToExcel = () => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    let html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
    `;
    
    for (const row of data) {
      html += '<tr>';
      for (const header of headers) {
        html += `<td>${row[header] || ''}</td>`;
      }
      html += '</tr>';
    }
    
    html += `
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Dynamic import for html2pdf (if available)
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.createElement('div');
      element.innerHTML = `
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
        <h1>${filename}</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${Object.values(row).map(v => `<td>${v || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      
      const opt = {
        margin: 1,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export requires html2pdf.js library. Please install it or use CSV/Excel export.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExport = async (format) => {
    setIsOpen(false);
    
    if (onExport) {
      await onExport(format);
      return;
    }
    
    switch (format) {
      case 'csv':
        exportToCSV();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        await exportToPDF();
        break;
      default:
        exportToCSV();
    }
  };
  
  const variantStyles = {
    primary: { background: '#3b82f6', color: 'white', border: 'none' },
    secondary: { background: '#6b7280', color: 'white', border: 'none' },
    outline: { background: 'white', color: '#374151', border: '1px solid #d1d5db' },
    ghost: { background: 'transparent', color: '#374151', border: 'none' }
  };
  
  const sizeStyles = {
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.75rem' },
    md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    lg: { padding: '0.625rem 1.25rem', fontSize: '1rem' }
  };
  
  const getFormatLabel = (format) => {
    switch (format) {
      case 'csv': return 'CSV File';
      case 'excel': return 'Excel File';
      case 'pdf': return 'PDF Document';
      default: return format;
    }
  };
  
  return (
    <div className={`export-button ${className}`}>
      <button
        className="export-btn"
        style={{ ...variantStyles[variant], ...sizeStyles[size] }}
        onClick={() => formats.length === 1 ? handleExport(formats[0]) : setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
      >
        {isExporting ? '⏳ Exporting...' : `📥 ${buttonText}`}
        {formats.length > 1 && <span className="dropdown-icon">▼</span>}
      </button>
      
      {isOpen && formats.length > 1 && (
        <div className="dropdown-menu">
          {formats.map(format => (
            <button
              key={format}
              className="dropdown-item"
              onClick={() => handleExport(format)}
            >
              📄 {getFormatLabel(format)}
            </button>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .export-button {
          position: relative;
          display: inline-block;
        }
        
        .export-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .export-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .dropdown-icon {
          font-size: 0.75rem;
          margin-left: 0.25rem;
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          min-width: 150px;
          z-index: 10;
        }
        
        .dropdown-item {
          display: block;
          width: 100%;
          padding: 0.5rem 1rem;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.875rem;
        }
        
        .dropdown-item:hover {
          background: #f3f4f6;
        }
        
        .dropdown-item:first-child {
          border-radius: 0.5rem 0.5rem 0 0;
        }
        
        .dropdown-item:last-child {
          border-radius: 0 0 0.5rem 0.5rem;
        }
      `}</style>
    </div>
  );
}