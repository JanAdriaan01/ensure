// lib/financialYear.js
export function getFinancialYearRange(date, startMonth = 3, startDay = 1) {
  const year = date.getFullYear();
  const financialStart = new Date(year, startMonth - 1, startDay);
  
  if (date < financialStart) {
    // Date is in previous financial year
    const start = new Date(year - 1, startMonth - 1, startDay);
    const end = new Date(year, startMonth - 1, startDay - 1);
    return { start, end, label: `${start.getFullYear()}/${end.getFullYear()}` };
  } else {
    // Date is in current financial year
    const start = new Date(year, startMonth - 1, startDay);
    const end = new Date(year + 1, startMonth - 1, startDay - 1);
    return { start, end, label: `${start.getFullYear()}/${end.getFullYear()}` };
  }
}

export function getPreviousFinancialYear(date, startMonth = 3, startDay = 1) {
  const current = getFinancialYearRange(date, startMonth, startDay);
  const prevStart = new Date(current.start);
  prevStart.setFullYear(prevStart.getFullYear() - 1);
  const prevEnd = new Date(current.end);
  prevEnd.setFullYear(prevEnd.getFullYear() - 1);
  return { start: prevStart, end: prevEnd, label: `${prevStart.getFullYear()}/${prevEnd.getFullYear()}` };
}

export function getFinancialYearsList(startYear = 2020, endYear = 2030, startMonth = 3, startDay = 1) {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    const start = new Date(year, startMonth - 1, startDay);
    const end = new Date(year + 1, startMonth - 1, startDay - 1);
    years.push({
      label: `${year}/${year + 1}`,
      start,
      end,
      year: year
    });
  }
  return years;
}