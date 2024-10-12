import React, { useState } from 'react';
import {
  useReactTable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
} from '@tanstack/react-table';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface TableProps {
  data: any[];
  columns: ColumnDef<any>[];
}

const DraggableTable: React.FC<TableProps> = ({ data, columns }) => {
  const [tableData, setTableData] = useState(data);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const updatedData = Array.from(tableData);
    const [movedRow] = updatedData.splice(result.source.index, 1);
    updatedData.splice(result.destination.index, 0, movedRow);

    setTableData(updatedData);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable" type="ROW">
        {(provided) => (
          <table
            className="table-auto border-collapse w-full"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-gray-200">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-2 border-r text-left">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <Draggable key={row.id} draggableId={row.id} index={index}>
                  {(provided) => (
                    <tr
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="hover:bg-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-2 border-b">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )}
                </Draggable>
              ))}
            </tbody>
          </table>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableTable;
