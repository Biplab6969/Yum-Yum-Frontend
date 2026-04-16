const DataTable = ({ columns, data, loading, emptyMessage = 'No data available' }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-secondary-100 rounded mb-2"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-secondary-50 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-secondary-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                className="table-header"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="hover:bg-secondary-50 transition-colors"
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="table-cell">
                  {column.render 
                    ? column.render(row[column.accessor], row, rowIndex)
                    : row[column.accessor]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
