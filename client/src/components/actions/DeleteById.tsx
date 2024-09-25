import React, { useState } from 'react'
import ConfirmPopup from '../common/CustomPopup';
import { IoTrash } from 'react-icons/io5';
import { deleteRecordById } from '../../hooks/dbHooks';

interface ArgsType{
    data:{id:string, type:string, page:string},
    popupData?:any;
    title?:string;
    content?:string;
    onYes?:(data:any)=>void;
    onNo?:()=>void;
}
const DeleteById: React.FC<ArgsType> = ({ data, onYes, onNo, title="Are you sure?", content="Delete Data", popupData}) => {

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
            className="p-1 ml-1 inline-block text-red-500 hover:text-red-500/50 cursor-pointer whitespace-normal break-words" title='delete'
            >
            <IoTrash />
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
