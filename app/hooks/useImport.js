// hooks/useImport.js
'use client';

import { useState } from 'react';

export default function useImport(options = {}) {
  const {
    onValidate,
    onTransform,
    batchSize = 100,
    maxFileSize = 5 * 1024 * 1024 // 5MB
  } = options;
  
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [importedCount, setImportedCount] = useState(0);
  
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      data.push(row);
    }
    
    return data;
  };
  
  const parseCSVLine = (line) => {
    const result = [];
    let inQuotes = false;
    let current = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };
  
  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > maxFileSize) {
        reject(new Error(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`));
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        const data = parseCSV(content);
        resolve(data);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  };
  
  const validateData = async (data) => {
    const validationErrors = [];
    const validationWarnings = [];
    
    for (let i = 0; i < data.length; i++) {
      if (onValidate) {
        const result = await onValidate(data[i], i);
        if (result.errors) {
          validationErrors.push({ row: i + 2, errors: result.errors });
        }
        if (result.warnings) {
          validationWarnings.push({ row: i + 2, warnings: result.warnings });
        }
      }
    }
    
    return { errors: validationErrors, warnings: validationWarnings };
  };
  
  const importData = async (file, importFunction) => {
    setIsImporting(true);
    setErrors([]);
    setWarnings([]);
    setProgress(0);
    setImportedCount(0);
    
    try {
      // Read and parse file
      let data = await readFile(file);
      
      // Transform data if needed
      if (onTransform) {
        data = data.map(onTransform);
      }
      
      // Validate data
      const { errors: validationErrors, warnings: validationWarnings } = await validateData(data);
      setErrors(validationErrors);
      setWarnings(validationWarnings);
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed with ${validationErrors.length} errors`);
      }
      
      // Import in batches
      let imported = 0;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const result = await importFunction(batch, i);
        
        if (result.errors) {
          setErrors(prev => [...prev, ...result.errors]);
          throw new Error('Import failed');
        }
        
        imported += result.count || batch.length;
        setImportedCount(imported);
        setProgress(Math.round((imported / data.length) * 100));
      }
      
      return { success: true, count: imported };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsImporting(false);
    }
  };
  
  const downloadTemplate = (headers, filename = 'template.csv') => {
    const csvRows = [headers.join(',')];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return {
    importData,
    downloadTemplate,
    isImporting,
    progress,
    errors,
    warnings,
    importedCount
  };
}