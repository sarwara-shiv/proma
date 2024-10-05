import React from 'react'
import { FaPencilAlt } from 'react-icons/fa';
import { IoAdd, IoPencil, IoRemove } from 'react-icons/io5';
interface ArgsType{
    type: 'add' | 'delete' | 'remove' | 'update';
    icon?:React.ReactNode;
    text?:string;
    size?:'sm' | 'md' | 'lg';
    position?:'absolute' | 'default';
    right?:number;
    color?:string;
    onClick:()=>void
}
const CustomSmallButton:React.FC<ArgsType> = ({type, icon, text,onClick, size='md', color, position='default', right=0}) => {
  const colorClass = color ? color : 
                      type === 'add' ? 'bg-green-100 text-green-600 border-green-600' :
                      type === 'delete' || type ==='remove' ? 'bg-red-100 text-red-600 border-red-600' : 'bg-primary-light text-primary border-primary';

  let sizeClass = size === 'sm' ? 'w-[20px] h-[20px]' :       
                    size === 'lg' ? 'w-[40px] h-[40px]' :    
                    'w-[30px] h-[30px]' ; 
  if(text){
    sizeClass = 'w-auto h-auto px-3 py-2';
  }           
  
  return (
    <>
    {position === 'default' && 
      <div className={`
        rounded-md
        cursor-pointer
        opacity-80
        hover:opacity-100
        flex 
        border
        items-center
        align-center
        justify-center
        font-${size} 
        ${sizeClass}
        ${colorClass}
      `} onClick={onClick}>
        <span className='icon'>
          {type === 'add' ? <IoAdd /> :
          type === 'delete' ? <IoRemove /> : 
          type === 'update' ? <FaPencilAlt /> : ''
        }
        </span>
        {text && <span className='text ml-2'>{text}</span>}
      </div>
    }

    {position === 'absolute' && 
      <div className={`
          cursor-pointer 
          ${position} 
          top-1/2 transform -translate-y-1/2  
          right-${right} 
          p-0.5 
          ${colorClass}
          rounded-full 
          text-xs`
      }
          onClick={onClick}
      >
              {type === 'add' ? <IoAdd /> :
          type === 'delete' ? <IoRemove /> : 
          type === 'update' ? <FaPencilAlt /> : ''
        }
      </div>
    }

    </>
  )
}

export default CustomSmallButton
