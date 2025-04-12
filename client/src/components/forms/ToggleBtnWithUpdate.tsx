import React, { useState } from 'react';
import ToggleSwitch from '../common/ToggleSwitch';
import { addUpdateRecords } from '../../hooks/dbHooks';
import { FlashPopup, Loader } from '../common';
import { FlashPopupType } from '../../interfaces';
import { useTranslation } from 'react-i18next';

interface PropsType {
  initialState?: Boolean;
  name:string;
  id:string;
  label?:string;
  rowData?:any;
  size?:'sm'|'md'|'lg';
  collection:string;
  onChange: (name:string, value:Boolean, rowData:any, status:boolean) => void;
}

// Custom Radio Button Cell Component
const ToggleBtnWithUpdate: React.FC<PropsType> = ({id, name,initialState,onChange,rowData, size="sm", collection, label=""}) => {
    const {t} = useTranslation();
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
    const [isLoader, setIsLoader] = useState<boolean>(false);
    const handleChange = async (value:boolean)=>{
        setIsLoader(true);
        let saved =false;
        try{
            
            const response = await addUpdateRecords({type: collection, checkDataBy:[], action:"update", id, body:{ [name]:value}}); 
            if(response.status === 'success'){
                saved = true;
                const content = `${t(`RESPONSE.${response.code}`)}`;
                setFlashPopupData({...flashPopupData, isOpen:true, message:content, type:"success"});
            }else{
                const content = `${t(`RESPONSE.${response.code}`)}`;
                setFlashPopupData({...flashPopupData, isOpen:true, message:content, type:"fail"});
            }
            setIsLoader(false);
        }catch(error){
            setIsLoader(false);
            console.error(error);
        }

        onChange && onChange(name, value, rowData, saved);
    }

  return (
    <div className='relative'>
    {isLoader && <Loader  type='small'/>}
    {!isLoader && 
    <div className='relative'>
        <ToggleSwitch onChange={handleChange} 
        id={`toggle-${id}-${rowData && rowData.id && rowData.id}`} 
        name={`toggle-${name || id}-${rowData && rowData.id && rowData.id}`} size={size} 
        initialState={initialState ? true : false}
        label={label}
        />
        </div>
    }
    <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>

    </div>
  );
};

export default ToggleBtnWithUpdate;
