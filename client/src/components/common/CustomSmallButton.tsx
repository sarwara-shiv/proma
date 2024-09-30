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
const CustomSmallButton:React.FC<ArgsType> = ({type, icon, text,onClick, size='md', color='slate-300'}) => {
  return (
    <div className={`font-${size} font-${color}`} onClick={onClick}>
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
