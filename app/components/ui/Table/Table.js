'use client';

const Table = ({ 
  columns, 
  data, 
  onRowClick, 
  loading = false, 
  emptyMessage = 'No data found' 
}) => {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx}>
                  {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .table-container {
          background: white;
          border-radius: 0.75rem;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .clickable {
          cursor: pointer;
          transition: background 0.2s;
        }
        .clickable:hover {
          background: #f9fafb;
        }
        .table-loading {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default Table;