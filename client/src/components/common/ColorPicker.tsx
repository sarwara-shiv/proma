import React, { useState, useEffect, useRef } from 'react';
import { colorClasses } from '../../mapping/ColorClasses';

interface ArgsType {
  selectedColor?: string;
  onSelect: (color: string) => void;
}

interface COLORS {
  [key: string]: string;
}

const ColorPicker: React.FC<ArgsType> = ({ selectedColor = '', onSelect }) => {
  const [colors] = useState<COLORS>(colorClasses);
  const [cColor, setCColor] = useState<string>(selectedColor);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = (value: string) => {
    setCColor(value);
    onSelect(value);  // Notify the parent about the selected color
    setIsOpen(false); // Close the dropdown after selection
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen); // Toggle the dropdown visibility
  };

  const handleClickOutside = (event: MouseEvent) => {
    // Close dropdown if clicked outside
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // Add event listener for detecting clicks outside of the dropdown
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up the event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Color circle (ccolor) */}
      <div
        className={`ccolor flex justify-center items-center 
        w-6 h-6 rounded-full border-2  border-white text-xs bg-${cColor || 'default'} text-${cColor || 'default'}-dark cursor-pointer`}
        onClick={toggleDropdown}
      >
        A
      </div>

      {/* Color dropdown */}
      {isOpen && (
        <div
          className="absolute mt-2 p-2 bg-white border border-gray-300 rounded shadow-lg z-50 flex flex-wrap w-48"
        >
          {Object.keys(colors).map((color) => {
            const cssClass = colors[color];
            return (
              <div
                key={color}
                className={`w-6 h-6 m-1 cursor-pointer flex justify-center items-center border rounded-full border-2 text-xs font-bold ${cssClass} ${
                  cColor === color ? 'border-white shadow-lg' : 'border-transparent'
                }`}
                onClick={() => handleClick(color)}
                title={color}
              >A</div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
