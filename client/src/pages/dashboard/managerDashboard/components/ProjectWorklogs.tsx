import { useEffect, useState } from "react";
import { workLogActions } from "../../../../hooks/dbHooks";
import { AdminUserReportType, WorkLogType } from "@/interfaces";
import { Headings, NoData } from "../../../../components/common";
import { t } from "i18next";
import { MdInfo } from "react-icons/md";
import { formatDate } from "date-fns";
import { trimHtmlContent } from "../../../../utils/commonUtils";
import { useSocket } from "../../../../context/SocketContext";


const ProjectWorklogs= ()=>{
    const [adminReport, setAdminReport] = useState<AdminUserReportType[]>([]);
    const [newWorklog, setNewWorklog] = useState<number>(0);
    const socket = useSocket();

    /**
     * TODO
     * add to show new entry
     */
    useEffect(() => {
      if(socket){

          socket.on('worklog-stopped', (payload:any) => {
            setNewWorklog((prev)=>prev+1);
              console.log('🔔 stopped:', payload);
          });
      }
      return () => {
          if (socket) {
            socket.off('worklog-stopped');  
          }
        };
    }, []);
    
    useEffect(()=>{
        getProjectReport();
    },[newWorklog]);


        /**
   * get project report
   */
  const getProjectReport= async()=>{

      try{
        // const res = await workLogActions({type:'report', body:{userId, reportType:wtype, projectId, startDate:'2024-01-01', endDate:'2025-03-22'}});
        const startDate = null;
        const res = await workLogActions({type:'adminReport', body:{startDate}});
        // const res = await workLogActions({type:'projectReport', body:{projectId}});
        console.log(res);
        if(res && res.data){
          setAdminReport(res.data);
        }
      }catch(error){
        console.log(error);
      }
  }

  const openNotesPopup = (notes:{worklogId:string, note:string}[])=>{
    if (notes && notes.length > 0) {
      const notesHtml = notes.map(n => `<div class="mb-2 p-1 bg-primary-light rounded-sm">${n.note.trim()}</div>`).join('');
    //   setAlertData({...alertData, isOpen:true, content:<div className='flex flex-col g-2' dangerouslySetInnerHTML={{ __html: notesHtml }} />})
    }
  }

    return (
        <div className="flex gap-4 flex-col">
            <Headings text={t('todaysWorklogs')} type="h3" />
            {/* ADMIN REPORT */}
            {adminReport && adminReport.length > 0 ? 
              <div className=''>
                {adminReport.map((data:AdminUserReportType, key)=>{
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
                                <th>{t('duration')}</th>
                                <th>{t('date')}</th>
                                <th className='text-right'>{t('note')}</th>
                              </tr>
                            </thead>
                            <tbody>

                              {data.data && data.data.map((tasks, tkey)=>{
                                return (
                                  <tr key={`task-${key}${tkey}-${tasks.taskId._id}`}>
                                    <td>{tkey+1}</td>
                                    <td>{tasks.projectId.name}</td>
                                    <td>{tasks.taskId.name}</td>
                                    <td className='items-left text-left'>
                                      <div className='flex justify-start items-center gap-2'>
                                          <span className='flex flex-col justify-center items-center'><span className='font-bold pr-1'>{tasks.days}</span>{t('days')}</span>
                                          <span className='flex flex-col justify-center items-center'><span className='font-bold pr-1'>{tasks.hours}</span>{t('hours')}</span>
                                          <span className='flex flex-col justify-center items-center'><span className='font-bold pr-1'>{tasks.minutes}</span>{t('minutes')}</span>
                                      </div>
                                    </td>
                                    <td>{formatDate(tasks.date, 'dd.MMM.yyyy')}</td>
                                    <td className=''>
                                      {tasks.notes.length > 0 && 
                                        <div className='flex justify-end gap-2'>
                                          <div className='w-[100px] truncate overflow-hidden whitespace-nowrap items-right text-right'>
                                            {trimHtmlContent(tasks.notes[0].note)}
                                          </div>
                                          {tasks.notes.length > 0 && 
                                            <div onClick={()=>{openNotesPopup(tasks.notes)}} 
                                              className='
                                              cursor-pointer text-slate-400 hover:text-primary
                                              '>
                                              <MdInfo />
                                            </div>
                                          }
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
            <div className='card bg-white p-6'>
              <NoData>
                <div className="flex gap-2">
                  🙁 <span className="italic">{t("todaysWorklogs_empty")}</span>
                  </div>
              </NoData>
            </div>
            }
        </div>
    )
}

export default ProjectWorklogs