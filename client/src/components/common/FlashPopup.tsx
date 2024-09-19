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
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const typeClasses = {
    'success': 'text-green-500',
    'fail': 'text-red-500',
    'warning': 'text-yellow-500',
    'error': 'text-red-500',
    'info': 'text-slate-500',
  }

  return (
    <div className={`fixed ${positionClasses[position]} bg-gray-900 bg-opacity-0 flex items-center justify-center z-50`}>
      <div className="bg-white p-2 rounded-lg shadow-lg text-center max-w-sm mx-auto">
        <div className="absolute top-[-0.45rem] right-[0rem] text-gray-600 hover:text-gray-800 focus:outline-none cursor-pointer bg-white text-red-500 rounded-full text-sm"  onClick={onClose}>
            <MdClose />
        </div>
        <p className={`${typeClasses[type]}  text-sm`}>{message}</p>
      </div>
    </div>
  );
};

export default FlashPopup;
