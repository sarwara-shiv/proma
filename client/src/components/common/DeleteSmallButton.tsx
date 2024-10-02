import React from 'react'
import { IoRemove } from 'react-icons/io5'
interface ArgsType{
    btnType?: 'delete' | 'update' | 'view'; 
    onClick?:()=>void
    position?:string
}
const DeleteSmallButton:React.FC<ArgsType> = ({onClick, position='absolute'}) => {
  return (
    <div className={`
        cursor-pointer 
        ${position} 
        top-1/2 transform -translate-y-1/2  
        right-0 
        p-0.5 
        bg-red-100 
        rounded-full 
        text-red-500 
        text-xs`
    }
        onClick={onClick}
    >
            <IoRemove />
    </div>
  )
}

export default DeleteSmallButton
