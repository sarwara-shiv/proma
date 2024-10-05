import React, { useState } from 'react'
import ConfirmPopup from '../common/CustomPopup';
import { IoRemove, IoTrash } from 'react-icons/io5';
import { deleteRecordById } from '../../hooks/dbHooks';
import { RelatedUpdates } from '@/interfaces';
import { IoMdClose } from 'react-icons/io';

interface ArgsType{
    data:{id:string, type:string, page:string},
    popupData?:any;
    title?:string;
    content?:string;
    style?: 'default' | 'fill';
    icon?:'bin' | 'close' | 'minus';
    onYes?:(data:any)=>void;
    onNo?:()=>void;
    relatedUpdates?:RelatedUpdates[]
}
const DeleteById: React.FC<ArgsType> = ({style='default', icon='bin', data, onYes, onNo, title="Are you sure?", content="Delete Data", popupData, relatedUpdates=[]}) => {

    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleDeleteAction =async()=>{
        setIsPopupOpen(!isPopupOpen)
        if(data.id && data.page && data.type){
            try{
                const response = await deleteRecordById({type:data.type, body:data});
                if(response.status === "success"){
                    onYes && onYes(response);
                }else{
                  console.error({status:"error",error:response.message, code:response.code}); 
                }
              }catch(error){
                console.error({status:"error",error:"server error", code:"server_error"}); 
              }

        }else{
            onYes && onYes({status:"error", message:"Data missing", code:"incomplete_data"});
        }
    }

    const confirmDelete = ()=>{
        setIsPopupOpen(!isPopupOpen);
    }

  return (
    <>
         <div onClick={() => confirmDelete()}
            title='delete'
            className={`p-0.5 ml-1 inline-block text-red-500 hover:text-red-500/50 cursor-pointer whitespace-normal break-words
                ${style === 'fill' ? 'rounded-full bg-red-100 ' : ''}
              `} 
            >
              {
              icon === 'bin' ? <IoTrash /> :
              icon === 'close' ? <IoMdClose /> :
              icon === 'minus' ? <IoRemove /> :<IoTrash />
              }
        </div>
        <ConfirmPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(!isPopupOpen)}
            title={title}
            data={popupData}
            content={<p className='text-left'>{content}</p>} 
            yesFunction={()=>handleDeleteAction()} 
            noFunction={()=>setIsPopupOpen(false)}/>
    </>
  )
}

export default DeleteById
