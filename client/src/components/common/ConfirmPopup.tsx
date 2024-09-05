// Popup.tsx
import React from 'react';
import { IoClose, IoCheckmarkSharp } from "react-icons/io5";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  yesBtnText?:string;
  noBtnText?:string;
  data?:any;
  yesFunction:(data: any)=>void;
  noFunction:(data:any)=>void;
}

const ConfirmPopup: React.FC<PopupProps> = ({ isOpen, onClose, title, content, yesBtnText, noBtnText, yesFunction, noFunction, data}) => {
  if (!isOpen) return null; // Render nothing if not open

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-2 rounded shadow-lg max-w-sm w-full">
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <h2 className="font-semibold text-md">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className='text-sm'>
          {content}
        </div>
        <div className='flex mt-2 justify-end'> 
            <div className="px-3 py-1 bg-green-100/50 hover:bg-green-100 ml-2 rounded-sm cursor-pointer text-green-900" onClick={()=>yesFunction(data)}>{yesBtnText ? yesBtnText : <IoCheckmarkSharp />} </div>
            <div className="px-3 py-1 bg-red-100/50 hover:bg-red-100 ml-2 rounded-sm cursor-pointer text-red-900" onClick={()=>noFunction(data)}>{noBtnText ? noBtnText : <IoClose />}</div>    
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
