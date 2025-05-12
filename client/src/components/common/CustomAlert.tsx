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
      <div className={`relative bg-white p-6 rounded shadow-lg min-w-md max-w-${type === 'form' ? 'xl' : 'sm'} `} ref={popupRef}>
        <div className=" flex justify-between items-center mb-2">
          <h2 className={`font-semibold ${typeClasses[type]}`}>
            {title ? title : type === 'error' ? 'Error' : type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : 'Info'}
            </h2>
          <div className={`cursor-pointer absolute top-1 right-1 aspect-squre rounded-full p-1  text-xl text-gray-500 hover:bg-red-100 hover:text-red-700`}  onClick={onClose}>
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
