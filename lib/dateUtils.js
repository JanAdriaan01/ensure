import { format, parse, differenceInDays, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameDay, isWithinInterval } from 'date-fns';

export class DateUtils {
  static formatDate(date, formatStr = 'yyyy-MM-dd') {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
  }
  
  static formatDateTime(date, formatStr = 'yyyy-MM-dd HH:mm') {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
  }
  
  static parseDate(dateStr, formatStr = 'yyyy-MM-dd') {
    return parse(dateStr, formatStr, new Date());
  }
  
  static getDateRange(range) {
    const today = new Date();
    const ranges = {
      today: { start: today, end: today },
      yesterday: { start: subDays(today, 1), end: subDays(today, 1) },
      thisWeek: { start: startOfWeek(today), end: endOfWeek(today) },
      lastWeek: { start: startOfWeek(subDays(today, 7)), end: endOfWeek(subDays(today, 7)) },
      thisMonth: { start: startOfMonth(today), end: endOfMonth(today) },
      lastMonth: { start: startOfMonth(subDays(today, 30)), end: endOfMonth(subDays(today, 30)) },
      thisYear: { start: startOfYear(today), end: endOfYear(today) },
      last30Days: { start: subDays(today, 30), end: today },
      last90Days: { start: subDays(today, 90), end: today }
    };
    
    return ranges[range] || { start: today, end: today };
  }
  
  static getDaysDifference(date1, date2) {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return differenceInDays(d1, d2);
  }
  
  static isDateInRange(date, startDate, endDate) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    return isWithinInterval(dateObj, { start, end });
  }
  
  static getWeekNumber(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  
  static getFinancialYear(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = d.getMonth();
    
    // Financial year starts in March (South Africa)
    if (month >= 2) { // March (2) to December (11)
      return `${year}/${year + 1}`;
    } else {
      return `${year - 1}/${year}`;
    }
  }
  
  static addDays(date, days) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return addDays(d, days);
  }
  
  static subtractDays(date, days) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return subDays(d, days);
  }
  
  static getWorkingDays(startDate, endDate) {
    let start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    let end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    let workingDays = 0;
    
    while (start <= end) {
      const dayOfWeek = start.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      start = addDays(start, 1);
    }
    
    return workingDays;
  }
  
  static getWeekDays() {
    return [
      { value: 0, label: 'Sunday' },
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' }
    ];
  }
  
  static getMonths() {
    return [
      { value: 0, label: 'January' },
      { value: 1, label: 'February' },
      { value: 2, label: 'March' },
      { value: 3, label: 'April' },
      { value: 4, label: 'May' },
      { value: 5, label: 'June' },
      { value: 6, label: 'July' },
      { value: 7, label: 'August' },
      { value: 8, label: 'September' },
      { value: 9, label: 'October' },
      { value: 10, label: 'November' },
      { value: 11, label: 'December' }
    ];
  }
}