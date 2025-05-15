import { useEffect, useState } from "react";
import { workLogActions } from "../../../../hooks/dbHooks";
import { AdminActiveWorklogType} from "@/interfaces";
import { Headings, NoData } from "../../../../components/common";
import { t } from "i18next";
import { trimHtmlContent } from "../../../../utils/commonUtils";
import { format } from "date-fns";
import { useSocket } from "../../../../context/SocketContext";


const ActiveWorklogs = ()=>{
  const [worklogs, setWorklogs] = useState<AdminActiveWorklogType[]>([]);
  const [newWorklog, setNewWorklog] = useState<number>(0);
  const socket = useSocket();

  /**
   * 
   * add id to show as new
   * 
   */
    useEffect(() => {
      if(socket){
          socket.on('worklog-started', (payload:any) => {
              console.log('🔔 started:', payload.data);
              setNewWorklog((prev)=>prev+1);
          });
          socket.on('worklog-stopped', (payload:any) => {
              console.log('🔔 stopped:', payload);
              setNewWorklog((prev)=>prev-1);
          });
      }
      return () => {
          if (socket) {
            socket.off('worklog-started'); 
            socket.off('worklog-stopped');  
          }
        };
    }, []);
    
    useEffect(()=>{
        getActiveWorkLog();
    },[newWorklog]);


    const getActiveWorkLog = async()=>{
        try{
          const res = await workLogActions({type:'adminActiveWorklog', body:{}});
          console.log(res);
          if(res.data){
            setWorklogs(res.data);
            setNewWorklog(res.data.count);
          }
        }catch(error){
          console.log(error);
        }
      }

    return (
        <div className="flex flex-col">
            <Headings text={t('activeWorklogs')} type="h3" />
            {worklogs && worklogs.length > 0 ? 
              <div className=''>
                {worklogs.map((data:AdminActiveWorklogType, key)=>{
                  return (
                    <div key={`user-${key}-${data.userId}`} className='card bg-white '>
                        <div className='p-1 text-lg font-bold text-slate-500'>{data.userName}</div>
                        <div className=''>
                          <table className='custom-table table-fixed w-full table-responsive text-left'>
                            <thead>
                              <tr>
                                <th className='w-10'>{t('srnr')}</th>
                                <th>{t('Project')}</th>
                                <th>{t('Task')}</th>
                                <th>{t('user')}</th>
                                <th>{t('duration')}</th>
                                <th className='text-right'>{t('start_time')}</th>
                              </tr>
                            </thead>
                            <tbody>

                              {data.data && data.data.map((tasks, tkey)=>{
                                return (
                                  <tr key={`task-${key}${tkey}-${tasks.taskId._id}`}>
                                    <td>{tkey+1}</td>
                                    <td>{tasks.projectId.name}</td>
                                    <td>{tasks.taskId.name}</td>
                                    <td>{data.userName}</td>
                                    <td className='items-left text-left'>
                                      <div className='flex justify-start items-center gap-2'>
                                          <span className='flex flex-col justify-center items-center'><span className='font-bold pr-1'>{tasks.days}</span>{t('days')}</span>
                                          <span className='flex flex-col justify-center items-center'><span className='font-bold pr-1'>{tasks.hours}</span>{t('hours')}</span>
                                          <span className='flex flex-col justify-center items-center'><span className='font-bold pr-1'>{tasks.minutes}</span>{t('minutes')}</span>
                                      </div>
                                    </td>
                                    <td className=''>
                                      {tasks.notes.length > 0 && 
                                        <div className='flex justify-end gap-2'>
                                          <div className='items-right text-right'>
                                            {trimHtmlContent(format(tasks.notes[0].startTime, 'dd.MMM.yyyy HH:mm'))}
                                          </div>
                                          </div>
                                        }
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  }
                )
              }
              </div>
                :
                <div className='card bg-white  p-6'>
                <NoData>
                  <div className="flex gap-2">
                    🙁 <span className="italic">{t("activeWorklogs_empty")}</span>
                  </div>
                </NoData>
                </div>
            }
        </div>
    )
}

export default ActiveWorklogs