import React from 'react'
interface ArgsType{
    text:string;
    value?:string;
    size?:'xs' | 'sm'  | 'md';
    color?:'primary' | 'default'  | 'secondary';
    onClick:(value:string)=>void
}
const LinkButton:React.FC<ArgsType> = ({size="xs", color="primary", value="link", text, onClick}) => {
    const sizeClasses = {
        'xs': 'text-xs',
        'sm': 'text-sm',
        'md': 'text-md',
      }
    const colorClasses = {
        'default': 'text-default',
        'primary': 'text-primary',
        'secondary': 'text-secondary',
      }
  return (
    <div onClick={()=>onClick(value)}
    className={`italic underline cursor-pointer hover:no-underline ${sizeClasses[size]} ${colorClasses[color]}`}
    >
      {text}
    </div>
  )
}

export default LinkButton
