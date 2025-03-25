import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppContext } from '../../../context/AppContext';
import {useAuthContext } from '../../../context/AuthContext';
import { AlertPopupType, CustomPopupType, MainTask, Project, Task, User } from '../../../interfaces';
import { useState } from 'react';
import { CustomAlert, CustomPopup } from '../../../components/common';
import { format } from 'date-fns';
import { workLogActions } from '../../../hooks/dbHooks';
import { RichTextArea } from '../../../components/forms';

const ActiveWorkLog = () => {
    const { t } = useTranslation();
    const {role} = useAuthContext();
    const [taskNotes, setTaskNotes] = useState<string>('');
    const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: t('active_task') });
    const {activeWorkLog, setActiveWorkLog, activeDailyReport, setActiveDailyReport} = useAppContext();
    const [custoPopupData, setCustomPopupData] = useState<CustomPopupType>({isOpen:false, title:'', content:''})

    const toggleWorklog = ({task}:{task:Task})=>{
        console.log('stop task?');
       
        const text = <div>Are you sure you want to close current Task? <span className="font-bold text-primary">{(activeWorkLog?.task as unknown as Task).name} </span></div>;
        setAlertData({...alertData, isOpen:true});
        setCustomPopupData((res:CustomPopupType)=>{
            return ({...res, isOpen:true, data:task, 
            content:<>
                <div className='text-xs mb-2'>{text}</div><RichTextArea name="textarea"
                    onChange={(name, value)=>richtTextonChange(value)} label='Add Notes' height='150' maxHeight='150'
                />    
                </>
            })
        })
    }

    const richtTextonChange = (value:string)=>{
        setTaskNotes((prevVal)=>{
            console.log(prevVal);
            return value
        }); 

    }

    // closePopup
    const closePopup = ()=>{
        console.log(taskNotes);
        setTaskNotes('');
        setCustomPopupData((res:CustomPopupType)=>{
            return ({...res, isOpen:false, title:'', content:''});
        })
    }

    // STOP WORKLOG
     const onStopWorklog = async()=>{
        try{
            if(activeWorkLog){
                const id = activeWorkLog && activeWorkLog._id;
                console.log(activeWorkLog);
                console.log(taskNotes);
                if(id){
                    const res = await workLogActions({type:'stop', id:id, body:{notes:taskNotes, worklogId:id}});
                    if(res.code === 'worklog_stopped'){
                        setActiveWorkLog(null);
                    }
                }
            }
            closePopup();
        }catch(error){
            console.log(error);
        }
    }

    // TASK DETAILS
    const openTaskDetails = () => {
        setAlertData({
          ...alertData,
          isOpen: true,
          content: (
            <div>
              {activeWorkLog && 
              <>
              {/* Header Section */}
              <div className="block px-2 py-1 flex gap-2 items-center justify-between">
                <div>
                  <span className="text-primary font-bold text-lg">
                    {(((activeWorkLog.task as unknown as Task)._mid as unknown as MainTask)._pid as unknown as Project).name}
                  </span>
                  <span className="text-xs px-1 py-0.5 text-slate-500 ml-1 font-normal bg-slate-200/60 rounded-sm">
                    {t(`${(((activeWorkLog.task as unknown as Task)._mid as unknown as MainTask)._pid as unknown as Project).projectType}`)}
                  </span>
                </div>
                <div
                  onClick={() => toggleWorklog({ task: activeWorkLog.task as unknown as Task })}
                  className="text-green-500 text-sm flex gap-1 items-center py-0.5 px-1 bg-green-100 rounded-md cursor-pointer"
                >
                  {t('stop')}
                </div>
              </div>
      
              {/* Task Details */}
              <div className="flex flex-wrap gap-2 text-sm p-2">
                <div className="inline-block px-2 py-1 rounded-md bg-slate-200/60">
                  <span className="text-slate-500 text-xs">{t('mainTask')}</span> : 
                  {((activeWorkLog.task as unknown as Task)._mid as unknown as Task).name}
                </div>
                <div className="inline-block px-2 py-1 rounded-md bg-slate-200/60">
                  <span className="text-slate-500 text-xs">{t('task')}</span> : 
                  {(activeWorkLog.task as unknown as Task).name}
                </div>
                <div className="inline-block px-2 py-1 rounded-md bg-slate-200/60">
                  <span className="text-slate-500 text-xs">{t('assignedBy')}</span> : 
                  {(activeWorkLog.user as unknown as User).name}
                </div>
                <div className="inline-block px-2 py-1 rounded-md bg-slate-200/60">
                  <span className="text-slate-500 text-xs">{t('assignedDate')}</span> : 
                  {(activeWorkLog.task as unknown as Task).assignedDate
                    ? format(((activeWorkLog.task as unknown as Task).assignedDate) as unknown as Date, 'dd.MM.yyyy')
                    : ''}
                </div>
              </div>
              </>
              }  
            </div>
          ),
        });
      };
      


    if(!activeWorkLog) return null;

    return (
        <>
        {activeWorkLog && activeWorkLog.task &&
            <div className='fixed bottom-10 right-8'>
                <div onClick={openTaskDetails} 
                    className='cursor-pointer relative flex justify-center items-center p-1 bg-primary text-xs text-white rounded-sm shadow-md'>
                    {(activeWorkLog.task as unknown as Task)._cid}
                </div>
            </div>  
        }
        <CustomAlert 
            isOpen={alertData.isOpen}
            content={alertData.content}
            onClose={()=>{setAlertData({...alertData, isOpen:false, content:""})}}
        />
        <CustomPopup 
            isOpen={custoPopupData.isOpen}
            onClose={closePopup}
            yesFunction={onStopWorklog}
            noFunction={closePopup}
            data={custoPopupData.data? custoPopupData.data : {}}
            title={custoPopupData.title}
            content={custoPopupData.content}
        />
        </>
    );
};

export default ActiveWorkLog;
