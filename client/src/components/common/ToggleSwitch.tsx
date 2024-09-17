import React, { useState, useEffect } from 'react';
import '../../assets/styles/togglebtn.css'

interface ArgsType {
  type?: 'default' | 'yesno';
  size?:'sm' | 'md' | 'lg'
  value?: string;
  name?: string;
  id?: string;
  initialState?: boolean;
  label?:string;
  yesText?:string;
  noText?:string;
  onChange: (isChecked: boolean) => void;
}

const ToggleSwitch: React.FC<ArgsType> = (args) => {
  const { initialState = false, type = 'status', id, value, name, onChange, label, yesText="YES", noText="NO", size='md' } = args;
  const [isChecked, setIsChecked] = useState(initialState);

  // Handle the initial state in case it changes externally
  useEffect(() => {
    setIsChecked(initialState);
  }, [initialState]);

  const handleToggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    onChange && onChange(newState); // Pass the updated value
  };

  return (
    <div className='btn-wrap'>
      {label && <h5>{label}</h5>}
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
          {type === 'yesno' && <>
            <span className='yes'>{yesText}</span>
            <span className='yes'>{noText}</span>
          </>}
        </label>
      </div>
    </div>
  );
};

export default ToggleSwitch;
