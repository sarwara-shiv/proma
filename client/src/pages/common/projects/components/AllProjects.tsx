import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import Loader from '../../../../components/common/Loader';
import DataTable from '../../../../components/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { IoCreateOutline, IoLockClosed } from "react-icons/io5";
import ConfirmPopup from '../../../../components/common/CustomPopup';
import { useTranslation } from 'react-i18next'; 
import { getRecords, deleteRecordById, addUpdateRecords, getRecordsWithLimit } from '../../../../hooks/dbHooks';
import DeleteById from '../../../../components/actions/DeleteById';
import CustomAlert from '../../../../components/common/CustomAlert';
import { NavLink } from 'react-router-dom';
import ToggleBtnCell from '../../../../components/table/ToggleBtnCell';
import { User } from '@/interfaces/users';
import { UserRole } from '@/interfaces/userRoles';
import FlashPopup from '../../../../components/common/FlashPopup';
import { AlertPopupType, FlashPopupType, PaginationProps, Project } from '@/interfaces';
import { getUsers } from '../../../../hooks/getRecords';
import { ObjectId } from 'mongodb';


const AllProjects = () => {
    const {t} = useTranslation();
    const [alertData, setAlertData] = useState<AlertPopupType>({isOpen:false, content:"", type:"info", title:""}); 
    const [data, setData] = useState<Project[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState<any | null>(null);
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
    const [popupContent, setPopupContent] = useState({content:"", title:"", isOpen:false});
    const [loader, setLoader] = useState(true);
    const [paginationData, setPaginationData] = useState<PaginationProps>({currentPage:1,totalRecords:0, limit:2, totalPages:0})
    const [recordType, setRecordType] = useState<string>('projects');


    const columns: ColumnDef<Project, any>[] = useMemo(() => [
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
          header: `${t('status')}`,
          accessorKey: 'status',
          id:"status",
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
          id:"endDate",
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
            header:`${t('actions')}`,
            cell: ({ row }: { row: any }) => (
                <div style={{ textAlign: 'right' }}>
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
                textAlign:'right',
                width:"100px"
                }
            }
        }
      ], []);

    useEffect(() => {
        getRecords();
    }, []);

    const getUserData= async({id}:{id:ObjectId})=>{
      const user = await getUsers({id:id});
      if(user)return user
      return false
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


    const getRecords = async () => {
        setLoader(true);
        try {
            const res = await getRecordsWithLimit({type: "projects", limit:50, pageNr:1, populateFields:['createdBy'] });  
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


 const handlePageChange = (page: number) => {
    setPaginationData({...paginationData, currentPage:page});
    getRecords();
  };


    return (
        <div className='p-4'>
            {loader ? (
                <Loader type="full" loaderType="bounce" /> // Use Loader component with type and loaderType
            ) : (
                <div className='data-wrap'>
                    {data.length > 0 ? (
                        <div>
                            <DataTable columns={columns} data={data}/>
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

