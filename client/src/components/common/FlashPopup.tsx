import React, { useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { FlashPopupType } from '@/interfaces';


const FlashPopup: React.FC<FlashPopupType> = ({
  isOpen,
  message,
  duration = 3000,
  onClose,
  position = 'top-right',
  type='success',
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
       onClose &&  onClose();
      }, duration);

      return () => clearTimeout(timer); // Cleanup the timer on component unmount or when `isOpen` changes
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  // Define position classes
  const positionClasses = {
    'top-right': 'top-9 right-4',
    'bottom-right': 'bottom-9 right-4',
    'top-left': 'top-9 left-4',
    'bottom-left': 'bottom-9 left-4',
  };

  const typeClasses = {
    'success': 'text-green-500',
    'fail': 'text-red-500',
    'warning': 'text-yellow-500',
    'error': 'text-red-500',
    'info': 'text-slate-500',
  }

  return (
    <div className={`fixed ${positionClasses[position]} bg-white bg-opacity-0 flex items-center justify-center z-50`}>
      <div className="bg-white p-5 rounded-lg card bg-white text-center max-w-sm mx-auto flex items-start gap-4">
        <p className={`${typeClasses[type]}  text-sm`}>{message}</p>
        <div className="bg-red-100 text-gray-600 hover:text-gray-800 focus:outline-none cursor-pointer text-red-500 rounded-full text-md p-0.5"  onClick={onClose}>
            <MdClose />
        </div>
      </div>
    </div>
  );
};

export default FlashPopup;
