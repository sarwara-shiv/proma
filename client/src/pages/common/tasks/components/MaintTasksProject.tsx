import { getRecordWithID } from '../../../../hooks/dbHooks';
import { AlertPopupType, FlashPopupType, MainTask, NavItem, Project, User } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import MainTaskForm from './MainTaskForm';
import { ObjectId } from 'mongodb';
import { endOfDay, format } from 'date-fns';
import path from 'path';
import { useTranslation } from 'react-i18next';
import { FaAd, FaPencilAlt } from 'react-icons/fa';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { CustomAlert } from '../../../../components/common';
interface ArgsType {
    cid?:string | null;
    action?:"add" | "update";
    data?: Project; 
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
    checkDataBy?:string[];
}

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

export default MainTasksProject
