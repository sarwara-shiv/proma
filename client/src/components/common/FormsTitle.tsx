import React from 'react'
interface ArgsType{
    text:string;
    color?:"primary" | "default";
    classes?:string;
}
const FormsTitle:React.FC<ArgsType> = ({text, color='default', classes = ''}) => {
  return (
    <>
      <h2 className={`${classes} text-${color === 'primary' ? 'primary' : 'slate-700 '} font-semibold text-md`}>{text}</h2>
    </>
  )
}

export default FormsTitle
