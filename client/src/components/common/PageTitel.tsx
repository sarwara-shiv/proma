import React from 'react'
interface ArgsType{
    text:string;
    action?:string;
}
const PageTitel: React.FC<ArgsType> = ({ text, action }) => {
  return (
    <h1 className='text-2xl text-slate-300 font-semibold mb-2'>
      {text} {action && <span className='text-primary font-semibold'> : {action}</span>}
    </h1>
  )
}

export default PageTitel 
