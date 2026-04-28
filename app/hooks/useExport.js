// hooks/useExport.js
'use client';

import { useState } from 'react';

export default function useExport(options = {}) {
  const {
    filename = 'export',
    formats = ['csv', 'excel', 'pdf']
  } = options;
  
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const exportToCSV = (data, customFilename = null) => {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        let value = row[header];
        if (value === undefined || value === null) value = '';
        if (typeof value === 'object') value = JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${customFilename || filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const exportToExcel = (data, customFilename = null) => {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }
    
    const headers = Object.keys(data[0]);
    let html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${customFilename || filename}</title>
          <style>
            th { background: #f3f4f6; font-weight: bold; }
            td, th { border: 1px solid #ddd; padding: 8px; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(header => {
                    let value = row[header];
                    if (value === undefined || value === null) value = '';
                    if (typeof value === 'object') value = JSON.stringify(value);
                    return `<td>${escapeHtml(String(value))}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${customFilename || filename}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const exportToPDF = async (data, customFilename = null) => {
    try {
      const html2pdf = await import('html2pdf.js');
      
      const element = document.createElement('div');
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      
      element.innerHTML = `
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
        <h1>${escapeHtml(customFilename || filename)}</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(header => {
                  let value = row[header];
                  if (value === undefined || value === null) value = '';
                  if (typeof value === 'object') value = JSON.stringify(value);
                  return `<td>${escapeHtml(String(value))}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      
      const opt = {
        margin: 1,
        filename: `${customFilename || filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
      };
      
      await html2pdf.default().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export requires html2pdf.js library');
      throw new Error('PDF export not available. Please install html2pdf.js');
    }
  };
  
  const exportData = async (data, format, customFilename = null) => {
    setIsExporting(true);
    setError(null);
    setProgress(0);
    
    try {
      switch (format) {
        case 'csv':
          await exportToCSV(data, customFilename);
          break;
        case 'excel':
          await exportToExcel(data, customFilename);
          break;
        case 'pdf':
          await exportToPDF(data, customFilename);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      setProgress(100);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsExporting(false);
    }
  };
  
  const escapeHtml = (str) => {
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };
  
  return {
    exportData,
    isExporting,
    progress,
    error,
    formats
  };
}