// Table.tsx
import React, { useMemo } from 'react';
import { useReactTable, ColumnDef, ColumnMeta, flexRender, getCoreRowModel } from '@tanstack/react-table';



interface TableProps {
    data:any[];
    columns:ColumnDef<any>[]
}


const DataTable: React.FC<TableProps> = ({data, columns}) => {
  // Define columns
 

  const { getHeaderGroups, getRowModel } = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="min-w-full bg-white border border-gray-200">
      <thead>
        {getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b bg-primary-light text-gray-900">
            {headerGroup.headers.map((header) => (
              <th key={header.id} className={`p-2 `} 
                style={{
                    width:header.column.columnDef.meta?.style?.width || 'auto',
                    textAlign: header.column.columnDef.meta?.style?.textAlign || 'center',
                }}
                >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {getRowModel().rows.map((row) => (
          <tr key={row.id} className="hover:bg-gray-100 border-b">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-2 py-1 text-sm text-gray-900" 
              style={{
                width:cell.column.columnDef.meta?.style?.width || 'auto',
                textAlign: cell.column.columnDef.meta?.style?.textAlign || 'center',
            }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;