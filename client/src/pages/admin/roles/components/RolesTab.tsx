import { useEffect, useMemo, useState } from 'react';
import { format, formatDate } from 'date-fns';
import Loader from '../../../../components/common/Loader';
import DataTable from '../../../../components/table/DataTable';
import { ColumnDef, RowData } from '@tanstack/react-table';
import { IoCreateOutline } from "react-icons/io5";
import { useTranslation } from 'react-i18next';
import { getRecords, deleteRecordById } from '../../../../hooks/dbHooks';
import { UserRole } from '../../../../interfaces';
import DeleteById from '../../../../components/actions/DeleteById';
import { NavLink } from 'react-router-dom';
import { Headings } from '../../../../components/common';
import { MdPerson, MdPersonOutline } from 'react-icons/md';

const pinnedColumns= ['id', 'name'];
const fixedWidthColumns= ['id', 'type', 'createdAt', 'actions'];

interface RolesWithUserCounts extends UserRole{
    users:number;
}

const RolesTab = () => {
    const {t} = useTranslation();
    const [data, setData] = useState<UserRole[]>([]);
    const [rolesWithUserCounts, setRolesWithUserCounts] = useState<RolesWithUserCounts[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState<any | null>(null);
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        getAllRoles();
    }, []);

    const getAllRoles = async () => {
        setLoader(true);
        try {
            const res = await getRecords({type: "roles"});  
            if (res.status === "success") {
                console.log(res);
                if(res.rolesWithUserCounts){
                    setRolesWithUserCounts(res.rolesWithUserCounts);
                }
                setData(res.data || []); 
                // console.log(res.data);
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
        <div className=''>
            {loader ? (
                <Loader type="full" loaderType="bounce" /> // Use Loader component with type and loaderType
            ) : (
                <div>
                    <div className='mb-2'>
                        <Headings text={t('roles')} type='h3' />
                    </div>
                    <div className='data-wrap grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                        {rolesWithUserCounts.length > 0 && rolesWithUserCounts.map((role, idx)=>{
                            return(
                                <div key={idx} className='p-4  m-0 rounded-lg bg-primary-light flex flex-wrap flex-col gap-2'>
                                    <div className='flex flex-wrap justify-between'>
                                        <Headings text={role.displayName} type='h5' classes='text-primary'/>
                                        <div className='flex gap-1 flex-wrap justify-end items-center px-2 bg-white rounded-3xl'>
                                            <span className='text-slate-500 text-lg'>
                                                <MdPerson />
                                            </span>
                                            <span className='text-md text-slate-600 font-semibold'>
                                                {role.users}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex-1 flex justify-between'>
                                        <Headings text={role._cid} type='h6' classes=''/>
                                        {role.createdAt && 
                                            <div className='text-xs flex gap-1 flex-wrap justify-end'>
                                                <span className='text-slate-500 '>
                                                    {t('createdAt')} :
                                                </span>
                                                <span className='text-slate-700 font-semibold'>
                                                    {formatDate(role.createdAt, 'dd.MM.yyyy')}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                    
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        
        </div>

    );
};

export default RolesTab;
