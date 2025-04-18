import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import { AlertPopupType, FlashPopupType, MainTask, NavItem, Project, User } from '@/interfaces';
import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom';
import MainTaskForm from './MainTaskForm';
import { ObjectId } from 'mongodb';
import { endOfDay, format } from 'date-fns';
import path from 'path';
import { useTranslation } from 'react-i18next';
import { FaAd, FaPencilAlt, FaTasks } from 'react-icons/fa';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { CustomAlert, FlashPopup } from '../../../../components/common';
import { ColumnDef } from '@tanstack/react-table';
import { CustomDropdown } from '../../../../components/forms';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { TaskStatuses } from '../../../../config/predefinedDataConfig';
import CustomDateTimePicker2 from '../../../../components/forms/CustomDateTimePicker';
import DataTable from '../../../../components/table/DataTable';
import CustomContextMenu from '../../../../components/common/CustomContextMenu';
import { DeleteById } from '../../../../components/actions';
interface ArgsType {
    cid?:string | null;
    action?:"add" | "update";
    data?: Project; 
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
    checkDataBy?:string[];
}

const pinnedColumns = ['name'];
const fixedWidthColumns = ['startDate', 'dueDate', 'endDate', 'action'];

const MainTasksProject:React.FC<ArgsType> = ({cid, action, data, checkDataBy=['name'], setSubNavItems}) => {
  const {id} = useParams();
  const {t} = useTranslation();
  const [projectData, setProjectData] = useState<Project>();
  const [projectId, setProjectId] = useState<ObjectId | string | null>(cid ? cid : id ? id : null);
  const [mainTasks, setMainTasks] = useState<MainTask[]>();
  const [editTask, setEditTask] = useState<MainTask | null>();
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});


  const tdClasses = 'p-2 text-xs';


  const navItems: NavItem[] = [
    { link: "projects", title: "projects_all" },
    { link: `projects/kickoff/${cid || id}`, title: "kickoff" },
    { link: `projects/tasks/${cid || id}`, title: "tasks" },
  ];

  const onDelete = (delData:any)=>{
    if(delData.status === "success"){ 
      getData();
    }else{
      console.error({error:delData.message, code:delData.code}); 
    }
}

  //---------- table columns model
  const columns:ColumnDef<MainTask, any>[] = useMemo(()=>[
    {
      header: '',
      id:"actions_cell",
      cell: ({ getValue, row }) => { 
        const cid = getValue() && getValue();
        const _id = row.original._id ? row.original._id as unknown as string : '';
        const _pid = row.original._pid ?  row.original._pid : null;
        return (
            <div>
                 <div>
                    <CustomContextMenu >
                            <ul>
                                <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                  <NavLink
                                     to={`${window.location.pathname.replace(/\/[^/]+\/maintasks\/[^/]+$/, '/maintasks/tasks/' + row.original._id)}`}
                                      state={{objectId:row.original._id, data:row.original}} title={`${t('maintasks')}`}
                                      className="flex justify-between items-center text-xs gap-1 hover:text-primary cursor-pointer whitespace-normal break-words"
                                      >
                                        <div>
                                          {t('tasks')}
                                        <span className='ml-1 py-0.7 px-1 bg-slate-200 rounded-sm text-slate-800'>
                                        {row.original.subtasks && row.original.subtasks.length > 0 ? <>{row.original.subtasks.length}</>:
                                        0
                                        }
                                        </span>
                                        </div>

                                        <FaTasks /> 
                                  </NavLink>
                                </li>
                                <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                    <div className='text-xs flex justify-between hover:text-green-700/50 cursor-pointer whitespace-normal break-words' 
                                    data-close-menu='true'
                                        onClick={()=>addUpdateMainTask(_pid, action='update', row.original)}
                                    >
                                        {t('update')} <FaPencilAlt />
                                    </div>
                                  </li>
                                <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                  <DeleteById text={t('delete')} data={{id:_id, type:'maintasks', page:"projects"}} content={`Delte Project: ${row.original.name}`} onYes={onDelete}/>
                                </li>
                            </ul>
                        </CustomContextMenu>
                </div>
            </div>
        )
      },
        meta:{
            style :{
            textAlign:'left',
            width:'30px'
            },
            noStyle:true,
        },
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
      header: `${t('status')}`,
      accessorKey: 'status',
      id:"status",
      cell: ({ getValue, row }) => {
        const status = getValue() && getValue();
        const _id = row.original._id
        return (
            <div className={`flex justify-center items-center ${getColorClasses(status)} text-center text-[10px]`}>  
                <div className='w-full rounded-sm'>
                    <CustomDropdown 
                            data={TaskStatuses} 
                        label={''} 
                        style='table'
                            name='status'
                        onChange={handleDataChange} selectedValue={status} recordId={_id} 
                        />
                </div>
            </div>
        ); 
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
            <div className={`flex relative w-full border-b bg-transparent`}>  
              <CustomDateTimePicker2 
                  selectedDate={startDate}
                  onChange={handleDateChange}
                  showTimeSelect={false}
                  recordId={_id}
                  name="startDate"
                  label=''
                  style='table'
              />
            </div>
        ); 
      },
        meta:{
            style :{
            textAlign:'center',
            width:'120px'
            }
        }
    },
    {
      header: `${t('dueDate')}`,
      accessorKey: 'dueDate',
      id:"dueDate",
      cell: ({ getValue, row }) => {
        const dueDate = getValue() && getValue();
        const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
        const _id = row.original._id
        return (
            <div className={`flex relative w-full border-b bg-transparent`}>  
              <CustomDateTimePicker2 
                  selectedDate={dueDate}
                  onChange={handleDateChange}
                  showTimeSelect={false}
                  recordId={_id}
                  name="dueDate"
                  label=''
                  style='table'
              />
            </div>
        ); 
      },
        meta:{
            style :{
            textAlign:'center',
            width:'120px'
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
            <div className={`flex relative w-full border-b bg-transparent`}>  
              <CustomDateTimePicker2 
                  selectedDate={endDate}
                  onChange={handleDateChange}
                  showTimeSelect={false}
                  recordId={_id}
                  name="endDate"
                  label=''
                  style='table'
              />
            </div>
        ); 
      },
        meta:{
            style :{
            textAlign:'center',
            width:'120px'
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
      header: `${t('responsiblePerson')}`,
      accessorKey: 'responsiblePerson',
      id:"responsiblePerson",
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
      header:`${t('tasks')}`,
      id:'tasks',
      cell: ({ row }: { row: any }) => (
          <div style={{ textAlign: 'center' }} className='hover:bg-white rounded-sm hover:shadow-sm'>
              {/* {row.original.isEditable && <></>
              } */}
              <div className='flex align-center justify-center flex-row py-[1px]'>
              <NavLink
                to={`${window.location.pathname.replace(/\/[^/]+\/maintasks\/[^/]+$/, '/maintasks/tasks/' + row.original._id)}`}// Dynamically build the URL using the _id
                state={{ objectId: row.original._id, data: row.original }} // Passing the _id and data in state
                title={`${t('maintasks')}`}
                className="p-1 ml-1 flex justify-center items-center inline-block text-green-700 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words"
              >
                <FaTasks /> 
                <span className='ml-1 py-0.7 px-1 bg-slate-200 rounded-sm text-slate-800'>
                  {row.original.subtasks && row.original.subtasks.length > 0 ? (
                    <>{row.original.subtasks.length}</>
                  ) : (
                    0
                  )}
                </span>
              </NavLink>
              </div>
          </div>
      ),
      meta:{
          style :{
          textAlign:'center',
          width:"80px"
          }
      }
  },
    {
      header: `${t('action')}`,
      id:"action",
      cell: ({ row }:{ row: any }) => {
        const _id = row.original._id
        const _pid = row.original._pid
        return (
          <div className='cursor-pointer flex justify-center hover:text-green-500' 
          onClick={()=>addUpdateMainTask(_pid, action='update', row.original)}
      >
          <FaPencilAlt /> 
      </div>
        ); 
      },
        meta:{
            style :{
            textAlign:'center',
            width:'50px'
            }
        }
    },
  ],[]);

  //---------- table columns model end

  useEffect(()=>{
      if(!cid){
        cid = id;
      }
      getData();
      setSubNavItems && setSubNavItems(navItems);
  }, []);

  useEffect(()=>{
      getData();
      setEditTask(null);
  }, [mainTasks]);

  const handleDataChange = async (recordId:string|ObjectId, name: string, value: string, selectedData: { _id: string, name: string }) => {
    console.log(recordId, name, value, selectedData);
    if(recordId && name && value){
      const nData = {[name]:value};
      updateData(recordId, nData);
    }
  };
  const handleDateChange = (recordId:string|ObjectId, value: Date | null, name:string)=>{
    console.log(recordId, value, name);
    if(recordId && name && value){
      const nData = {[name]:value};
      updateData(recordId, nData);
    }
  }

const updateData = async(id:string|ObjectId, newData:any)=>{
  if(id && newData){
    try{
      const res = await addUpdateRecords({id:id as unknown as string, action:'update', type:'maintasks', body:{...newData}});
      if(res){
        const message = `${t(`RESPONSE.${res.code}`)}`;
        if(res.status === 'success'){
          setFlashPopupData({...flashPopupData, isOpen:true, message, type:'success'});
          getData();
        }else{
          setFlashPopupData({...flashPopupData, isOpen:true, message, type:'fail'});
        }
      }
    }catch(err){
      console.log(err);
    }
  }
}

  const getData = async ()=>{
    try{
          const populateFields = [
                { 
                path: 'mainTasks',
                populate: [
                  { path: 'createdBy' },
                  { path: 'responsiblePerson' }
                ]
              }
          ]
          const pid = cid ? cid : id;
          if(pid){
              const res = await getRecordWithID({id:pid, populateFields, type:'projects'});
              console.log(res);

              if(res.status === 'success' && res.data){
                  setProjectData(res.data);
                  data = {...res.data}
                  // setMainTasks(data?.mainTasks ? data.mainTasks as unknown as MainTask[] : [])
              }

          }
      }catch(error){
          console.log(error);
      }
  }


  const updateMainTasks = (value:MainTask[])=>{
    if(value){
      setMainTasks(value);
    }
    
    console.log(value);
  }

  const addUpdateMainTask = (pid:string | ObjectId | null, action:string, taskData:MainTask | null)=>{
    if(pid){
        if(action === 'add'){
            setAlertData({...alertData, isOpen:true, type:'form', title:`${t("add")}`,
                content:<MainTaskForm action='add'  onChange={updateMainTasks} pid={pid}
                mainTasks={data && data.mainTasks as unknown as MainTask[] || []}
                />
            })
        }
        if(action === 'update' && taskData){
            setAlertData({...alertData, isOpen:true, type:'form',title:<>{t("update")} <span className='text-primary'>{taskData.name}</span></>,
                content:<MainTaskForm action='update'  onChange={updateMainTasks} pid={pid}
                mainTask={taskData}
                mainTasks={data && data.mainTasks as unknown as MainTask[] || []}
                />
            })
        }
    }
  }

  return (
    <div>
      {projectData && 
      <div>
        <header className='flex justify-between items-center'>
          <h1 className='text-lg text-primary font-bold'>{projectData.name}</h1>
          <div className='flex justify-center items-center btn btn-outline text-sm p-2'
            onClick={()=>addUpdateMainTask(projectId, 'add', null)}
          >
            <IoMdAdd /> {t('NAV.maintasks_add')}
          </div>
        </header>
        <div className='main'>
          <div className='my-4 mb-7 card bg-white'>
            {projectData?.mainTasks && 
              <DataTable columns={columns} data={projectData.mainTasks} 
                pinnedColumns={pinnedColumns}
                fixWidthColumns={fixedWidthColumns}
              />
            }
          </div>
          {/* <div>
            <MainTaskForm pid={projectId} onChange={updateMainTasks} action={editTask ? 'update' : 'add'} mainTask={editTask} mainTasks={data && data.mainTasks as unknown as MainTask[] || []}/>
          </div> */}
        </div>
      </div>
      }

        <CustomAlert
          onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
          isOpen={alertData.isOpen}
          content={alertData.content}
          title={alertData.title}
          type={alertData.type || 'info'}  
        />
        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>

    
    </div>
  )
}

export default MainTasksProject
