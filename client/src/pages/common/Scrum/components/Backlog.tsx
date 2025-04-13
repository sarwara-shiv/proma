import { MdAdd, MdCheck, MdClose, MdInfo, MdInfoOutline } from "react-icons/md";
import { ISprint, QueryFilters, Task } from "../../../../interfaces";
import { getRecordsWithFilters, sprintActions } from "./../../../../hooks/dbHooks";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";
import { CustomTooltip } from "../../../../components/common";

interface ArgsType {
    projectId:string|ObjectId,
    sprint:ISprint,
    onUpdate?:(sprint:ISprint, action:"add" | "remove")=>void
}

const Backlog:React.FC<ArgsType> = ({projectId, onUpdate, sprint}) => {
    const [cSprint, setCSprint] = useState<ISprint>(sprint);
    const [backlog, setBacklog] = useState<Task[]>([]);

    useEffect(()=>{
        getBacklog();
    },[])
    // GET TASKS
    const getBacklog = async ()=>{
        if(projectId){
            try{
                const res = await sprintActions({
                    type:"get-tasks",
                    body:{projectId}
                });

                console.log(res);
                if(res.status === 'success' && res.data){
                    setBacklog(res.data);
                }
            }catch(error){
                console.error(error);
            }
        }
    }  

    const addToSprintBacklog = async (task:Task, sprint:ISprint = cSprint)=>{
        if (!task || !task._id || !sprint) return;
        console.log(task);
        const taskId = task._id;

        const updatedBacklog = backlog.map(t =>
            t._id === task._id
              ? { ...t, sprintId: cSprint._id } // Return updated task
              : t // Otherwise return as-is
          );
        setBacklog(updatedBacklog);

        // if(!cSprint.backlog || !task._id) return;
        // const taskIdAlreadyExists = cSprint.backlog.some(id => id.toString() === taskId.toString());
        // if (!taskIdAlreadyExists) {
        //     setCSprint(prev => ({
        //         ...prev,
        //         backlog: [...(prev.backlog || []), taskId]
        //     }));
        // }
        onUpdate && onUpdate(sprint, 'add'); 
    }
    const removeFromSprintBacklog = async (task:Task, sprint:ISprint = cSprint)=>{
        if (!task || !task._id || !sprint) return;
        console.log(task);
        const taskId = task._id;

        const updatedBacklog = backlog.map(t =>
            t._id === task._id
              ? { ...t, sprintId: '' } // Return updated task
              : t // Otherwise return as-is
          );
        setBacklog(updatedBacklog);

        // if(!cSprint.backlog || !task._id) return;
        // const taskIdAlreadyExists = cSprint.backlog.some(id => id.toString() === taskId.toString());
        // setCSprint(prev => {
        //     let updatedBacklog;
          
        //     if (taskIdAlreadyExists) {
        //       // Remove the taskId from the backlog if it exists
        //       updatedBacklog = prev.backlog.filter(id => id.toString() !== taskId.toString());
        //     } else {
        //       // Add the taskId to the backlog if it doesn't exist
        //       updatedBacklog = [...(prev.backlog || []), taskId];
        //     }
          
        //     return {
        //       ...prev,
        //       backlog: updatedBacklog
        //     };
        // });

        onUpdate && onUpdate(sprint, 'remove'); 
    }

    // UPDATE SPRINT
    const updateSprint = async (task:Task, action:"add"|"remove" = 'add')=>{
        if(!task || !cSprint){
            console.log(" no task or sprint");
            return;
        };
        try{
            const taskId = task._id;
            const sprintId = cSprint._id;
            const type = action === 'add' ? 'add-tasks' : "remove-tasks";
            const res = await sprintActions({
                type, body:{id:sprintId, tasks:[taskId]}
            });

            console.log(res);
            if(res.status === "success" && res.data){
                setCSprint(res.data);
                if(action === 'add'){
                    addToSprintBacklog(task);
                }else{
                    removeFromSprintBacklog(task);
                }
            }

        }catch(error){
            console.error(error);
        }
    }

    // RETURN EMPTY IF NOT SPRINT OR PROJECT ID
    return <div>
       {backlog && backlog.length > 0 && 
        <div className="bg-slate-100 p-2 rounded-md">
            <h1>Tasks</h1>
            <div className="flex gap-4 flex-col">
            {backlog.map((task:Task, key:number)=>{
                return (
                    <div key={`${key}-${task._id}`} 
                    className={`box-shadow-sm bg-white rounded-lg overflow-clip`}
                    >
                        <div className="flex">
                            <div className="flex flex-col flex-1 p-2">
                                <div className="text-slate-300 text-xs font-bold">{task._cid}</div>
                                <h2 className="flex-1 font-bold text-sm">{task.name}</h2>
                            </div>
                            
                            <div className="flex justify-between p-2 gap-4 max-w-[50px] flex-col border-l">
                                {task.sprintId ? 
                                    <CustomTooltip content='added to sprint'> 
                                        <span onClick={()=>updateSprint(task, 'remove')} 
                                        className="aspect-1/1 p-1/2 rounded-full text-red-400 hover:bg-red-100 hover:text-red-500 cursor-pointer">
                                            <MdClose />
                                        </span>
                                    </CustomTooltip> :
                                    <CustomTooltip content='add to sprint'> 
                                        <span onClick={()=>updateSprint(task, 'add')}
                                        className="aspect-1/1 p-1/2 rounded-full text-slate-400 hover:bg-primary-light hover:text-primary cursor-pointer">
                                            <MdAdd />
                                        </span>
                                    </CustomTooltip>
                                }
                                <CustomTooltip content='Info'> 
                                    <span className="aspect-1/1 p-1/2 text-slate-400 rounded-full hover:bg-primary-light hover:text-primary cursor-pointer">
                                        <MdInfoOutline />
                                    </span>
                                </CustomTooltip>
                            </div>
                        </div>
                    </div>
                    )
                })}
            </div>
        </div>
       }
    </div>
}

export default Backlog