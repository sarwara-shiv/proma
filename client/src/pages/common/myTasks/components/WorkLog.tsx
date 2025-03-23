/**
 * 
 * Work log reports
 * SCHENARIO
 * 1. user role  not admin or manager
 * can see only his worklog reports
 * report types: 
 *    1. project based
 *    Total time spent on particular project daily, weekly, monthly, total or startDate and endDate by each user and total
 *    
 *    2. userbased     
 *    Total time spend by user and on each project
 * 
 *    3. usertasks
 *    total time spend by user on each task
 * 
 */
import { NavLink, useLocation, useParams } from 'react-router-dom';
import PageTitel from '../../../../components/common/PageTitel';
import React, { ReactNode, useEffect, useState } from 'react';
import { IoPlay, IoPauseSharp } from "react-icons/io5";
import { MdAdd } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import PageSubmenu from '../../../../components/common/PageSubmenu';
import {useAuthContext } from '../../../../context/AuthContext';
import { Task, WorkLogType } from '../../../../interfaces';
import { workLogActions } from '../../../../hooks/dbHooks';
import { ObjectId } from 'mongodb';
import moment from 'moment'

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}
interface WorklogFilter {
  reportType?:'daily'|'weekly'|'monthyl' | null
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  userId?: string | ObjectId | null;
  taskId?: string | ObjectId | null;
  projectId?: string | ObjectId | null;
}

interface ReportByType{
  days:number
  hours:number
  minutes:number
  period:{month?:number, week?:number, year:number} 
  projectId:{_id:string | ObjectId, name:string, taskType:string}
  taskId:{_id:string | ObjectId, name:string, projectType:string}
  taskName?:string
  totalDuration?:number
  users:{_id:string | ObjectId, name:string, email:string, username:string}
}
interface ReportType{
  date:string,
  notes:{worklogId:string, note:string}[]
  officialHours:{days:string, hours:string, minutes:string}
  days:number
  hours:number
  minutes:number
  period:{month?:number, week?:number, year:number} 
  projectId:{_id:string | ObjectId, name:string, taskType:string}
  taskId:{_id:string, name:string, projectType:string}
  taskName?:string
  totalDuration?:number
  users:{_id:string | ObjectId, name:string, email:string, username:string}
}

const navItems: NavItem[] = [
  { link: "mytasks", title: "mytasks", icon: <IoPlay /> },
];

const WorkLog = () => {
  const {user} = useAuthContext();
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const { data, objectId } = location.state || {}; 
  const [pageTitle, setPageTitle] = useState("users");
  const [myWorklog, setMyWorkLog] = useState<WorkLogType[] | ReportByType[] | ReportType[]>([]);
  const [worklogType, setWorklogType] = useState<string>('daily');
  const [worklogFilters, setWorklogFileters] = useState<WorklogFilter>({reportType:'daily'});
  const [dataType, setDataType] = useState<'start'|'stop'|'update'|'report' | 'report2' | 'user-report' | 'admin-report' | 'reportByType'>('report2');
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';

  useEffect(()=>{
    setWorklogFileters((prev:WorklogFilter)=>{
      const userId = user?._id as unknown as ObjectId;
      // const userId = null;
      // const projectId = '6712b34aec33d905712ccf72';
      // const projectId = '67c76a62d1823709654ba6d4';
      const projectId = null;
      return {...prev, 
        userId,
        projectId,
        reportType : null,
        taskId: null,
        startDate:null,
        endDate:null,
      }
    })
    getWorkLog();
    getProjectReport();
  },[])

  /**
   * 
   * @param type:string daily, weekly, monthly
   *  
   * 
   * 
   */
  const getWorkLog= async()=>{
    let wtype = worklogFilters?.reportType || null;
    let projectId = worklogFilters?.projectId || null;
    let taskId = worklogFilters?.taskId || null;
    let startDate = worklogFilters?.startDate || null;
    let endDate = worklogFilters?.endDate || null;
    // const userId = worklogFilters?.userId || null;
    console.log(worklogFilters);
    let userId = user?._id as unknown as ObjectId 
    if(userId){
      try{

        // startDate = "2025-02-21";
        // endDate = "2025-03-22";
        // const res = await workLogActions({type:'report', body:{userId, reportType:wtype, projectId, startDate:'2024-01-01', endDate:'2025-03-22'}});

        const res = await workLogActions({type:dataType, body:{userId, reportType:'weekly', projectId, taskId, startDate,endDate}});
        console.log(res);
        if(res && res.data && res.data.length > 0){
          setMyWorkLog(res.data);
        }
      }catch(error){
        console.log(error);
      }
    }

  }
  /**
   * get project report
   */
  const getProjectReport= async()=>{

    console.log(worklogFilters);
    const userId = user?._id as unknown as ObjectId 
    if(userId){
      try{
        let projectId = null;
        //  projectId = '6712b34aec33d905712ccf72';
       projectId = '67c76a62d1823709654ba6d4';
        
        // const res = await workLogActions({type:'report', body:{userId, reportType:wtype, projectId, startDate:'2024-01-01', endDate:'2025-03-22'}});
        const res = await workLogActions({type:'projectReport', body:{}});
        // const res = await workLogActions({type:'projectReport', body:{projectId}});
        console.log(res);
      }catch(error){
        console.log(error);
      }
    }

  }
  const getReadableMonth = (monthNumber:number) => {
    return moment().month(monthNumber).format('MMMM');  // 'MMMM' returns the full month name
  };
  
  const getStartAndEndDateOfWeek = (year:number, weekNumber:number) => {
    const startDate = moment().year(year).week(weekNumber).startOf('week');
    const endDate = moment(startDate).endOf('week');
  
    return {
      start: startDate.format('DD.MMM.YYYY'),  // Format as "YYYY-MM-DD"
      end: endDate.format('DD.MMM.YYYY'),
    };
  };


  return (
    <div className='page-wrap relative'>
      <div className='content mb-7'>
        <div className='content-wrap p-4 '>
          {(dataType === "report" || dataType === "report2") && <div className='card bg-white'>
            <table className='table-auto border-collapse w-full table-fixed custom-table'>
            <thead className='sticky top-0 z-10 items-left'>
              <tr className='border-b text-sm font-normal items-left text-left'>
                <th className='p-1 w-8'>{t('srnr')}</th>
                <th className='p-1'>{t('project')}</th>
                <th className='p-1'>{t('task')}</th>
                <th className='p-1'>{t('date')}</th>
                <th className='p-1'>{t('duration')}</th>
              </tr>
            </thead>
            <tbody className='text-xs items-left text-gray-500 text-left'>
            {myWorklog && myWorklog.length > 0 && myWorklog.map((data, key)=>{
              return (
                <tr key={key}>
                  <td>{key+1}</td>
                  <td>{(data as unknown as ReportType).projectId.name} </td>
                  <td>{(data as unknown as ReportType).taskId.name} </td>
                  <td>{(data as unknown as ReportType).date}</td>
                  <td>
                    <div className='flex gap-1'>
                      <span className='flex flex-col justify-center items-center'>
                        <span>{`${(data as unknown as ReportByType).days}`}</span>
                        {t('days')}
                      </span>
                      <span  className='flex flex-col justify-center items-center'>
                        <span>{` ${(data as unknown as ReportByType).hours}`}</span>
                        {t('hours')}
                      </span>
                      <span  className='flex flex-col justify-center items-center'>
                        <span>{` ${(data as unknown as ReportByType).minutes} `}</span>
                        {t('minutes')}
                      </span>
                      </div>
                  </td>
                  </tr>
                )
              })}
            </tbody>
            </table>
            </div>}
          {dataType == "reportByType" && <div className='card bg-white'>
          <table className='table-auto border-collapse w-full table-fixed custom-table'>
            <thead className='sticky top-0 z-10 items-left'>
              <tr className='border-b text-sm font-normal items-left text-left'>
                <th className='p-1 w-8'>{t('srnr')}</th>
                <th className='p-1'>{t('project')}</th>
                <th className='p-1'>{t('task')}</th>
                <th className='p-1'>{t('period')}</th>
                <th className='p-1'>{t('duration')}</th>
              </tr>
            </thead>
            <tbody className='text-xs items-left text-gray-500 text-left'>
            {myWorklog && myWorklog.length > 0 && myWorklog.map((data, k)=>{
                const period = (data as unknown as ReportByType).period?.month ? (data as unknown as ReportByType).period?.month 
                              : (data as unknown as ReportByType).period?.week ? (data as unknown as ReportByType).period?.week : false;
                const type = (data as unknown as ReportByType).period?.month ? 'month' 
                              : (data as unknown as ReportByType).period?.week ? 'week': false;
                const month = period && type == 'month' ? getReadableMonth(period - 1) : false;
                const week = period && type == 'week' ? getStartAndEndDateOfWeek((data as unknown as ReportByType).period.year, period ) : false;
              return (
                <tr key={`${k}`}>
                  <td className='p-1 w-2'>{k+1}</td>
                  <td className='p-1'>{(data as unknown as ReportByType)?.projectId?.name || ''  }</td>
                  <td className='p-1'>{(data as unknown as ReportByType)?.taskId?.name || ''  }</td>
                  <td className='p-1'>
                    {month && type === 'month' ? `${month}, ${(data as unknown as ReportByType).period.year}` :''}   
                    {week && type === 'week' ? `${week.start} - ${week.end}` :''}
                  </td>
                  <td className='p-1'>
                    <div className='flex gap-1'>
                      <span className='flex flex-col justify-center items-center'>
                        <span>{`${(data as unknown as ReportByType).days}`}</span>
                        {t('days')}
                      </span>
                      <span  className='flex flex-col justify-center items-center'>
                        <span>{` ${(data as unknown as ReportByType).hours}`}</span>
                        {t('hours')}
                      </span>
                      <span  className='flex flex-col justify-center items-center'>
                        <span>{` ${(data as unknown as ReportByType).minutes} `}</span>
                        {t('minutes')}
                      </span>
                    </div>
                    
                    
                   
                  </td>
                </tr>
                )
              })}
              
            </tbody>
            </table></div>
            }
        </div>
      </div>
    </div>
  );
}

export default WorkLog;
