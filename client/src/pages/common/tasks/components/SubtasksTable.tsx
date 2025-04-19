import { getColorClasses } from '../../../../mapping/ColorClasses';
import { DeleteById } from '../../../../components/actions';
import DeleteSmallButton from '../../../../components/common/DeleteSmallButton';
import EnterInput from '../../../../components/forms/EnterInput';
import { DeleteRelated, DynamicField, MainTask, QaTask, RelatedUpdates, SidePanelProps, Task, User } from '@/interfaces'
import { format } from 'date-fns';
import { ObjectId } from 'mongodb'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { FaAngleRight, FaPlusSquare } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { CustomDropdown } from '../../../../components/forms';
import CustomDateTimePicker2 from '../../../../components/forms/CustomDateTimePicker';
import ClickToEdit from '../../../../components/forms/ClickToEdit';
import { Priorities, TaskStatuses } from '../../../../config/predefinedDataConfig';
import CustomContextMenu from '../../../../components/common/CustomContextMenu';
import { extractAllIds } from '../../../../utils/tasksUtils';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ResizableTableHeader from '../../../../components/table/ResizableTableHeader';
import { sanitizeString } from '../../../../utils/commonUtils';
import SidePanel from '../../../../components/common/SidePanel';
import RichtTextEditor from '../../../../components/forms/RichtTextEditor';
import SubtasksTableL3 from './SubtasksTableL3';
interface ArgsType{
    mainTask:MainTask | null;
    subtasks:Task[];
    parentTask:Task | null,
    type?:'task' | 'subtask';
    updateTask?:(taskId:string|ObjectId, cfdata:any, refresh:boolean)=>void;
    taskId?:string|ObjectId|null;
    addCustomField:(value:DynamicField, index:number|null)=>void;
    deleteCustomField:(index:number, key:string)=>void;
    openCustomFieldsPopup:()=>void;
    subTasksCount:SubTasksCount[],
    toggleSubTasksCount:(taskId: string | ObjectId)=>void,
    handleTaskCustomField:(taskId: string | ObjectId,
      customField: DynamicField,
      value: any,
      cfdata: DynamicField[])=>void;
    getData:()=>void;
    handleTaskInput:(taskId:string|ObjectId, field:string, value:string | Date | null)=>void;
    DeleteRelatedUpdates:RelatedUpdates[];
    showNextLevel:boolean;
    addTask:({name, value, taskId}:{name:string, value:string, taskId:string|ObjectId|null, parentTask:Task|null})=>void
}

interface SubTasksCount{
  taskId:string|ObjectId;
  isOpen:boolean
}

const SubtasksTable:React.FC<ArgsType> = ({
    mainTask, subtasks, type='task', taskId=null,
    addCustomField, deleteCustomField, openCustomFieldsPopup,addTask,getData,DeleteRelatedUpdates,
    handleTaskCustomField, handleTaskInput, parentTask=null, updateTask,toggleSubTasksCount,subTasksCount, showNextLevel=false
}) => {
    const {t} = useTranslation();
    const [mainTaskData, setMainTaskData] = useState<MainTask | null>(mainTask || null)
    const [subtasksData, setSubtasksdata] = useState<Task[] | null>(subtasks || null)
    const [subTasksCount2, setSubTasksCount2] = useState<SubTasksCount[]>();
    const [sidePanelData, setSidePanelData] = useState<SidePanelProps>({isOpen:false, title:'', subtitle:'',children:''});
    const [editorData, setEditorData] = useState({
      value: '',
      data: {}
    });
    const [richTextData, setRichtTextData] = useState<{id:string, field:string, content:string} | null>({id:'', field:'', content:''});
    const thStyles = 'text-xs font-semibold p-1 text-primary text-left border border-slate-200';
    const tdStyles = 'text-xs font-normal p-1 text-left  border border-slate-200';
  
    const tdClasses = 'p-2 text-xs';

     // Rich text editor change
  const RichtTextEditorChange = (content: string, data:any)=>{
    if(content && data._id && data.field){
      setRichtTextData({id:data._id, field:data.field, content});
      // updateTask && updateTask(data._id, {[data.field]:content}, true);
      // setEditorData({...editorData, value:'', data:{}})
    }
  }
  const saveRichTextData = ()=>{
    console.log(richTextData);
    if(richTextData?.id && richTextData.field && richTextData.content){
      updateTask && updateTask(richTextData.id, {[richTextData.field]:richTextData.content}, true);
    }
  }

  useEffect(()=>{
    setMainTaskData(mainTask);
  },[mainTask?.customFields])
  useEffect(()=>{
    console.log(subTasksCount);
  },[subTasksCount])


  const handleDrag = (result: any) => {
    if (!result.destination) return;
    const stasks = subtasksData ? subtasksData as unknown as Task[] : [];
    const items = Array.from(stasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const getTaskIds = (tasks: Task[]): string[] => {
      return tasks.map(task => task._id).filter((id): id is string => !!id);
    };

    const idsArray = getTaskIds(items);
    console.log(idsArray);
    if(idsArray && items){
      const taskId = parentTask?._id || '';
      const ndata = {subtasks:idsArray};
      updateTask && updateTask(taskId, ndata, false);
    }

    setSubtasksdata(items);
  };


  const getColWidth = (width:number, index:number)=>{
    console.log(width, ' : ' ,index)
  }

  // const toggleSubTasksCount2 = (taskId: ObjectId | string) => {
  // console.log(taskId);
  //   if (taskId) {
  //     setSubTasksCount(prevVal => {
  //       if (!prevVal) prevVal = [];
  
  //       // Check if the task already exists in the array
  //       const taskExists = prevVal.find(d => d.taskId === taskId);
  
  //       if (taskExists) {
  //         // If the task exists, toggle the isOpen property
  //         return prevVal.map(d =>
  //           d.taskId === taskId ? { ...d, isOpen: !d.isOpen } : d
  //         );
  //       } else {
  //         // If the task doesn't exist, add a new entry
  //         return [...prevVal, { taskId, isOpen: true }];
  //       }
  //     });
  //   }
  // };

  return (
    <div>
        {mainTaskData && 
            <>
        <DragDropContext onDragEnd={handleDrag}>
            <Droppable droppableId="droppable-rows">
              {(provided)=>(
                <table className='w-full table-fixed'  {...provided.droppableProps} ref={provided.innerRef}>
                    <thead>
                    <tr className='text-sm font-normal'>
                      <th className='w-[20px] relative text-center sticky left-[26px] bg-white z-10'>
                        <div className='w-[30px] absolute h-[1px] left-[-4px]
                          bg-green-200
                        '>

                        </div>

                      </th>
                      <th className='w-[3px] bg-green-200 border border-green-200 sticky left-[40px] z-10'></th>
                      {/* <th className={`${thStyles} w-[200px]  sticky left-[43px] bg-white z-10`} >{t('subtask')}</th> */}
                        <ResizableTableHeader initialWidth={200} classes={`${thStyles} w-[200px]  sticky left-[43px] bg-white z-10`} colId={``} >
                          {t('subtask')}
                        </ResizableTableHeader>
                      <th className={`${thStyles}  w-[160px]`}>{t('responsiblePerson')}</th>
                      <th className={`${thStyles} text-center w-[120px]`}>{t('priority')}</th>
                      <th className={`${thStyles} w-[120px] text-center`}>{t('status')}</th>
                      <th className={`${thStyles} w-[120px] text-center`} >{t('startDate')}</th>
                      <th className={`${thStyles} w-[120px] text-center`} >{t('dueDate')}</th>
                      <ResizableTableHeader initialWidth={223} classes={`${thStyles} w-[223px]`} colId={``}>
                         {t('note')}
                      </ResizableTableHeader>
                      {mainTaskData && mainTaskData.customFields && mainTaskData.customFields.map((cf, index)=>{
                        const width = (cf.type === 'status' || cf.type === 'dropdown' || cf.type === 'date' ) ? 'w-[120px]' : 'w-[200px]'  ;
                        return (
                          <ResizableTableHeader initialWidth={200} classes={`${thStyles} ${width} relative`} key={`th-${index}-${sanitizeString(cf.key)}`} colId={``} >
                            <div
                              className='relative flex w-full h-full items-center justify-start group'
                            >
                              {cf.key}
                            </div>
                          </ResizableTableHeader>
                        );
                      })}
                      <th className=' w-[50px]'></th>
                      <th className=''></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subtasksData && subtasksData.map((st, index)=>{
                      const cUser = st.createdBy as unknown as User;
                      const rUser = st.responsiblePerson as unknown as User;
                      const tskID = st._id;
                      const ids = extractAllIds(st);
                      let deleteRelated:DeleteRelated[];
                      return (
                        <Draggable key={`task-data-${index}-${st._id}`} draggableId={`task-data-${index}-${st._id}`} index={index}>
                        {(provided)=> (
                          <>
                        <tr key={`task-${index}-${st._id}`} className='group hover:bg-slate-100'
                         ref={provided.innerRef}
                         {...provided.draggableProps}
                         {...provided.dragHandleProps}
                        >
                          <td className='w-[20px] sticky left-[26px] bg-white z-10'>
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
                                              if(st._id){
                                                setRichtTextData({id:st?._id, field:'description', content:st.description ? st.description : ''})
                                              }

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
                          </td>
                          <td className='w-[5px] bg-green-200 border border-green-200 sticky left-[40px] z-10'></td>
                          <td className={`${tdStyles} w-[160px] sticky left-[23px] bg-white z-2 group-hover:bg-slate-100`}>
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
                                    <>
                                    {showNextLevel && 
                                      <FaAngleRight 
                                        className="text-slate-400"
                                        style={{
                                          transform: subTasksCount?.find(d => d.taskId === tskID && d.isOpen === true) 
                                            ? 'rotate(90deg)' 
                                            : 'rotate(0deg)',
                                          transition: 'transform 0.3s ease', // For smooth rotation
                                        }} 
                                      />
                                    }
                                    </>
                                  </div>
                                  }
                                </div>
                                <div className={`
                                  ${showNextLevel && 'group-hover:translate group-hover:translate-x-3 transition-all'}
                                  flex justify-between items-start
                                `}>
                                  <ClickToEdit value={st.name}  name='name'
                                      onBlur={(value)=>handleTaskInput(st._id ? st._id : '', 'name', value)}
                                    />
                                  {st.subtasks && st.subtasks.length > 0 && 
                                    <span className='ml-1 font-normal text-xs text-slate-500 bg-gray-200 rounded-sm px-1 py-0.7'>{st.subtasks.length}</span>
                                  }
                                </div>
                              </div>
                            </td>
                          <td className={`${tdStyles} w-[160px]`}>{rUser ? rUser.name : ''}</td>
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
                            <td className={`${tdStyles} w-[120px] text-center`}>
                            <CustomDateTimePicker2 selectedDate={st.startDate ? st.startDate : null} style='table'
                                        onDateChange={(rid, value, name)=>handleTaskInput(st._id ? st._id : '', 'startDate', value)}
                                />
                          </td>
                          <td className={`${tdStyles} w-[120px] text-center`}>
                          <CustomDateTimePicker2 selectedDate={st.dueDate ? st.dueDate : null} style='table'
                                      onDateChange={(rid, value, name)=>handleTaskInput(st._id ? st._id : '', 'dueDate', value)}
                              />
                          </td>
                          <td className={`${tdStyles} text-xs`} >
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
                            cfdata.selectedValue._id : cfdata.selectedValue : '';                        
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
                          <td className=' w-[50px]'></td>
                          <th className=''></th>
                        </tr>
                        {/* SUBTAKS L3 */}
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
                                      subtasks={st.subtasks ? st.subtasks as unknown as Task[] : []}
                                      type='subtask'
                                      taskId={tskID}
                                      handleTaskCustomField={handleTaskCustomField}
                                      DeleteRelatedUpdates={DeleteRelatedUpdates}
                                      addCustomField={addCustomField}
                                      deleteCustomField={deleteCustomField}
                                      openCustomFieldsPopup={openCustomFieldsPopup}
                                      getData={getData}
                                      addTask={addTask}
                                      parentTask={st}
                                      updateTask={updateTask}
                                      showNextLevel={false}
                                      handleTaskInput={handleTaskInput} subTasksCount={[]} toggleSubTasksCount={toggleSubTasksCount }                                    />
                                  </td>
                              </tr>
                            
                            }

                        </>
                        )}
                        </Draggable>
                      )
                    })}
                    <tr>
                      <td className='w-[20px] left-[26px] bg-white z-10'></td>
                      <td className='w-[3px] bg-green-200 border border-green-200 sticky left-[40px] z-10'></td>
                      <td 
                      className='border-t border-b border-l p-1
                      w-[200px] sticky left-[43px] bg-white z-10
                      '
                      >
                          <EnterInput name='addTask' onEnter={({name, value})=>addTask({name, value, taskId, parentTask})} showButton={false} 
                          placeholder={`+ ${t('addSubTasks')}`}
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
                      <td className='border-b border-t border-r'
                      colSpan={mainTaskData && mainTaskData.customFields ? mainTaskData.customFields.length + 6 : 6}
                      ></td>
                      <td className=''></td>
                      <td></td>
                    </tr>
                    </tbody>
                </table>
              )}
            </Droppable> 
          </DragDropContext>   
            </>
        }
        <SidePanel isOpen={sidePanelData.isOpen} title={sidePanelData.title} subtitle={sidePanelData.subtitle} 
        onClose={()=>{
          setSidePanelData({...sidePanelData, isOpen:false});
          setEditorData({...editorData, value:'', data:{}})
          setRichtTextData(null);
        }}
        >
          <div className='flex justify-end mb-2'>
              <div className='btn btn-solid flex justify-center items-center px-2 py-0.5 rounded-md cursor-pointer' onClick={saveRichTextData}>
                {t('save')}
              </div>
            </div>
          <RichtTextEditor
            value={editorData.value}
            data={editorData.data}
            onChange={(newContent, data)=>RichtTextEditorChange(newContent, data)}
          />
          
        </SidePanel>  
    </div>
  )
}

export default SubtasksTable
