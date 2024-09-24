import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface DataType {
  _id: string;
  name: string;
  [key: string]: string;
}

interface ColorData{
    value:string;
    color:string;
}

interface ArgsType {
  data: DataType[];
  onChange: (name: string, value: string, data: DataType) => void;
  label?: string;
  name?: string;
  selectedValue?: string;
  colorClasses?:ColorData[]

}

const CustomDropdown: React.FC<ArgsType> = ({
  label = '',
  name = '',
  data,
  onChange,
  selectedValue = '',
  colorClasses=[]
}) => {
  const [value, setValue] = useState<string>(selectedValue);
  const [isOpen, setIsOpen] = useState(false);
  const {t} = useTranslation();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false); // Close the dropdown if click outside
        }
      };
      document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef])

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev); // Toggle dropdown visibility
  };

  const handleItemClick = (_id: string, selectedData: DataType) => {
    setValue(_id);
    setIsOpen(false); // Close dropdown after selection
    onChange(name, _id, selectedData); // Trigger the parent's onChange
  };

  const getColorClasses = (value:string)=>{
    
    if(colorClasses && colorClasses.length > 0){
        const cls = colorClasses
        .filter(d => d.value === value) 
        .map(d => d.color)             
        .join(' ');
        return cls;  
    }else{
        return '';
    }   
  }

  return (
    <div className="relative flex flex-col" ref={dropdownRef}>
      {label && <label htmlFor={name} 
      className='text-gray-400'
      >{label}</label>}

      {/* Custom dropdown trigger */}
      <div
        className={`cursor-pointer flex justify-between items-center 
        w-fullbg-gray-50 border  text-gray-900 text-sm rounded-sm focus:outline-none block w-full p-2.5 dark:bg-gray-700
        ${getColorClasses(value) ?  getColorClasses(value) : 'text-gray-900'}
        `}
        onClick={toggleDropdown}
      >
        <span 
            className={`${getColorClasses(value) &&  getColorClasses(value)} `}
        >{value ? data.find((item) => item._id === value)?.name : `${t('selectOption')}`}</span>
        <span>
            <svg
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            </span> 
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full max-h-[200px] mt-2 bg-white border rounded-md shadow-lg overflow-y-auto z-10">
          {data.map((item) => (
            <div
              key={item._id}
              onClick={() => handleItemClick(item._id, item)}
              className={`px-2 py-1 text-sm text-slate-400 border-b border-slate-200 
              hover:bg-primary-light 
              hover:text-slate-800 
              cursor-pointer
              ${item._id === value && 'bg-green-100'}
              `}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
