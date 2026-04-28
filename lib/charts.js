export class ChartConfig {
  static lineChart(data, options = {}) {
    return {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map(dataset => ({
          label: dataset.label,
          data: dataset.data,
          borderColor: dataset.color || this.getRandomColor(),
          backgroundColor: dataset.fillColor || 'transparent',
          tension: options.smooth ? 0.4 : 0,
          fill: options.fill || false
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: options.legendPosition || 'top' },
          title: { display: !!options.title, text: options.title || '' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: { beginAtZero: options.beginAtZero !== false }
        }
      }
    };
  }
  
  static barChart(data, options = {}) {
    return {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets.map(dataset => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: dataset.colors || this.getColorPalette(data.datasets.length),
          borderRadius: options.rounded ? 4 : 0
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: options.legendPosition || 'top' },
          title: { display: !!options.title, text: options.title || '' }
        },
        scales: {
          y: { beginAtZero: true, grid: { drawBorder: true } },
          x: { grid: { display: false } }
        }
      }
    };
  }
  
  static pieChart(data, options = {}) {
    return {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: this.getColorPalette(data.labels.length),
          borderWidth: options.borderWidth || 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: options.legendPosition || 'bottom' },
          title: { display: !!options.title, text: options.title || '' },
          tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw} (${((context.raw / data.total) * 100).toFixed(1)}%)` } }
        }
      }
    };
  }
  
  static doughnutChart(data, options = {}) {
    return {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: this.getColorPalette(data.labels.length),
          cutout: options.cutout || '50%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: options.legendPosition || 'bottom' },
          title: { display: !!options.title, text: options.title || '' }
        }
      }
    };
  }
  
  static getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  static getColorPalette(count) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7D794', '#786FA6', '#F19066',
      '#3B9E8D', '#E77F67', '#C44569', '#F5CD79', '#574B60'
    ];
    return colors.slice(0, count);
  }
  
  static getFinancialChart(jobData) {
    const labels = jobData.map(job => job.lc_number);
    const poAmounts = jobData.map(job => job.po_amount || 0);
    const budgets = jobData.map(job => job.total_budget || 0);
    const actuals = jobData.map(job => job.actual_cost || 0);
    
    return this.barChart({
      labels,
      datasets: [
        { label: 'PO Amount', data: poAmounts, color: '#4ECDC4' },
        { label: 'Budget', data: budgets, color: '#45B7D1' },
        { label: 'Actual Cost', data: actuals, color: '#FF6B6B' }
      ]
    }, { title: 'Job Financial Comparison' });
  }
  
  static getHoursChart(employeeHours) {
    return this.barChart({
      labels: employeeHours.map(e => `${e.first_name} ${e.last_name}`),
      datasets: [
        { label: 'Productive Hours', data: employeeHours.map(e => e.productive_hours || 0), color: '#4ECDC4' },
        { label: 'Unproductive Hours', data: employeeHours.map(e => e.unproductive_hours || 0), color: '#FF6B6B' },
        { label: 'Overtime Hours', data: employeeHours.map(e => e.overtime_hours || 0), color: '#F7D794' }
      ]
    }, { title: 'Employee Hours Distribution' });
  }
  
  static getRevenueChart(revenueData) {
    return this.lineChart({
      labels: revenueData.map(r => r.month),
      datasets: [
        { label: 'Revenue', data: revenueData.map(r => r.revenue), color: '#4ECDC4' },
        { label: 'Expenses', data: revenueData.map(r => r.expenses), color: '#FF6B6B' },
        { label: 'Profit', data: revenueData.map(r => r.profit), color: '#45B7D1' }
      ]
    }, { title: 'Financial Trends', smooth: true });
  }
  
  static getStockStatusChart(stockItems) {
    const lowStock = stockItems.filter(item => item.quantity <= item.min_quantity).length;
    const normalStock = stockItems.filter(item => item.quantity > item.min_quantity && item.quantity <= item.max_quantity).length;
    const overStock = stockItems.filter(item => item.quantity > item.max_quantity).length;
    
    return this.doughnutChart({
      labels: ['Low Stock', 'Normal Stock', 'Over Stock'],
      values: [lowStock, normalStock, overStock]
    }, { title: 'Stock Status Distribution' });
  }
}