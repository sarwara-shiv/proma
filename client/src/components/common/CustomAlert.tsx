// Popup.tsx
import React, { useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { AlertPopupType } from '@/interfaces';


const CustomAlert: React.FC<AlertPopupType> = ({ isOpen, onClose, title, content, type ="info", display}) => {
  if (!isOpen) return null; 
  const typeClasses = {
    'success': 'text-green-500',
    'fail': 'text-red-500',
    'warning': 'text-yellow-500',
    'error': 'text-red-500',
    'info': 'text-slate-500',
  }

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`bg-white p-2 rounded shadow-lg max-w-sm w-full`}>
        <div className="relative flex justify-between items-center border-b mb-2">
          <h2 className={`font-semibold text-sm ${typeClasses[type]}`}>
            {title ? title : type === 'error' ? 'Error' : type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : 'Info'}
            </h2>
          <div className="absolute top-[-0.75rem] right-[-0.45rem] text-gray-600 hover:text-gray-800 focus:outline-none cursor-pointer bg-white text-red-500 rounded-full text-md"  onClick={onClose}>
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
