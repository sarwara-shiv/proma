import DataTable from '../../../../components/table/DataTable';
import { CustomPopup, Headings, Loader, NoData } from '../../../../components/common';
import { getRecordsWithFilters, getRecordsWithLimit, searchTasksAI, workLogActions } from '../../../../hooks/dbHooks';
import { MainTask, OrderByFilter, QueryFilters, NotEqualTo, Task, User, Project, WorkLogType, TasksByProject, CustomPopupType } from '../../../../interfaces';
import { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { compareDates, getDatesDifference } from '../../../../utils/dateUtils';
import { IoPlay, IoPauseSharp } from "react-icons/io5";
import { useAppContext } from '../../../../context/AppContext';
import { filterTaskByProject } from '../../../../utils/tasksUtils';
import MyTasksByProject from './MyTasksByProject';
import { CustomInput, RichTextArea } from '../../../../components/forms';
import { JSX } from 'react/jsx-runtime';
import {useAuthContext } from '../../../../context/AuthContext';
import CustomSmallButton from '../../../../components/common/CustomSmallButton';
import { IoMdSearch } from 'react-icons/io';
import LeadChatbot from '../../../../components/ai/LeadChatbot';
import LeadForm from '../../../../components/ai/LeadForm';

const pinnedColumns = ['actions','project','_cid', 'name', 'actions_cell'];
const fixedWidthColumns = ['actions_cell', '_cid'];

const AllMyTasks = () => {
    const {activeWorkLog, setActiveWorkLog, activeDailyReport, setActiveDailyReport} = useAppContext();
    const {user} = useAuthContext();
    const {t} = useTranslation();
    const [records, setRecords] = useState<Task[]>();
    const [tasksByProject, setTasksByProject] = useState<TasksByProject[]>([]);
    const [clickedTask, setClickedTask] = useState<Task|null>(null)
    const [loader, setLoader] = useState(true);
    const [queryString, setQueryString] = useState<string>('');
    const [taskNotes, setTaskNotes] = useState<string>('');
    const [toggleTaskData, setToggleTaskData] = useState<{note:string}>({note:''})
    const [custoPopupData, setCustomPopupData] = useState<CustomPopupType>({isOpen:false, title:'', content:''})

    useEffect(()=>{
        getData();
        getActiveWorkLog();
    },[]); 

    useEffect(() => {
       
    }, [taskNotes]);

    // get active task
    const getActiveWorkLog = async()=>{
        try{
            if(user && user._id){
                let filters:QueryFilters = {
                    status:'active',
                    user: user._id as unknown as string
                }
                const populateFields=[
                    {path:'user'}, 
                    {path:'task',
                        populate: [
                            {path:'_mid',
                                populate:[
                                    {path:'_pid'}
                                ]
                            },
                            {path:'assignedBy'},
                        ]
                    }, 
                    
                ];
                const res = await getRecordsWithFilters({type:'worklogs', limit:1, populateFields, filters, orderBy:{status:'asc'}, pageNr:1});
                if(res){
                    if(res.status == 'success' && res.data && res.data.length > 0){
                        setActiveWorkLog(res.data[0]);
                    }else{
                        setActiveWorkLog(null);
                    }
                }
            }
        }catch(error){
            console.error(error);
        }
    }

    // get all tasks
    const getData = async()=>{
        setLoader(true);
        setTasksByProject([]);
        setRecords([]);
        try{
            const populateFields=[
                {path:'_mid'}, 
                {path:'_mid',
                    populate: [
                        {
                            path:'_pid'
                        }
                    ]
                }, 
                {path:'responsiblePerson'}, 
                {path:'assignedBy'}
            ];
            const orderBy:OrderByFilter={
                priority:'asc',
                assignedDate:'asc',
                createdAt:'asc',
                _mid:'asc',
                status:'asc',
            }

            // const notEqualTo:NotEqualTo={
            //     type:'notEqualTo',
            //     value:'completed'
            // }

            let filters:QueryFilters = {
                level:1,
            }

            const responsiblePerson = user && user._id ? user._id as unknown as string : false;
            if(responsiblePerson) {
                filters = {...filters, responsiblePerson}
            }

            const res = await getRecordsWithFilters({type:'tasks', limit:1000, orderBy, filters, pageNr:1, populateFields});
            if(res){
                if(res.status === 'success'){
                    setRecords(res.data);
                    const fTasks = filterTaskByProject(res.data);
                    setTasksByProject(fTasks.byProject);
                   
                }else{
                    setTasksByProject([]);
                }
            }
            setLoader(false);
            
        }catch(err){
            setLoader(false);
           
        }
    }

    // search ai tasks
    const searchTasks = async(query:string)=>{
        try{
            const res = await searchTasksAI({type:"tasks", query});
            console.log(res);
        }catch(error){
            console.error(error);
        }
    }


    // start stop worklog
    const startWorkLog = async({task, note=''}:{task:Task, note?:string})=>{
        
        try{
            const taskID = task ? task._id : null;
            const project = task._mid && task._mid && (task._mid as unknown as MainTask)._pid ? ((task._mid as unknown as MainTask)._pid as unknown as Project)._id : null;
            let id = activeWorkLog && activeWorkLog._id ? activeWorkLog._id : null;

            if(taskID && project){
                let isCurrent = false;
               
                if(activeWorkLog && activeWorkLog.task && (typeof activeWorkLog.task === "object" && activeWorkLog.task !== null)){
                    if(taskID === (activeWorkLog.task as unknown as Task)._id){
                        isCurrent = true;
                    }
                }else{
                    if(activeWorkLog && activeWorkLog.task && taskID === activeWorkLog.task){
                        isCurrent = true;
                    }
                }

                const populateFields=[
                    {path:'user'}, 
                    {path:'task',
                        populate: [
                            {path:'_mid',
                                populate:[
                                    {path:'_pid'}
                                ]
                            },
                            {path:'assignedBy'},
                        ]
                    }, 
                    
                ];

                const res = await workLogActions({type:'start', body:{task:taskID, notes:taskNotes, populateFields, project, id}});
                if(res.status === 'success'){
                    // setTaskNote('');

                    if(res.code === 'worklog_stopped'){
                        setActiveWorkLog(null);
                    }
                    if(res.data){
                        setActiveWorkLog(res.data); 
                    }
                }else{
                    // setTaskNote('');
                    console.error('not started');
                }
            }else{
                console.error('no task or project found');
            }
        }catch(error){
        }
        closePopup();
    }




    /**
     * 
     * HANDLE WORKLOG TOGGLE
     */
    const toggleWorklog = ({task}:{task:Task})=>{
        let text: string | JSX.Element;
        const taskID = task ? task._id : null;
        const project = task._mid && task._mid ? (task._mid as unknown as Project)._id : null;
        let id = activeWorkLog && activeWorkLog._id ? activeWorkLog._id : null;

        if(taskID && project){
            let isCurrent = false;
            
            if(activeWorkLog && activeWorkLog.task && (typeof activeWorkLog.task === "object" && activeWorkLog.task !== null)){
                if(taskID === (activeWorkLog.task as unknown as Task)._id){
                    isCurrent = true;
                }
            }else{
                if(activeWorkLog && activeWorkLog.task && taskID === activeWorkLog.task){
                    isCurrent = true;
                }
            }

            if(isCurrent){
                text = <div>Are you sure you want to close current Task? <span className="font-bold text-primary">{(activeWorkLog?.task as unknown as Task).name} </span></div>;
               
            }else{
                if(id){
                    text = <div>are you sure you want to close task? <span className="font-bold text-primary">"{(activeWorkLog?.task as unknown as Task).name}"</span> and open New Task <span className="font-bold text-primary">"{task.name}"</span></div>;
                    
                }else{
                   
                }
            }
        }
        if(id){
            setClickedTask(task);
            setCustomPopupData((res:CustomPopupType)=>{
                return ({...res, isOpen:true, data:task, 
                content:<>
                    <div className='text-xs mb-2'>{text}</div><RichTextArea name="textarea"
                        onChange={(name, value)=>richtTextonChange(value)} label='Add Notes' height='150' maxHeight='150'
                    />    
                    </>
                })
            })
        }else{
            startWorkLog({task});
        }
    }

    const richtTextonChange = (value:string)=>{
        setTaskNotes((prevVal)=>{
            return value
        }); 

    }

    // On Stop Work Log
    const onStopWorklog = async()=>{
       
        if(clickedTask){
            try{
                await startWorkLog({task:clickedTask});
                closePopup();
            }catch(error){
                console.error(error);
            }
        }
    }

    // closePopup
    const closePopup = ()=>{
       
        setTaskNotes('');
        setClickedTask(null);
        setCustomPopupData((res:CustomPopupType)=>{
            return ({...res, isOpen:false, title:'', content:''});
        })
    }

    const columns: ColumnDef<Task, any>[] = useMemo(() => [
        {
            header: `${t('actions')}`,
            id:"actions",
            cell: ({ getValue, row }) => { 
                const task = row.original;
                const taskId = activeWorkLog && activeWorkLog.task ? typeof activeWorkLog.task === 'object' && activeWorkLog.task !== null ? (activeWorkLog.task as unknown as Task)._id : activeWorkLog.task : null;
              return (
                  <div onClick={()=>toggleWorklog({task: task as unknown as Task})}
                  className={` px-1 font-bold flex  justify-center items-center hover:text-green-500
                    text-xl rounded-md text-center cursor-pointer ${taskId && taskId === task._id ? 'text-green-500' : 'text-slate-400'}
                  `}>
                    {taskId && taskId === task._id ? <IoPauseSharp/> : <IoPlay />}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'center',
                  width:'40px'
                  }
              }
          },
        {
            header: `#`,
            accessorKey: '_cid',
            id:"_cid",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
          {
            header: `${t('project')}`,
            accessorKey: '_mid',
            id:"project",
            cell: ({ getValue, row }) => { 
              const cid = getValue() ? getValue() as unknown as MainTask : null;
              const pid = cid && cid._pid ? cid._pid as unknown as Project : '';
              return (
                  <div>
                      {pid ? pid.name : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('name')}`,
            accessorKey: 'name',
            id:"name",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('maintask')}`,
            accessorKey: '_mid',
            id:"maintask",
            cell: ({ getValue, row }) => { 
              const cid = getValue() ? getValue() as unknown as MainTask : null;
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid ? cid.name : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        
        {
            header: `${t('responsiblePerson')}`,
            accessorKey: 'responsiblePerson',
            id:"responsiblePerson",
            cell: ({ getValue, row }) => { 
              const cid = getValue() ? getValue() as unknown as User : null;
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid ? cid.name : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('assignedBy')}`,
            accessorKey: 'assignedBy',
            id:"assignedBy",
            cell: ({ getValue, row }) => { 
              const cid = getValue() ? getValue() as unknown as User : null;
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid ? cid.name : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('status')}`,
            accessorKey: 'status',
            id:"status",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div className={`${getColorClasses(cid)} rounded-md px-1`} >
                      {t(cid)}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'center',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('priority')}`,
            accessorKey: 'priority',
            id:"priority",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div className={`${getColorClasses(cid)} rounded-md px-1`} >
                      {t(cid)}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'center',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('createdAt')}`,
            accessorKey: 'createdAt',
            id:"createdAt",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid ? format(cid, 'dd.MM.yyyy') : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('dueDate')}`,
            accessorKey: 'dueDate',
            id:"dueDate",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const _id = row.original._id ? row.original._id as unknown as string : '';
              return (
                  <div>
                      {cid ? format(cid, 'dd.MM.yyyy') : ''}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'left',
                  width:'80px'
                  }
              }
          },
        {
            header: `${t('dueDays')}`,
            id:"due",
            cell: ({ getValue, row }) => { 
              const cid = getValue() && getValue();
              const sDate = row.original.startDate? row.original.startDate : null;
              const dDate = row.original.dueDate ? row.original.dueDate : null;
              const value:{years:number, months:number, days:number, totalDays:number} | null = sDate && dDate ? getDatesDifference(new Date(), dDate) : null
              return (
                  <div className={` px-1 font-bold rounded-md
                    ${value && value.totalDays && value?.totalDays < 0 ? 'bg-red-100 text-red-500 ' : 'bg-green-100 text-green-500 '}
                  `}>
                      {value && <div>
                          {value.totalDays ?  <span>{value.totalDays}</span> : ''} 
                          {/* {value.days && value.days > 0 ?  <span>{value.days} : Days</span> : ''} 
                          {value.months && value.months > 0 ?  <span>{value.months}: Months</span>:''} 
                          {value.years && value.years > 0 ?  <span>{value.years} : Years</span>:''}  */}
                        </div>}
                  </div>
              )
            },
              meta:{
                  style :{
                  textAlign:'center',
                  width:'80px'
                  }
              }
          },
       
    ], [activeWorkLog]);

  return (
    <div className='p-4'>
        {loader ? <Loader type='full'/>: 
        <>
            <div className='flex items-center'>
                <CustomInput type='text' onChange={(event)=>setQueryString(event.target.value)} />
                <CustomSmallButton type='search'  icon={<IoMdSearch/>} onClick={()=>searchTasks(queryString)}/>
            </div>
            <div className='mb-8'>
                <Headings text={`${t('PAGES.myTasks_active')}`} classes=''/>
                <div className='card bg-white mt-2'>
                    {activeWorkLog && activeWorkLog.task ?  
                    (<>
                        <div className='block px-2 py-1 flex gap-2 items-center justify-between'>
                            <div>
                                <span className='text-primary font-bold text-lg '>{(((activeWorkLog.task as unknown as Task)._mid as unknown as MainTask)._pid as unknown as Project).name}</span>
                                <span className="text-xs px-1 py-0.5 text-slate-500 ml-1 font-normal bg-slate-200/60 rounded-sm">{t(`${(((activeWorkLog.task as unknown as Task)._mid as unknown as MainTask)._pid as unknown as Project).projectType}`)}</span>
                            </div>
                            <div onClick={()=>toggleWorklog({task: (activeWorkLog.task as unknown as Task)})} 
                                className='text-green-500 text-sm flex gap-1 
                                    items-center
                                    py-0.5 px-1
                                    bg-green-100 rounded-md
                                    cursor-pointer btn btn-danger
                                '>
                                {t('stop')}
                            </div>
                        </div>
                        {activeWorkLog.reason && activeWorkLog.isRework &&
                            <div className='inline-block px-2 py-1 rounded-md text-sm'>
                                <span className='text-slate-500 text-xs'>{t('rework')}</span> : {t(activeWorkLog.reason)}
                            </div>
                        }
                        <div className='flex flex-wrap gap-2 text-sm p-2'>
                            <div className='inline-block px-2 py-1 rounded-md bg-slate-200/60 '><span className='text-slate-500 text-xs'>{t('mainTask')}</span> : {((activeWorkLog.task as unknown as Task)._mid as unknown as Task).name}</div>
                            <div className='inline-block px-2 py-1 rounded-md bg-slate-200/60 '><span className='text-slate-500 text-xs '>{t('task')}</span> : {(activeWorkLog.task as unknown as Task).name}</div>
                            <div className='inline-block px-2 py-1 rounded-md bg-slate-200/60 '><span className='text-slate-500 text-xs'>{t('assignedBy')}</span> : {(activeWorkLog.user as unknown as User).name}</div>
                            <div className='inline-block px-2 py-1 rounded-md bg-slate-200/60 '><span className='text-slate-500 text-xs '>{t('assignedDate')}</span> : 
                                {(activeWorkLog.task as unknown as Task).assignedDate ? format(((activeWorkLog.task as unknown as Task).assignedDate) as unknown as Date, 'dd.MM.yyyy') : ''}
                            </div>
                        </div>
                        </>
                    ) :(
                        <NoData content={<div className='text-sm text-slate-500'>{t('noActiveTask')}</div>}/>
                    )}
                </div>
            </div>

            {/* Show tasks by project */}
            {tasksByProject && tasksByProject.length>0 ? 
                <div>
                    <Headings text={`${t('projects')}`} classes='mb-2'/>
                    <MyTasksByProject tasks={tasksByProject}/> 
                </div>
            : 
                <NoData />
            }

            {/* Show tasks in tabular form */}
            {records && records.length > 0 && 
            <div>
                <Headings text={`${t('PAGES.myTasks_assigned')}`} classes='mb-3'/>
                <div className='card bg-white'>
                    <DataTable pinnedColumns={pinnedColumns} fixWidthColumns={fixedWidthColumns} data={records} columns={columns}/>
                </div>
            </div>
            
            }

            {/* <LeadChatbot />
            <LeadForm /> */}
        
        </>
            
        }

        <CustomPopup 
            isOpen={custoPopupData.isOpen}
            onClose={closePopup}
            yesFunction={onStopWorklog}
            noFunction={closePopup}
            data={custoPopupData.data? custoPopupData.data : {}}
            title={custoPopupData.title}
            content={custoPopupData.content}
        />
    </div>
  )
}

export default AllMyTasks

