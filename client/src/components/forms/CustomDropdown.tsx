import { ObjectId } from 'mongodb';
import React, { useEffect, useState, useRef } from 'react';
import { IoChevronDownSharp } from 'react-icons/io5';

interface DataType {
  _id: string;
  name: string;
  [key: string]: string;
}

interface ColorData {
  value: string;
  color: string;
}

interface ArgsType {
  data: DataType[] | any[];
  onChange: (recordId: string, name: string, value: string, data: DataType) => void;
  label?: string;
  emptyLabel?: React.ReactNode;
  name?: string;
  selectedValue?: string;
  recordId?: string | ObjectId;
  colorClasses?: ColorData[];
  style?: 'table' | 'default';
}

const CustomDropdown: React.FC<ArgsType> = ({
  label = '',
  name = '',
  data,
  onChange,
  selectedValue = '',
  colorClasses = [],
  recordId = '',
  emptyLabel = '',
  style = 'default',
}) => {
  const [value, setValue] = useState<string>(selectedValue);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  }>({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (selectedValue) {
      const selectedItem = data.find(
        (d) => d._id === selectedValue || d.name === selectedValue
      );
      if (selectedItem) {
        setValue(selectedItem._id);
      }
    }
  }, [selectedValue, data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownListRef.current &&
        !dropdownListRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

    
  }, []);

  const toggleDropdown = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (_id: string, selectedData: DataType) => {
    setValue(_id);
    setIsOpen(false);
    onChange(recordId as unknown as string, name, _id, selectedData);
  };

  const getColorClasses = (value: string) => {
    if (colorClasses && colorClasses.length > 0) {
      const cls = colorClasses
        .filter((d) => d.value === value)
        .map((d) => d.color)
        .join(' ');
      return cls;
    } else {
      return '';
    }
  };

  return (
    <div className="relative flex flex-col" ref={dropdownRef}>
      {label && (
        <label htmlFor={name} className="text-gray-400 text-sm">
          {label}
        </label>
      )}

      {/* Custom dropdown trigger */}
      <div
        className={`cursor-pointer flex justify-between items-center 
        w-full   
         rounded-sm 
        focus:outline-none block w-full 
        ${style === 'table' ? 'p-0.5 bg-transparent text-xs' : 'p-2.5 bg-gray-50 border text-sm text-gray-900'}
        dark:bg-gray-700
        ${getColorClasses(value) ? getColorClasses(value) : ''}
        `}
        onClick={toggleDropdown}
      >
        <span className={`${getColorClasses(value) && getColorClasses(value)}`}>
          {value
            ? data.find((item) => item._id === value)?.displayName ||
              data.find((item) => item._id === value)?.name
            : emptyLabel
            ? emptyLabel
            : `${'Select Option'}`}
        </span>
        <span>
          <IoChevronDownSharp
            className={`${
              style === 'table' ? 'w-3 h-3 ' : 'w-4 h-4'
            } transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </span>
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div
          ref={dropdownListRef}
          className={`${style === 'default' ? 'absolute' : 'fixed'} bg-white border-2 border-white border rounded-md shadow-lg overflow-y-auto z-50`}
          style={
            style === 'table' ?
            {
            
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: '200px',
          }:
          {
            top: '100%',
            width: '100%',
            maxWidth:'250px',
            maxHeight: '200px',
          }
        }
        >
          
          {data.map((item) => (
            <div
              key={item._id}
              onClick={() => handleItemClick(item._id, item)}
              className={`px-2 py-1 
                ${style ==='table' ? 'text-xs':'text-sm' }
                ${item.color ? `bg-${item.color} text-${item.color}-dark` : 'text-slate-400 '}
                border-b border-slate-200 
                hover:bg-primary-light 
                hover:text-slate-800 
                cursor-pointer
              ${item._id === value || (item.name === value && 'bg-green-100')}
              `}
            >
              {item.displayName || item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
