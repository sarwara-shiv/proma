import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
interface argsType {
    type?: string;
    name?: string;
    classes?: string;
    label?: string;
    id?: string;
    value?: string | number;
    placeholder?: string;
    info?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: () => void;
}

const CustomInput: React.FC<argsType> = (args) => {
    const { type = "text", name, classes, label,id, value, placeholder, info, onChange, onClick } = args;
    const [showPassword, setShowPassword] = useState(false);
  return (
    <div className='input-wrap flex flex-col w-full mb-4'>
        {label && <label htmlFor=''>{label}</label> }
        <input
            type={showPassword ? 'text' : type}
            name={name}
            className={`${classes} bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
            id={id}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onClick={onClick}
        />
        {type === "password" && 
            <div className="input_icon" onClick={()=>setShowPassword(!showPassword)}>
                {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </div>
        }
    </div>
  )
}

export default CustomInput
