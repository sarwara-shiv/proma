import { useEffect, useState } from "react";
import { Headings, NumberCard,HorizontalScroll, SidePanel, NoData } from "../../../../components/common"
import { useTranslation } from "react-i18next"
import { useAuthContext } from "../../../../context/AuthContext";
import { getRecordWithID, getTotalRecords } from "../../../../hooks/dbHooks";
import { QueryFilters, SidePanelProps, TasksByProjectMainTasks } from "@/interfaces";
import { IoInformation } from "react-icons/io5";
import { getColorClasses } from "../../../../mapping/ColorClasses";
import TasksStatusPieChart from "../../../../components/charts/TasksStatusPieChart";
import TasksStatusBarChart from "../../../../components/charts/TasksStatusBarChart";
import { filterTaskByMainTasks, filterTaskByProject } from "../../../../utils/tasksUtils";
import TasksOverviewDetails from "./TasksOverviewDetails";

const TasksOverview = ()=>{
    const {t} = useTranslation();
    const {user} = useAuthContext();
    const [pIds, setPIds] = useState<{pid:string, mid?:{mid?:string, tid?:string}[]}[]>([]); // project ids
    const [tProjects, setTProjects] = useState<number>(0); // total projects where user id exists in kickoff-> responsibilities->persons
    const [tMTasks, setTMTasks] = useState<number>(0); // total main tasks
    const [tTasks, setTTasks] = useState<number>(0); // total tasks
    const [tTasksActive, setTTasksActive] = useState<number>(0); // total active tasks
    const [tTasksTodo, setTTasksTodo] = useState<number>(0); // total active tasks
    const [tTasksCompleted, setTTasksCompleted] = useState<number>(0); // total active tasks
    const [tTasksHold, setTTasksHold] = useState<number>(0); // onHold tasks
    const [tTasksReview, setTTasksReview] = useState<number>(0); // inReview Tasks
    const [tTasksDue, setTTasksDue] = useState<number>(0); // total due tasks
    const [tTasksBlocked, setTTasksBlocked] = useState<number>(0); // total due tasks
    const [idsData, setIdsData] = useState<Record<string, string[]>>({});
    const [pieChartData, setPieChartData] = useState({}); 
    const [sidePanelProps, setSidePanelProps] = useState<SidePanelProps>({isOpen:false, children:<></>, title:''}); 

    useEffect(()=>{
        getData();
    },[])

    /**
     * 
     * GET DATA
     * 
     */
    const getData = async()=>{
        if(user && user._id){
            try{
                let pids:string[] = []; // project ids
                let mids:string[] = [];  // main tasks ids
                // get all Projects
                const filters: QueryFilters = {
                    "kickoff.responsibilities.persons": user._id.toString(),
                    "status": {
                      type: "notEqualTo",
                      value: ["completed", "cancelled"] 
                    }
                  }
                const res = await getTotalRecords({type:'projects', filters, selectFields:'projectType'});
                console.log(res);
                
                if(res.status === 'success' && res.totalRecords) {
                    setTProjects(res.totalRecords);
                    pids = res.recordIds ? res.recordIds : [];
                }

                // get main tasks
                if(pids){
                    idsData.projects = pids;
                    const mtFilters: QueryFilters = {
                        "_pid" : pids
                    }
                    console.log(pids);
                    const mainTasks = await getTotalRecords({type:'maintasks', filters:mtFilters, ids:'true', selectFields:'subtasks'});
                    if(mainTasks.status === 'success' && mainTasks.totalRecords){
                        setTMTasks(mainTasks.totalRecords);
                        if(mainTasks.fieldData){
                            const allSubtasks = mainTasks.fieldData.map((item:{subtasks:string[]}) => item.subtasks).flat();
                            idsData.allTasks = allSubtasks;
                            setTTasks(allSubtasks.length);
                        }

                        if(mainTasks.recordIds) {
                            mids = mainTasks.recordIds;
                        }
                    }
                    
                }

                // get all tasks which are active at level-1
                if(mids){
                    idsData.projects = mids;
                    const tFilters: QueryFilters = {
                        "_mid" : mids,
                        "level":1,
                        "status" : {type:'notEqualTo', value:["blocked", "completed"]}
                    }
                    const activeTasks = await getTotalRecords({type:'tasks', filters:tFilters, ids:'true'});
                    if(activeTasks.totalRecords){
                        setTTasksActive(activeTasks.totalRecords);
                        
                        if(activeTasks.recordIds) idsData.activeTasks = activeTasks.recordIds;
                    }

                    // completed tasks
                    const tCFilters: QueryFilters = {
                        "_mid" : mids,
                        "level":1,
                        "status" : ["completed"]
                    }
                    const completedTasks = await getTotalRecords({type:'tasks', filters:tCFilters, ids:'true'});
                    if(completedTasks.totalRecords){
                        setTTasksCompleted(completedTasks.totalRecords);
                        setPieChartData({...pieChartData, completed:completedTasks.totalRecords});
                        if(completedTasks.recordIds) idsData.completedTasks = completedTasks.recordIds;
                    }
                    // onHOld tasks
                    const tholdFilters: QueryFilters = {
                        "_mid" : mids,
                        "level":1,
                        "status" : ["onHold"]
                    }
                    const onHoldTasks = await getTotalRecords({type:'tasks', filters:tholdFilters, ids:'true'});
                    if(onHoldTasks.totalRecords){
                        setTTasksHold(onHoldTasks.totalRecords);
                        setPieChartData({...pieChartData, onHold:onHoldTasks.totalRecords});
                        if(onHoldTasks.recordIds) idsData.onHoldTasks = onHoldTasks.recordIds;
                    }
                    // inReview tasks
                    const treviewFilters: QueryFilters = {
                        "_mid" : mids,
                        "level":1,
                        "status" : ["pendingReview"]
                    }
                    const inReviewTasks = await getTotalRecords({type:'tasks', filters:treviewFilters, ids:'true'});
                    if(inReviewTasks.totalRecords){
                        setTTasksReview(inReviewTasks.totalRecords);
                        setPieChartData({...pieChartData, pendingReview:inReviewTasks.totalRecords});
                        if(inReviewTasks.recordIds) idsData.pendingReviewTasks = inReviewTasks.recordIds;
                    }
                    // inReview tasks
                    const tblockedFilters: QueryFilters = {
                        "_mid" : mids,
                        "level":1,
                        "status" : ["blocked"]
                    }
                    const blockedTasks = await getTotalRecords({type:'tasks', filters:tblockedFilters, ids:'true'});
                    if(blockedTasks.totalRecords){
                        setTTasksBlocked(blockedTasks.totalRecords);
                        setPieChartData({...pieChartData, blocked:blockedTasks.totalRecords});
                        if(blockedTasks.recordIds) idsData.blockedTasks = blockedTasks.recordIds;
                    }
                    // due tasks
                    const tdueFilters: QueryFilters = {
                        "_mid" : mids,
                        "level":1,
                    }
                    const dueTasks = await getTotalRecords({type:'tasks', filters:tdueFilters, ids:'true', overdue:'true'});
                    if(dueTasks.totalRecords){
                        setTTasksDue(dueTasks.totalRecords);
                        setPieChartData({...pieChartData, overDue:dueTasks.totalRecords});
                        if(dueTasks.recordIds) idsData.dueTasks = dueTasks.recordIds;
                    }
                    // todo tasks
                    const todoFilters: QueryFilters = {
                        "_mid" : mids,
                        "level":1,
                        "status" : ["toDo"]
                    }
                    const toDoTasks = await getTotalRecords({type:'tasks', filters:todoFilters, ids:'true', overdue:'true'});
                    if(toDoTasks.totalRecords){
                        setTTasksTodo(toDoTasks.totalRecords);
                        setPieChartData({...pieChartData, toDo:toDoTasks.totalRecords});
                        if(toDoTasks.recordIds) idsData.toDoTasks = toDoTasks.recordIds;
                    }
                }
    
            }catch(error){
                console.error(error);
            }
        }else{
            console.warn('no user id');
        }
    }

    /**
     * 
     * ON TASKS CARD CLICK
     * 
     */
    const handleTaskCardsClick = async(type:string) =>{
        console.log(type);
        if(type && idsData[type]){
            console.log(idsData[type]);
            if(idsData[type].length <= 0){
                setSidePanelProps({...sidePanelProps, isOpen:true, title:t(type), children:<>
                   <NoData />
                </>})
            }else{
                try{
                    const populateFields = [
                        {path:'_mid',
                            populate:[
                                {path:'_pid'}
                            ]
                        }, 
                        {path: 'responsiblePerson'}, 
                        {path: 'assignedBy'}, 
                        {path: 'subtasks',
                            populate:[
                                {path:'subtasks'}
                            ]
                        }, 
                    ];
                    const ids = idsData[type];
                    const res = await getRecordWithID({type:'tasks', id:ids, populateFields});
                    if(res.data && res.data.length > 0){
                        const result = filterTaskByMainTasks(res.data);
                        console.log(result.result);
                        if(result && result.result && result.result.length > 0){
                            const resultTasks:TasksByProjectMainTasks[] = result.result;
                            setSidePanelProps({...sidePanelProps, isOpen:true, title:t(type), 
                                children:<TasksOverviewDetails tasks={resultTasks} />
                            })
                        }

                    }
                }catch(err){
                    console.error(err);
                }
                
            }
        }
    }


    return (
        <div className="w-full">
            <div className="flex gap-x-6 mb-4 font-bold text-lg text-slate-400 flex-wrap">
                <div className="border-b-2 border-white hover:border-primary cursor-pointer transition-all ease">
                    <span className="font-semibold text">{t('projects')}: </span><span className="text-primary">{tProjects}</span>
                </div>
                <div className="border-b-2 border-white hover:border-primary cursor-pointer transition-all ease">
                    <span className="font-semibold ">{t('maintasks')}: </span><span className="text-primary">{tMTasks}</span>
                </div>
                <div className="border-b-2 border-white hover:border-primary cursor-pointer transition-all ease">
                    <span className="font-semibold ">{t('tasks')}: </span><span className="text-primary">{tTasks}</span>
                </div>
            </div>
            <div className="mb-2">
                <Headings text={t('tasks')} type="section"/>
            </div>
            <div className=' flex flex-nowrap gap-x-4 w-full mb-7 '>
                <HorizontalScroll >
                    {/* <div className=' flex flex-nowrap gap-x-4 w-auto w-full'> */}
                        <NumberCard title = {`${t('toDo')}`} value={tTasksTodo} icon={IoInformation} colors={getColorClasses('toDo')} onClick={()=>handleTaskCardsClick('toDoTasks')}/>
                        <NumberCard title = {`${t('active')}`} value={tTasksActive} icon={IoInformation} colors={getColorClasses('active')} onClick={()=>handleTaskCardsClick('activeTasks')}/>
                        <NumberCard title = {`${t('completed')}`} value={tTasksCompleted} icon={IoInformation} colors={getColorClasses('completed')} onClick={()=>handleTaskCardsClick('completedTasks')}/>
                        <NumberCard title = {`${t('onHold')}`} value={tTasksHold} icon={IoInformation} colors={getColorClasses('onHold')} onClick={()=>handleTaskCardsClick('onHoldTasks')}/>
                        <NumberCard title = {`${t('pendingReview')}`} value={tTasksReview} icon={IoInformation} colors={getColorClasses('pendingReview')}  onClick={()=>handleTaskCardsClick('pendingReviewTasks')}/>
                        <NumberCard title = {`${t('blocked')}`} value={tTasksBlocked} icon={IoInformation} colors={getColorClasses('toDo')} onClick={()=>handleTaskCardsClick('blockedReviewTasks')}/>
                        <NumberCard title = {`${t('overdue')}`} value={tTasksDue} icon={IoInformation} colors={getColorClasses('danger')} onClick={()=>handleTaskCardsClick('dueTasks')}/>
                    {/* </div> */}
                </HorizontalScroll>
            </div>
            <div className="flex flex-col md:flex-row flex-wrap gap-4">
                <div className="flex-1 max-w-sm min-w-3xs">
                    <TasksStatusPieChart data={{toDo:tTasksTodo, onHold:tTasksHold, completed:tTasksCompleted, blocked:tTasksBlocked, pendingReview:tTasksReview, overdue:tTasksDue, active:tTasksActive}}/> 
                </div>
                <div className="flex-1 max-w-sm min-w-3xs">
                    <TasksStatusBarChart data={{toDo:tTasksTodo, onHold:tTasksHold, completed:tTasksCompleted, blocked:tTasksBlocked, pendingReview:tTasksReview, overdue:tTasksDue, active:tTasksActive}}/> 
                </div>
            </div>

            <SidePanel 
                isOpen={sidePanelProps.isOpen}
                children={sidePanelProps.children}
                title={sidePanelProps.title}
                onClose={()=>setSidePanelProps({...sidePanelProps, isOpen:false, children:<></>, title:''})}
            />
        </div>
    )
}

export default TasksOverview