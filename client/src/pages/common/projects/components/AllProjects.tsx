import { ReactNode, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import Loader from '../../../../components/common/Loader';
import DataTable from '../../../../components/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { IoCreateOutline, IoEllipsisVertical, IoLockClosed } from "react-icons/io5";
import { FaEye, FaTasks } from 'react-icons/fa';

import { MdRocketLaunch } from "react-icons/md";

import ConfirmPopup from '../../../../components/common/CustomPopup';
import { useTranslation } from 'react-i18next'; 
import { getRecords, deleteRecordById, addUpdateRecords, getRecordsWithLimit, getRecordsWithFilters } from '../../../../hooks/dbHooks';
import DeleteById from '../../../../components/actions/DeleteById';
import CustomAlert from '../../../../components/common/CustomAlert';
import { NavLink } from 'react-router-dom';
import ToggleBtnCell from '../../../../components/table/ToggleBtnCell';
import { User } from '@/interfaces/users';
import { UserRole } from '@/interfaces/userRoles';
import FlashPopup from '../../../../components/common/FlashPopup';
import { AlertPopupType, FlashPopupType, NavItem, OrderByFilter, PaginationProps, Project, QueryFilters } from '@/interfaces';
import { getUsers } from '../../../../hooks/getRecords';
import { ObjectId } from 'mongodb';
import SubNavigationCell from '../../../../components/table/SubNavigationCell';
import { ProjectStatuses, Priorities } from '../../../../config/predefinedDataConfig';
import { CustomDropdown } from '../../../../components/forms';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import Pagination from '../../../../components/common/Pagination';

interface ArgsType {
    setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
    navItems:NavItem[];
}

const AllProjects:React.FC<ArgsType> = ({setSubNavItems, navItems}) => {
    const {t} = useTranslation();
    const [alertData, setAlertData] = useState<AlertPopupType>({isOpen:false, content:"", type:"info", title:""}); 
    const [data, setData] = useState<Project[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState<any | null>(null);
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
    const [popupContent, setPopupContent] = useState({content:"", title:"", isOpen:false});
    const [loader, setLoader] = useState(true);
    const [paginationData, setPaginationData] = useState<PaginationProps>({currentPage:1,totalRecords:0, limit:50, totalPages:0})
    const [recordType, setRecordType] = useState<string>('projects');
    const [fitlers, setFilters] = useState<QueryFilters>({});
    
    
    useEffect(()=>{
        setSubNavItems(navItems)
        getRecords();
    },[])

    useEffect(() => {
        getRecords();
    }, [paginationData.currentPage]);

    const columns: ColumnDef<Project, any>[] = useMemo(() => [
        {
          header: `${t('id')}`,
          accessorKey: '_cid',
          id:"_cid",
            meta:{
                style :{
                textAlign:'left',
                }
            }
        },
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
          header: `${t('projectType')}`,
          accessorKey: 'projectType',
          id:"projectType",
            meta:{
                style :{
                textAlign:'left',
                }
            }
        },
        {
          header: `${t('status')}`,
          accessorKey: 'status',
          id:"status",
          cell: ({ getValue, row }) => {
            const status = getValue() && getValue();
            const _id = row.original._id
            return (
                <>  
                    <span onClick={()=>handleCellClick(
                        {
                            name:'status', 
                            value:status, 
                            content:<CustomDropdown 
                                        data={ProjectStatuses} 
                                        label={''} 
                                        name='status'
                                        onChange={handleDataChange} selectedValue={status} recordId={_id} 
                                    />, 
                            title:`${t('status')}`
                        }
                    )} 
                    className={`cursor-pointer underline italic px-1 rounded-sm ${getColorClasses(status)}`}>  {`${t(`${status}`)}`}</span>
                </>
            ); 
          },
            meta:{
                style :{
                textAlign:'center',
                }
            }
        },
        {
          header: `${t('priority')}`,
          accessorKey: 'priority',
          id:"priority",
          cell: ({ getValue, row }) => {
            const priority = getValue() && getValue();
            const _id = row.original._id
            return (
                <>  
                    <span
                    onClick={()=>handleCellClick(
                        {
                            name:'priority', 
                            value:priority, 
                            content:<CustomDropdown 
                                        data={Priorities} 
                                        label={''} 
                                        name='priority'
                                        onChange={handleDataChange} selectedValue={priority} recordId={_id} 
                                    />, 
                            title:`${t('priority')}`
                        }
                    )} 
                    className={`cursor-pointer underline italic px-1 rounded-sm ${getColorClasses(priority)}`}>  {`${t(`${priority}`)}`}</span>
                </>
            ); 
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
          id:"createdBy",
          cell: ({ getValue }: { getValue: () => User }) => {
            const user = getValue() && getValue().name;
            return <span>{user}</span>;
          },
            meta:{
                style :{
                textAlign:'center',
                }
            }
        },
        {
            header: `${t('startDate')}`,
            accessorKey: 'startDate',
            id:"startDate",
            cell: ({ getValue, row }) => {
              const startDate = getValue() && getValue();
              const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
              const _id = row.original._id
              return (
                  <>  
                      <span
                      onClick={()=>handleCellClick(
                          {
                              name:'startDate', 
                              value:startDate, 
                              content:<CustomDateTimePicker
                                  selectedDate={startDate}
                                  onChange={handleDateChange}
                                  showTimeSelect={false}
                                  recordId={_id}
                                  name="startDate"
                                  label=''
                              />, 
                              title:`${t('startDate')}`
                          }
                      )} 
                      className={`cursor-pointer underline italic px-1 rounded-s `}>  {date}</span>
                  </>
              ); 
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
            id:"endDate",
            cell: ({ getValue, row }) => {
              const endDate = getValue() && getValue();
              const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
              const _id = row.original._id
              return (
                  <>  
                      <span
                      onClick={()=>handleCellClick(
                          {
                              name:'endDate', 
                              value:endDate, 
                              content:<CustomDateTimePicker
                                  selectedDate={endDate}
                                  onChange={handleDateChange}
                                  showTimeSelect={false}
                                  recordId={_id}
                                  name="endDate"
                                  label=''
                              />, 
                              title:`${t('endDate')}`
                          }
                      )} 
                      className={`cursor-pointer underline italic px-1 rounded-s `}>  {date || '-'}</span>
                  </>
              ); 
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
                            to={`kickoff/${row.original._id}`} state={{objectId:row.original._id, data:row.original}} title={`${t('kickOff')}`}
                            className="p-1 ml-1  inline-block text-green-700 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words"
                            >
                              <MdRocketLaunch /> 
                        </NavLink>
                        <NavLink
                            to={`maintasks/${row.original._id}`} state={{objectId:row.original._id, data:row.original}} title={`${t('maintasks')}`}
                            className="p-1 ml-1  inline-block text-green-700 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words"
                            >
                              <FaTasks /> 
                        </NavLink>
                        <NavLink
                            to={`view/${row.original._id}`} state={{objectId:row.original._id, data:row.original}} title={`${t('view')}`}
                            className="p-1 ml-1  inline-block text-green-700 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words"
                            >
                              <FaEye /> 
                        </NavLink>
                        <div className='inline-block p-1 ml-1 cursor-pointer hover:bg-primary-light hover:text-primary'>
                            <SubNavigationCell id='' navItems={[]} rowData={{}} onClose={()=>{console.log('closed')}}/>
                        </div>
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



    const getUserData= async({id}:{id:ObjectId})=>{
      const user = await getUsers({id:id});
      if(user)return user
      return false
    }

    const handleDataChange = async (recordId:string|ObjectId, name: string, value: string, selectedData: { _id: string, name: string }) => {
        console.log(recordId, name, value, selectedData);
        setCellData(recordId, value, name); 
    };
    const handleCellClick = ({name, value, content, title}:{name: string, value: string, content:ReactNode, title:string}) => {
        setAlertData({...alertData, isOpen:true, content:content, type:'form', title});
    };

    const handleDateChange = (recordId:string|ObjectId, value: Date | null, name:string)=>{
        console.log(recordId, value, name);
        setCellData(recordId, value, name);
    }

    const setCellData=(recordId:string|ObjectId, value: Date | string | ObjectId| null, name:string)=>{
        setData(prevVal => {
            return prevVal.map(d=>{
                if(d._id === recordId){
                    updateData({id:recordId as unknown as string, newData:{[name]:value}});
                    return {...d, [name]:value};
                }
                return {...d}
            })
        })
    }
    

    // HANDLE CELL CHANGE
    const handleCellChange = (value:Boolean | string, rowData:any)=>{
        if(rowData.id && rowData.field && rowData.row){
            if(rowData.row && rowData.row[rowData.field]){
                rowData.row[rowData.field] = value;
            }
    
            setData((prevValue) => 
                prevValue.map((item) =>
                  item._id === rowData.row._id
                    ? { ...item, ...rowData.row} 
                    : item
                )
            );

            const newData = {[rowData.field]:value};
            updateData({id:rowData.id, newData:{[rowData.field]:value}});
        }

    }

    // UPDTE USER DATA
    const updateData = async({id, newData}:{id:string, newData:any})=>{
            
        try{
            const response = await addUpdateRecords({type: recordType, checkDataBy:[], action:"update", id, body:{ ...newData}}); 
            if(response.status === 'success'){
                const content = `${t(`RESPONSE.${response.code}`)}`;
                // setAlertData({...alertData, isOpen:true, title:"Success", type:"success", content});
                setFlashPopupData({...flashPopupData, isOpen:true, message:content, type:"success"});

            }else{
                const content = `${t(`RESPONSE.${response.code}`)}`;
                setAlertData({...alertData, isOpen:true, title:"Fail", type:"fail", content})
            }
        }catch(err){
            console.log(err)
        }
    }


    const getRecords = async () => {
        setLoader(true);
        try {
            const filters:QueryFilters = {
                // isActive:true,
                // createdAt:{date:'23.09.2024', format:'DD.MM.YYYY'}
            }

            const orderBy:OrderByFilter={
                priority:'asc',
            }
            const res = await getRecordsWithFilters({
                type: "projects", 
                limit:paginationData.limit as unknown as number, 
                pageNr:paginationData.currentPage as unknown as number, 
                populateFields:['createdBy'],
                filters,
                orderBy
            });  
            if (res.status === "success") {
                setData(res.data || []);
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

    const onDelete = (data:any)=>{
        if(data.status === "success"){ 
          getRecords();
        }else{
          console.error({error:data.message, code:data.code}); 
        }
    }

    const handleRowAction = async(data:any)=>{
        setPopupContent({...popupContent, isOpen:!popupContent.isOpen});
        if(data.action){
            if(data.id && data.action === 'delete'){
                try{
                    try{
                        const response = await deleteRecordById({type:recordType, body:data});
                        if(response.status === "success"){ 
                            getRecords();
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


    const handlePageChange =  (page: number) => {
        setPaginationData({...paginationData, currentPage:page})
    };
    return (
        <div className='p-4'>
            {loader ? (
                <Loader type="full" loaderType="bounce" /> // Use Loader component with type and loaderType
            ) : (
                <div className='data-wrap'>
                    {data.length > 0 ? (
                        <div className='relative bg-white p-4 rounded-md overflow-y-auto w-full'>
                            <DataTable columns={columns} data={data}/>
                            <Pagination
                                currentPage={paginationData.currentPage} 
                                totalPages={paginationData.totalPages} 
                                onPageChange={handlePageChange} 
                                totalRecords={paginationData.totalRecords}
                            /> 
                            {/* <Pagination
                                currentPage={paginationData.currentPage} 
                                totalPages={paginationData.totalPages} 
                                onPageChange={handlePageChange} 
                            /> */}
                                <ConfirmPopup
                                    isOpen={popupContent.isOpen}
                                    onClose={() => setPopupContent({...popupContent, isOpen:!popupContent.isOpen})}
                                    title={popupContent.title ? popupContent.title : ''}
                                    data={popupData}
                                    content={popupContent.content} 
                                    yesFunction={(data)=>handleRowAction(data)} 
                                    noFunction={()=>setIsPopupOpen(!isPopupOpen)}                                
                                />
                        </div>
                        
                    ) : (
                        <p>{t('noData')}</p>
                    )}
                </div>
            )}

            <CustomAlert
                onClose = {()=> setAlertData({...alertData, 'isOpen':!alertData.isOpen})}
                isOpen ={alertData.isOpen}
                content = {alertData.content}
                title = {alertData.title}
                type={alertData.type || 'info'}
        />

        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>
        

        </div>

    );
};

export default AllProjects;

