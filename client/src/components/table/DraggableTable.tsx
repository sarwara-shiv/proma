import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Sample data
const ddata = [
  { id: 1, name: 'John Doe', age: 28, country: 'USA' },
  { id: 2, name: 'Jane Doe', age: 32, country: 'Canada' },
  { id: 3, name: 'Alice Smith', age: 24, country: 'UK' },
  { id: 4, name: 'Bob Johnson', age: 45, country: 'Australia' },
];

const DraggableTable: React.FC = () => {
  const [items, setItems] = useState(ddata);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(items);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    setItems(reorderedItems); // Update state with the new order
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <table
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="min-w-full border-collapse border border-gray-300"
          >
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 border border-gray-300">Drag</th>
                <th className="p-4 border border-gray-300">Name</th>
                <th className="p-4 border border-gray-300">Age</th>
                <th className="p-4 border border-gray-300">Country</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                  {(provided, snapshot) => (
                    <tr
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`hover:bg-gray-100 ${snapshot.isDragging ? "bg-blue-100" : ""}`}
                    >
                      <td className="p-4 border border-gray-300 w-[30px]">
                        <span
                          {...provided.dragHandleProps} // Apply drag handle props here
                          className="cursor-pointer text-gray-600"
                        >
                          &#x21D5; {/* Drag handle icon (up and down arrow) */}
                        </span>
                      </td>
                      <td className="p-4 border border-gray-300">{item.name}</td>
                      <td className="p-4 border border-gray-300">{item.age}</td>
                      <td className="p-4 border border-gray-300">{item.country}</td>
                    </tr>
                  )}
                </Draggable>
              ))}
              {provided.placeholder} {/* Placeholder for spacing */}
            </tbody>
          </table>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableTable;
