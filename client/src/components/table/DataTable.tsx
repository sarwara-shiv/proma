import React, { useState } from 'react';
import {
  useReactTable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from '@tanstack/react-table';
import { FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';
import { BsArrowsExpandVertical } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

interface TableProps {
  data: any[];
  columns: ColumnDef<any>[];
  pinnedColumns?:string[];
  fixWidthColumns?:string[];
}

const DataTable: React.FC<TableProps> = ({ data, columns, pinnedColumns, fixWidthColumns }) => {
  const {t} = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [columnSizing, setColumnSizing] = useState({});

  // Group the data by 'project'
  const groupedData = data.reduce((acc, row) => {
    const projectKey = row._mid;
    if (!acc[projectKey]) {
      acc[projectKey] = [];
    }
    acc[projectKey].push(row);
    return acc;
  }, {});

  const groupedRows = Object.keys(groupedData).map((projectKey) => {
    const projectRows = groupedData[projectKey];
    return [
      { isHeader: true, project: projectKey }, // Insert header for each project
      ...projectRows, // Add all rows for this project
    ];
  }).flat();

  // Initialize the table with filtering and sorting
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter, // Pass filter change handler
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Add the filtered row model
    globalFilterFn: 'includesString', // Use default string includes filtering
  });

  // const getStickyStyle = (index: number, isPinned: boolean) => {
  //   if (!isPinned) return {}; // If not pinned, no sticky styles

  //   return {
  //     position: 'sticky' as 'sticky',
  //     left: `${index * 150}px`,
  //     zIndex: 1, 
  //     // backgroundColor: 'white', 
  //   };
  // };

  const getStickyStyle = (index: number, isPinned: boolean) => {
    if (!isPinned) return {}; // If not pinned, no sticky styles

    // Calculate the left position based on the widths of previous columns
    const leftPosition = table.getHeaderGroups().reduce((sum, headerGroup) => {
      return (
        sum +
        headerGroup.headers.slice(0, index).reduce((headerSum, header) => {
          return (
            headerSum +
            (header.column.columnDef.meta?.style?.width
              ? parseInt(header.column.columnDef.meta?.style?.width, 10)
              : 150) // Default width if not specified
          );
        }, 0)
      );
    }, 0);

    return {
      position: 'sticky' as 'sticky',
      left: `${leftPosition}px`, // Use the calculated left position
      zIndex: 1,
    };
  };

  return (
    <div>
      {/* Search Field */}
      <div className="sticky top-0 bg-white z-10 px-4 py-2 shadow-sm">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)} // Update global filter
          placeholder={`${t('search')}...`}
          className="p-2 border rounded w-full text-sm max-w-[200px] focus:outline-none"
        />
      </div>

      <div className="table-container relative overflow-x-auto py-4 relative">
        <table className="table-auto border-collapse w-full table-fixed">
          <thead className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              
              <tr key={headerGroup.id} 
              className="border-b trgroup">
                {headerGroup.headers.map((header, index) => {
                  const isPinned = pinnedColumns && pinnedColumns.includes(header.id) || false;
                  const fixWidth = fixWidthColumns && fixWidthColumns.includes(header.id) || false;
                  return (
                  <th
                    key={header.id}
                    className={`p-2  text-xs font-normal group 
                      bg-white
                      ${header.column.getCanSort() ? 'cursor-pointer' : ''} 
                      `}
                    style={{
                      textAlign:header.column.columnDef.meta?.style?.textAlign || 'left',
                      width: header.column.columnDef.meta?.style?.width ? header.column.columnDef.meta?.style?.width : 
                      header.getSize() ? header.getSize() : 'auto',
                      // width: !fixWidth ?
                      // header.getSize() ? header.getSize() : header.column.columnDef.meta?.style?.width || 'auto' :
                      // header.column.columnDef.meta?.style?.width || 'auto',

                      ...getStickyStyle(index, isPinned),
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className={`flex justify-${header.column.columnDef.meta?.style?.textAlign ?  
                      header.column.columnDef.meta?.style?.textAlign === 'left' ? 'start' : 
                      header.column.columnDef.meta?.style?.textAlign === 'right' ? 'end' :  'center'
                      : 'start'} 
                    items-center relative`}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      
                      {header.column.getIsSorted() && (
                        <span className="absolute right-[10px] text-primary-dark">
                          {header.column.getIsSorted() === 'desc' ? (
                            <FaSortAlphaDown />
                          ) : (
                            <FaSortAlphaUp />
                          )}
                        </span>
                      )}
                      {!fixWidth && 
                        <div
                          onMouseDown={(e) => {
                            const startX = e.clientX;
                            const startWidth = header.getSize();
                            const onMouseMove = (e: MouseEvent) => {
                              const newWidth = startWidth + e.clientX - startX;
                              setColumnSizing((prev: any) => ({
                                ...prev,
                                [header.column.id]: Math.max(newWidth, 30),
                              }));
                            };

                            const onMouseUp = () => {
                              document.removeEventListener('mousemove', onMouseMove);
                              document.removeEventListener('mouseup', onMouseUp);
                            };

                            document.addEventListener('mousemove', onMouseMove);
                            document.addEventListener('mouseup', onMouseUp);
                          }}
                          className="resizer absolute right-[-1.2em] bg-primary-light opacity-0 group-hover:opacity-100"
                        >
                          <BsArrowsExpandVertical />
                        </div>
                      }
                    </div>
                  </th>
                )}
                )}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-green-100 border-b even:bg-slate-100 group">
                {row.getVisibleCells().map((cell, index) => {
                  const isPinned = pinnedColumns && pinnedColumns.includes(cell.column.id) || false;
                  return (
                  <td
                    key={cell.id}
                    className={`px-2 py-1 ${isPinned ? 'group-even:bg-slate-100 bg-white ' : ''}
                    group-hover:bg-green-100
                    ${cell.column.columnDef.meta?.noStyles ? 'bg-white border-none' : ''}
                     ${
                      cell.column.columnDef.meta?.style?.tFontSize || 'text-xs '
                    } ${
                      cell.column.columnDef.meta?.style?.tColor || 'text-slate-500'
                    } `}
                    style={{
                      textAlign:
                        cell.column.columnDef.meta?.style?.textAlign || 'left',
                      color: cell.column.columnDef.meta?.style?.color || '',
                      fontSize: cell.column.columnDef.meta?.style?.fontSize || '',
                      width: cell.column.getSize() ? cell.column.getSize() : cell.column.columnDef.meta?.style?.width || 'auto',
                      ...getStickyStyle(index, isPinned),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )}
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
