// Popup.tsx
import { CustomPopupType } from '../../interfaces';
import React from 'react';
import { IoClose, IoCheckmarkSharp } from "react-icons/io5";

// interface PopupProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   content: React.ReactNode;
//   yesBtnText?:string;
//   noBtnText?:string;
//   data?:any;
//   type?: "form" | "text";
//   yesFunction:(data: any)=>void;
//   noFunction:(data:any)=>void;
// }

const ConfirmPopup: React.FC<CustomPopupType> = ({ isOpen, onClose, title, content, yesBtnText, noBtnText, yesFunction, noFunction, data, type='form'}) => {
  if (!isOpen) return null; // Render nothing if not open

  const onYesClick = (data:any)=>{
    yesFunction && yesFunction(data)
  }
  const onNoClick = (data:any)=>{
    noFunction && noFunction(data);
  }
  const onCloseClick = ()=>{
    onClose && onClose();
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[999999999]">
      <div className="bg-white p-2 rounded shadow-lg max-w-sm w-full">
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <h2 className="font-semibold text-md">{title}</h2>
          <button onClick={onCloseClick} className="text-gray-500 hover:text-gray-700"> 
            <IoClose />
          </button>
        </div>
        <div className='text-sm'>
          {content}
        </div>
        {(yesFunction || noFunction) && (
          <div className='flex mt-2 justify-end'> 
            {yesFunction && 
              <div className="px-3 py-1 bg-green-100/50 hover:bg-green-100 ml-2 rounded-sm cursor-pointer text-green-900" onClick={()=>onYesClick(data)}>{yesBtnText ? yesBtnText : <IoCheckmarkSharp />} </div>
            }
            {noFunction && 
              <div className="px-3 py-1 bg-red-100/50 hover:bg-red-100 ml-2 rounded-sm cursor-pointer text-red-900" onClick={()=>onNoClick(data)}>{noBtnText ? noBtnText : <IoClose />}</div>    
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmPopup;
