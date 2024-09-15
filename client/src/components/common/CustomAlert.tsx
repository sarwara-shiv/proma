// Popup.tsx
import React, { useEffect } from 'react';
import { IoClose } from "react-icons/io5";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | null;
  content: React.ReactNode | string;
  data?:any;
  display?:'timer' | null;
  type?:"info" | "error" | "warning" | "success" | string;
}

const CustomAlert: React.FC<PopupProps> = ({ isOpen, onClose, title, content, type ="info", display}) => {
  if (!isOpen) return null; // Render nothing if not open

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`bg-white p-2 rounded shadow-lg max-w-sm w-full`}>
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <h2 className={`font-semibold text-md text-${type === 'error' ? 'red-500' : type === 'success' ? 'green-600' : type === 'warning' ? 'yellow-300' : 'stone-300'}`}>
            {title ? title : type === 'error' ? 'Error' : type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : 'Info'}
            </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose />
          </button>
        </div>
        <div className='text-sm'>
          {content}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
