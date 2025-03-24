import { useTranslation } from "react-i18next";
import { NavItem, Project } from "../../../../interfaces";
import { ObjectId } from "mongodb";
import { useAuthContext } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { workLogActions } from "../../../../hooks/dbHooks";
import UserBarChart from "./UserBarChart";
import UserPieChart from "./UserPieChart";
import { format } from "date-fns";

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
    timePeriod:{startDate:Date, endDate:Date}
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

    useEffect(()=>{
        if(id) getProjectReport(id);
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
                <div className="flex gap-2 justify-between flex-wrap">
                    <div className="text-2xl text-primary font-bold ">{reportData.projectId.name}</div>
                    <div className="flex gap-2">
                        <div>{format(reportData.timePeriod.startDate, 'dd.MMM.yyyy')}</div>
                        -
                        <div>{format(reportData.timePeriod.endDate, 'dd.MMM.yyyy')}</div>
                    </div>
                    <div className="flex flex-row text-xs gap-2">
                        <div className="flex flex-col justify-center items-center">
                            <span className="text-sm bold">{Math.floor(reportData.totalDuration/60)}</span>{t('total_hours')}
                        </div>
                        <div className="flex flex-col justify-center items-center">
                            <span className="text-sm bold">{reportData.projectTime.days}</span>{t('days')}
                        </div>
                        <div className="flex flex-col justify-center items-center">
                            <span className="text-sm bold">{reportData.projectTime.hours}</span>{t('hours')}
                        </div>
                        <div className="flex flex-col justify-center items-center">
                            <span className="text-sm bold">{reportData.projectTime.minutes}</span>{t('minutes')}
                        </div>
                    </div>
                </div>

                {/* Users */}
                {reportData.users && reportData.users.length > 0 && 
                <>
                    <div className="flex gap-4 flex-col md:flex-row">
                        <div className="flex-1">
                            <UserBarChart users={reportData.users} />
                        </div>
                        <div className="flex-1">
                            <UserPieChart users={reportData.users} />
                        </div>
                    </div>
                    <table className="table-auto border-collapse w-full table-fixed custom-table">
                        <thead>
                            <tr>
                                <th className="text-left w-12">{t('srnr')}</th>
                                <th className="text-left">{t('name')}</th>
                                <th className="text-right">{t('duration')}</th>
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
                    </>
                }
                {/* TASKS */}
                {reportData.tasks && reportData.tasks.length > 0 &&
                    <table className="table-auto border-collapse w-full table-fixed custom-table">
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
                }

            </div>
            }
        </div>
    )
}

export default ProjectReport