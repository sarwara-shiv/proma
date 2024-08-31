import React from 'react'
interface argsType {
    btnText?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const FormButton: React.FC<argsType> = (args) => {
    const {onClick, btnText } = args;
  return (
    <div className='form_btn w-full'>
      <button className="btn btn-solid" type='submit' onClick={onClick}>{btnText}</button>
    </div>
  )
}

export default FormButton