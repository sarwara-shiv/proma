import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import { AlertPopupType, BaseTask, DeleteRelated, DynamicField, FlashPopupType, MainTask, NavItem, Project, RelatedUpdates, RichTextEditorProps, SidePanelProps, Task, User } from '@/interfaces';
import React, { useEffect, useRef, useState } from 'react'
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
import { FaAngleRight, FaPlusSquare, FaUserCircle } from 'react-icons/fa';
import SubtasksTable from './SubtasksTable';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { extractAllIds } from '../../../../utils/tasksUtils';
import ColorPicker from '../../../../components/common/ColorPicker';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { CustomDropdown, MensionUserInput } from '../../../../components/forms';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import CustomDateTimePicker2 from '../../../../components/forms/CustomDateTimePicker';
import ClickToEdit from '../../../../components/forms/ClickToEdit';
import { sanitizeString } from '../../../../utils/commonUtils';
import CustomContextMenu from '../../../../components/common/CustomContextMenu';
import { Priorities, TaskStatuses } from '../../../../config/predefinedDataConfig';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ResizableTableHeader from '../../../../components/table/ResizableTableHeader'; 
import SidePanel from '../../../../components/common/SidePanel';
import RichtTextEditor from '../../../../components/forms/RichtTextEditor';

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


const ProjectTasks:React.FC<ArgsType> = ({cid, action, data, checkDataBy, setSubNavItems, mtid}) => {
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
  const [sidePanelData, setSidePanelData] = useState<SidePanelProps>({isOpen:false, title:'', subtitle:'',children:''});
  const [editorData, setEditorData] = useState({
    value: '',
    data: {}
  });

  const thStyles = 'text-xs font-semibold p-1 text-left text-primary border border-slate-200';
  const tdStyles = 'text-xs font-normal p-1 text-left  border border-slate-200';

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

  // Rich text editor change
  const RichtTextEditorChange = (content: string, data:any)=>{
    if(content && data._id && data.field){
      updateTask(data._id, {[data.field]:content}, true);
      // setEditorData({...editorData, value:'', data:{}})
    }
  }

  // updateMainTask
  const updateMainTask= async(data:any = null)=>{
    try{
      const mid = mainTaskId as unknown as string;
      const nData = data ? data : mainTaskData;
      const res =  await addUpdateRecords({id:mid,  type:'maintasks', action:'update', body:{...nData}});
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
                        { path: 'createdBy' }, 
                        { path: 'responsiblePerson' }, 
                      ],
                    },
                    { path: 'createdBy' }, 
                    { path: 'responsiblePerson' }, 
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
                console.log(res.data); 
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



  const deleteCustomField = (index: number, key: string) => {
    setMainTaskData((prevVal) => {
      if (!prevVal) return prevVal;
  
      // Create a deep copy of the previous value to avoid direct mutations
      const updatedMainTaskData = JSON.parse(JSON.stringify(prevVal));
      
      // Remove the custom field from the main task
      if (Array.isArray(updatedMainTaskData.customFields)) {
        updatedMainTaskData.customFields = updatedMainTaskData.customFields.filter(
          (field: { key: string; }) => field.key !== key
        );
      }
      let level = 0;
      // Recursively remove the custom field from subtasks
      const removeCustomFieldFromSubtasks = (subtasks: any[]) => {
        subtasks.forEach((subtask: any, index:number) => {
          let customFieldsUpdated = false; // Flag to track if customFields were updated
  
          // Remove custom fields from the subtask
          if (Array.isArray(subtask.customFields)) {
            const originalLength = subtask.customFields.length;
            subtask.customFields = subtask.customFields.filter(
              (field: any) => field.key !== key
            );
            // Set the flag if there was a change
            customFieldsUpdated = subtask.customFields.length < originalLength;
          }
  
          // Update the subtask if customFields were changed
          if (customFieldsUpdated) {
            updateTask(subtask._id, { customFields: subtask.customFields }, false);
          }
          
          let refresh=false;
          // Check if the subtask has its own subtasks
          if (Array.isArray(subtask.subtasks) && subtask.subtasks.length > 0) {
            
            removeCustomFieldFromSubtasks(subtask.subtasks); // Recursive call
          }
          if (index === subtasks.length - 1) {
            console.log("Last subtask processed:", subtask._id);
            level++;
            if(level === 2) refresh = true
            console.log(level);
          }

          updateTask(subtask._id, {customFields:subtask.customFields}, refresh);

        });
      };
  
      // Call the recursive function on the main task's subtasks
      if (Array.isArray(updatedMainTaskData.subtasks)) {
        removeCustomFieldFromSubtasks(updatedMainTaskData.subtasks);
      }
  
      return updatedMainTaskData; // Return the updated state
    });
  };
  

  // add Tasks
  const addTask = async ({name, value, taskId, parentTask}:{name:string, value:string, taskId:string|ObjectId|null, parentTask:Task | null})=>{
    const mid = mainTaskId as unknown as string;
    const createdBy = user?._id;
    let responsiblePerson:ObjectId | string | null | undefined = 
    mainTaskData?.responsiblePerson ? (mainTaskData?.responsiblePerson as unknown as User )._id : user?._id;
    ;
    if(mid && createdBy){
      try{
        let level = 1;
        let relatedUpdates:RelatedUpdates[]= [];
        if(taskId){
          const ruser = parentTask ? parentTask.responsiblePerson as unknown as User : null;
          responsiblePerson = ruser ? ruser._id : null;
          level=2;
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
        const res = await addUpdateRecords({action:'add', type:'tasks', relatedUpdates, body:{name:value, _mid:mid, createdBy, responsiblePerson, level}})
      
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
    setAlertData({...alertData, isOpen:true, title:`${t('editCustomField')}`,
      content: <CustomFieldForm selectedData={cf} index={index} onChange={(value, index) => addCustomFieldsMainTasks(value ,index)} />
    })
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
        value: customField.value,
        selectedValue:value
      };
  
      let nData: DynamicField[] = cfdata || []; // Ensure cfdata is an array or initialize it as an empty array
  
      const keyExists = nData.find((d) => d.key === customField.key);
  
      if (keyExists) {
        // If key exists, update the value
        nData = nData.map((d) => {
          if (d.key === customField.key) {
            return { ...d, selectedValue: value }; // Create a new object to avoid direct mutation
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

  const handleTaskInput = (taskId:string|ObjectId, field:string, value:string | Date | null)=>{
    if(taskId && field && value){
      const nData = {[field]:value};
      updateTask(taskId, nData);
    }
  }

  // update task
  const updateTask = async(taskId:string|ObjectId, cfdata:any, refresh:boolean = true)=>{

    if(taskId && cfdata){
      let relatedUpdates:RelatedUpdates[]= [];
      if(cfdata && cfdata.status){
        const cTask = subtasks?.filter(st=>st._id === taskId);
        let ids:string[] = [];
        if(Array.isArray(cTask) && cTask.length > 0)
        ids = extractAllIds(cTask[0]);

        if(ids && Array.isArray(ids) && ids.length > 0 && cfdata.status === 'completed')
          relatedUpdates= [{
            collection:'tasks',
            field:'status',
            type:'string',
            value:cfdata.status,
            ids:[...ids]
         }]

      }
      try{
        const res = await addUpdateRecords({type:'tasks', action:'update', relatedUpdates, id:taskId as unknown as string, body:{...cfdata}});
        if(res.status === 'success'){
          const content = `${t(`RESPONSE.${res.code}`)}`;
          setFlashPopupData({...flashPopupData, isOpen:true, message:content})
          if(refresh){
            getData();
          }
        }
      }catch(error){
        console.log(error);
      }
    }
  }

  // handle responsible person
  const handleResponsiblePerson = async(taskId:string|ObjectId, user:User)=>{
    if(taskId && user){
      const cTask = subtasks?.filter(st=>st._id === taskId);
      let ids = [];
      let relatedUpdates:RelatedUpdates[]= []
      if(cTask){
        console.log(cTask[0]);
        ids = extractAllIds(cTask[0]);
        console.log(ids);
        if(ids && Array.isArray(ids) && ids.length > 0)
        relatedUpdates= [{
          collection:'tasks',
          field:'responsiblePerson',
          type:'string',
          value:user._id,
          ids:[...ids]
       }]
       console.log(relatedUpdates);
      }

      const tndata = {responsiblePerson : user._id}
      try{
        const res = await addUpdateRecords({type:'tasks', action:'update', relatedUpdates, id:taskId as unknown as string, body:{...tndata}});
        if(res.status === 'success'){
          const content = `${t(`RESPONSE.${res.code}`)}`;
          setFlashPopupData({...flashPopupData, isOpen:true, message:content})
          getData();
        }else{
          console.log(res);
        }
      }catch(error){
        console.log(error);
      }
    }
  }

  const handleDrag = (result: any) => {
    if (!result.destination) return;
    const stasks = subtasks ? subtasks as unknown as Task[] : [];
    const items = Array.from(stasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const getTaskIds = (tasks: Task[]): string[] => {
      return tasks.map(task => task._id).filter((id): id is string => !!id);
    };

    const idsArray = getTaskIds(items);
    console.log(idsArray);
    if(idsArray && items){
      updateMainTask({subtasks:idsArray});
    }

    setSubtasks(items); 
  };
  

  const getColWidth = (width:number, colId:string)=>{
    console.log(width, ' : ' ,colId)
  }
  


  // delete task
  return (
    <div>
      {loader ? <Loader type='full'/> :
        <div className='card bg-white'>
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
            <DragDropContext onDragEnd={handleDrag}>
            <Droppable droppableId="droppable-rows">
              {(provided)=>(
              <table className='w-full table-fixed text-slate-600' {...provided.droppableProps} ref={provided.innerRef}>
                <thead>
                  <tr key={'task-level-1'} className='text-sm font-normal'>
                    <th className='w-[20px] sticky left-0 bg-white z-2'>
                      <CustomContextMenu >
                          <ul>
                            <li className='px-2 py-1 my-1 hover:bg-slate-100'>
                              <div 
                                onClick={openCustomFieldsPopup}
                                className='
                                  cursor-pointer
                                  flex justify-center items-center rounded-full
                                  text-slate-600
                                  flex justify-between align-center
                                  text-xs
                                  '>
                                  {t('addNewCell')} <IoMdAdd />
                                </div>
                            </li>
                          </ul>
                      </CustomContextMenu>
                    </th>
                    <th className='w-[3px] bg-green-200 border border-green-200 sticky left-[20px] z-2'></th>
                    {/* <th className={`${thStyles} w-[223px] sticky left-[23px] bg-white z-2`}
                    >{t('task')}
                    </th> */}
                    <ResizableTableHeader initialWidth={223} classes={`${thStyles} w-[223px] sticky left-[23px] bg-white z-2`} colId={``} onMouseUp={getColWidth}>
                         {t('task')}
                    </ResizableTableHeader>
                    <th className={`${thStyles}  w-[160px] `}
                    >{t('responsiblePerson')}</th>
                    <th className={`${thStyles} w-[120px] text-center`}>
                      {t('priority')}</th>
                    <th className={`${thStyles} text-center w-[120px]`}>{t('status')}</th>
                    <th className={`${thStyles} w-[120px] text-center`} >{t('startDate')}</th>
                    <th className={`${thStyles} w-[120px] text-center`} >{t('dueDate')}</th>
                    <ResizableTableHeader initialWidth={223} classes={`${thStyles} w-[223px]`} colId={``} onMouseUp={getColWidth}>
                         {t('note')}
                    </ResizableTableHeader>
                    {mainTaskData && mainTaskData.customFields && mainTaskData.customFields.map((cf, index)=>{
                      const width = (cf.type === 'status' || cf.type === 'dropdown' || cf.type === 'date' ) ? 'w-[120px]' : 'w-[200px]'  ;
                      return (
                        <ResizableTableHeader initialWidth={223} classes={`${thStyles} ${width} relative`} key={`th-${index}-${sanitizeString(cf.key)}`} colId={`index+9`}>
                         <div
                            className='relative flex w-full h-full items-center justify-start group'
                          >
                            {/* {(cf.type === 'status' || cf.type === 'dropdown' )&&   
                            
                            } */}
                            <div
                              className='
                                relative left-[-8px] py-0.8 px-0.8
                                  opacity-0 cursor-pointer
                                  group-hover:opacity-100
                                  hover:bg-slate-200
                                  rounded-sm
                              '
                            >
                              <CustomContextMenu >
                                <ul>
                                  <li className='px-2 py-1 my-1 hover:bg-slate-100 text-sm'>
                                    <div onClick={()=>editCustomFieldOptions(index, cf)} className='cursor-pointer text-xs'>
                                    {t('update')}
                                    </div>
                                  </li>
                                  <li className='px-2 py-1 my-1 hover:bg-slate-100'>
                                    <DeleteSmallButton  onClick={()=>deleteCustomField(index, cf.key)} text={`${t('delete')}`} />
                                  </li>
                                </ul>
                              </CustomContextMenu>
                            </div>
                            <div>
                              {cf.key}
                            </div>
                          </div>
                        </ResizableTableHeader>

                        // <th key={`th-${index}-${sanitizeString(cf.key)}`} className={`${thStyles} ${width} relative`} >
                          
                        // </th>
                      );
                    })}
                  <th className='border-b border-t border-l w-[30px]'>
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
                  <th className='border-b border-t'></th>
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
                      <Draggable key={`task-data-${index}-${st._id}`} draggableId={`task-data-${index}-${st._id}`} index={index}>
                        {(provided)=> (

                        <>
                        
                          <tr key={`task-data-${index}-${st._id}`} className='group hover:bg-slate-100' 
                          ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <td className='w-[20px] sticky left-0 bg-white z-2 '>
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
                                <CustomContextMenu >
                                      <ul>
                                        <li className='px-2 py-1 my-1 hover:bg-slate-100'>
                                          <div className='text-xs flex justify-between items-center cursor-pointer' onClick={()=>{
                                              setEditorData({...editorData, value:'', data:{}})
                                              setEditorData({...editorData, value:st.description || '', data: {_id:st._id, field:'description'}})
                                              setSidePanelData({...sidePanelData, isOpen:true, title:st._cid || '', subtitle:st.name})

                                          }}>
                                            <span>{t('details')}</span>
                                            <span><FaPlusSquare /></span>  
                                          </div>
                                        </li>
                                        <li className='px-2 py-1 my-1 hover:bg-slate-100'>
                                          <div></div>
                                          {tskID && 
                                            <DeleteById style='fill' deleteRelated={
                                              ids && ids.length >0 ?  deleteRelated=[{collection:'tasks', ids:ids}] : []
                                            } icon='close' data={{id:tskID, type:'tasks', page:'tasks'}} relatedUpdates={DeleteRelatedUpdates} 
                                              onYes={getData} text={`${t('delete')}`}
                                            />
                                          }
                                        </li>
                                      </ul>
                                  </CustomContextMenu>
                              </div>
                              <div 
                              
                                >
                                  
                                </div>
                            </td>
                            <td className='w-[3px] bg-green-200 border border-green-200 sticky left-[20px] z-2'></td>
                            <td className={`${tdStyles} w-[200px] sticky left-[23px] bg-white z-2 group-hover:bg-slate-100`}>
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
                            <td className={`${tdStyles} group`}
                            >
                              <div className='relative flex justify-start align-center'>
                                <div
                                  className=' group-hover:translate group-hover:translate-x-3 transition-all
                                  flex justify-between items-center'
                                >{rUser ? rUser.name : 
                                <div className='text-slate-400 flex items-center justify-start'>
                                  <FaUserCircle size={16} className='text-slate-200'/> 
                                  </div>
                                }</div>
                                <div 
                                className='absolute left-[-5px] opacity-0 group-hover:opacity-100'
                                >
                                  <CustomContextMenu >
                                        <ul>
                                          <li className='px-2 py-1 my-1 hover:bg-slate-100 text-sm'>
                                            <p className='text-xs text-slate-400'>Responsible Person</p>
                                            <MensionUserInput onClick={(user, data)=>handleResponsiblePerson(st._id ? st._id:'', user)} inputType='text' type='users'/>
                                          </li>
                                        </ul>
                                    </CustomContextMenu>
                                </div>
                              </div>
                            </td>
                            <td className={`${tdStyles} ${getColorClasses(st.priority)} text-center`}>
                              <CustomDropdown selectedValue={st.priority} data={Priorities} style='table'
                                onChange={(rid, name, value, data)=>handleTaskInput(st._id ? st._id : '', 'priority', value)}
                              />
                              </td>
                            <td className={`${tdStyles} ${getColorClasses(st.status)} text-center text-[10px]`}>
                              <CustomDropdown selectedValue={st.status} data={TaskStatuses} style='table'
                                onChange={(rid, name, value, data)=>handleTaskInput(st._id ? st._id : '', 'status', value)}
                              />
                              </td>
                            <td className={`${tdStyles} text-xs`}>
                              {/* {st.startDate ? format(st.startDate, 'dd.MM.yyyy') : ''} */}
                                <CustomDateTimePicker2 selectedDate={st.startDate ? st.startDate : null} style='table'
                                        onDateChange={(rid, value, name)=>handleTaskInput(st._id ? st._id : '', 'startDate', value)}
                                />
                              </td>
                            <td className={`${tdStyles} text-xs`}>
                              {/* {st.dueDate ? format(st.dueDate, 'dd.MM.yyyy') : ''} */}
                                <CustomDateTimePicker2 selectedDate={st.dueDate ? st.dueDate : null} style='table'
                                        onDateChange={(rid, value, name)=>handleTaskInput(st._id ? st._id : '', 'dueDate', value)}
                                />
                            </td>
                            <td className={`${tdStyles} text-xs`}>
                              <ClickToEdit value={st.note || ''}  name='note'
                                      onBlur={(value)=>handleTaskInput(st._id ? st._id : '', 'note', value)}
                                    />
                            </td>
                            {mainTaskData && mainTaskData.customFields && mainTaskData.customFields.map((cf, index)=>{
                              const fV = st.customFields ? st.customFields.find((tcf)=>tcf.key === cf.key) : null;
                              const tid = st._id ? st._id : '';

                              const cfdata = fV;

                              const cfcolor = cfdata && (cfdata.type === 'dropdown' || cfdata.type === 'status') ? 
                              `bg-${cfdata.selectedValue.color} text-${cfdata.selectedValue.color}-dark` : '';

                              const cftype = cfdata ? cfdata.type : '';

                              const cfvalue = cfdata ? (cfdata.type === 'dropdown' || cfdata.type === 'status') ? 
                              cfdata.selectedValue._id : cfdata.selectedValue : null;
                              console.log('------------------');
                              console.log(cfdata);
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
                            <td className='border-b border-t'></td>
                          </tr>
                              
                            {/* SUBTASKS */}
                            {subTasksCount?.find(d => d.taskId === tskID && d.isOpen === true) && 
                              <tr>
                                <td className='w-[20px] sticky left-0 z-2 bg-white'></td>
                                <td className='w-[3px] text-center sticky left-[20px] z-2 bg-white'>
                                  <div className='w-[2px] bg-green-200 top-0 h-full absolute'></div>
                                </td>
                                <td className='py-4'
                                colSpan={mainTaskData && mainTaskData.customFields ? mainTaskData.customFields.length + 9 : 9}
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
                                      parentTask={st}
                                      updateTask={updateTask}
                                      handleTaskInput={handleTaskInput}
                                    />
                                  </td>
                              </tr>
                            
                            }
                        </>
                        )}
                      </Draggable>
                      
                    )
                  })}
                  <tr>
                    <td className='w-[20px] sticky left-0 bg-white z-2'></td>
                    <td className='w-[3px] bg-green-200 border border-green-200 sticky left-[20px] z-2'></td>
                    <td 
                    className='border-t border-b border-l p-1
                      w-[200px] sticky left-[23px] bg-white z-2
                    '
                    >
                        <EnterInput name='addTask' onEnter={({name, value})=>addTask({name, value, taskId:null, parentTask:null})} showButton={false} 
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
                    <td className='border-b border-t'
                    colSpan={mainTaskData && mainTaskData.customFields ? mainTaskData.customFields.length + 7 : 7}
                    ></td>
                    <td className='border-b border-t'></td>
                  </tr>
                </tbody>
              </table>
             )}
            </Droppable>
            </DragDropContext>
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


        <SidePanel isOpen={sidePanelData.isOpen} title={sidePanelData.title} subtitle={sidePanelData.subtitle} 
        onClose={()=>{
          setSidePanelData({...sidePanelData, isOpen:false});
          setEditorData({...editorData, value:'', data:{}})
        
        }}
        >
          <RichtTextEditor
            value={editorData.value}
            data={editorData.data}
            onChange={(newContent, data)=>RichtTextEditorChange(newContent, data)}
          />
          
        </SidePanel>  
    </div>
  )
}


export default ProjectTasks