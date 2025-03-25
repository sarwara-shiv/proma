// Popup.tsx
import React, { useEffect, useRef } from 'react';
import { IoClose } from "react-icons/io5";
import { AlertPopupType } from '../../interfaces';


const CustomAlert: React.FC<AlertPopupType> = ({ isOpen, onClose, title, content, type ="info", display}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose && onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null; 
  const typeClasses = {
    'success': 'text-green-500 text-sm',
    'fail': 'text-red-500 text-sm',
    'warning': 'text-yellow-500 text-sm',
    'error': 'text-red-500 text-sm',
    'info': 'text-slate-500 text-sm',
    'form': 'text-slate-500 text-lg',
  }


  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4`}>
      <div className={`bg-white p-2 rounded shadow-lg min-w-[300px] max-w-${type === 'form' ? '[700px]' : 'sm'} `} ref={popupRef}>
        <div className="relative flex justify-between items-center border-b mb-2">
          <h2 className={`font-semibold ${typeClasses[type]}`}>
            {title ? title : type === 'error' ? 'Error' : type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : 'Info'}
            </h2>
          <div className={`absolute top-[-0.75rem] right-[-0.45rem] text-gray-600 hover:text-gray-800 focus:outline-none cursor-pointer bg-white text-red-500 rounded-full text-${type === 'form' ? 'lg' : 'md'}`}  onClick={onClose}>
            <IoClose />
        </div>
        </div>
        <div className='text-xs text-slate-500'>
          {content}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
