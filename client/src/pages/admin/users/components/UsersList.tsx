import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import Loader from '../../../../components/common/Loader';
import DataTable from '../../../../components/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { IoCreateOutline, IoLockClosed } from "react-icons/io5";
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
import { AlertPopupType, FlashPopupType, OrderByFilter, PaginationProps, QueryFilters } from '@/interfaces';
import ChangePassword from './ChangePassword';
import Pagination from '../../../../components/common/Pagination';

const pinnedColumns= ['id', 'username'];
const fixedWidthColumns= ['id', 'status', 'createdAt', 'actions', 'role'];
const AllUsers = () => {
    const {t} = useTranslation();
    const [alertData, setAlertData] = useState<AlertPopupType>({isOpen:false, content:"", type:"info", title:""}); 
    const [data, setData] = useState<User[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState<any | null>(null);
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
    const [popupContent, setPopupContent] = useState({content:"", title:"", isOpen:false});
    const [loader, setLoader] = useState(true);
    const [paginationData, setPaginationData] = useState<PaginationProps>({currentPage:1,totalRecords:0, limit:50, totalPages:0})
    const columns: ColumnDef<User, any>[] = useMemo(() => [
        {
          header: `${t('id')}`,
          accessorKey: '_cid',
          id:"id",
            meta:{
                style :{
                textAlign:'left',
                width:'120px'
                }
            }
        },
        {
          header: `${t('username')}`,
          accessorKey: 'username',
          id:"username",
            meta:{
                style :{
                textAlign:'left',
                }
            }
        },
        {
          header: `${t('email')}`,
          accessorKey: 'email',
          id:"email",
            meta:{
                style :{
                textAlign:'left',
                }
            }
        },
        {
            header: `${t('userRole')}`,
            accessorKey: 'role',
            id:"role",
            meta:{
                style :{
                textAlign:'left',
                width:'120px'
                }
            },
            cell:info=>{
                const originalData = info.row.original; 
                const roles = originalData?.roles as unknown as UserRole[]
                const role = roles[0] ? roles[0].name : '';
                return(                 
                    <span>{role}</span>
                )
            }
        },
        {
             header: `${t('status')}`,
            accessorKey: 'isActive',
            id:"status",
            meta:{
                style :{
                textAlign:'center',
                width:'60px'
                }
            },
            cell: (info) => {
                const initialState = info.row.original.isActive ? true :false;
                return (
                    <>  {info.row.original.isActive }
                            <ToggleBtnCell 
                            initialState={initialState} 
                            id={info.cell.id} 
                            name={info.cell.id} 
                            rowData={{id:info.row.original._id, field:"isActive", row:info.row.original}}
                            onChange={handleCellChange}/>
                    </>
              )
            },
        },
        {
          header: `${t('createdAt')}`, 
          accessorKey: 'createdAt',
          id: 'createdAt',
          cell: ({ getValue }: { getValue: () => string }) => {
            const date = new Date(getValue());
            return <span>{format(date, 'dd.MM.yyyy')}</span>;
          },
            meta:{
                style :{
                textAlign:'center',
                width:'80px'
                }
            }
        },
        {
            header:`${t('actions')}`,
            id:'actions',
            cell: ({ row }: { row: any }) => (
                <div style={{ textAlign: 'center' }}>
                    {/* {row.original.isEditable && <></>
                    } */}
                    <div>
                        <DeleteById data={{id:row.original._id, type:"users", page:"auth"}} content={`Delte Role: ${row.original.username}`} onYes={onDelete}/>
                        <NavLink
                            to={`update`} state={{objectId:row.original._id, data:row.original}} title="update"
                            className="p-1 ml-1  inline-block text-green-700 hover:text-green-700/50 cursor-pointer whitespace-normal break-words"
                            >
                              <IoCreateOutline /> 
                        </NavLink>
                        <div onClick={()=>changePassword({id:row.original._id as string, username:row.original.username})} 
                        className="p-1 ml-1  inline-block text-green-700 hover:text-green-700/50 cursor-pointer whitespace-normal break-words"
                            >
                              <IoLockClosed />
                        </div>
                    </div>
                    
                </div>
            ),
            meta:{
                style :{
                textAlign:'center',
                width:"100px"
                }
            }
        }
      ], []);

    useEffect(() => {
        getAllUsers();
    }, [paginationData.currentPage]);

    const changePassword = ({id, username}:{id:string, username:string})=>{
        setAlertData({...alertData, content:<ChangePassword id={id} username={username} />, 'title':`${username}`,  'isOpen':true, 'type':'form'})  
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
            const response = await addUpdateRecords({type: "users", checkDataBy:[], action:"update", id, body:{ ...newData}}); 
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


    const getAllUsers = async () => {
        setLoader(true);
        try {
            const filters:QueryFilters = {
                // isActive:true,
                // createdAt:{date:'23.09.2024', format:'DD.MM.YYYY'}
            }

            const orderBy:OrderByFilter={
                createdAt:'desc'
            }
            const res = await getRecordsWithFilters({
                type: "auth", 
                limit:paginationData.limit as unknown as number, 
                pageNr:paginationData.currentPage as unknown as number, 
                populateFields:['roles'],
                filters,
                orderBy
            });  
            if (res.status === "success") {
                setData(res.data || []);
                // console.log(res);
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
            getAllUsers();
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
                        const response = await deleteRecordById({type:'users', body:data});
                        if(response.status === "success"){ 
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


 const handlePageChange =  (page: number) => {
    setPaginationData({...paginationData, currentPage:page})
    console.log(paginationData);
  };


    return (
        <div className='card bg-white'>
            {loader ? (
                <Loader type="full" loaderType="bounce" /> // Use Loader component with type and loaderType
            ) : (
                <div className='data-wrap'>
                    {data.length > 0 ? (
                        <div>
                            <DataTable columns={columns} data={data}
                                pinnedColumns={pinnedColumns}
                                fixWidthColumns={fixedWidthColumns} 
                            />
                             <Pagination
                                currentPage={paginationData.currentPage} 
                                totalPages={paginationData.totalPages} 
                                onPageChange={handlePageChange} 
                                totalRecords={paginationData.totalRecords}
                            /> 
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

export default AllUsers;

