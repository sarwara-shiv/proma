import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import Loader from '../../../../components/common/Loader';
import DataTable from '../../../../components/table/DataTable';
import { ColumnDef, RowData } from '@tanstack/react-table';
import { IoCreateOutline } from "react-icons/io5";
import { useTranslation } from 'react-i18next';
import { getRecords, deleteRecordById } from '../../../../hooks/dbHooks';
import { UserRole } from '../../../../interfaces';
import DeleteById from '../../../../components/actions/DeleteById';
import { NavLink } from 'react-router-dom';


const AllRoles = () => {
    const {t} = useTranslation();
    const [data, setData] = useState<UserRole[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState<any | null>(null);
    const [loader, setLoader] = useState(true);

    const columns: ColumnDef<RowData, any>[] = useMemo(() => [ 
        {
          header: `${t('id')}`,
          accessorKey: '_cid',
          id:'_cid',
          meta:{
            style :{
                textAlign:'left',
                tColor:'text-slate-900',
            }
         }
        },
        {
          header: `${t('name')}`,
          accessorKey: 'name',
          meta:{
            style :{
                textAlign:'left',
                tColor:'text-slate-900',
                width:"140px"
            }
         }
        },
        {
          header: `${t('displayName')}`,
          accessorKey: 'displayName',
          meta:{
                style :{
                    textAlign:'left',
                    width:"140px"
                }
            }
        },
        {
          header: `${t('type')}`,
          accessorKey: 'type',
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
                        <DeleteById data={{id:row.original._id, type:"roles", page:"roles"}} content={`Delte Role: ${row.original.displayName}`} onYes={onDelete}/>
                        <NavLink
                            to={`update`} state={{objectId:row.original._id, data:row.original}} title="update"
                            className="p-1 ml-1  inline-block text-green-700 hover:text-green-700/50 cursor-pointer whitespace-normal break-words"
                            >
                              <IoCreateOutline /> 
                        </NavLink>
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
        getAllRoles();
    }, []);

    const getAllRoles = async () => {
        setLoader(true);
        try {
            const res = await getRecords({type: "roles"});  
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

    const onDelete = (data:any)=>{
        if(data.status === "success"){ 
            getAllRoles();
        }else{
          console.error({error:data.message, code:data.code}); 
        }
    }
    const handleRowAction = async(data:any)=>{
        setIsPopupOpen(!isPopupOpen);
        if(data.id && data.action){
            try{
                const response = await deleteRecordById({type:'roles', body:data});
                if(response.status === "success"){ 
                    getAllRoles();
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
                        </div>
                        
                    ) : (
                        <p>{t('noDataFound')}</p>
                    )}
                </div>
            )}
        
        </div>

    );
};

export default AllRoles;
