import React from 'react'
import { IoAdd, IoRemove } from 'react-icons/io5';
interface ArgsType{
    type: 'add' | 'delete' | 'remove';
    icon?:React.ReactNode;
    text?:string;
    size?:'sm' | 'md' | 'lg';
    color?:string;
    onClick:()=>void
}
const CustomSmallButton:React.FC<ArgsType> = ({type, icon, text,onClick, size='md', color}) => {
  const colorClass = color ? color : 
                      type === 'add' ? 'bg-green-100 text-green-600 border-green-100' :
                      type === 'delete' || type ==='remove' ? 'bg-red-100 text-red-600 border-red-600' : 'bg-primary-light text-primary border-primary';

  const sizeClass = size === 'sm' ? 'w-[30px] h-[30px]' :       
                    size === 'lg' ? 'w-[50px] h-[50px]' :    
                    'w-[40px] h-[40px]' ;            
  
  return (
    <div className={`
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
        type === 'delete' ? <IoRemove /> : ''
      }
      </span>
      {text && <span className='text'>{text}</span>}
    </div>
  )
}

export default CustomSmallButton
