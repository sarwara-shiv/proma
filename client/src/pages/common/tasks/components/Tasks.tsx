import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import { AlertPopupType, BaseTask, DeleteRelated, DynamicField, FlashPopupType, MainTask, NavItem, Project, RelatedUpdates, Task, User } from '@/interfaces';
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
import { useAuth } from '../../../../hooks/useAuth';
import EnterInput from '../../../../components/forms/EnterInput';
import { DeleteById } from '../../../../components/actions';
import { FaAngleRight } from 'react-icons/fa';
import SubtasksTable from './SubtasksTable';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { extractAllIds } from '../../../../utils/tasksUtils';
import ColorPicker from '../../../../components/common/ColorPicker';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { CustomDropdown } from '../../../../components/forms';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import CustomDateTimePicker2 from '../../../../components/forms/CustomDateTimePicker';
import ClickToEdit from '../../../../components/forms/ClickToEdit';

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
let DeleteRelatedUpdatesTasks:RelatedUpdates[]= [{
 collection:'tasks',
 field:'subtasks',
 type:'array',
 ids:[]
}]

interface SubTasksCount{
  taskId:string|ObjectId;
  isOpen:boolean
}


const Tasks:React.FC<ArgsType> = ({cid, action, data, checkDataBy, setSubNavItems, mtid}) => {
  const {id} = useParams();
  const {user} = useAuth();
  const {t} = useTranslation();
  const [projectData, setProjectData] = useState<Project>();
  const [projectId, setProjectId] = useState<ObjectId | string>(id ? id : '');
  const [mainTaskId, setMainTaskId] = useState<ObjectId | string>(mtid ? mtid : '');
  const [mainTaskData, setMainTaskData] = useState<MainTask>();
  const [subtasks, setSubtasks] = useState<Task[]>();
  const [subTasksCount, setSubTasksCount] = useState<SubTasksCount[]>();
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
              if(res.status === 'success' && res.data){
                  setProjectData(res.data._pid);
                  setMainTaskData(res.data);
                  DeleteRelatedUpdates[0].ids = [res.data._id];
                  const stasks = res.data.subtasks as unknown as Task[];
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
  const addCustomFieldsMainTasks = (value:DynamicField, index:number|null)=>{ 
      if(index !== null && index >= 0){
        setMainTaskData((prevVal)=>{
          if (!prevVal) return prevVal; 
          let cfields = prevVal?.customFields;
          if(cfields && Array.isArray(cfields)){
            if(cfields[index]){
              cfields[index] = value;
              cfields = [...cfields];
            }
          }else{
            cfields = [value];
          }
          return {...prevVal, customFields:[...cfields]}
        })
      }else{
        setMainTaskData((prevVal)=>{
          if (!prevVal) return prevVal; 
          let cfields = prevVal?.customFields;
          if(cfields && Array.isArray(cfields)){
            const fieldexits = cfields.find(d=>d.key === value.key);
            if(!fieldexits){
              cfields = [...cfields, value];
            }else{
              setAlertData({...alertData, isOpen:true, content:'Field with name exists'});
            }
          }else{
            cfields = [value];
          }
          return {...prevVal, customFields:[...cfields]}
        })
      }
  }

  // delte custom fields from main tasks
  const  deleteCustomField = (index:number, key:string)=>{
    setMainTaskData((prevVal)=>{
      if (!prevVal) return prevVal; 
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

  const toggleSubTasksCount = (taskId: ObjectId | string) => {
  
    if (taskId) {
      setSubTasksCount(prevVal => {
        if (!prevVal) return [];
  
        // Check if the task already exists in the array
        const taskExists = prevVal.find(d => d.taskId === taskId);
  
        if (taskExists) {
          // If the task exists, toggle the isOpen property
          return prevVal.map(d =>
            d.taskId === taskId ? { ...d, isOpen: !d.isOpen } : d
          );
        } else {
          // If the task doesn't exist, add a new entry
          return [...prevVal, { taskId, isOpen: true }];
        }
      });
    }
  };

  // edit custom field options
  const editCustomFieldOptions= (index:number, cf:DynamicField)=>{
    if(cf.type === 'dropdown' || cf.type === 'status'){
      setAlertData({...alertData, isOpen:true, 
        content: <CustomFieldForm selectedData={cf} index={index} onChange={(value, index) => addCustomFieldsMainTasks(value ,index)} />
      })
    }
  }

  const handleTaskCustomField = (
    taskId: string | ObjectId,
    customField: DynamicField,
    value: any,
    cfdata: DynamicField[],
  ) => {
    console.log(value);
    if (taskId && customField && value) {
      const tcf: DynamicField = {
        key: customField.key,
        type: customField.type,
        value: value,
      };
  
      let nData: DynamicField[] = cfdata || []; // Ensure cfdata is an array or initialize it as an empty array
  
      const keyExists = nData.find((d) => d.key === customField.key);
  
      if (keyExists) {
        // If key exists, update the value
        nData = nData.map((d) => {
          if (d.key === customField.key) {
            return { ...d, value: value }; // Create a new object to avoid direct mutation
          }
          return d;
        });
      } else {
        // If key doesn't exist, add the new custom field to the array
        nData = [...nData, tcf];
      }
  
      // Now call the updateTask function with the updated custom fields
      updateTask(taskId, { customFields: nData });
    }
  };

  const handleTaskInput = (taskId:string|ObjectId, field:string, value:string)=>{
    if(taskId && field && value){
      const nData = {[field]:value};
      updateTask(taskId, nData);
    }
  }

  // update task
  const updateTask = async(taskId:string|ObjectId, cfdata:any)=>{

    if(taskId && cfdata){
      try{
        const res = await addUpdateRecords({type:'tasks', action:'update', id:taskId as unknown as string, body:{...cfdata}});
        if(res.status === 'success'){
          const content = `${t(`RESPONSE.${res.code}`)}`;
          setFlashPopupData({...flashPopupData, isOpen:true, message:content})
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
            <div className='relative overflow-x-auto py-4'>
            <table className='w-full table-fixed'>
              <thead>
                <tr key={'task-level-1'}className='text-sm font-normal'>
                  <th className='w-[20px] sticky left-0 bg-white z-10'></th>
                  <th className='w-[3px] bg-green-200 border border-green-200 sticky left-[20px] z-10'></th>
                  <th className={`${thStyles} w-[223px] sticky left-[23px] bg-white z-10`}>{t('task')}</th>
                  <th className={`${thStyles}  w-[160px] `}>{t('responsiblePerson')}</th>
                  <th className={`${thStyles} w-[120px] text-center`}>{t('priority')}</th>
                  <th className={`${thStyles} text-center w-[120px]`}>{t('status')}</th>
                  <th className={`${thStyles} w-[80px] text-center`} >{t('startDate')}</th>
                  <th className={`${thStyles} w-[80px] text-center`} >{t('dueDate')}</th>
                  {mainTaskData && mainTaskData.customFields && mainTaskData.customFields.map((cf, index)=>{
                    return (
                      <th key={`th-${index}-${cf.key}`} className={`${thStyles} w-[120px] relative`} >
                        <div
                          className='relative flex w-full h-full items-center justify-start group'
                        >
                          {(cf.type === 'status' || cf.type === 'dropdown' )&&   
                            <div 
                            onClick={()=>editCustomFieldOptions(index, cf)}
                            className='relative left-[-8px] py-0.8 px-0.8
                              opacity-0 cursor-pointer
                              group-hover:opacity-100
                              hover:bg-slate-200
                              rounded-sm
                            '
                            >
                              <IoEllipsisVerticalSharp />
                            </div>
                          }
                          <div>
                            {cf.key}
                          </div>
                          <div 
                          className='
                             absolute right-0 opacity-0
                              transition-opacity duration-300
                              group-hover:opacity-100 text-center
                              
                          '
                          >
                            <DeleteSmallButton  onClick={()=>deleteCustomField(index, cf.key)} 
                              
                              />
                          </div>
                        </div>
                      </th>
                    );
                  })}
                 <th className='border-b border-t border-l min-w-[50px]'>
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
                  const ids = extractAllIds(st);
                  let deleteRelated:DeleteRelated[];
 
                  return (
                    <>
                    <tr key={`task-data-${index}-${st._id}`} className='group hover:bg-slate-100'>
                      <td className='w-[20px] sticky left-0 bg-white z-10 '>
                        <div 
                          className='
                            relative
                            w-full
                            h-full
                            flex
                            items-center
                            justify-center
                            left-[-3px]
                            opacity-0
                            group-hover:opacity-100
                          '
                          >
                            {tskID && 
                              <DeleteById style='fill' deleteRelated={
                                ids && ids.length >0 ?  deleteRelated=[{collection:'tasks', ids:ids}] : []
                              } icon='close' data={{id:tskID, type:'tasks', page:'tasks'}} relatedUpdates={DeleteRelatedUpdates} 
                                onYes={getData}
                              />
                            }
                          </div>
                      </td>
                      <td className='w-[3px] bg-green-200 border border-green-200 sticky left-[20px] z-10'></td>
                      <td className={`${tdStyles} w-[200px] sticky left-[23px] bg-white z-10 group-hover:bg-slate-100`}>
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
                              <div 
                              onClick={() => toggleSubTasksCount(tskID)}
                              className="ml-1 cursor-pointer"
                            >
                              <FaAngleRight 
                                className="text-slate-400"
                                style={{
                                  transform: subTasksCount?.find(d => d.taskId === tskID && d.isOpen === true) 
                                    ? 'rotate(90deg)' 
                                    : 'rotate(0deg)',
                                  transition: 'transform 0.3s ease', // For smooth rotation
                                }} 
                              />
                            </div>
                            }
                          </div>
                          <div className='
                            group-hover:translate group-hover:translate-x-3 transition-all
                            flex justify-between items-start
                          '>
                            <ClickToEdit value={st.name}  name='name'
                                onBlur={(value)=>handleTaskInput(st._id ? st._id : '', 'name', value)}
                              />
                            {/* {st.name}  */}
                            {st.subtasks && st.subtasks.length > 0 && 
                              <span className='ml-1 font-normal text-xs text-slate-500 bg-gray-200 rounded-sm px-1 py-0.7'>{st.subtasks.length}</span>
                            }
                          </div>
                        </div>
                      </td>
                      <td className={`${tdStyles}`}>{rUser ? rUser.name : ''}</td>
                      <td className={`${tdStyles} ${getColorClasses(st.priority)} text-center`}>{st.priority}</td>
                      <td className={`${tdStyles} ${getColorClasses(st.status)} text-center text-[10px]`}>{t(`${st.status}`)}</td>
                      <td className={`${tdStyles}`}>{st.startDate ? format(st.startDate, 'dd.MM.yyyy') : ''}</td>
                      <td className={`${tdStyles}`}>{st.dueDate ? format(st.dueDate, 'dd.MM.yyyy') : ''}</td>
                      {mainTaskData && mainTaskData.customFields && mainTaskData.customFields.map((cf, index)=>{
                        const fV = st.customFields ? st.customFields.find((tcf)=>tcf.key === cf.key) : null;
                        const tid = st._id ? st._id : '';

                        const cfdata = fV;

                        const cfcolor = cfdata && (cfdata.type === 'dropdown' || cfdata.type === 'status') ? 
                        `bg-${cfdata.value.color} text-${cfdata.value.color}-dark` : '';

                        const cftype = cfdata ? cfdata.type : '';

                        const cfvalue = cfdata ? (cfdata.type === 'dropdown' || cfdata.type === 'status') ? 
                        cfdata.value._id : cfdata.value : null;
                        console.log('------------------');
                        console.log(cfvalue);
                        return (
                          <td key={`tcf-${index}-${st._id}`} className={`${tdStyles} ${cfcolor} text-center`}>
                            {(cf.type === 'dropdown' || cf.type === 'status') ? 
                              <div className={`${cfcolor} `}>
                                <CustomDropdown emptyLabel={<div className='text-xs'>--select--</div>}
                                name={`tcf-${index}`} data={cf.value} 
                                style='table' selectedValue={cfvalue}
                                onChange={(rid,name,value,cfdata)=>handleTaskCustomField(tid, cf, cfdata, st.customFields)}/>
                              </div>
                            :
                            
                            (cf.type === 'date') ?
                              <div className={`${cfcolor} `}>
                                {/* <CustomDateTimePicker selectedDate={cfvalue} style='table'/> */}
                                <CustomDateTimePicker2 selectedDate={cfvalue ? cfvalue : null} style='table'
                                  onDateChange={(rid, value, name)=>handleTaskCustomField(tid, cf, value, st.customFields)}
                                />
                              </div>

                              :

                              <ClickToEdit value={cfvalue}  name={`tcf-${index}`}
                                onBlur={(value)=>handleTaskCustomField(tid, cf, value, st.customFields)}
                              />
                            }
                          </td>
                        );
                      })}
                      <td className='border-b border-t border-l min-w-[50px]'></td>
                    </tr>
                        
                      {/* SUBTASKS */}
                      {subTasksCount?.find(d => d.taskId === tskID && d.isOpen === true) && 
                        <tr>
                          <td className='w-[20px] sticky left-0 z-10 bg-white'></td>
                          <td className='w-[3px] text-center sticky left-[20px] z-10 bg-white'>
                            <div className='w-[2px] bg-green-200 top-0 h-full absolute'></div>
                          </td>
                          <td className='py-4'
                          colSpan={mainTaskData && mainTaskData.customFields ? mainTaskData.customFields.length + 7 : 7}
                          >
                              <SubtasksTable 
                                mainTask={mainTaskData || null}
                                subtasks={st.subtasks ? st.subtasks as unknown as Task[]: []}
                                type='subtask'
                                taskId={tskID}
                                handleTaskCustomField={handleTaskCustomField}
                                DeleteRelatedUpdates={DeleteRelatedUpdates}
                                addCustomField={addCustomFieldsMainTasks}
                                deleteCustomField={deleteCustomField}
                                openCustomFieldsPopup={openCustomFieldsPopup}
                                getData={getData}
                                addTask={addTask}
                                handleTaskInput={handleTaskInput}
                              />
                            </td>
                        </tr>
                      
                      }
                    </>
                    
                  )
                })}
                <tr>
                  <td className='w-[20px] sticky left-0 bg-white z-10'></td>
                  <td className='w-[3px] bg-green-200 border border-green-200 sticky left-[20px] z-10'></td>
                  <td 
                  className='border-t border-b border-l p-1
                     w-[200px] sticky left-[23px] bg-white z-10
                  '
                  >
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
                          w-full
                      '/>
                  </td>
                  <td className='border-b'
                  colSpan={mainTaskData && mainTaskData.customFields ? mainTaskData.customFields.length + 6 : 6}
                  ></td>
                </tr>
              </tbody>
            </table>
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

export default Tasks
