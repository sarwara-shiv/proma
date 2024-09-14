import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useCookies } from 'react-cookie';
import { format } from 'date-fns';
import axios from 'axios';
import Loader from '../../../../components/common/Loader';
import DataTable from '../../../../components/common/DataTable';
import { ColumnDef, RowData } from '@tanstack/react-table';
import { IoTrash, IoCreateOutline } from "react-icons/io5";
import Popup from '../../../../components/common/CustomAlert';
import ConfirmPopup from '../../../../components/common/CustomPopup';
import { useTranslation } from 'react-i18next';
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



const AllRoles = () => {
    const {t} = useTranslation();
    const { user } = useAuth();
    const [cookies] = useCookies(['access_token']);
    const [data, setData] = useState<DataType[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState<any | null>(null);
    const [loader, setLoader] = useState(true);
    const JWT_TOKEN = cookies.access_token;
    const API_URL = process.env.REACT_APP_API_URL;
    console.log(user);

    const columns: ColumnDef<RowData, any>[] = useMemo(() => [
        {
          header: `${t('name')}`,
          accessorKey: 'name',
          meta:{
            style :{
            textAlign:'left',
            }
        }
        },
        {
          header: `${t('shortName')}`,
          accessorKey: 'shortName',
          meta:{
                style :{
                    textAlign:'center',
                }
            }
        },
        {
          header: `${t('description')}`,
          accessorKey: 'description',
          meta:{
                style :{
                    textAlign:'left',
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
                        <div onClick={() => confirmDelete(row.original._id, "delete")}
                            className="p-1 ml-1 inline-block text-red-500 hover:text-red-500/50 cursor-pointer whitespace-normal break-words" title='delete'
                            >
                            <IoTrash />
                        </div>
                        <div onClick={() => confirmDelete(row.original._id, "edit")}
                            className="p-1 ml-1  inline-block text-green-700 hover:text-green-700/50 cursor-pointer whitespace-normal break-words" title='delete'
                            >
                            <IoCreateOutline />
                        </div>
                    </div>
                    }
                    {row.original.type === 'default' &&  
                        <div className='text-sm'>default</div>
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
        getAllRoles();
    }, []);

    const getAllRoles = async () => {
        setLoader(true);
        try {
            const res = await getRecords({type: "roles"});  
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

    const confirmDelete = (id:string, action:String)=>{
       setIsPopupOpen(!isPopupOpen);
       setPopupData({id, action});
    }
    const handleRowAction = async(data:any)=>{
        setIsPopupOpen(!isPopupOpen);
        console.log(data);
        if(data.id && data.action){
            try{
                const response = await deleteRecordById({type:'roles', body:data});
                if(response.status === "success"){ 
                    console.log(response.data);
                    getAllRoles();
                    // setFormData(response.data.data);
                    // navigation("/");
                }else{
                  console.error({error:response.data.message, code:response.data.code}); 
                }
          
              }catch(error){
                console.log(error);
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
                                    isOpen={isPopupOpen}
                                    onClose={() => setIsPopupOpen(!isPopupOpen)}
                                    title="My Popup Title"
                                    data={popupData}
                                    content={<p>This is the content of the popup.</p>} 
                                    yesFunction={(data)=>handleRowAction(data)} 
                                    noFunction={()=>setIsPopupOpen(!isPopupOpen)}                                />
                        </div>
                        
                    ) : (
                        <p>No roles found</p>
                    )}
                </div>
            )}
        
        </div>

    );
};

export default AllRoles;
