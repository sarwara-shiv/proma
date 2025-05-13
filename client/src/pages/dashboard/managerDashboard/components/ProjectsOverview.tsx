import { getRecordsWithFilters} from "../../../../hooks/dbHooks";
import { AlertPopupType, DecodedToken, Kickoff, OrderByFilter, Project, QueryFilters, SidePanelProps, User } from "@/interfaces";
import { getColorClasses } from "../../../../mapping/ColorClasses";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CustomAlert, DaysLeft, PersonName, SidePanel } from "../../../../components/common";
import { getDatesDifferenceInDays } from "../../../../utils/dateUtils";
import { MdAdd, MdArrowBack } from "react-icons/md";
import { useAuthContext } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProjectTeam from "../../components/ProjectTeam";
import ProjectProgress from "../../../../pages/common/projects/components/ProjectProgress";

interface ArgsType{
    user:DecodedToken | null;
}
const ProjectsOverview:React.FC<ArgsType> = ({user})=>{
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {isAdmin} = useAuthContext()
    const [projects, setProjects] = useState<Project[]>([]);
    const [alertProps, setAlertProps] = useState<AlertPopupType>({isOpen:false, title:'', content:''});
    const [panelProps, setPanelProps] = useState<SidePanelProps>({isOpen:false, title:'', children:''});
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
                    {path:'kickoff.responsibilities.persons'},
                    {path:'kickoff.responsibilities.role'}
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
            if(users && users.length > 0){
                return <div className="relative flex gap-0 items-center">
                        <div className="relative flex">
                            {users.slice(0, 3).map((user, idx) => (
                                <div
                                key={`user-${idx}`}
                                className={`relative ${idx !== 0 ? '-ml-2' : ''} z-${10 + idx} ${idx ===1 && users.length > 2 && 'scale-125'}`} 
                                >
                                    <PersonName user={user} showName={false}/>
                                </div>
                            ))}
                            </div>
                        <span onClick={()=>showTeamAlert(kickOff)}
                        className="text-lg w-8 h-8 flex justify-center items-center hover:bg-primary-light hover:text-primary rounded-full p-1 bg-slate-100 cursor-pointer">
                            <MdAdd />
                        </span>
                        
                </div>
            }
        }
        return false;
    }

    // SHOW TEAM
    const showTeamAlert = (kickOff:Kickoff) =>{
        if(kickOff && kickOff.responsibilities && kickOff.responsibilities.length > 0 ){
            setPanelProps({...alertProps, isOpen:true, title:t('responsiblities'), 
                children:<ProjectTeam responsibilities={kickOff.responsibilities} />
            })
        }
    }

    // NAVIGATION
    const navigateTo = (_id:string | object, type:'projects'= 'projects') =>{
        let link = isAdmin ? '/admin' : '/users';
        if(_id && type){

            if(type === 'projects'){
                link += `/projects/view/${_id}`;
            }

            navigate(link);
        }
    }

    return (
        <div className="w-full mb-6">
            {projects && projects.length > 0 ? 
                <div className="flex gap-6 flex-wrap">
                    {projects.map((project, pidx)=>{
                        const duedays = project.dueDate ? getDatesDifferenceInDays(project.dueDate) : null;
                        return (
                            <div key={`${pidx}-${project._id}`} className="flex-1 card min-w-2xs max-w-sm box-shadow rounded-lg p-4 flex flex-col">
                                <div className="flex justify-between gap-2 text-sm items-center  pb-1 flex-wrap mb-2">
                                    <div className="group flex items-center cursor-pointer pr-4" onClick={()=>navigateTo(project._id || '')}>
                                        <div className="absolute opacity-0 transition-all text-primary translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"><MdArrowBack /></div>
                                        <span className={`font-bold transition-all hover:translate-x-3.5 ${duedays && duedays.days < 0 ? 'text-red-400' : 'text-green-500'}`}>
                                            {project._cid}
                                        </span>
                                    </div>
                                    <div className="flex justify-end text-xs gap-2">
                                        {project.projectType && 
                                            <span className=" bg-primary-light text-primary py-1 px-2 rounded-xl text-xs font-semibold uppercase">{t(project.projectType)}</span>
                                        }
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <div className="flex items-center flex-cols bg-white  rounded-xl overflow-clip border">
                                        <span className="text-xs text-slate-400 px-1">{t('status')}</span>
                                        <span className={`p-1 tracking-wider font-semibold text-xs ${getColorClasses(project.status)}`}>{t(project.status)}</span> 
                                    </div>
                                    <div className="flex items-center flex-cols bg-white rounded-xl overflow-clip border">
                                        <span className="text-xs text-slate-400 px-1">{t('priority')}</span>
                                        <span className={`p-1 font-semibold  tracking-wider text-xs ${getColorClasses(project.priority)}`}>{t(project.priority)}</span>
                                    </div>

                                </div>
                                <div className="text-center my-4 bg-gray-100 rounded-md py-2">
                                    <div className="flex justify-center gap-2 items-center">
                                        <span className="font-bold text-lg text-slate-700">{project.name}</span>
                                    </div>
                                    {project.description && 
                                        <div className="text-xs text-center line-clamp-1 text-slate-500">
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
                                                <DaysLeft dueDate={project.dueDate} />
                                            </div>
                                        }
                                    </div>
                                </div>
                                
                                {/* STORY POINTS */}
                                {project.mainTasks && 
                                    <div className="">
                                        {/* {getProgress(project.mainTasks as unknown as MainTask[])} */}
                                        <ProjectProgress project={project}/>
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

            <CustomAlert 
                isOpen={alertProps.isOpen}
                title={alertProps.title}
                content={alertProps.content}
                onClose={()=>{setAlertProps({...alertProps, isOpen:false, title:'', content:''})}}
            />
            <SidePanel 
             isOpen={panelProps.isOpen}
             title={panelProps.title}
             children={panelProps.children}
             onClose={()=>{setPanelProps({...panelProps, isOpen:false, title:'', children:''})}}
            />
        </div>
    )
}

export default ProjectsOverview;