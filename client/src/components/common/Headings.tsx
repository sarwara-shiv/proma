import React from 'react'
interface ArgsType{
    text:string;
    size?:'base' | 'sm'| 'md'| 'lg'| 'xl';
    classes?:string
}
const Headings: React.FC<ArgsType> = ({ text,size="base", classes="" }) => {
  return (
    <h2 className={`text-${size} text-slate-300 ${classes}`}>
      {text}
    </h2>
  )
}

export default Headings 
