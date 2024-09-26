import React, { useEffect, useState } from 'react';
import ToggleSwitch from '../common/ToggleSwitch';
import { AlertPopupType, NavItem } from '@/interfaces';
import { CustomAlert } from '../common';
import { IoEllipsisVertical } from 'react-icons/io5';

interface PropsType {
  id:string;
  rowData?:any
  navItems:NavItem[];
  onClose: (value:Boolean|string, rowData:any) => void;
}


const SubNavigationCell: React.FC<PropsType> = ({id, rowData,onClose}) => {
    const [alertData, setAlertData] = useState<AlertPopupType>({
        isOpen:false,
        title:'Navigation',
        content: '',
        data:{},
    })
    const handleChange = (value:boolean)=>{
        onClose && onClose(value, rowData);
    }

    useEffect(()=>{

    }, []);

    const handleClick = ()=>{
        setAlertData({...alertData, isOpen:true});
    }

  return (
   <div>
    <div className='' onClick={handleClick}>
        <IoEllipsisVertical />
    </div>
    <CustomAlert  isOpen={alertData.isOpen} title={alertData.title} content="" onClose={()=>setAlertData({...alertData, isOpen:false})}/>
   </div>
  );
};

export default SubNavigationCell;
