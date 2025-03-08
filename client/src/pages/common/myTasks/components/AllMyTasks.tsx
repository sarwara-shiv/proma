import DataTable from '../../../../components/table/DataTable';
import { Headings, Loader, NoData } from '../../../../components/common';
import { getRecordsWithFilters, getRecordsWithLimit, workLogActions } from '../../../../hooks/dbHooks';
import { MainTask, OrderByFilter, QueryFilters, NotEqualTo, Task, User, Project, WorkLog, TasksByProject } from '../../../../interfaces';
import { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { compareDates, getDatesDifference } from '../../../../utils/dateUtils';
import { useAuth } from '../../../../hooks/useAuth';
import { IoPlay, IoPauseSharp } from "react-icons/io5";
import { useAppContext } from '../../../../context/AppContext';
import { filterTaskByProject } from '../../../../utils/tasksUtils';
import MyTasksByProject from './MyTasksByProject';

const pinnedColumns = ['actions','project','_cid', 'name', 'actions_cell'];
const fixedWidthColumns = ['actions_cell', '_cid'];

const AllMyTasks = () => {
    const {activeWorkLog, setActiveWorkLog, activeDailyReport, setActiveDailyReport} = useAppContext();
    const {user} = useAuth();
    const {t} = useTranslation();
    const [records, setRecords] = useState<Task[]>();
    const [tasksByProject, setTasksByProject] = useState<TasksByProject[]>([]);
    const [loader, setLoader] = useState(true);

    useEffect(()=>{
        getData();
        getActiveWorkLog();
    },[]); 

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
            console.log(error);
        }
    }

    // get all tasks
    const getData = async()=>{
        setLoader(true);
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
                    console.log(fTasks);
                }
            }
            setLoader(false);
            
        }catch(err){
            setLoader(false);
           
        }
    }


    const startWorkLog = async({task}:{task:Task})=>{
        try{
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
                    console.log('closing current task');
                }else{
                    id = null
                    console.log("creating new task / closing current task");
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

                const res = await workLogActions({type:'start', body:{task:taskID, populateFields, project, id}});
                
                if(res.status === 'success'){
                    
                    if(res.code === 'worklog_stopped'){
                        setActiveWorkLog(null);
                    }
                    if(res.data){
                      
                        setActiveWorkLog(res.data); 
                    }
                }else{
                    console.error('not started');
                }
            }else{
                console.error('no task or project found');
            }
        }catch(error){
        }
    }

    const columns: ColumnDef<Task, any>[] = useMemo(() => [
        {
            header: `${t('actions')}`,
            id:"actions",
            cell: ({ getValue, row }) => { 
                const task = row.original;
                const taskId = activeWorkLog && activeWorkLog.task ? typeof activeWorkLog.task === 'object' && activeWorkLog.task !== null ? (activeWorkLog.task as unknown as Task)._id : activeWorkLog.task : null;
              return (
                  <div onClick={()=>startWorkLog({task: task as unknown as Task})}
                  className={` px-1 font-bold flex  justify-center items-center 
                    text-xl rounded-md text-center cursor-pointer
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
                      {cid}
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
                      {cid}
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
    <div className='mt-8 p-4'>
        {loader ? <Loader type='full'/>: 
        <>
            <div className='mb-8'>
                <Headings text={`${t('PAGES.myTasks_active')}`} classes=''/>
                <div className='card bg-white mt-2'>
                    {activeWorkLog && activeWorkLog.task ? (
                        <div className='flex flex-wrap gap-2 text-sm p-2'>
                            <div className='inline-block px-2 py-1 rounded-md bg-slate-200/60'><span className='text-slate-500 '>{t('project')}</span> : {(((activeWorkLog.task as unknown as Task)._mid as unknown as MainTask)._pid as unknown as Project).name}</div>
                            <div className='inline-block px-2 py-1 rounded-md bg-slate-200/60 '><span className='text-slate-500 '>{t('mainTask')}</span> : {((activeWorkLog.task as unknown as Task)._mid as unknown as Task).name}</div>
                            <div className='inline-block px-2 py-1 rounded-md bg-slate-200/60 '><span className='text-slate-500 '>{t('task')}</span> : {(activeWorkLog.task as unknown as Task).name}</div>
                            <div className='inline-block px-2 py-1 rounded-md bg-slate-200/60 '><span className='text-slate-500'>{t('assignedBy')}</span> : {(activeWorkLog.user as unknown as User).name}</div>
                            <div className='inline-block px-2 py-1 rounded-md bg-slate-200/60 '><span className='text-slate-500 '>{t('assignedDate')}</span> : 
                                {(activeWorkLog.task as unknown as Task).assignedDate ? format(((activeWorkLog.task as unknown as Task).assignedDate) as unknown as Date, 'dd.MM.yyyy') : ''}
                            </div>
                        </div>
                    ) :(
                        <NoData />
                    )}
                </div>
            </div>

            {/* Show tasks by project */}
            {tasksByProject && tasksByProject.length>0 ? <MyTasksByProject tasks={tasksByProject}/> : <NoData />}

            {/* Show tasks in tabular form */}
            {records && records.length > 0 && 
            <div>
                <Headings text={`${t('PAGES.myTasks_assigned')}`} classes='mb-3'/>
                <div className='card bg-white'>
                    <DataTable pinnedColumns={pinnedColumns} fixWidthColumns={fixedWidthColumns} data={records} columns={columns}/>
                </div>
            </div>
            
            }
        
        </>
            
        }
    </div>
  )
}

export default AllMyTasks
