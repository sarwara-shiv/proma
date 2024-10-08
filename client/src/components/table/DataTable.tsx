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
    <table className="min-w-full bg-white-  border-none border-gray-200">
      <thead>
        {getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b text-sm bg-primary-light- text-gray-0 font-normal">
            {headerGroup.headers.map((header) => (
              <th key={header.id} className={`p-2 font-normal`} 
                style={{
                    width:header.column.columnDef.meta?.style?.width || 'auto',
                    textAlign: header.column.columnDef.meta?.style?.textAlign || 'left',
                    maxWidth:header.column.columnDef.meta?.style?.maxWidth || '',
                    minWidth:header.column.columnDef.meta?.style?.minWidth || '',
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
          <tr key={row.id} className="hover:bg-green-100 border-b border-gray-100 even:bg-gray-300/30 text-xs">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className={
                `px-2 py-1 ${cell.column.columnDef.meta?.style?.tFontSize || 'text-xs '}
                ${cell.column.columnDef.meta?.style?.tColor || 'text-slate-500' } 
                ` 
              }
              style={{
                width:cell.column.columnDef.meta?.style?.width || 'auto',
                textAlign: cell.column.columnDef.meta?.style?.textAlign || 'left',
                color:cell.column.columnDef.meta?.style?.color || '',
                maxWidth:cell.column.columnDef.meta?.style?.maxWidth || '',
                minWidth:cell.column.columnDef.meta?.style?.minWidth || '',
                fontSize:cell.column.columnDef.meta?.style?.fontSize || '',
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
