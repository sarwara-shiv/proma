import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import { AlertPopupType, BaseTask, DynamicField, FlashPopupType, MainTask, NavItem, Project, RelatedUpdates, Task, User } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import MainTaskForm from './MainTaskForm';
import { ObjectId } from 'mongodb';
import { format } from 'date-fns';
import path from 'path';
import { useTranslation } from 'react-i18next';
import { CustomAlert, FlashPopup, Loader } from '../../../../components/common';
import { IoMdAdd } from 'react-icons/io';
import CustomFieldForm from '../../../../components/forms/CustomFieldForm';
import DeleteSmallButton from '../../../../components/common/DeleteSmallButton';
import {useAuthContext } from '../../../../context/AuthContext';
import EnterInput from '../../../../components/forms/EnterInput';
import { DeleteById } from '../../../../components/actions';
import { FaAngleRight } from 'react-icons/fa';
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


let DeleteRelatedUpdates:RelatedUpdates[]= [{
 collection:'maintasks',
 field:'subtasks',
 type:'array',
 ids:[]
}]

const TasksBackup:React.FC<ArgsType> = ({cid, action, data, checkDataBy, setSubNavItems, mtid}) => {
  const {id} = useParams();
  const {user} = useAuthContext();
  const {t} = useTranslation();
  const [projectData, setProjectData] = useState<Project>();
  const [projectId, setProjectId] = useState<ObjectId | string>(id ? id : '');
  const [mainTaskId, setMainTaskId] = useState<ObjectId | string>(mtid ? mtid : '');
  const [mainTaskData, setMainTaskData] = useState<MainTask>();
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

  useEffect(()=>{
      updateMainTask();
  }, [mainTaskData?.customFields]);

  // updateMainTask
  const updateMainTask= async()=>{
    try{
      const mid = mainTaskId as unknown as string;
      const res =  await addUpdateRecords({id:mid,  type:'maintasks', action:'update', body:{...mainTaskData}});
      if(res.status === 'success'){
        const content = `${t(`RESPONSE.${res.code}`)}`;
        setFlashPopupData({...flashPopupData, isOpen:true, message:content});
      }

    }catch(error){
      console.log(error);
    }
  }


  // get project data
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
                  setMainTaskData(res.data);
                  DeleteRelatedUpdates[0].ids = [res.data._id];
                  const stasks = res.data.subtasks as unknown as Task[];
                  console.log(res.data.subtasks);
                  setSubtasks(stasks);
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

  // add custom fields to maintask
  const openCustomFieldsPopup = ()=>{
    setAlertData({...alertData, isOpen:true, 
      content:<CustomFieldForm onChange={addCustomFieldsMainTasks} />

    })
  }
  // add custom fields to maintask
  const addCustomFieldsMainTasks = (value:DynamicField)=>{
    console.log(value);
      setMainTaskData((prevVal)=>{
        if (!prevVal) return prevVal; 
        console.log('hasdata');
        let cfields = prevVal?.customFields;
        if(cfields && Array.isArray(cfields)){
          cfields = [...cfields, value];
        }else{
          cfields = [value];
        }
        return {...prevVal, customFields:[...cfields]}
      })
  }

  // delte custom fields from main tasks
  const  deleteCustomField = (index:number, key:string)=>{
    console.log(index, key);
    setMainTaskData((prevVal)=>{
      if (!prevVal) return prevVal; 
      console.log('hasdata');
      let cfields = prevVal?.customFields;
      if(cfields && Array.isArray(cfields)){
        cfields = cfields.filter((d,i)=>{
          if(d.key !== key && i !== index){
            return d;
          }
        })
      }else{
        cfields = cfields;
      }
      if(cfields)
      return {...prevVal, customFields:[...cfields]}
      return {...prevVal}
    })
  }

  // add Tasks
  const addTask = async ({name, value, taskId}:{name:string, value:string, taskId:string|ObjectId|null})=>{
    const mid = mainTaskId as unknown as string;
    const createdBy = user?._id;
    const responsiblePerson = user?._id;
    if(mid && createdBy){
      try{
        let relatedUpdates:RelatedUpdates[]= [];
        if(taskId){
          relatedUpdates= [{
            collection:'tasks',
            field:'subtasks',
            type:'array',
            ids:[taskId]
          }]
        }else{
          relatedUpdates= [{
           collection:'maintasks',
           field:'subtasks',
           type:'array',
           ids:[mid]
         }]
        }
        const res = await addUpdateRecords({action:'add', type:'tasks', relatedUpdates, body:{name:value, _mid:mid, createdBy, responsiblePerson}})
        console.log(res);
        if(res.status === 'success'){
          const content = `${t(`RESPONSE.${res.code}`)}`;
          setFlashPopupData({...flashPopupData, isOpen:true, message:content});
          getData();
        }
      }catch(error){
        console.log(error);
      }
    }
  }


  // delete task
  return (
    <div>
      {loader ? <Loader type='full'/> :
        <div>
            {projectData && 
            <div className='border-b mb-3 pb-2'>
                <h1 className='text-lg text-primary font-bold'>{projectData.name}

                  {mainTaskData && 
                    <span className='text-sm text-slate-500 font-bold pl-2'>: {mainTaskData.name}</span>
                  }
                </h1>
            </div>
            }

            <table className='w-full rounded-sm'>
              <thead>
                <tr className='text-sm font-normal'>
                  <th className='w-[20px]'></th>
                  <th className='w-[3px] bg-green-200 border border-green-200'></th>
                  <th className={`${thStyles}`}>{t('task')}</th>
                  <th className={`${thStyles}  w-[160px]`}>{t('responsiblePerson')}</th>
                  <th className={`${thStyles} w-[120px]`}>{t('priority')}</th>
                  <th className={`${thStyles} w-[120px]`}>{t('status')}</th>
                  <th className={`${thStyles} w-[80px]`} >{t('dueDate')}</th>
                  {mainTaskData && mainTaskData.customFields && mainTaskData.customFields.map((cf, index)=>{
                    return (
                      <th key={`th-${index}`} className={`${thStyles} w-[120px]`} >
                        <div
                          className='relative flex w-full h-full items-center justify-start group'
                        >
                          {cf.key}
                          <div 
                          className='
                             absolute right-0 opacity-0
                              transition-opacity duration-300
                              group-hover:opacity-100
                          '
                          >
                            <DeleteSmallButton  onClick={()=>deleteCustomField(index, cf.key)} 
                              
                              />
                          </div>
                        </div>
                      </th>
                    );
                  })}
                 <th className='border-b border-t border-l'>
                  <div 
                  onClick={openCustomFieldsPopup}
                  className='
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
                  const tskID = st._id;
                  console.log(DeleteRelatedUpdates)
                  return (
                    <tr key={`task-${index}`} className='group'>
                      <td className='w-[20px]'>
                        <div 
                          className='
                            relative
                            w-full
                            h-full
                            flex
                            items-center
                            justify-center
                            left-[-10px]
                            opacity-0
                            group-hover:opacity-100
                          '
                          >
                            {tskID && 
                              <DeleteById style='fill' icon='close' data={{id:tskID, type:'tasks', page:'tasks'}} relatedUpdates={DeleteRelatedUpdates} 
                                onYes={getData}
                              />
                            }
                          </div>
                      </td>
                      <td className='w-[5px] bg-green-200 border border-green-200'></td>
                      <td className={`${tdStyles}`}>
                        <div 
                          className='relative flex w-full h-full items-center justify-start group
                          
                          '
                        >
                          <div 
                          className='
                            absolute
                            left-[-10px]
                            opacity-0
                            group-hover:opacity-100
                          '
                          >
                            {tskID && 
                              <div className='
                               ml-1 cursor-pointer
                              '>
                                  <FaAngleRight className='text-slate-400'/>
                              </div>
                              // <DeleteById style='fill' icon='close' data={{id:tskID, type:'tasks', page:'tasks'}} relatedUpdates={DeleteRelatedUpdates} 
                              //   onYes={getData}
                              // />
                            }
                          </div>
                          <div className='
                            group-hover:translate group-hover:translate-x-3 transition-all
                          '>

                            {st.name}
                          </div>
                        </div>
                      </td>
                      <td className={`${tdStyles}`}>{rUser ? rUser.name : ''}</td>
                      <td className={`${tdStyles}`}>{st.priority}</td>
                      <td className={`${tdStyles}`}>{st.status}</td>
                      <td className={`${tdStyles}`}>{st.dueDate ? format(st.dueDate, 'dd.MM.yyyy') : ''}</td>
                      {mainTaskData && mainTaskData.customFields && mainTaskData.customFields.map((cf, index)=>{
                        const fV = st.customFields ? st.customFields.find((tcf)=>tcf.key === cf.key) : null;
                        
                        return (
                          <td key={`th-${index}`} className={`${tdStyles}`}>
                            {fV ? cf.value : ''}
                          </td>
                        );
                      })}
                      <td className='border-b border-t border-l'></td>
                    </tr>
                  )
                })}
                <tr>
                  <td className='w-[20px]'></td>
                  <td className='w-[3px] bg-green-200 border border-green-200'></td>
                  <td 
                  className='border-t border-b border-l p-1'
                  colSpan={mainTaskData && mainTaskData.customFields ? mainTaskData.customFields.length + 7 : 7}>
                      <EnterInput name='addTask' onEnter={({name, value})=>addTask({name, value, taskId:null})} showButton={false} 
                      placeholder={`+ ${t('addTasks')}`}
                      customClasses='
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
                      '/>
                  </td>
                </tr>
              </tbody>
            </table>
           

        </div>
      
      
      }

      <CustomAlert
          onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
          isOpen={alertData.isOpen}
          content={alertData.content}
          title={alertData.title}
          type={alertData.type || 'info'} 
        />
        {/* <ConfirmPopup
            isOpen={popupContent.isOpen}
            onClose={() => setPopupContent({...popupContent, isOpen:!popupContent.isOpen})}
            title={popupContent.title ? popupContent.title : ''}
            data={popupData}
            content={popupContent.content} 
            yesFunction={(data)=>handleRowAction(data)} 
            noFunction={()=>setIsPopupOpen(!isPopupOpen)}                                
        /> */}

        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>

    </div>
  )
}

export default TasksBackup
