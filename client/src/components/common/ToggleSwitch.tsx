import React, { useState, useEffect } from 'react';
import '../../assets/styles/togglebtn.css'

interface ArgsType {
  type?: 'default' | 'yesno' | 'privacy';
  size?:'xs' | 'sm' | 'md' | 'lg'
  value?: string;
  name?: string;
  id?: string;
  initialState?: boolean;
  yesColor?:string;
  noColor?:string;
  label?:string;
  yesText?:React.ReactNode;
  yesValue?:string;
  noValue?:string;
  noText?:React.ReactNode;
  onChange: (isChecked: boolean, value?:string) => void;
}

const ToggleSwitch: React.FC<ArgsType> = (args) => {
  const { initialState = false, type = 'status', id, value, name, onChange, label, yesText, noText, size='sm', 
    yesValue = 'yes', noValue='no',
    yesColor="green", noColor="red",
  } = args;
  const [isChecked, setIsChecked] = useState(initialState);

  // Handle the initial state in case it changes externally
  useEffect(() => {
    setIsChecked(initialState);
  }, [initialState]);

  const handleToggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    const value = newState ? yesValue : noValue;
    onChange && onChange(newState, value); // Pass the updated value
  };

  return (
    <div className='btn-wrap'>
      {label && <h5>{label}</h5>}
      {type === 'yesno' || (yesText && noText) ? 
      <div className={``}>
        <input type='checkbox' id={id || 'toggle'}
          name={name}
          checked={isChecked}
          onChange={handleToggle}
          value={value} 
          className='absolute hidden'
          />
          <label htmlFor={id || 'toggle'} className={`relative grid grid-cols-2 w-max bg-white rounded-md box-shadow border-2 border-white 
            ${isChecked ? 
              `before:left-0 before:bg-${yesColor}-100`
              :`before:left-2/4 before:bg-${noColor}-100`}

            before:w-2/4 before:top-0 before:bottom-0 before:absolute 
            before:transition-all before:duration-200 before:ease before:pointer-events-none before:z-0
            text-${size}
            
            `}>
            <span className={`${isChecked ? `text-${yesColor}-500 bg-${yesColor}-100`: 'shadow-light text-slate-400'}  
            cursor-pointer px-2 py-1 flex justify-center items-center transition-colors duration-200 ease relative z-1
            `}>{yesText}</span>
            <span className={`${!isChecked ? `text-${noColor}-500 bg-${noColor}-100`: 'shadow-light text-slate-400'} 
            cursor-pointer px-2 py-1 flex justify-center items-center transition-colors duration-200 ease relative z-1
            `}>{noText}</span>
          </label>
      </div>
      :
    
      <div className={`toggle-container size-${size}`}>
        <input
          type="checkbox"
          id={id || 'toggle'}
          name={name}
          value={value}
          className="toggle-checkbox"
          checked={isChecked}
          onChange={handleToggle}
        />
        <label htmlFor={id || 'toggle'} className="toggle-label">
        </label>
      </div>
      }
    </div>
  );
};

export default ToggleSwitch;
