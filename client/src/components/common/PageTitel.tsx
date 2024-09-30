import React from 'react'
interface ArgsType{
    text:string;
    action?:string;
    color?:string;
    size?: 'md' | 'lg' | 'xl' | '2xl';
}
const PageTitel: React.FC<ArgsType> = ({ text, action, color='slate-300', size='xl' }) => {
  return (
    <h1 className={`text-${size} text-${color} font-semibold`}>
      {text} {action && <span className='text-primary font-semibold'> : {action}</span>}
    </h1>
  )
}

export default PageTitel 
