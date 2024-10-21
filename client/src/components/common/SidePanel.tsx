import { SidePanelProps } from '@/interfaces';
import React from 'react';
import { MdClose } from 'react-icons/md';

// interface SidePanelProps {
//   isOpen: boolean;
//   onClose?: () => void;
//   children: React.ReactNode;
// }

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, children, title, subtitle }) => {
  return (
    <div
      className={`
        fixed top-0 right-0 h-full max-w-full w-[600px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className='relative pr-[50px] mb-6 flex justify-between items-center'>
            <div className='px-4 py-2'>
                {title && 
                    <div className='text-xl font-bold text-primary'>
                        {title}
                    </div>
                }
                {subtitle && 
                    <div className='text-sm text-slate-400'>
                        {subtitle}
                    </div>
                }
            </div>
        
            <button
                onClick={onClose}
                className="absolute top-2 right-2 flex justify-center items-center
                w-[30px] h-[30px]
                rounded-full hover:bg-red-100 transition
                bg-slate-100 text-red-500   
                "
            >
                <MdClose />
            </button>
        </div>  

      {/* Content */}
      <div className="p-6 overflow-y-auto h-full">{children}</div>
    </div>
  );
};

export default SidePanel;
