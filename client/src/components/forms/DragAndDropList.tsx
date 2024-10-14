import React, { useEffect, useState } from 'react';
import { MdDragIndicator } from 'react-icons/md';
import DeleteSmallButton from '../common/DeleteSmallButton';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface DragAndDropListProps {
  items: string[]; // The list of items (goals)
  name: string;
  onFinalUpdate: (name: string, updatedItems: string[]) => void; // Callback function to return final data
}

const DragAndDropList: React.FC<DragAndDropListProps> = ({ items, onFinalUpdate, name }) => {
  const [localItems, setLocalItems] = useState<string[]>(items); // Local state to manage items within the component

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Handle the drag end event
  const handleDragEnd = (result: any) => {
    if (!result.destination) return; // If there's no destination, do nothing

    const newItems = Array.from(localItems);
    const [movedItem] = newItems.splice(result.source.index, 1); // Remove the dragged item
    newItems.splice(result.destination.index, 0, movedItem); // Add it to the new position

    setLocalItems(newItems); // Update local state
    onFinalUpdate(name, newItems); // Return the final updated data to the parent
  };

  // Remove an item and update the parent with the final data
  const handleRemove = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    onFinalUpdate(name, newItems); // Return the final updated data to the parent
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef} // Reference to provide the droppable context
          >
            {localItems.map((item, index) => (
              <Draggable key={index} draggableId={String(index)} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef} // Reference for draggable context
                    {...provided.draggableProps} // Props for draggable
                    {...provided.dragHandleProps} // Props for drag handle
                    className='relative pb-1 border-b text-sm border-gray-100 pr-5 flex items-center' // Added flex for layout control
                  >
                    {/* Drag handle on the left */}
                    <span
                      className='cursor-move mr-2 text-gray-500' // Adjusted for styling
                      style={{ display: 'inline-flex', alignItems: 'top' }} // Flexbox for vertical centering
                    >
                      <MdDragIndicator size={16} className='text-slate-300' />
                    </span>

                    {/* Item content */}
                    <span className='pr-2'><b>{index + 1}. </b></span>
                    <span className='flex-1'>{item}</span>

                    {/* Remove button on the right */}
                    <DeleteSmallButton onClick={() => handleRemove(index)} />
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder} {/* Placeholder for spacing */}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragAndDropList;
