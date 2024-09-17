import React from 'react';
import ToggleSwitch from '../common/ToggleSwitch';

interface PropsType {
  initialState?: Boolean;
  name?:string;
  id:string;
  rowData?:any
  onChange: (value:Boolean|string, rowData:any) => void;
}

// Custom Radio Button Cell Component
const ToggleBtnCell: React.FC<PropsType> = ({id, name,initialState,onChange,rowData}) => {
    const handleChange = (value:boolean)=>{
        onChange && onChange(value, rowData);
    }

  return (
   <ToggleSwitch onChange={handleChange} 
    id={`toggle-${id}-${rowData && rowData.id && rowData.id}`} 
    name={`toggle-${name || id}-${rowData && rowData.id && rowData.id}`} size='sm' 
    initialState={initialState ? true : false}
    />
  );
};

export default ToggleBtnCell;
