import { useEffect, useState } from "react";
import { Headings, NumberCard } from "../../../../components/common"
import { useTranslation } from "react-i18next"
import { MdPerson2 } from "react-icons/md"
import { useAuthContext } from "../../../../context/AuthContext";
import { getTotalRecords } from "../../../../hooks/dbHooks";
import { notEqual } from "assert";
import { QueryFilters } from "@/interfaces";
import { IoInformation } from "react-icons/io5";
import { getColorClasses } from "../../../../mapping/ColorClasses";

const TasksOverview = ()=>{
    const {t} = useTranslation();
    const {user} = useAuthContext();
    const [pIds, setPIds] = useState<string[]>([]); // project ids
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
    const [idsData, setIdsData] = useState<Record<string, string[]>>({}) 

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
                console.log(user._id)
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
    const handleTaskCardsClick = (type:string) =>{
        console.log(type);
        if(type && idsData[type]){
            console.log(idsData[type]);
        }
    }


    return <div>
        <div>
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
            <div className=' flex flex-wrap gap-x-4 w-full mb-7'>
                <NumberCard title = {`${t('toDo')}`} value={tTasksTodo} icon={IoInformation} colors={getColorClasses('toDo')} minWidth={35} onClick={()=>handleTaskCardsClick('toDoTasks')}/>
                <NumberCard title = {`${t('active')}`} value={tTasksActive} icon={IoInformation} colors={getColorClasses('active')} minWidth={35} onClick={()=>handleTaskCardsClick('activeTasks')}/>
                <NumberCard title = {`${t('completed')}`} value={tTasksCompleted} icon={IoInformation} colors={getColorClasses('completed')} minWidth={35} onClick={()=>handleTaskCardsClick('completedTasks')}/>
                <NumberCard title = {`${t('onHold')}`} value={tTasksHold} icon={IoInformation} colors={getColorClasses('onHold')} minWidth={35} onClick={()=>handleTaskCardsClick('onHoldTasks')}/>
                <NumberCard title = {`${t('pendingReview')}`} value={tTasksReview} icon={IoInformation} colors={getColorClasses('pendingReview')} minWidth={35} onClick={()=>handleTaskCardsClick('pendingReviewTasks')}/>
                <NumberCard title = {`${t('blocked')}`} value={tTasksBlocked} icon={IoInformation} colors={getColorClasses('toDo')} minWidth={35} onClick={()=>handleTaskCardsClick('blockedReviewTasks')}/>
                <NumberCard title = {`${t('overdue')}`} value={tTasksDue} icon={IoInformation} colors={getColorClasses('danger')} minWidth={35} onClick={()=>handleTaskCardsClick('dueTasks')}/>
            </div>
        </div>
    </div>
}

export default TasksOverview