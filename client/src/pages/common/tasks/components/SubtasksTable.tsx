import { getColorClasses } from '../../../../mapping/ColorClasses';
import { DeleteById } from '../../../../components/actions';
import DeleteSmallButton from '../../../../components/common/DeleteSmallButton';
import EnterInput from '../../../../components/forms/EnterInput';
import { DynamicField, MainTask, QaTask, RelatedUpdates, Task, User } from '@/interfaces'
import { format } from 'date-fns';
import { ObjectId } from 'mongodb'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { FaAngleRight } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { CustomDropdown } from '../../../../components/forms';
import CustomDateTimePicker2 from '../../../../components/forms/CustomDateTimePicker';
import ClickToEdit from '../../../../components/forms/ClickToEdit';
interface ArgsType{
    mainTask:MainTask | null;
    subtasks:Task[];
    parentTask:Task | null,
    type?:'task' | 'subtask';
    taskId?:string|ObjectId|null;
    addCustomField:(value:DynamicField, index:number|null)=>void;
    deleteCustomField:(index:number, key:string)=>void;
    openCustomFieldsPopup:()=>void;
    handleTaskCustomField:(taskId: string | ObjectId,
      customField: DynamicField,
      value: any,
      cfdata: DynamicField[])=>void;
    getData:()=>void;
    handleTaskInput:(taskId:string|ObjectId, field:string, value:string)=>void;
    DeleteRelatedUpdates:RelatedUpdates[];
    addTask:({name, value, taskId}:{name:string, value:string, taskId:string|ObjectId|null, parentTask:Task|null})=>void
}
const SubtasksTable:React.FC<ArgsType> = ({
    mainTask, subtasks, type='task', taskId=null,
    addCustomField, deleteCustomField, openCustomFieldsPopup,addTask,getData,DeleteRelatedUpdates,
    handleTaskCustomField, handleTaskInput, parentTask=null
}) => {
    const {t} = useTranslation();
    const [mainTaskData, setMainTaskData] = useState<MainTask | null>(mainTask || null)
    const thStyles = 'text-xs font-normal text-slate-600 p-2 text-left border border-slate-200';
    const tdStyles = 'text-xs font-normal text-slate-400 p-2 text-left  border border-slate-200';
  
    const tdClasses = 'p-2 text-xs';
  useEffect(()=>{
    setMainTaskData(mainTask);
  },[mainTask?.customFields])

  return (
    <div>
        {mainTaskData && 
            <table className='w-full table-fixed'>
                <thead>
                <tr className='text-sm font-normal'>
                  <th className='w-[20px] relative text-center sticky left-[26px] bg-white z-10'>
                    <div className='w-[30px] absolute h-[1px] left-[-4px]
                      bg-green-200
                    '>

                    </div>

                  </th>
                  <th className='w-[3px] bg-green-200 border border-green-200 sticky left-[40px] z-10'></th>
                  <th className={`${thStyles} w-[200px]  sticky left-[43px] bg-white z-10`} >{t('subtask')}</th>
                  <th className={`${thStyles}  w-[160px]`}>{t('responsiblePerson')}</th>
                  <th className={`${thStyles} text-center w-[120px]`}>{t('priority')}</th>
                  <th className={`${thStyles} w-[120px] text-center`}>{t('status')}</th>
                  <th className={`${thStyles} w-[100px] text-center`} >{t('startDate')}</th>
                  <th className={`${thStyles} w-[100px] text-center`} >{t('dueDate')}</th>
                  
                  {mainTaskData && mainTaskData.customFields && mainTaskData.customFields.map((cf, index)=>{
                    const width = (cf.type === 'status' || cf.type === 'dropdown' || cf.type === 'date' ) ? 'w-[120px]' : 'w-[200px]'  ;
                    return (
                      <th key={`th-${index}`} className={`${thStyles} ${width}`} >
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
                  <th className=' w-[50px]'></th>
                  <th className=''></th>
                </tr>
              </thead>
              <tbody>
                {subtasks && subtasks.map((st, index)=>{
                  const cUser = st.createdBy as unknown as User;
                  const rUser = st.responsiblePerson as unknown as User;
                  const tskID = st._id;
                  console.log(DeleteRelatedUpdates)
                  return (
                    <tr key={`task-${index}`} className='group hover:bg-slate-100'>
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
                            {tskID && 
                              <DeleteById style='fill' icon='close' data={{id:tskID, type:'tasks', page:'tasks'}} relatedUpdates={DeleteRelatedUpdates} 
                                onYes={getData}
                              />
                            }
                          </div>
                      </td>
                      <td className='w-[5px] bg-green-200 border border-green-200 sticky left-[40px] z-10'></td>
                      <td className={`${tdStyles} w-[200px] left-[43px] sticky bg-white z-10 group-hover:bg-slate-100`}>
                            {/* {st.name} */}
                            <ClickToEdit value={st.name}  name='name'
                                onBlur={(value)=>handleTaskInput(st._id ? st._id : '', 'name', value)}
                              />
                      </td>
                      <td className={`${tdStyles} w-[160px]`}>{rUser ? rUser.name : ''}</td>
                      <td className={`${tdStyles} w-[120px] ${getColorClasses(st.priority)} text-center`}>{st.priority}</td>
                      <td className={`${tdStyles}  w-[120px] ${getColorClasses(st.status)} text-center text-[10px]`}>{t(`${st.status}`)}</td>
                      <td className={`${tdStyles} w-[80px] text-center`}>{st.startDate ? format(st.startDate, 'dd.MM.yyyy') : ''}</td>
                      <td className={`${tdStyles} w-[80px] text-center`}>{st.dueDate ? format(st.dueDate, 'dd.MM.yyyy') : ''}</td>
                      {mainTaskData && mainTaskData.customFields && mainTaskData.customFields.map((cf, index)=>{
                        const fV = st.customFields ? st.customFields.find((tcf)=>tcf.key === cf.key) : null;
                        const tid = st._id ? st._id : '';

                        const cfdata = fV;

                        const cfcolor = cfdata && (cfdata.type === 'dropdown' || cfdata.type === 'status') ? 
                        `bg-${cfdata.value.color} text-${cfdata.value.color}-dark` : '';

                        const cftype = cfdata ? cfdata.type : '';

                        const cfvalue = cfdata ? (cfdata.type === 'dropdown' || cfdata.type === 'status') ? 
                        cfdata.value._id : cfdata.value : '';                        
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
                  <td className='border-b border-r'
                  colSpan={mainTaskData && mainTaskData.customFields ? mainTaskData.customFields.length + 5 : 5}
                  ></td>
                  <td className=''></td>
                  <td></td>
                </tr>
                </tbody>
            </table>
        }
    </div>
  )
}

export default SubtasksTable
