import React from 'react'
interface ArgsType{
    text:string;
    size?:'base' | 'sm'| 'md'| 'lg'| 'xl';
}
const Headings: React.FC<ArgsType> = ({ text,size="base" }) => {
  return (
    <h2 className={`text-${size} text-slate-300`}>
      {text}
    </h2>
  )
}

export default Headings 