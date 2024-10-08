import { format, parse } from 'date-fns';
import { ObjectId } from 'mongodb';
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import ReactDOM from 'react-dom';
import { FaCalendarAlt } from 'react-icons/fa';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';

interface ArgsType {
  selectedDate: Date | null;
  onDateChange?: (recordId: string | ObjectId, date: Date | null, name: string) => void;
  onChange?: (recordId: string | ObjectId, value: Date | null, name: string) => void;
  showTimeSelect?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  recordId?: string | ObjectId;
  name?: string;
  disable?: boolean;
  style?: 'table' | 'default';
}

const CustomDateTimePicker2: React.FC<ArgsType> = ({ 
  selectedDate,
  onDateChange,
  onChange,
  showTimeSelect = false,
  name = "",
  placeholder = '__.__.____', // Default placeholder showing the format
  required = false,
  recordId = '',
  label,
  disable = false,
  style = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(true); // Open by default
  const [position, setPosition] = useState({ top: 0, left: 0, maxHeight: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dateValue, setDateValue] = useState<Date | null>(selectedDate ? selectedDate : null);
  const [manualInput, setManualInput] = useState<string>(selectedDate ? format(selectedDate, 'dd.MM.yyyy') : '');
  const datePickerRef = useRef<any>(null);

  const toggleMenu = () => {
    if (datePickerRef.current) {
      datePickerRef.current.setOpen(true); // Open the date picker programmatically
    }
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
    console.log(dateValue);
    if (selectedDate) {
      setDateValue(selectedDate);
      setManualInput(format(selectedDate, 'dd.MM.yyyy'));
    }
  }, [selectedDate]);

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

  // Function to handle the manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Automatically add dots to the date (dd.MM.yyyy)
    if (input.length === 2 || input.length === 5) {
      input += '.';
    }

    setManualInput(input);

    // Validate and update the date if it's in the correct format
    if (input.length === 10) {
      const parsedDate = parse(input, 'dd.MM.yyyy', new Date());

      if (!isNaN(parsedDate.getTime())) {
        setDateValue(parsedDate);
        // if (onDateChange) onDateChange(recordId, parsedDate, name);
        // if (onChange) onChange(recordId, parsedDate, name);
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    setDateValue(date);
    setManualInput(date ? format(date, 'dd.MM.yyyy') : ''); // Update the manual input field
    if (onDateChange) onDateChange(recordId, date, name);
    if (onChange) onChange(recordId, date, name);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      {label && (
        <div className="flex items-center mb-0">
          <label className="text-gray-400 flex items-center text-sm">{label}</label>
        </div>
      )}

      <div className={`
          ${style === 'table' ? 'relative' : 'relative'} flex items-center w-full
          ${disable ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          type="text"
          value={manualInput}
          onChange={handleInputChange} // Handle manual input
          placeholder={placeholder} // Show "__.__.____" format as placeholder
          className={`w-full 
              ${style === 'table' ? 
              'bg-gray-50 border-none text-gray-900 text-xs p-0.5 pr-8 dark:bg-gray-700' 
              :
              'bg-gray-50 border text-gray-900 text-sm p-2.5 pr-10 dark:bg-gray-700'
              }
            rounded-sm focus:outline-none block`}
        />

        <button ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400`}
        >
          <FaCalendarAlt size={style === 'table' ? 15 : 18} />
        </button>
      </div>

      {/* Custom Context Menu */}
      {ReactDOM.createPortal(
        <div
          ref={menuRef}
          className={`fixed ${isOpen ? 'display-block z-50' : 'display-none'} `}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: '200px', // Adjust the width as needed
            maxHeight: `${position.maxHeight}px`, // Set dynamic max height
            overflowY: menuRef.current && position.maxHeight < (menuRef.current.scrollHeight || 0) ? 'auto' : 'visible', // Safely handle scroll
          }}
        >
          <DatePicker
            selected={dateValue}
            onChange={handleDateChange}
            dateFormat="dd.MM.yyyy"
            timeFormat={showTimeSelect ? 'HH:mm' : undefined}
            showTimeSelect={showTimeSelect}
            timeIntervals={15}
            ref={datePickerRef} // Ref to control the DatePicker
            className=" hidden absolute z-50 top-[-20px]" 
          />
        </div>,
        document.body // Render into the body using a portal
      )}
    
    </div>
  );
};

export default CustomDateTimePicker2;
