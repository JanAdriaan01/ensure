export class NumberUtils {
  static formatCurrency(amount, currency = 'ZAR', options = {}) {
    const { decimalPlaces = 2, symbol = true } = options;
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: symbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
    
    return formatter.format(amount || 0);
  }
  
  static formatNumber(number, options = {}) {
    const { decimalPlaces = 0, thousandsSeparator = true } = options;
    const formatter = new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      useGrouping: thousandsSeparator
    });
    
    return formatter.format(number || 0);
  }
  
  static formatPercentage(value, decimalPlaces = 1) {
    return `${(value * 100).toFixed(decimalPlaces)}%`;
  }
  
  static round(value, decimals = 2) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  }
  
  static calculateVAT(amount, rate = 0.15) {
    return {
      exclusive: amount,
      vat: amount * rate,
      inclusive: amount * (1 + rate)
    };
  }
  
  static calculateMargin(cost, revenue) {
    if (cost === 0) return 0;
    return (revenue - cost) / revenue;
  }
  
  static calculateMarkup(cost, sellingPrice) {
    if (cost === 0) return 0;
    return (sellingPrice - cost) / cost;
  }
  
  static formatHours(hours) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (minutes === 0) return `${wholeHours}h`;
    if (wholeHours === 0) return `${minutes}m`;
    return `${wholeHours}h ${minutes}m`;
  }
  
  static calculateOvertime(regularHours, overtimeRate = 1.5) {
    const standardHours = 160; // 40 hours * 4 weeks
    const regular = Math.min(regularHours, standardHours);
    const overtime = Math.max(0, regularHours - standardHours);
    
    return {
      regular,
      overtime,
      overtimeRate,
      regularPay: regular,
      overtimePay: overtime * overtimeRate,
      totalPay: regular + (overtime * overtimeRate)
    };
  }
  
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  static getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  static isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
  
  static toInteger(value, defaultValue = 0) {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  static toFloat(value, decimalPlaces = 2, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : Number(parsed.toFixed(decimalPlaces));
  }
  
  static abbreviateNumber(number) {
    if (number < 1e3) return number.toString();
    if (number >= 1e3 && number < 1e6) return (number / 1e3).toFixed(1) + 'K';
    if (number >= 1e6 && number < 1e9) return (number / 1e6).toFixed(1) + 'M';
    if (number >= 1e9 && number < 1e12) return (number / 1e9).toFixed(1) + 'B';
    return (number / 1e12).toFixed(1) + 'T';
  }
}