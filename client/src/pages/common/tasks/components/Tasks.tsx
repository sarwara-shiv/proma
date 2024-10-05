import { getRecordWithID } from '../../../../hooks/dbHooks';
import { AlertPopupType, FlashPopupType, MainTask, NavItem, Project, Task, User } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import MainTaskForm from './MainTaskForm';
import { ObjectId } from 'mongodb';
import { format } from 'date-fns';
import path from 'path';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../../../components/common';
import { IoMdAdd } from 'react-icons/io';
interface ArgsType {
    cid?:string | null;
    pid?:ObjectId | string; // project id
    mtid?: ObjectId | string // main task id
    mainTask?:MainTask // main task
    action?:"add" | "update";
    data?: Project; 
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
    checkDataBy?:string[];
}

const Tasks:React.FC<ArgsType> = ({cid, action, data, checkDataBy, setSubNavItems, mtid}) => {
  const {id} = useParams();
  const {t} = useTranslation();
  const [projectData, setProjectData] = useState<Project>();
  const [projectId, setProjectId] = useState<ObjectId | string>(id ? id : '');
  const [mainTaskId, setMainTaskId] = useState<ObjectId | string>(mtid ? mtid : '');
  const [mainTask, setMainTask] = useState<MainTask>();
  const [subtasks, setSubtasks] = useState<Task[]>();
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
  const [loader, setLoader] = useState(true);


  const thStyles = 'text-xs font-normal text-slate-600 p-2 text-left border border-slate-200';
  const tdStyles = 'text-xs font-normal text-slate-400 p-2 text-left  border border-slate-200';

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
  }, []);

  const getData = async ()=>{
    setLoader(true);
    try{
          const populateFields = [
            { path: '_pid' }, // Populate the project or parent task
            {
              path: 'subtasks',
              populate: [
                {
                  path: 'subtasks',
                  populate: [
                    {
                      path: 'subtasks',
                      populate: [
                        {
                          path: 'subtasks',
                          populate: { path: 'subtasks' },
                        },
                      ],
                    },
                  ],
                },
                { path: 'createdBy' }, 
                { path: 'responsiblePerson' }, 
              ],
            },
          ]
          const pid = cid ? cid : id;
          if(pid){
              const res = await getRecordWithID({id:mainTaskId, populateFields, type:'maintasks'});
              console.log(res);

              if(res.status === 'success' && res.data){
                  setProjectData(res.data._pid);
                  setMainTask(res.data);
                  setSubtasks(res.subtasks);
              }
              setLoader(false);

          }else{
            setLoader(false);
          }
      }catch(error){
        setLoader(false);
          console.log(error);
      }
  }

  return (
    <div>
      {loader ? <Loader type='full'/> :
        <div>
            {projectData && 
            <div className='border-b mb-3 pb-2'>
                <h1 className='text-lg text-primary font-bold'>{projectData.name}

                  {mainTask && 
                    <span className='text-sm text-slate-500 font-bold pl-2'>: {mainTask.name}</span>
                  }
                </h1>
            </div>
            }

            <table className='w-full rounded-sm'>
              <thead>
                <tr className='text-sm font-normal'>
                  <th className='w-[10px] bg-green-200 border border-green-200'></th>
                  <th className={`${thStyles}`}>{t('task')}</th>
                  <th className={`${thStyles}  w-[160px]`}>{t('responsiblePerson')}</th>
                  <th className={`${thStyles} w-[120px]`}>{t('priority')}</th>
                  <th className={`${thStyles} w-[120px]`}>{t('status')}</th>
                  <th className={`${thStyles} w-[80px]`} >{t('dueDate')}</th>
                  {mainTask && mainTask.customFields && mainTask.customFields.map((cf, index)=>{
                    return (
                      <th>{cf.key}</th>
                    );
                  })}
                 <th className='border-b border-t border-l'>
                  <div className='
                  cursor-pointer
                    w-[20px] h-[20px] flex justify-center items-center bg-green-100 rounded-full
                    ml-2 text-green-600
                    hover:bg-green-600 hover:text-green-100 transition-colors ease
                  '>
                    <IoMdAdd />
                  </div>
                 </th>
                </tr>
              </thead>
              <tbody>
                {subtasks && subtasks.map((st, index)=>{
                  const cUser = st.createdBy as unknown as User;
                  const rUser = st.responsiblePerson as unknown as User;
                  return (
                    <tr>
                      <td className='w-[10px] bg-green-200 border border-green-200'></td>
                      <td className={`${tdStyles}`}>{st.name}</td>
                      <td className={`${tdStyles}`}>{rUser.name}</td>
                      <td className={`${tdStyles}`}>{st.status}</td>
                      <td className={`${tdStyles}`}>{st.dueDate ? format(st.dueDate, 'dd.MM.yyyy') : ''}</td>
                      {mainTask && mainTask.customFields && mainTask.customFields.map((cf, index)=>{
                        const fV = st.customFields ? st.customFields.find((tcf)=>tcf.key === cf.key) : null;
                        return (
                          <td>{fV ? cf.value : ''}</td>
                        );
                      })}
                      <td className='border-b border-t border-l'></td>
                    </tr>
                  )
                })}
                <tr>
                  <td className='w-[10px] bg-green-200 border border-green-200'></td>
                  <td 
                  className='border-t border-b border-l p-1'
                  colSpan={mainTask && mainTask.customFields ? mainTask.customFields.length + 6 : 6}>
                      <input type='text' 
                        placeholder={`+ ${t('addTasks')}`}
                        className='
                          text-xs
                          border
                          p-1
                          text-slate-400
                          border-transparent
                          hover:border-slate-300
                          hover:outline-none

                          focus:border-slate-400
                          focus:outline-none
                          w-1/3
                        '
                      >
                      
                      </input>
                  </td>
                </tr>
              </tbody>
            </table>
           

        </div>
      
      
      }

      
    </div>
  )
}

export default Tasks
