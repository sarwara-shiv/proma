import React, { useEffect, useState } from 'react';
import { IoRemove } from 'react-icons/io5';
import { FaGripLines } from 'react-icons/fa'; // Import an icon for the drag handle
import { MdDragIndicator } from 'react-icons/md';
import DeleteSmallButton from '../common/DeleteSmallButton';

interface DragAndDropListProps {
  items: string[]; // The list of items (goals)
  name:string;
  onFinalUpdate: (name:string, updatedItems: string[]) => void; // Callback function to return final data
}

const DragAndDropList: React.FC<DragAndDropListProps> = ({ items, onFinalUpdate, name }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localItems, setLocalItems] = useState<string[]>(items); // Local state to manage items within the component

useEffect(()=>{
    setLocalItems(items);
},[items])


  // Handle the start of dragging
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Allow the dragged item to be dropped
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  // Handle dropping the item into a new position
  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const newItems = [...localItems];

    // Reorder the array
    const draggedItem = newItems.splice(draggedIndex, 1)[0];
    newItems.splice(index, 0, draggedItem);

    // Update the local state and return the final updated data
    setLocalItems(newItems);
    onFinalUpdate(name, newItems); // Return the final updated data to the parent

    setDraggedIndex(null); // Reset draggedIndex after the drop
  };

  // Remove an item and update the parent with the final data
  const handleRemove = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    onFinalUpdate(name, newItems); // Return the final updated data to the parent
  };

  return (
    <ul>
      {localItems.map((item, index) => (
        <li
          key={index}
          className='relative pb-1 border-b border-gray-100 pr-5 flex items-top' // Added flex for layout control
          draggable={true}
          onDragStart={() => handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
        >
          {/* Drag handle on the left */}
          <span
            className='cursor-move mr-4 text-gray-500' // Adjusted for styling
            style={{ display: 'inline-flex', alignItems: 'top' }} // Flexbox for vertical centering
          >
            <MdDragIndicator size={16} className='text-slate-300'/>
          </span>

          {/* Item content */}
          <span className='pr-2'><b>{index+1}. </b></span>
          <span className='flex-1'>{item}</span>

          {/* Remove button on the right */}
          <DeleteSmallButton onClick={()=>handleRemove(index)} />          
          {/* <span
            className='cursor-pointer absolute top-1/2 transform -translate-y-1/2  right-0 p-0.5 bg-red-100 rounded-full text-red-500 text-xs'
            onClick={() => handleRemove(index)}
          >
            <IoRemove />
          </span> */}
        </li>
      ))}
    </ul>
  );
};

export default DragAndDropList;
