import { getRecordsWithFilters, getRecordsWithLimit, getRecordWithID } from "../../../../hooks/dbHooks";
import { DecodedToken, Kickoff, MainTask, OrderByFilter, Project, QueryFilters, Task, User } from "@/interfaces";
import { getColorClasses } from "../../../../mapping/ColorClasses";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { getTasksStoryPoints } from "../../../../utils/tasksUtils";
import { CustomTooltip, ImageIcon } from "../../../../components/common";
import { getDatesDifferenceInDays } from "../../../../utils/dateUtils";
import { MdAdd } from "react-icons/md";

interface ArgsType{
    user:DecodedToken | null;
}
const ProjectsOverview:React.FC<ArgsType> = ({user})=>{
    const {t} = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [page, setPage] = useState<number>(1);

    useEffect(()=>{
        if(user){
            getProjectsData();
        }
    },[])


    // GET PROJECTS
    const getProjectsData = async()=>{
        if(user){
            try{
                const filters: QueryFilters = {
                    "kickoff.responsibilities.persons": user._id.toString(),
                    "status": {
                      type: "notEqualTo",
                      value: ["completed", "cancelled"] 
                    }
                  }
                const orderBy:OrderByFilter = {
                    'dueDate':-1
                }

                const populateFields = [
                    {path:'mainTasks',
                        populate:[
                            {path:'responsiblePerson'},
                            {path:'subtasks',
                                populate:[
                                    {path:'responsiblePerson'},
                                    {path:'subtasks'}
                                ]
                            }
                        ]
                    }, 
                    {path:'kickoff.responsibilities.persons'}
                ];

                const res = await getRecordsWithFilters({
                    type: 'projects', filters, orderBy,populateFields,
                    limit: 0,
                    pageNr: 0
                });

                console.log(res);
                if(res.status === 'success' && res.data) {
                    setProjects(res.data);
                }
            }catch(err){
                console.error(err);
            }
        }
    }

    /**
     * 
     * PROJECT PROGRESS
     * @param mainTasks 
     * 
     */
    const getProgress = (mainTasks:MainTask[])=>{
        if(mainTasks && mainTasks.length > 0){
            const tasks: Task[] = mainTasks.flatMap(task => task.subtasks ?? []);

            if(tasks && tasks.length > 0){
                const sp:Record<string, number> = getTasksStoryPoints(tasks);
                if(sp && Object.keys(sp).length > 0){
                    console.log(sp);
                    const totalStoryPoints = sp.total || 0;
                    const completed = sp.completed || 0;
                    const totalTasks = tasks.length;
                    const countByStatus:Record<string, number> = sp.countByStatus as unknown as Record<string, number>;

                    let progress = 0;
                    let progressPercent = 0;
                    if(totalStoryPoints && completed){
                        progress = (completed / totalStoryPoints) * 100;
                        progressPercent = Number(progress.toFixed(2));
                        console.log('---- progress %',progressPercent);
                    }
                    return <div className="w-full py-2">
                            <div className="pb-1 text-sm font-bold text-slate-500 flex justify-between">
                                {t('progress')}
                            </div>
                            <div className="relative w-full h-[6px] bg-slate-200 rounded-lg">
                                <div
                                    className="absolute left-0 top-0 h-full bg-green-400 rounded-lg"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-end text-sm font-bold text-slate-600">
                                {progressPercent}%
                            </div>
                            <div className="my-2 flex-col text-xs text-slate-600">
                                <CustomTooltip content={t('storyPoints_info')}>
                                    <div className="text-sm font-bold text-slate-500 ">{t('storyPoints_full')}</div>
                                </CustomTooltip>
                                <div className="flex  gap-2">
                                    <span>{t('total')}: </span><span>{totalStoryPoints}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span>{t('completed')}: </span><span>{completed}</span>
                                </div>
                            </div>
                            <div className="flex flex-col text-xs gap-2 py-2 bg-gray-100 p-2 rounded-lg my-2 ">
                                {Object.entries(countByStatus).map(([status, count]) => (
                                    <div key={status} className="flex flex-row gap-2 justify-between items-center">
                                        <div className="flex gap-2">
                                            <div className={`w-4 h-4 border-2 border-white shadow ${getColorClasses(status)}`}></div>
                                            <div>{t(status)}</div>
                                        </div>
                                        <div>{count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>


                }else{
                    return false;
                }
            }
        }else{
            return false;
        }

        return false;
    }


    /**
     * 
     * GET DAYS LEFT
     * 
     */
    const getDaysLeft = (endDate:Date, startDate:Date)=>{
        const result = getDatesDifferenceInDays(endDate, startDate);
        if(result && result.days && result.status){
            return <div className=''>
                {result.status !== 'dueToday' ? 
                        <div className={`${getColorClasses(result.status)} flex gap-1 px-2 px-1 rounded-xl items-center shadow`}>
                            <div>{t(result.status)}</div>
                            <span className="text-md font-bold">{result.days}</span> <span>{Math.abs(result.days)> 1 ? <>{t('days')}</> : <>{t('day')}</>}</span>
                        </div>
                    :
                    <div className={`${getColorClasses(result.status)}`}>
                        {t(result.status)}
                    </div>
                }
            </div>
        }
        return false;
    }
    /**
     * 
     * GET TEAM
     * 
     */
    const getTeam = (kickOff:Kickoff)=>{
        if(kickOff && kickOff.responsibilities && kickOff.responsibilities.length > 0 ){
            const users: User[] = kickOff.responsibilities.flatMap(res => res.persons as unknown as User ?? []);
            console.log(users);
            if(users && users.length > 0){
                return <div className="relative flex gap-0 items-center">
                        <div className="relative flex">
                            {users.slice(0, 3).map((user, idx) => (
                                <div
                                key={`user-${idx}`}
                                className={`relative ${idx !== 0 ? '-ml-2' : ''} z-${10 + idx}`}
                                >
                                <div className="w-8 h-8 rounded-full shadow bg-gray-300 flex items-center justify-center overflow-hidden border border-white">
                                    {user.image && user.name ? (
                                    <ImageIcon image={user.image} title={user.name} fullImageLink={false} />
                                    ) : (
                                    <span className="text-primary font-bold text-md">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                    )}
                                </div>
                                </div>
                            ))}
                            </div>
                        <span className="text-lg w-8 h-8 flex justify-center items-center hover:bg-primary-light hover:text-primary rounded-full p-1 bg-slate-100 cursor-pointer">
                            <MdAdd />
                        </span>
                        
                </div>
            }
        }
        return false;
    }

    return (
        <div className="w-full">
            {projects && projects.length > 0 ? 
                <div className="flex gap-6 flex-wrap">
                    {projects.map((project, pidx)=>{
                        return (
                            <div key={`${pidx}-${project._id}`} className="flex-1 card min-w-2xs max-w-sm box-shadow rounded-lg p-4 flex flex-col">
                                <div className="flex justify-between gap-2 text-sm items-center  pb-1 flex-wrap">
                                    <span className="font-bold text-slate-500">{project._cid}</span>
                                    <div className="flex justify-end text-xs gap-2">
                                        {project.projectType && 
                                            <span className=" bg-primary-light p-1 rounded-md text-xs">{t(project.projectType)}</span>
                                        }
                                        <span className={`p-1 rounded-md text-xs ${getColorClasses(project.status)}`}>{t(project.status)}</span>
                                        <span className={`p-1 rounded-md text-xs ${getColorClasses(project.priority)}`}>{t(project.priority)}</span>
                                    </div>
                                </div>
                                <div className="text-center my-4 bg-gray-100 rounded-md py-2">
                                    <div className="flex justify-center gap-2 items-center">
                                        <span className="font-bold text-slate-700">{project.name}</span>
                                    </div>
                                    {project.description && 
                                        <div className="text-xs text-center">
                                            <span dangerouslySetInnerHTML={{__html:project.description}}/>
                                        </div>
                                    }
                                    
                                    <div className="flex gap-2 flex-col items-center flex-wrap text-sm">
                                        {project.kickoff && project.kickoff.responsibilities && project.kickoff.responsibilities.length > 0 && 
                                            <div className="flex justify-center my-2">
                                                {getTeam(project.kickoff)}
                                            </div>
                                        }

                                        {project.dueDate && 
                                            <div className="flex rounded-md bg-white items-center gap-1">
                                                {getDaysLeft(project.dueDate, new Date())}
                                            </div>
                                        }
                                    </div>
                                </div>
                                
                                {/* STORY POINTS */}
                                {project.mainTasks && 
                                    <div className="">
                                        {getProgress(project.mainTasks as unknown as MainTask[])}
                                    </div>
                                }

                                <div className="flex gap-2 flex-wrap py-2 text-sm">
                                    <div className="flex rounded-md bg-white items-center gap-1">
                                        <span className="text-xs text-slate-400">{t('startDate')}</span>
                                        {project.startDate && <>{format(project.startDate, 'dd.MM.yyyy')}</>}
                                    </div>
                                    <div className="flex rounded-md bg-white items-center gap-1">
                                        <span className="text-xs text-slate-400">{t('dueDate')}</span>
                                        {project.dueDate && <>{format(project.dueDate, 'dd.MM.yyyy')}</>}
                                    </div>
                                </div>
                                
                                
                            </div>
                        )
                    })}
                </div> 
                : 
                <div>
                    
                </div>
            }
        </div>
    )
}

export default ProjectsOverview;