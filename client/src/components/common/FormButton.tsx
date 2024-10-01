import React from 'react'
interface argsType {
    btnText?: string;
    disable?:boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const FormButton: React.FC<argsType> = (args) => {
    const {onClick, btnText, disable=false } = args;
  return (
    <div className='form_btn w-full'>
      <button 
      className={`btn btn-solid ${disable ? 'pointer-events-none opacity-50' : ''}`}
      type='submit' onClick={onClick}>{btnText}</button>
    </div>
  )
}

export default FormButton