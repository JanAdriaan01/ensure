import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class ExportService {
  static async exportToCSV(data, filename, options = {}) {
    const { headers, delimiter = ',' } = options;
    
    let csvData = data;
    if (headers) {
      csvData = data.map(row => {
        const newRow = {};
        headers.forEach(header => {
          newRow[header.label] = row[header.key];
        });
        return newRow;
      });
    }
    
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: delimiter });
    
    this.downloadFile(csv, filename, 'text/csv');
  }
  
  static async exportToExcel(data, filename, options = {}) {
    const { sheetName = 'Sheet1', headers } = options;
    
    let excelData = data;
    if (headers) {
      excelData = data.map(row => {
        const newRow = {};
        headers.forEach(header => {
          newRow[header.label] = row[header.key];
        });
        return newRow;
      });
    }
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadBlob(blob, filename);
  }
  
  static async exportToPDF(data, filename, options = {}) {
    const { title, columns, orientation = 'portrait' } = options;
    const doc = new jsPDF({ orientation });
    
    if (title) {
      doc.setFontSize(18);
      doc.text(title, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
    }
    
    const tableData = data.map(row => 
      columns.map(col => row[col.key] || '')
    );
    
    autoTable(doc, {
      head: [columns.map(col => col.label)],
      body: tableData,
      startY: title ? 35 : 15,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    doc.save(filename);
  }
  
  static async exportToJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    this.downloadFile(jsonString, filename, 'application/json');
  }
  
  static downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }
  
  static downloadBlob(blob, filename) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  static async exportFromAPI(endpoint, params, format, filename) {
    const queryString = new URLSearchParams({ ...params, format }).toString();
    const response = await fetch(`${endpoint}?${queryString}`);
    const blob = await response.blob();
    this.downloadBlob(blob, filename);
  }
}

// Export helpers for common entities
export async function exportJobs(jobs, format, filename) {
  const columns = [
    { key: 'lc_number', label: 'Job Number' },
    { key: 'client_name', label: 'Client' },
    { key: 'po_status', label: 'PO Status' },
    { key: 'completion_status', label: 'Completion' },
    { key: 'po_amount', label: 'PO Amount' },
    { key: 'total_budget', label: 'Budget' },
    { key: 'created_at', label: 'Created Date' }
  ];
  
  switch(format) {
    case 'csv':
      await ExportService.exportToCSV(jobs, filename, { headers: columns });
      break;
    case 'excel':
      await ExportService.exportToExcel(jobs, filename, { headers: columns });
      break;
    case 'pdf':
      await ExportService.exportToPDF(jobs, filename, { title: 'Jobs Report', columns });
      break;
    case 'json':
      await ExportService.exportToJSON(jobs, filename);
      break;
  }
}

export async function exportEmployees(employees, format, filename) {
  const columns = [
    { key: 'employee_number', label: 'Emp Number' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'hourly_rate', label: 'Hourly Rate' },
    { key: 'status', label: 'Status' }
  ];
  
  switch(format) {
    case 'csv':
      await ExportService.exportToCSV(employees, filename, { headers: columns });
      break;
    case 'excel':
      await ExportService.exportToExcel(employees, filename, { headers: columns });
      break;
    case 'pdf':
      await ExportService.exportToPDF(employees, filename, { title: 'Employees Report', columns });
      break;
  }
}