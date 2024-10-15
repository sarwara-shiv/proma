import React, { useState, useRef, useEffect } from 'react';

const ResizableTableHeader = ({
  children,
  initialWidth,
  classes="",
  key=''
}: {
  children: React.ReactNode;
  initialWidth: number;
  classes?: string;
  key?:string
}) => {
  const [width, setWidth] = useState(initialWidth);
  const resizerRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(initialWidth);

  // Function to handle mouse down event for resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Function to handle mouse move event during resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current) return;

    // Calculate the new width
    const newWidth = startWidthRef.current + (e.clientX - startXRef.current);

    // Ensure the new width is not less than a minimum width
    if (newWidth > 50) {
      setWidth(newWidth); // Only update state when necessary
    }
  };

  // Function to handle mouse up event to stop resizing
  const handleMouseUp = () => {
    resizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Clean up event listeners on component unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <th
    key={key}
      style={{ width: `${width}px`, minWidth: '50px' }} // Set a minWidth directly
      className={` group ${classes}`}
    >
      <div className="flex items-center justify-between relative h-full">
        {children}
        <div
          className="w-2 h-full absolute right-[-5px] top-0 cursor-col-resize group-hover:bg-gray-300"
          ref={resizerRef}
          onMouseDown={handleMouseDown}
        />
      </div>
    </th>
  );
};

export default ResizableTableHeader;
