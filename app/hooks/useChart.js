// hooks/useChart.js
'use client';

import { useState, useMemo } from 'react';

export default function useChart(data = [], options = {}) {
  const {
    xAxis = 'label',
    yAxis = 'value',
    groupBy = null,
    aggregate = 'sum',
    sortBy = null,
    sortDirection = 'desc',
    limit = null
  } = options;
  
  const [chartType, setChartType] = useState('bar');
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  
  const aggregateValues = (values) => {
    switch (aggregate) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        return values[0];
    }
  };
  
  const prepareData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let preparedData = [...data];
    
    // Group data if needed
    if (groupBy) {
      const groups = new Map();
      
      preparedData.forEach(item => {
        const groupKey = item[groupBy];
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey).push(item[yAxis]);
      });
      
      preparedData = Array.from(groups.entries()).map(([label, values]) => ({
        label,
        [yAxis]: aggregateValues(values),
        originalData: values
      }));
    }
    
    // Sort data
    if (sortBy) {
      preparedData.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    // Limit data
    if (limit && limit > 0) {
      preparedData = preparedData.slice(0, limit);
    }
    
    return preparedData.map(item => ({
      label: item[xAxis],
      value: item[yAxis],
      originalData: item
    }));
  }, [data, xAxis, yAxis, groupBy, aggregate, sortBy, sortDirection, limit]);
  
  const getMinValue = useMemo(() => {
    if (prepareData.length === 0) return 0;
    return Math.min(...prepareData.map(d => d.value));
  }, [prepareData]);
  
  const getMaxValue = useMemo(() => {
    if (prepareData.length === 0) return 0;
    return Math.max(...prepareData.map(d => d.value));
  }, [prepareData]);
  
  const getTotal = useMemo(() => {
    if (prepareData.length === 0) return 0;
    return prepareData.reduce((sum, d) => sum + d.value, 0);
  }, [prepareData]);
  
  const getAverage = useMemo(() => {
    if (prepareData.length === 0) return 0;
    return getTotal / prepareData.length;
  }, [prepareData, getTotal]);
  
  const getPercentages = useMemo(() => {
    if (getTotal === 0) return prepareData.map(d => ({ ...d, percentage: 0 }));
    
    return prepareData.map(d => ({
      ...d,
      percentage: (d.value / getTotal) * 100
    }));
  }, [prepareData, getTotal]);
  
  const getTrend = useMemo(() => {
    if (prepareData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const firstValue = prepareData[0].value;
    const lastValue = prepareData[prepareData.length - 1].value;
    const change = lastValue - firstValue;
    const percentageChange = (change / firstValue) * 100;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change),
      percentage: Math.abs(percentageChange),
      firstValue,
      lastValue
    };
  }, [prepareData]);
  
  const getFormattedValue = (value, format = 'number') => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'compact':
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
      default:
        return value.toLocaleString();
    }
  };
  
  const getColor = (index, colorPalette = null) => {
    const defaultPalette = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    
    const palette = colorPalette || defaultPalette;
    return palette[index % palette.length];
  };
  
  const getTooltipData = (dataPoint) => {
    const percentage = (dataPoint.value / getTotal) * 100;
    return {
      ...dataPoint,
      percentage: percentage.toFixed(1),
      formattedValue: getFormattedValue(dataPoint.value)
    };
  };
  
  return {
    chartData: prepareData,
    percentages: getPercentages,
    chartType,
    setChartType,
    selectedDataPoint,
    setSelectedDataPoint,
    stats: {
      min: getMinValue,
      max: getMaxValue,
      total: getTotal,
      average: getAverage,
      count: prepareData.length
    },
    trend: getTrend,
    getFormattedValue,
    getColor,
    getTooltipData
  };
}