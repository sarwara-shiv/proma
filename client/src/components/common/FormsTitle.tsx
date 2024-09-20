import React from 'react'
interface ArgsType{
    text:string;
    color?:"primary" | "default";
}
const FormsTitle:React.FC<ArgsType> = ({text, color='default'}) => {
  return (
    <>
      <h2 className={`text-${color === 'primary' ? 'primary' : 'slate-800 '} font-semibold text-md`}>{text}</h2>
    </>
  )
}

export default FormsTitle
