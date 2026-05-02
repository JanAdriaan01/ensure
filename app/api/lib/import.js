import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export class ImportService {
  static async importFromFile(file, options = {}) {
    const { type = 'auto', validateRow = null, transformRow = null } = options;
    
    let data;
    const fileType = type === 'auto' ? this.getFileType(file.name) : type;
    
    if (fileType === 'csv') {
      data = await this.parseCSV(file);
    } else if (fileType === 'excel') {
      data = await this.parseExcel(file);
    } else if (fileType === 'json') {
      data = await this.parseJSON(file);
    } else {
      throw new Error('Unsupported file format');
    }
    
    // Validate and transform data
    let processedData = data;
    if (validateRow) {
      const errors = [];
      processedData = data.filter((row, index) => {
        const isValid = validateRow(row, index);
        if (!isValid) errors.push({ row: index, data: row });
        return isValid;
      });
      if (errors.length > 0) {
        throw new Error(`Validation failed for ${errors.length} rows`);
      }
    }
    
    if (transformRow) {
      processedData = processedData.map(transformRow);
    }
    
    return {
      data: processedData,
      totalRows: data.length,
      validRows: processedData.length,
      invalidRows: data.length - processedData.length
    };
  }
  
  static getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'csv') return 'csv';
    if (['xlsx', 'xls'].includes(ext)) return 'excel';
    if (ext === 'json') return 'json';
    return null;
  }
  
  static parseCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  
  static parseExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  static parseJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(Array.isArray(data) ? data : [data]);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  
  static async bulkImport(data, importFunction, batchSize = 100) {
    const results = {
      successful: [],
      failed: [],
      total: data.length
    };
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const promises = batch.map(async (item, index) => {
        try {
          const result = await importFunction(item);
          results.successful.push({ index: i + index, data: item, result });
        } catch (error) {
          results.failed.push({ index: i + index, data: item, error: error.message });
        }
      });
      
      await Promise.all(promises);
    }
    
    return results;
  }
  
  static validateRequiredFields(data, requiredFields) {
    const errors = [];
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push({ row: index, field, message: `${field} is required` });
        }
      });
    });
    return errors;
  }
  
  static validateDataTypes(data, fieldTypes) {
    const errors = [];
    data.forEach((row, index) => {
      Object.entries(fieldTypes).forEach(([field, type]) => {
        const value = row[field];
        if (value && !this.isType(value, type)) {
          errors.push({ row: index, field, message: `${field} must be ${type}` });
        }
      });
    });
    return errors;
  }
  
  static isType(value, type) {
    switch(type) {
      case 'number':
        return !isNaN(parseFloat(value));
      case 'date':
        return !isNaN(Date.parse(value));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return /^[\d\s+-]{10,}$/.test(value);
      default:
        return true;
    }
  }
}