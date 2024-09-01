import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
interface argsType {
    type?: 'password' | 'textarea' | 'text' | 'number' | 'email';
    name?: string;
    classes?: string;
    label?: string;
    id?: string;
    value?: string | number;
    placeholder?: string;
    info?: string;
    required?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onClick?: () => void;
}

const CustomInput: React.FC<argsType> = (args) => {
    const { type = "text", name, classes, label, required = false,id, value, placeholder, info, onChange, onClick } = args;
    const [showPassword, setShowPassword] = useState(false);
  return (
    <div className='input-wrap flex flex-col w-full mb-4'>
        {label && <label htmlFor={id? id:name} className='text-gray-400'>{label}</label> }
        {type === 'textarea' ? (   
            <textarea
                name={name}
                className={`${classes} bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary`}
                id={id ? id: name}
                placeholder={placeholder}
                onChange={onChange}
                onClick={onClick}
                required={required}
                defaultValue={value}
            ></textarea>
        ):(
        
            <input
                type={showPassword ? 'text' : type}
                name={name}
                className={`${classes} bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-primary-light focus:border-primary-light block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary`}
                id={id ? id : name}
                value={value}
                required={required}
                placeholder={placeholder}
                onChange={onChange}
                onClick={onClick}
            />
        ) 
        }
        {type === "password" && 
            <div className="input_icon" onClick={()=>setShowPassword(!showPassword)}>
                {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </div>
        }
    </div>
  )
}

export default CustomInput
