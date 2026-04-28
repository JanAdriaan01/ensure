// hooks/usePrint.js
'use client';

import { useState, useCallback } from 'react';

export default function usePrint(options = {}) {
  const {
    title = 'Print Document',
    styles = null,
    orientation = 'portrait',
    pageSize = 'A4'
  } = options;
  
  const [isPrinting, setIsPrinting] = useState(false);
  
  const printElement = useCallback((elementOrSelector) => {
    setIsPrinting(true);
    
    try {
      let element;
      if (typeof elementOrSelector === 'string') {
        element = document.querySelector(elementOrSelector);
      } else {
        element = elementOrSelector;
      }
      
      if (!element) {
        throw new Error('Element not found');
      }
      
      const originalTitle = document.title;
      document.title = title;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
      
      const stylesHtml = styles || getPageStyles();
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
                .print-only { display: block; }
              }
              
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
              }
              
              table {
                border-collapse: collapse;
                width: 100%;
              }
              
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              
              th {
                background-color: #f2f2f2;
              }
              
              @page {
                size: ${pageSize} ${orientation};
                margin: 2cm;
              }
            </style>
            ${stylesHtml}
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
          document.title = originalTitle;
        };
      };
      
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to print. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  }, [title, styles]);
  
  const printHTML = useCallback((html) => {
    setIsPrinting(true);
    
    try {
      const originalTitle = document.title;
      document.title = title;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
              }
              
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
              }
              
              @page {
                size: ${pageSize} ${orientation};
                margin: 2cm;
              }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
          document.title = originalTitle;
        };
      };
      
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to print. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  }, [title, pageSize, orientation]);
  
  const printTable = useCallback((headers, data, tableTitle = null) => {
    let html = `
      <h1>${tableTitle || title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
    `;
    
    headers.forEach(header => {
      html += `<th>${header}</th>`;
    });
    
    html += `</thead><tbody>`;
    
    data.forEach(row => {
      html += '<tr>';
      headers.forEach(header => {
        let value = row[header];
        if (value === undefined || value === null) value = '';
        if (typeof value === 'object') value = JSON.stringify(value);
        html += `<td>${value}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    return printHTML(html);
  }, [title, printHTML]);
  
  const printAsPDF = useCallback(async (elementOrSelector) => {
    try {
      const html2pdf = await import('html2pdf.js');
      
      let element;
      if (typeof elementOrSelector === 'string') {
        element = document.querySelector(elementOrSelector);
      } else {
        element = elementOrSelector;
      }
      
      if (!element) {
        throw new Error('Element not found');
      }
      
      const opt = {
        margin: 1,
        filename: `${title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: pageSize, orientation }
      };
      
      await html2pdf.default().set(opt).from(element).save();
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please install html2pdf.js');
    }
  }, [title, pageSize, orientation]);
  
  const getPageStyles = () => {
    let styles = '';
    const styleSheets = document.styleSheets;
    
    try {
      for (const sheet of styleSheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            for (const rule of rules) {
              styles += rule.cssText;
            }
          }
        } catch (e) {
          // CORS or other errors
        }
      }
    } catch (e) {
      console.error('Failed to get styles:', e);
    }
    
    return `<style>${styles}</style>`;
  };
  
  return {
    printElement,
    printHTML,
    printTable,
    printAsPDF,
    isPrinting
  };
}