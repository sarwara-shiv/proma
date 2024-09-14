import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useCookies } from 'react-cookie';
import { format } from 'date-fns';
import axios from 'axios';
import Loader from '../../../../components/common/Loader';
import DataTable from '../../../../components/common/DataTable';
import { ColumnDef, RowData, ColumnMeta } from '@tanstack/react-table';
import { IoTrash, IoCreateOutline } from "react-icons/io5";
import ConfirmPopup from '../../../../components/common/CustomPopup';
import { useTranslation } from 'react-i18next'; 
import Popup from '../../../../components/common/CustomAlert';
import { getRecords, deleteRecordById } from '../../../../hooks/dbHooks';

interface DataType { 
    name: string;
    shortName: string;
    description?: string;
    _id: string;
    createdAt: string; // Changed to string for date representation
    updatedAt: string; // Changed to string for date representation
    permissions?: string[];
}



const AllUsers = () => {
    const {t} = useTranslation();
    const { user } = useAuth();
    const [cookies] = useCookies(['access_token']);
    const [alertData, setAlertData] = useState({isOpen:false, content:"", type:"info", title:""}); 
    const [data, setData] = useState<DataType[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState<any | null>(null);
    const [popupContent, setPopupContent] = useState({content:"", title:"", isOpen:false});
    const [loader, setLoader] = useState(true);
    const JWT_TOKEN = cookies.access_token;
    const API_URL = process.env.REACT_APP_API_URL;

    const columns: ColumnDef<RowData, any>[] = useMemo(() => [
        {
          header: `${t('username')}`,
          accessorKey: 'username',
          meta:{
            style :{
            textAlign:'left',
            }
        }
        },
        {
          header: `${t('email')}`,
          accessorKey: 'email',
          meta:{
            style :{
            textAlign:'center',
            }
        }
        },
        {
          header: `${t('createdAt')}`, 
          accessorKey: 'createdAt',
          cell: ({ getValue }: { getValue: () => string }) => {
            const date = new Date(getValue());
            return <span>{format(date, 'dd.MM.yyyy')}</span>;
          },
          meta:{
            style :{
            textAlign:'center',
            }
        }
        },
        {
            header:`${t('actions')}`,
            cell: ({ row }: { row: any }) => (
                <div style={{ textAlign: 'right' }}>
                    {row.original.isEditable && 
                    <div>
                        <div onClick={() => confirmDelete(row.original._id, "delete", row.original.username)}
                            className="p-1 ml-1 inline-block text-red-500 hover:text-red-500/50 cursor-pointer whitespace-normal break-words" title='delete'
                            >
                            <IoTrash />
                        </div>
                        <div onClick={() => confirmDelete(row.original._id, "update", row.original.username)}
                            className="p-1 ml-1  inline-block text-green-700 hover:text-green-700/50 cursor-pointer whitespace-normal break-words" title='delete'
                            >
                            <IoCreateOutline />
                        </div>
                    </div>
                    }
                    
                </div>
            ),
            meta:{
                style :{
                textAlign:'right',
                width:"50px"
                }
            }
        }
      ], []);


    useEffect(() => {
        getAllUsers();
    }, []);

    const getAllUsers = async () => {
        setLoader(true);
        try {
            const res = await getRecords({type: "auth" }); 
            console.log(res);
            if (res.status === "success") {
                setData(res.data || []);
            }else{
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            setData([]);
        }finally{
            setLoader(false);
        }
    };

    const confirmDelete = (id:string, action:String, content:string | "")=>{
       setPopupData({id, action});
       setPopupContent({...popupContent, isOpen:!popupContent.isOpen, title:"Delete ?", content});
    }

    const handleRowAction = async(data:any)=>{
        setPopupContent({...popupContent, isOpen:!popupContent.isOpen});
        console.log(data);
        if(data.action){
            if(data.id && data.action === 'delete'){
                try{
                    try{
                        const response = await deleteRecordById({type:'users', body:data});
                        if(response.status === "success"){ 
                            console.log(response.data);
                            getAllUsers();
                            setAlertData({...alertData, isOpen:true, title:response.code, content:"adfasdf", type:'success'});
                        }else{
                            setAlertData({...alertData, isOpen:true, title:response.code, type:'error'});
                        }
                  
                      }catch(error){
                        console.log(error);
                      }
                  }catch(error){
                    setAlertData({...alertData, isOpen:true, title:"Error", content:"unknown Error", type:'error'});
                  }
    
            }
        }
    }



    return (
        <div className='p-4'>
            {loader ? (
                <Loader type="full" loaderType="bounce" /> // Use Loader component with type and loaderType
            ) : (
                <div className='data-wrap'>
                    {data.length > 0 ? (
                        <div>
                            <DataTable columns={columns} data={data}/>
                                <ConfirmPopup
                                    isOpen={popupContent.isOpen}
                                    onClose={() => setPopupContent({...popupContent, isOpen:!popupContent.isOpen})}
                                    title={popupContent.title}
                                    data={popupData}
                                    content={popupContent.content} 
                                    yesFunction={(data)=>handleRowAction(data)} 
                                    noFunction={()=>setIsPopupOpen(!isPopupOpen)}                                
                                />
                        </div>
                        
                    ) : (
                        <p>No roles found</p>
                    )}
                </div>
            )}

        <Popup
            onClose = {()=> setAlertData({...alertData, 'isOpen':!alertData.isOpen})}
            isOpen ={alertData.isOpen}
            content = {alertData.content}
            title = {alertData.title}
            type={alertData.type}
      />
        
        </div>

    );
};

export default AllUsers;
