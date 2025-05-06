import { useTranslation } from "react-i18next";
import { NavItem, Project, User } from "../../../../interfaces";
import { ObjectId } from "mongodb";
import { useAuthContext } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { workLogActions } from "../../../../hooks/dbHooks";
import UserBarChart from "../../../../components/charts/UserBarChart";
import UserPieChart from "../../../../components/charts/UserPieChart";
import { format } from "date-fns";
import { DaysLeft } from "../../../../components/common";
import { getColorClasses } from "../../../../mapping/ColorClasses";
import ProjectProgress from "./ProjectProgress";
import { FaEye, FaPencilAlt, FaTasks } from "react-icons/fa";
import { MdRocketLaunch } from "react-icons/md";
import { DiScrum } from "react-icons/di";
import { IoBarChartSharp, IoDocumentAttach } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";

interface ProjectReportType {
    projectId: {_id:string, name:string, projectType:string}
    projectTime : {days:number, hours:number, minutes:number}
    totalDuration:number
    tasks:{
        taskId: {_id:string, name:string, taskType:string}
        taskName:string,
        time:{days:number, hours:number, minutes:number}
        totalDuration:number
        workingTime: {days:number, hours:number, minutes:number}
    }[]
    timePeriod:{startDate:Date, endDate:Date},
    project:Project | null,
    workingProjectTime:{days:number, hours:number, minutes:number}
    users:{
        userId: {_id:string, name:string, email:string}
        time: {days:number, hours:number, minutes:number}
        totalDuration:number
        userName:string,
        workingTime:{days:number, hours:number, minutes:number}
    }[]
  }

  interface ArgsType {

    setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
  }
const ProjectReport:React.FC<ArgsType> = ({setSubNavItems})=>{
    const {t} = useTranslation();
    const {user} = useAuthContext();
    const [reportData, setReportData] = useState<ProjectReportType | null>();
    const {id} = useParams();
    const PnavItems: NavItem[] = [
        { link: `projects/view/${id}`, title: "view", icon:<FaEye />},
        { link: `projects/update/${id}`, title: "update", icon:<FaPencilAlt />},
        { link: `projects/maintasks/${id}`, title: "maintasks", icon:<FaTasks />},
        { link: `projects/kickoff/${id}`, title: "kickOff", icon:<MdRocketLaunch />},
        { link: `projects/sprints/${id}`, title: "sprints", icon:<DiScrum />}, 
        { link: `projects/report/${id}`, title: "report", icon:<IoBarChartSharp />}, 
        { link: `projects/documentation/${id}`, title: "documentation", icon:<IoDocumentAttach />},
        { link: `projects/add`, title: "projects_add", icon:<IoMdAdd />},
      ];

    useEffect(()=>{
        if(id) getProjectReport(id);
        setSubNavItems(PnavItems);
    },[])

    const getProjectReport = async (id:string)=>{
        if(id){
            try{
                const res = await workLogActions({type:'projectReport', body:{projectId:id}});
                console.log(res);
                if(res.status === 'success'){
                    if(res.data && res.data.length > 0){
                        setReportData(res.data[0]);
                    }
                }

            }catch(error){
                console.error(error);
            }
        }else{
            console.error('id not provided');
        }
    }

    return (
        <div>
            {reportData && 
            <div>
                <div>
                    <div className="text-slate-600 mb-2 text-2xl font-bold">{reportData.projectId.name}</div>
                </div>
                {reportData.project && 
                <div className="flex justify-between flex-wrap">
                    <div className="flex flex-wrap gap-4">
                        {reportData.project.createdAt && 
                        <div>
                            <span className='text-slate-400 text-xs'>{t('createdAtDate')}: </span>
                            <span className='text-sm text-slate'>
                            {format(reportData.project.createdAt, 'dd.MM.yyyy')}
                            </span>
                            </div>
                        }
                        {reportData.project.dueDate && 
                        <div>
                            <span className='text-slate-400 text-xs'>{t('dueDate')}: </span>
                            <span className='text-sm text-slate'>
                            {format(reportData.project.dueDate, 'dd.MM.yyyy')}
                            </span>
                            </div>
                        }
                        {reportData.project.endDate && 
                        <div>
                            <span className='text-slate-400 text-xs'>{t('endDate')}: </span>
                            <span className='text-sm text-slate'>
                            {format(reportData.project.endDate, 'dd.MM.yyyy')}
                            </span>
                            </div>
                        }
                        {reportData.project.createdBy && 
                        <div>
                            <span className='text-slate-400 text-xs'>{t('createdBy')}: </span>
                            <span className='text-sm text-slate'>
                            {(reportData.project.createdBy as unknown as User).name}
                            
                            </span>
                            </div>
                        }
                    </div>
                    <div className="mb-8 flex flex-wrap gap-6">
                        <div className='flex items-center flex-cols bg-white gap-2 px-1 rounded-md border'>
                            <span className='text-xs text-slate-400'>{t('status')}</span>
                            <div className={`text-xs rounded-sm  border-white border-1 
                                px-1 py-1
                                ${getColorClasses(reportData.project.status)} 
                                text-xs flex justify-center items-center rounded-sm 
                                `}>
                                    
                                    {t(`${reportData.project.status}`)}
                            </div>
                        </div>
                        <div className='flex items-center flex-cols bg-white gap-2 px-1 rounded-md border'>
                            <span className='text-xs text-slate-400'>{t('priority')}</span>
                            <div className={`text-xs rounded-sm  border-white border-1 
                                px-1 py-1
                                ${getColorClasses(reportData.project.priority)} 
                                text-xs flex justify-center items-center rounded-sm 
                                `}>
                                    
                                    {t(`${reportData.project.priority}`)}
                            </div>
                        </div>
                    </div>
                </div>
                }
                <div className="flex gap-2 justify-start flex-wrap gap-6 mb-6">
                    {/* {reportData.project && 
                    <div className="bg-white card rounded-md p-4">
                        <div className="text-slate-600 mb-2 text-lg font-semibold">Project Timeline</div>
                        <div className="flex gap-4 ">
                            <div className="flex flex-col justify-center items-start">
                                <span className="text-xs text-slate-400">{t('startDate')} </span>
                                {reportData.project.startDate ? <span className="text-sm">{format(reportData.project.startDate, 'dd.MMM.yyyy')}</span> : <span>-</span>}
                            </div>
                            <div className="flex flex-col justify-center items-start">
                                <span className="text-xs text-slate-400">{t('dueDate')} </span>
                                {reportData.project.dueDate ? <span className="text-sm">{format(reportData.project.dueDate, 'dd.MMM.yyyy')}</span> : <span>-</span>}
                            </div>
                            <div className="flex flex-col justify-center items-start">
                                <span className="text-xs text-slate-400">{t('endDate')} </span>
                                {reportData.project.endDate ? <span className="text-sm">{format(reportData.project.endDate, 'dd.MMM.yyyy')}</span> : <span>-</span>}
                            </div>
                        </div>
                    </div>
                    } */}
                    <div className="bg-white card">
                        <div className="text-slate-600 mb-2 text-lg font-semibold">{t('report')} {t('timeline')}</div>
                        <div className="flex gap-2 flex-wrap">
                            <div className="flex flex-col justify-center items-start">
                                <span className="text-xs text-slate-400">{t('startDate')} </span>
                                <span>{format(reportData.timePeriod.startDate, 'dd.MMM.yyyy')}</span>
                            </div>
                        
                            <div className="flex flex-col justify-center items-start">
                                <span className="text-xs text-slate-400">{t('endDate')} </span>
                                <span>{format(reportData.timePeriod.endDate, 'dd.MMM.yyyy')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white card">
                        <div className="text-slate-600 mb-2 text-lg font-semibold">{t('tasks')} {t('timeline')}</div>
                        <div className="flex gap-2 flex-wrap">
                            <div className="flex flex-col justify-center items-left">
                                <span className="text-xs text-slate-400">{t('total_hours')}</span>
                                <span className="text-sm bold">{Math.floor(reportData.totalDuration/60)}</span>
                            </div>
                            <div className="flex flex-col justify-center items-left">
                                <span className="text-xs text-slate-400">{t('days')}</span>
                                <span className="text-sm bold">{reportData.projectTime.days}</span>
                            </div>
                            <div className="flex flex-col justify-center items-left">
                                <span className="text-xs text-slate-400">{t('hours')}</span>
                                <span className="text-sm bold">{reportData.projectTime.hours}</span>
                            </div>
                            <div className="flex flex-col justify-center items-center">
                                <span className="text-xs text-slate-400">{t('minutes')}</span>
                                <span className="text-sm bold">{reportData.projectTime.minutes}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users */}
                {reportData.users && reportData.users.length > 0 && 
                <>
                    <div className="flex gap-4 flex-col mb-8 lg:flex-row">
                        <div className="flex-1 min-w-sm bg-gray-100 rounded-md">
                            <UserBarChart users={reportData.users} />
                        </div>
                        <div className="flex-1 min-w-sm bg-gray-100 rounded-md"> 
                            <UserPieChart users={reportData.users} />
                        </div>
                        {reportData.project && 
                            <div className="flex-1 min-w-sm bg-gray-100 p-4 rounded-md">
                                <ProjectProgress project={reportData.project}/>
                            </div>
                        }
                    </div>
                    <div className="mb-8 card bg-white p-4">
                        <div className="text-lg text-slate-500 font-bold">{t('users')}</div>
                        <table className="table-auto border-collapse w-full table-fixed custom-table">
                            <thead>
                                <tr>
                                    <th className="text-left w-12 py-4">{t('srnr')}</th>
                                    <th className="text-left py-4">{t('name')}</th>
                                    <th className="text-right py-4">{t('duration')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.users.map((data,key)=>{
                                    return (
                                        <tr key={key}>
                                            <td className="text-left">{key + 1}</td>
                                            <td className="text-left">
                                                {data.userName}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex gap-3 text-gray-400 justify-end">
                                                    <span><span className="font-bold text-gray-800">{data.time.days}</span>{t('D')}</span>
                                                    <span><span className="font-bold text-gray-800">{data.time.hours}</span>{t('H')}</span>
                                                    <span><span className="font-bold text-gray-800">{data.time.minutes}</span>{t('M')}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    </>
                }
                {/* TASKS */}
                {reportData.tasks && reportData.tasks.length > 0 &&
                    <div className="mb-8 card bg-white p-4">
                        <div className="text-lg text-slate-500 font-bold">{t('tasks')}</div>
                        <table className="table-auto border-collapse w-full table-fixed custom-table p-2">
                            <thead>
                                <tr>
                                    <th className="text-left w-12">{t('srnr')}</th>
                                    <th className="text-left">{t('Task')}</th>
                                    <th className="text-right">{t('duration')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.tasks.map((data,key)=>{
                                    return (
                                        <tr key={key}>
                                            <td className="text-left">{key + 1}</td>
                                            <td className="text-left">
                                                {data.taskName}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex gap-3 text-gray-400 justify-end">
                                                    <span><span className="font-bold text-gray-800">{data.time.days}</span>{t('D')}</span>
                                                    <span><span className="font-bold text-gray-800">{data.time.hours}</span>{t('H')}</span>
                                                    <span><span className="font-bold text-gray-800">{data.time.minutes}</span>{t('M')}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                }

            </div>
            }
        </div>
    )
}

export default ProjectReport