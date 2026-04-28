export class FilterManager {
  constructor(data, options = {}) {
    this.data = data;
    this.filters = options.filters || {};
  }
  
  applyFilters(filters = this.filters) {
    let filteredData = [...this.data];
    
    Object.entries(filters).forEach(([key, filterConfig]) => {
      if (filterConfig.value !== undefined && filterConfig.value !== null && filterConfig.value !== '') {
        filteredData = this.applyFilter(filteredData, key, filterConfig);
      }
    });
    
    return filteredData;
  }
  
  applyFilter(data, field, config) {
    const { value, operator = 'eq', type = 'string' } = config;
    
    return data.filter(item => {
      const itemValue = this.getNestedValue(item, field);
      
      switch(operator) {
        case 'eq':
          return this.compareValues(itemValue, value, type, 'eq');
        case 'neq':
          return !this.compareValues(itemValue, value, type, 'eq');
        case 'gt':
          return this.compareValues(itemValue, value, type, 'gt');
        case 'gte':
          return this.compareValues(itemValue, value, type, 'gte');
        case 'lt':
          return this.compareValues(itemValue, value, type, 'lt');
        case 'lte':
          return this.compareValues(itemValue, value, type, 'lte');
        case 'contains':
          return itemValue && itemValue.toString().toLowerCase().includes(value.toString().toLowerCase());
        case 'startsWith':
          return itemValue && itemValue.toString().toLowerCase().startsWith(value.toString().toLowerCase());
        case 'endsWith':
          return itemValue && itemValue.toString().toLowerCase().endsWith(value.toString().toLowerCase());
        case 'between':
          return itemValue >= value[0] && itemValue <= value[1];
        case 'in':
          return value.includes(itemValue);
        case 'notIn':
          return !value.includes(itemValue);
        case 'isNull':
          return itemValue === null || itemValue === undefined;
        case 'isNotNull':
          return itemValue !== null && itemValue !== undefined;
        default:
          return itemValue === value;
      }
    });
  }
  
  compareValues(itemValue, filterValue, type, operator) {
    let item = itemValue;
    let filter = filterValue;
    
    if (type === 'date') {
      item = new Date(itemValue).getTime();
      filter = new Date(filterValue).getTime();
    } else if (type === 'number') {
      item = parseFloat(itemValue);
      filter = parseFloat(filterValue);
    }
    
    switch(operator) {
      case 'eq':
        return item === filter;
      case 'gt':
        return item > filter;
      case 'gte':
        return item >= filter;
      case 'lt':
        return item < filter;
      case 'lte':
        return item <= filter;
      default:
        return item === filter;
    }
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
  
  addDateRangeFilter(field, startDate, endDate) {
    this.filters[field] = {
      value: [startDate, endDate],
      operator: 'between',
      type: 'date'
    };
    return this;
  }
  
  addMultiSelectFilter(field, values) {
    this.filters[field] = {
      value: values,
      operator: 'in'
    };
    return this;
  }
  
  addRangeFilter(field, min, max) {
    this.filters[field] = {
      value: [min, max],
      operator: 'between',
      type: 'number'
    };
    return this;
  }
  
  clearFilters() {
    this.filters = {};
    return this;
  }
  
  removeFilter(field) {
    delete this.filters[field];
    return this;
  }
}

// Pre-built filter presets
export const FILTER_PRESETS = {
  JOBS: {
    status: { field: 'po_status', operator: 'eq' },
    completion: { field: 'completion_status', operator: 'eq' },
    client: { field: 'client_id', operator: 'eq' },
    dateRange: { field: 'created_at', operator: 'between', type: 'date' },
    budgetRange: { field: 'total_budget', operator: 'between', type: 'number' }
  },
  
  EMPLOYEES: {
    status: { field: 'status', operator: 'eq' },
    department: { field: 'department', operator: 'eq' },
    position: { field: 'position', operator: 'eq' },
    skill: { field: 'skills.name', operator: 'contains' }
  },
  
  STOCK: {
    category: { field: 'category', operator: 'eq' },
    quantityRange: { field: 'quantity', operator: 'between', type: 'number' },
    lowStock: { field: 'quantity', operator: 'lt', type: 'number' }
  }
};