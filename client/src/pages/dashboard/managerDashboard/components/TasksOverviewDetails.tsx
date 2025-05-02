import { ReactNode, useEffect, useMemo, useState } from "react"
import { ButtonMenu, DisplayTaskDetails, NoData } from "../../../../components/common"
import { TasksByProjectMainTasks } from "@/interfaces"

interface ArgsType {
    tasks:TasksByProjectMainTasks[]
}
const TasksOverviewDetails:React.FC<ArgsType> = ({tasks})=>{
    const [selectedNav, setSelectedNav] = useState<string>();
    const [openTasks, setOpenTasks] = useState<string[]>([]);
    

    const nav:{_id:string, name:ReactNode}[] = useMemo(() => {
        return tasks.map((taskGroup) => (
            {
          _id: taskGroup.project._id ? taskGroup.project._id.toString() : '',
          name: <span>{taskGroup.project.name } <span className="text-xs text-primary">({taskGroup.tasks.length})</span> </span>,
        }
    )
    );
    }, [tasks]);

    useEffect(() => {
        if (nav.length > 0) {
          setSelectedNav(nav[0]._id);
        }
      }, [nav]);

    return (
        <div className="relative">
            <div className="sticky -top-6 pb-2 z-50 bg-white px-2">
                {nav && nav.length > 1 && 
                    <ButtonMenu nav={nav} onClick={(value)=>setSelectedNav(value)} selectedValue={selectedNav}/>
                }
            </div>
            {tasks && tasks.length > 0 ? 
                <div>
                    {tasks.map((project, pidx)=>{
                        return(
                            <div key={`project-${pidx}-${project.projectID}`} className={`projects p-2 mb-8 ${selectedNav && selectedNav !== project.projectID && 'hidden'}`}>
                                <div className="font-bold text-xl mb-1 text-primary">{project.project.name}</div>
                                {project.mainTasks && project.mainTasks.length > 0 ?
                                    <div className="maintasks flex flex-col gap-y-2 mb-4 rounded-lg">
                                        {project.mainTasks.map((maintasks, midx)=>{
                                            return (
                                                <div key={`maintask-${pidx}-${midx}`} className="mb-2">
                                                    <div className="text-md px-2 border-t border-x rounded-tr-lg inline-block py-1 bg-slate-100 mt-3 font-bold text-gray-600">{maintasks.mainTask.name}</div>
                                                    {maintasks.tasks && maintasks.tasks.length > 0 ?
                                                        <div className="tasks mb-1 text-sm border p-2 rounded-b-lg">
                                                            {maintasks.tasks.map((task, tidx)=>{
                                                                return (
                                                                    <div className="mb-2 bg-gray-100  my-3 p-2 rounded-lg">
                                                                        {/* {task.name} */}
                                                                        <DisplayTaskDetails task={task} projectId={''}/>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                        :
                                                        <div>
                                                            {/* NO TASKS */}
                                                            <NoData />
                                                        </div>
                                                    }
                                                </div>
                                            )
                                        })}
                                    </div>
                                    :
                                    <div>
                                        {/* NO MAIN TASKS */}
                                        <NoData content=""/>
                                    </div>
                                }
                            </div>
                        )
                    })}
                </div>
                :
                <div>
                    {/* NO PROJECTS*/}
                    <NoData />
                </div>
            }

        </div>
    )
}

export default TasksOverviewDetails