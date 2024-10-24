import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';

interface CustomContextMenuProps {
  children: React.ReactNode;
  iconSize?:'xs' | 'sm' | 'md';
  text?:React.ReactNode | null
}

const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ children, iconSize='sm', text=null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, maxHeight: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false); // Close the menu when clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && menuRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const menuHeight = menuRef.current.scrollHeight || 0; // Safely handle undefined scrollHeight
      let availableHeightBelow = viewportHeight - buttonRect.bottom;
      let availableHeightAbove = buttonRect.top;

      let top = buttonRect.bottom; // Default position: below the button
      let left = buttonRect.left;  // Default left aligned with the button
      let maxHeight = menuHeight;

      // Adjust if the menu overflows the viewport on the right
      if (left + menuRef.current.offsetWidth > viewportWidth) {
        left = viewportWidth - menuRef.current.offsetWidth - 10; // Adjust left if overflowing right
      }

      // Determine whether to open the menu below or above the button
      if (availableHeightBelow >= menuHeight) {
        top = buttonRect.bottom; // Open below
        maxHeight = availableHeightBelow;
      } else if (availableHeightAbove >= menuHeight) {
        top = buttonRect.top - menuHeight; // Open above
        maxHeight = availableHeightAbove;
      } else {
        // If neither space fits, set maxHeight to available space
        if (availableHeightBelow >= availableHeightAbove) {
          top = buttonRect.bottom; // Open below with limited height
          maxHeight = availableHeightBelow;
        } else {
          top = buttonRect.top - availableHeightAbove; // Open above with limited height
          maxHeight = availableHeightAbove;
        }
      }

      setPosition({ top, left, maxHeight });
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Trigger Button */}
        <button ref={buttonRef} className={`p-1 rounded text-${iconSize} `} onClick={toggleMenu}>
          {text ? <p className='flex justify-start items-center'><IoEllipsisVerticalSharp /> {text}</p> : <IoEllipsisVerticalSharp />}
        </button>

      {/* Custom Context Menu */}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className="fixed bg-white border shadow-lg rounded-md z-50"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: '150px', // Adjust the width as needed
              maxHeight: `${position.maxHeight}px`, // Set dynamic max height
              overflowY:
                menuRef.current && position.maxHeight < (menuRef.current.scrollHeight || 0)
                  ? 'auto'
                  : 'visible', // Safely handle scroll
            }}
          >
            {children}
          </div>,
          document.body // Render into the body using a portal
        )}
    </div>
  );
};

export default CustomContextMenu;
