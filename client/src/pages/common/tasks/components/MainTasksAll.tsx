import { useTranslation } from 'react-i18next';
import { CustomAlert, FlashPopup, Loader } from '../../../../components/common'
import Pagination from '../../../../components/common/Pagination';
import { ColumnDef } from '@tanstack/react-table';
import { getRecordsWithFilters } from '../../../../hooks/dbHooks';
import { AlertPopupType, FlashPopupType, MainTask, OrderByFilter, PaginationProps, Project, QueryFilters, User } from '@/interfaces';
import React, { useEffect, useMemo, useState } from 'react'
import { CustomDropdown } from '../../../../components/forms';
import { format } from 'date-fns';
import { DeleteById } from '../../../../components/actions';
import { NavLink } from 'react-router-dom';
import { IoCreateOutline } from 'react-icons/io5';
import DataTable from '../../../..//components/table/DataTable';
import ConfirmPopup from '../../../../components/common/CustomPopup';
import { FaTasks } from 'react-icons/fa';

const MainTasksAll = () => {
    const {t} = useTranslation();
    const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
    const [paginationData, setPaginationData] = useState<PaginationProps>({currentPage:1,totalRecords:0, limit:50, totalPages:0})
    const [recordType, setRecordType] = useState<string>('maintasks');
    const [popupContent, setPopupContent] = useState({content:"", title:"", isOpen:false});
    const [data, setData] = useState<MainTask[]>();
    const [loader, setLoader] = useState(true);



    useEffect(()=>{
        getRecords();
    },[])
    useEffect(()=>{
        getRecords();
    },[paginationData.currentPage])


    const getRecords = async () => {
        setLoader(true);
        try {
            const filters:QueryFilters = {
                // isActive:true,
                // createdAt:{date:'23.09.2024', format:'DD.MM.YYYY'}
            }

            const orderBy:OrderByFilter={
                _pid:'asc',
            }
            const res = await getRecordsWithFilters({
                type: "maintasks", 
                limit:paginationData.limit as unknown as number, 
                pageNr:paginationData.currentPage as unknown as number, 
                populateFields:['createdBy', '_pid', 'responsiblePerson'],
                filters,
                orderBy
            });  
            console.log(res);
            if (res.status === "success") {
                setData(res.data || []);
                console.log(res);
                setPaginationData({...paginationData, totalRecords:res.totalRecords, totalPages:res.totalPages, currentPage:res.currentPage})
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

    const handlePageChange =  (page: number) => {
        setPaginationData({...paginationData, currentPage:page})
    };

    const columns: ColumnDef<MainTask, any>[] = useMemo(() => [
        {
          header: `${t('name')}`,
          accessorKey: 'name',
          id:"name",
            meta:{
                style :{
                textAlign:'left',
                }
            }
        },
        {
          header: `${t('project')}`,
          accessorKey: '_pid',
          id:"project",
            meta:{
                style :{
                textAlign:'left',
                }
            },
            cell: ({ getValue }: { getValue: () => string }) => {
                const project = getValue() as unknown as Project;
                return <span>{project.name}</span>;
            },
        },
        
      
        {
          header: `${t('startDate')}`, 
          accessorKey: 'startDate',
          cell: ({ getValue }: { getValue: () => string }) => {
            const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
            return <span>{date}</span>;
          },
            meta:{
                style :{
                textAlign:'center',
                }
            }
        },
        {
          header: `${t('dueDate')}`, 
          accessorKey: 'dueDate',
          cell: ({ getValue }: { getValue: () => string }) => {
            const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
            return <span>{date}</span>;
          },
            meta:{
                style :{
                textAlign:'center',
                }
            }
        },
        {
          header: `${t('endDate')}`, 
          accessorKey: 'endDate',
          cell: ({ getValue }: { getValue: () => string }) => {
            const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
            return <span>{date}</span>;
          },
            meta:{
                style :{
                textAlign:'center',
                }
            }
        },
        {
          header: `${t('status')}`, 
          accessorKey: 'status',
          cell: ({ getValue }: { getValue: () => string }) => {
            return <span>{getValue()}</span>;
          },
            meta:{
                style :{
                textAlign:'center',
                }
            }
        },
        {
          header: `${t('createdBy')}`, 
          accessorKey: 'createdBy',
          cell: ({ getValue }: { getValue: () => string }) => {
            const cUser = getValue() as unknown as User
            return <span>{cUser.name}</span>;
          },
            meta:{
                style :{
                textAlign:'center',
                }
            }
        },
        {
          header: `${t('responsiblePerson')}`, 
          accessorKey: 'responsiblePerson',
          cell: ({ getValue }: { getValue: () => string }) => {
            const cUser = getValue() as unknown as User
            return <span>{cUser.name}</span>;
          },
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
            const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
            return <span>{date}</span>;
          },
            meta:{
                style :{
                textAlign:'center',
                }
            }
        },
        {
            header:`${t('links')}`,
            id:'links',
            cell: ({ row }: { row: any }) => (
                <div style={{ textAlign: 'center' }} className='hover:bg-white rounded-sm hover:shadow-sm'>
                    {/* {row.original.isEditable && <></>
                    } */}
                    <div className='flex align-center justify-center flex-row py-[1px]'>
                        <NavLink
                            to={`tasks/${row.original._id}`} state={{objectId:row.original._id, data:row.original}} title={`${t('maintasks')}`}
                            className="p-1 ml-1  inline-block text-green-700 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words"
                            >
                              <FaTasks /> 
                        </NavLink>
                    </div>
                </div>
            ),
            meta:{
                style :{
                textAlign:'center',
                width:"130px"
                }
            }
        },
        {
            header:`${t('actions')}`,
            cell: ({ row }: { row: any }) => (
                <div style={{ textAlign: 'center' }} className='text-md'>
                    {/* {row.original.isEditable && <></>
                    } */}
                    <div>
                        <DeleteById data={{id:row.original._id, type:recordType, page:"projects"}} content={`Delte Project: ${row.original.name}`} onYes={onDelete}/>
                        <NavLink
                            to={`update`} state={{objectId:row.original._id, data:row.original}} title="update"
                            className="p-1 ml-1  inline-block text-green-700 hover:text-green-700/50 cursor-pointer whitespace-normal break-words"
                            >
                              <IoCreateOutline /> 
                        </NavLink>
                    </div>
                    
                </div>
            ),
            meta:{
                style :{
                textAlign:'center',
                width:"60px"
                }
            }
        },
      ], []);

      const onDelete = (data:any)=>{
        if(data.status === "success"){ 
          getRecords();
        }else{
          console.error({error:data.message, code:data.code}); 
        }
    }

  return (
    <div>
        {loader ? (
                <Loader type="full" loaderType="bounce" /> // Use Loader component with type and loaderType
            ) : (
                <div className='data-wrap'>
                    {data && data.length > 0 ? (
                        <div className='relative bg-white p-4 rounded-md overflow-y-auto w-full'>
                            <DataTable columns={columns} data={data}/>
                            <Pagination
                                currentPage={paginationData.currentPage} 
                                totalPages={paginationData.totalPages} 
                                onPageChange={handlePageChange} 
                                totalRecords={paginationData.totalRecords}
                            /> 
                                
                        </div>
                        
                    ) : (
                        <p>{t('noData')}</p>
                    )}
                </div>
            )
        }

        <CustomAlert
          onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
          isOpen={alertData.isOpen}
          content={alertData.content}
          title={alertData.title}
          type={alertData.type || 'info'} 
        />
        {/* <ConfirmPopup
            isOpen={popupContent.isOpen}
            onClose={() => setPopupContent({...popupContent, isOpen:!popupContent.isOpen})}
            title={popupContent.title ? popupContent.title : ''}
            data={popupData}
            content={popupContent.content} 
            yesFunction={(data)=>handleRowAction(data)} 
            noFunction={()=>setIsPopupOpen(!isPopupOpen)}                                
        /> */}

        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>

    </div>
  )
}

export default MainTasksAll
