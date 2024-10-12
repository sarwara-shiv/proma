import { getRecordWithID } from '../../../../hooks/dbHooks';
import { AlertPopupType, FlashPopupType, MainTask, NavItem, Project, User } from '@/interfaces';
import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom';
import MainTaskForm from './MainTaskForm';
import { ObjectId } from 'mongodb';
import { endOfDay, format } from 'date-fns';
import path from 'path';
import { useTranslation } from 'react-i18next';
import { FaAd, FaPencilAlt } from 'react-icons/fa';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { CustomAlert } from '../../../../components/common';
import { ColumnDef } from '@tanstack/react-table';
import { CustomDropdown } from '../../../../components/forms';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { TaskStatuses } from '../../../../config/predefinedDataConfig';
import CustomDateTimePicker2 from '../../../../components/forms/CustomDateTimePicker';
import DataTable from '../../../../components/table/DataTable';
interface ArgsType {
    cid?:string | null;
    action?:"add" | "update";
    data?: Project; 
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
    checkDataBy?:string[];
}

const pinnedColumns = ['name'];
const fixedWidthColumns = ['startDate', 'dueDate', 'endDate', 'action'];

const MainTasksProject_backup:React.FC<ArgsType> = ({cid, action, data, checkDataBy=['name'], setSubNavItems}) => {
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

  //---------- table columns model
  const columns:ColumnDef<MainTask, any>[] = useMemo(()=>[
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
            width:'130px'
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
            width:'130px'
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
            width:'130px'
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
    
};
const handleDateChange = (recordId:string|ObjectId, value: Date | null, name:string)=>{
  console.log(recordId, value, name);
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
            setAlertData({...alertData, isOpen:true, type:'form',
                content:<MainTaskForm action='add'  onChange={updateMainTasks} pid={pid}
                mainTasks={data && data.mainTasks as unknown as MainTask[] || []}
                />
            })
        }
        if(action === 'update' && taskData){
            setAlertData({...alertData, isOpen:true, type:'form',
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
          <div className='my-4 mb-7'>
            {projectData?.mainTasks && 
              <DataTable columns={columns} data={projectData.mainTasks} 
                pinnedColumns={pinnedColumns}
                fixWidthColumns={fixedWidthColumns}
              />
            }
            {projectData?.mainTasks && 
              <table className='w-full'>
                <thead>
                  <tr className='text-left text-xs border-b border-slate-400 font-semibold'>
                    <th className={`${tdClasses}`}>Name</th>
                    <th className={`${tdClasses}`}>startDate</th>
                    <th className={`${tdClasses}`}>dueDate</th>
                    <th className={`${tdClasses}`}>endDate</th>
                    <th className={`${tdClasses}`}>createdBy</th>
                    <th className={`${tdClasses}`}>responsible Person</th>
                    <th className={`${tdClasses}`}>status</th>
                    <th className={`${tdClasses} text-center`}>action</th>
                  </tr>
                </thead>
                <tbody>
                  {(projectData.mainTasks as unknown as MainTask[]).map((mTask, index)=>{
                    const createdBy = mTask.createdBy as unknown as User;
                    const rUser = mTask.responsiblePerson as unknown as User;
                    return (
                      <tr key={`mt-${mTask._id}-${index}`} 
                      className='text-sm 
                      text-gray-400
                      border-b
                       odd:bg-slate-100
                      '
                      >
                        <td className={`${tdClasses}`}>{mTask.name}</td>
                        <td className={`${tdClasses}`}>{mTask.startDate && format(mTask.startDate, 'dd.MM.yyyy')}</td>
                        <td className={`${tdClasses}`}>{mTask.dueDate && format(mTask.dueDate, 'dd.MM.yyyy')}</td>
                        <td className={`${tdClasses}`}>{mTask.endDate && format(mTask.endDate, 'dd.MM.yyyy')}</td>
                        <td className={`${tdClasses}`}>{createdBy && createdBy.name}</td> 
                        <td className={`${tdClasses}`}>{rUser && rUser.name}</td> 
                        <td className={`${tdClasses}`}>{t(`${mTask.status}`)}</td>
                        <td className={`${tdClasses} text-center`}>
                            <div className='cursor-pointer flex justify-center hover:text-green-500' 
                                onClick={()=>addUpdateMainTask(mTask._pid, action='update', mTask)}
                            >
                                { editTask && editTask._id === mTask._id ? 
                                    <IoMdClose size={20} className='text-red-500'/> : <FaPencilAlt /> 
                                }
                            </div>
                        </td>
                      </tr>
                    )
                  })}
                 </tbody>
              </table>
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
    </div>
  )
}

export default MainTasksProject_backup
