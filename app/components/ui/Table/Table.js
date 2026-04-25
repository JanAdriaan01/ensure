'use client';

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import EmptyState from '../EmptyState/EmptyState';
import styles from './Table.module.css';

export default function Table({ 
  columns, 
  data, 
  onRowClick, 
  loading = false, 
  emptyMessage = 'No data found',
  showHeader = true
}) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="sm" text="" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        {showHeader && (
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={{ width: col.width }}
                  className={`${styles.tableHeader} ${col.align === 'right' ? styles.right : col.align === 'center' ? styles.center : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((row, rowIdx) => (
            <tr 
              key={row.id || rowIdx} 
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? styles.clickable : ''} ${rowIdx === data.length - 1 ? styles.lastRow : ''}`}
            >
              {columns.map((col, colIdx) => (
                <td 
                  key={colIdx}
                  className={`${styles.tableCell} ${col.align === 'right' ? styles.right : col.align === 'center' ? styles.center : ''}`}
                >
                  {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}