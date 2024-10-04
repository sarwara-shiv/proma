import { getRecordWithID } from '../../../hooks/dbHooks';
import { MainTask, NavItem, Project, User } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import MainTaskForm from './components/MainTaskForm';
import { ObjectId } from 'mongodb';
import { format } from 'date-fns';
import path from 'path';
import { useTranslation } from 'react-i18next';
interface ArgsType {
    cid?:string | null;
    action?:"add" | "update";
    data?: Project; 
    setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
    checkDataBy?:string[];
}

const Tasks:React.FC<ArgsType> = ({cid, action, data, checkDataBy, setSubNavItems}) => {
  const {id} = useParams();
  const {t} = useTranslation();
  const [projectData, setProjectData] = useState<Project>();
  const [projectId, setProjectId] = useState<ObjectId | string>(id ? id : '');
  const [mainTasks, setMainTasks] = useState<MainTask[]>();

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
        setSubNavItems(navItems);
  }, []);

  useEffect(()=>{
      getData();
  }, [mainTasks]);

  const getData = async ()=>{
    try{
          const populateFields = [
              {path: 'mainTasks',
                populate:{
                  path:'createdBy'
                }

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

  return (
    <div>
      {projectData && 
      <div>
        <header>
          <h1>{projectData.name}</h1>
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
                    <th className={`${tdClasses}`}>status</th>
                  </tr>
                </thead>
                <tbody>
                  {(projectData.mainTasks as unknown as MainTask[]).map((mTask, index)=>{
                    const createdBy = mTask.createdBy as unknown as User;
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
                        <td className={`${tdClasses}`}>{t(`${mTask.status}`)}</td>
                      </tr>
                    )
                  })}
                 </tbody>
              </table>
            }
          </div>
          <div>
            <MainTaskForm pid={projectId} onChange={updateMainTasks} mainTasks={data && data.mainTasks as unknown as MainTask[] || []}/>
          </div>
        </div>
      </div>
      }
    </div>
  )
}

export default Tasks
