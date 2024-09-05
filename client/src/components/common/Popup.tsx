// Popup.tsx
import React from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null; // Render nothing if not open

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-sm w-full">
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div>
          {content}
        </div>
      </div>
    </div>
  );
};

export default Popup;
