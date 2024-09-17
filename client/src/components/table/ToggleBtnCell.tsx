// RadioButtonCell.tsx
import React from 'react';
import ToggleSwitch from '../common/ToggleSwitch';

interface PropsType {
  initialState?: Boolean;
  name?:string;
  id:string;
  onChange: (initialState:Boolean) => void;
}

// Custom Radio Button Cell Component
const ToggleBtnCell: React.FC<PropsType> = ({id, name,initialState,onChange,}) => {
    const handleChange = (state:boolean)=>{
        onChange && onChange(state)
    }

  return (
   <ToggleSwitch onChange={handleChange} id={id} name={name} size='sm' initialState={initialState ? true : false}/>
  );
};

export default ToggleBtnCell;
