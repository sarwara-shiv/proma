import React from 'react'
interface ArgsType{
    text:string;
    size?:'base' | 'sm'| 'md'| 'lg'| 'xl';
    type?: 'section'| "default" ;
    classes?:string
}
const Headings: React.FC<ArgsType> = ({ text,size="base", classes="", type='default' }) => {
  return (
    <h2 className={`text-${size} ${type === 'section' ? 'text-lg font-bold text-slate-700 ': 'text-slate-300 ' }${classes}`}>
      {text}
    </h2>
  )
}

export default Headings 
