export class SearchEngine {
  constructor(data, options = {}) {
    this.data = data;
    this.fields = options.fields || [];
    this.caseSensitive = options.caseSensitive || false;
    this.fuzzy = options.fuzzy || false;
  }
  
  search(query, options = {}) {
    if (!query || query.trim() === '') return this.data;
    
    const searchFields = options.fields || this.fields;
    const searchTerm = this.caseSensitive ? query : query.toLowerCase();
    
    return this.data.filter(item => {
      return searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        if (!value) return false;
        
        const searchValue = this.caseSensitive ? value.toString() : value.toString().toLowerCase();
        
        if (this.fuzzy || options.fuzzy) {
          return this.fuzzyMatch(searchValue, searchTerm);
        } else {
          return searchValue.includes(searchTerm);
        }
      });
    });
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
  
  fuzzyMatch(str, searchTerm) {
    if (searchTerm.length === 0) return true;
    if (str.length < searchTerm.length) return false;
    
    let pattern = '';
    for (let i = 0; i < searchTerm.length; i++) {
      pattern += `${searchTerm[i]}.*`;
    }
    const regex = new RegExp(pattern, 'i');
    return regex.test(str);
  }
  
  advancedSearch(filters) {
    return this.data.filter(item => {
      return Object.entries(filters).every(([field, condition]) => {
        const value = this.getNestedValue(item, field);
        
        if (typeof condition === 'object') {
          const { operator, value: filterValue } = condition;
          
          switch(operator) {
            case 'eq':
              return value === filterValue;
            case 'neq':
              return value !== filterValue;
            case 'gt':
              return value > filterValue;
            case 'gte':
              return value >= filterValue;
            case 'lt':
              return value < filterValue;
            case 'lte':
              return value <= filterValue;
            case 'contains':
              return value && value.toString().includes(filterValue);
            case 'startsWith':
              return value && value.toString().startsWith(filterValue);
            case 'endsWith':
              return value && value.toString().endsWith(filterValue);
            case 'between':
              return value >= filterValue[0] && value <= filterValue[1];
            case 'in':
              return filterValue.includes(value);
            default:
              return value === filterValue;
          }
        } else {
          return value === condition;
        }
      });
    });
  }
  
  searchByRelevance(query, options = {}) {
    const results = this.search(query, options);
    
    return results.map(item => {
      let relevance = 0;
      this.fields.forEach(field => {
        const value = this.getNestedValue(item, field);
        if (value) {
          const strValue = value.toString().toLowerCase();
          const searchTerm = query.toLowerCase();
          
          if (strValue === searchTerm) {
            relevance += 100;
          } else if (strValue.startsWith(searchTerm)) {
            relevance += 75;
          } else if (strValue.includes(searchTerm)) {
            relevance += 50;
          }
          
          // Word boundary matching
          if (new RegExp(`\\b${searchTerm}\\b`).test(strValue)) {
            relevance += 25;
          }
        }
      });
      
      return { item, relevance };
    }).sort((a, b) => b.relevance - a.relevance);
  }
}

// Search presets for different entities
export const JOB_SEARCH_FIELDS = ['lc_number', 'client_name', 'description', 'po_status'];
export const EMPLOYEE_SEARCH_FIELDS = ['first_name', 'last_name', 'employee_number', 'email', 'position'];
export const CLIENT_SEARCH_FIELDS = ['name', 'email', 'phone', 'contact_person'];
export const QUOTE_SEARCH_FIELDS = ['quote_number', 'client_name', 'description', 'status'];
export const STOCK_SEARCH_FIELDS = ['name', 'sku', 'category', 'supplier'];
export const TOOL_SEARCH_FIELDS = ['name', 'serial_number', 'category', 'location'];