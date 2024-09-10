import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineInfoCircle } from 'react-icons/ai';

interface argsType {
    type?: 'password' | 'textarea' | 'text' | 'number' | 'email' | 'url';
    name?: string;
    classes?: string;
    label?: string;
    id?: string;
    value?: string | number;
    placeholder?: string;
    info?: string;
    minChar?: number;
    maxChar?: number;
    required?: boolean;
    pattern?: string;
    fieldType?: "password" | "email" | "mobile" | "slug" | "name" | "fullname" | "username" | "url" | "keyword" | "numbers";
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onClick?: () => void;
}

const CustomInput: React.FC<argsType> = (args) => {
    const { 
        type = "text", 
        name, 
        classes, 
        label, 
        required = false,
        id, 
        value, 
        placeholder, 
        pattern, 
        fieldType, 
        minChar, 
        maxChar,
        info, 
        onChange, 
        onClick 
    } = args;

    const [showPassword, setShowPassword] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const infoRef = useRef<HTMLDivElement | null>(null);

    const regExPattern = {
        password: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@\\-_+#!$%&=?*])[A-Za-z\\d@\\-_+#!$%&=?*]{6,}$`, // at least one uppercase, one lowercase, one digit, and one special character
        email: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`,
        mobile: `^\\+?[1-9]\\d{1,14}$`,
        url: `^(https?:\\/\\/)?(www\\.)?[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`,
        keyword: `^[A-Za-z0-9_-]+$`,
        slug: `^[A-Za-z0-9_-]+$`,
        numbers: `^\\d+$`,
        name: `^[A-Za-z]+$`,
        fullname: `^[A-Za-z]+(?: [A-Za-z]+)*$`,
        username: `^[A-Za-z]+(\\.[A-Za-z]+)*$`,
    };

    const fieldPattern = pattern || (fieldType && regExPattern[fieldType]) || 
        (type === "email" && regExPattern["email"]) || 
        (type === "password" && regExPattern["password"]) || 
        (type === "url" && regExPattern["url"]) || 
        ".";

    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const inputValue = event.target.value;
        const regex = new RegExp(fieldPattern);
        
        if (required && !inputValue) {
            setIsValid(false);
        } else if (inputValue && !regex.test(inputValue)) {
            setIsValid(false);
        } else if (minChar && inputValue.length < minChar) {
            setIsValid(false);
        } else if (maxChar && inputValue.length > maxChar) {
            setIsValid(false);
        } else {
            setIsValid(true);
        }
    };

    const getInfoContent = () => {
        switch (fieldType) {
            case 'password':
                return 'Password must be at least 6 characters long with at least one uppercase letter, one lowercase letter, and one digit.';
            case 'email':
                return 'Must be a valid email address format, e.g., example@domain.com.';
            case 'url':
                return 'Must be a valid URL, e.g., http://www.example.com.';
            case 'numbers':
                return 'Only digits are allowed.';
            case 'name':
                return 'Only letters are allowed.';
            case 'fullname':
                return 'Only letters and single spaces between names are allowed.';
            case 'username':
                return 'Only letters and dots are allowed, no consecutive dots.';
            case 'keyword':
                return 'No spaces, only letters, numbers, hyphens, and underscores.';
            default:
                return info || 'No specific validation applied.';
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
            setShowInfo(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className='input-wrap flex flex-col w-full mb-4 relative'>
            {label && (
                <div className='flex items-center'>
                    <label htmlFor={id ? id : name} className='text-gray-400 flex items-center'>
                        {label}
                        {required && <span className={`${isValid ? 'text-gray-400' : 'text-red-500'} ml-1`}>*</span>}
                    </label>
                    {fieldPattern && fieldPattern !== "." && (
                        <AiOutlineInfoCircle
                            className='ml-2 text-gray-500 cursor-pointer'
                            onClick={() => setShowInfo(!showInfo)}
                        />
                    )}
                    {showInfo && fieldPattern && fieldPattern !== "." && (
                        <div
                            ref={infoRef}
                            className='absolute z-50 top-full left-0 mt-2 bg-white border border-gray-300 shadow-md p-2 text-xs text-gray-600 rounded-md'
                        >
                            {getInfoContent()}
                        </div>
                    )}
                </div>
            )}
            {type === 'textarea' ? (
                <textarea
                    name={name}
                    className={`${classes} bg-gray-50 border ${isValid ? 'border-gray-300 focus:ring-primary focus:border-primary' : 'border-red-500 focus:ring-red-500 focus:border-red-500'} text-gray-900 text-sm rounded-sm focus:outline-none block w-full p-2.5 dark:bg-gray-700`}
                    id={id ? id : name}              
                    placeholder={placeholder}
                    onChange={onChange}
                    onClick={onClick}
                    required={required}
                    onBlur={handleBlur}
                    defaultValue={value}
                ></textarea>
            ) : (
                <div className="relative w-full">
                    <input
                        type={showPassword && type === 'password' ? 'text' : type}
                        name={name}
                        className={`${classes} bg-gray-50 border ${isValid ? 'border-gray-300 focus:ring-primary focus:border-primary' : 'border-red-500 focus:ring-red-500 focus:border-red-500'} text-gray-900 text-sm rounded-sm focus:outline-none block w-full p-2.5 dark:bg-gray-700`}
                        id={id ? id : name}                        
                        value={value}
                        required={required}
                        placeholder={placeholder}
                        pattern={fieldPattern}
                        onChange={onChange}
                        onClick={onClick}
                        onBlur={handleBlur}
                        minLength={minChar}
                        maxLength={maxChar}
                    />
                    {type === "password" && (
                        <div 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                        </div>
                    )}
                </div>
            )}
            {info && <p className='text-gray-500 text-sm'>{info}</p>}
        </div>
    );
};

export default CustomInput;
