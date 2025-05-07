import { calculateWorkingHours } from "../../../../utils/dateUtils";
import { CustomTooltip, Headings, NoData } from "../../../../components/common";
import { addUpdateRecords } from "../../../../hooks/dbHooks";
import { ISprint, Task, User } from "../../../../interfaces";
import React, { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { MdClose, MdInfoOutline, MdPerson } from "react-icons/md";
import { format } from "date-fns";

interface ArgsType {
  sprint: ISprint;
  setSelectedSprint: (sprint: ISprint) => void;
  getTaskDetail:(task:Task)=>void;
  removeTaskAlert:(selectedSprint:ISprint, task:Task)=>void
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

const TasksList: React.FC<ArgsType> = ({ sprint, setSelectedSprint, getTaskDetail, removeTaskAlert }) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (sprint?.backlog?.length > 0) {
      const tasks: Task[] = sprint.backlog as unknown as Task[];

      const columns: { [key: string]: Column } = {
        toDo: { id: "toDo", title: "To Do", taskIds: [] },
        inProgress: { id: "inProgress", title: "In Progress", taskIds: [] },
        completed: { id: "completed", title: "Completed", taskIds: [] },
      };

      tasks.forEach((task) => {
        if (task.status === "toDo") columns.toDo.taskIds.push(task._id!);
        else if (task.status === "completed")
          columns.completed.taskIds.push(task._id!);
        else columns.inProgress.taskIds.push(task._id!);
      });

    }
  }, [sprint]);

  const getTaskET = (task:Task)=>{
    return  task.expectedTime ? task.expectedTime : 
    task.startDate && task.dueDate ? calculateWorkingHours(task.startDate, task.dueDate)
     : 0
   }

  const onTaskStatusChange = (
    taskId: string,
    newStatus: Task["status"],
    updatedTasks: Task[]
  ) => {
    addUpdateRecords({
      id: taskId,
      type: "tasks",
      action: "update",
      body: { status: newStatus },
    })
      .then((res) => {
        if (res.status === "success" && res.data) {
          const updatedBacklog = sprint.backlog.map((task) =>
            (task as unknown as Task)._id === taskId ? res.data : task
          );
          setSelectedSprint({ ...sprint, backlog: updatedBacklog });
        }
      })
      .catch((err) => console.error(err));
  };

  const isWithinSprint = (task:Task, sprint:ISprint) =>{
    if(task.startDate && sprint.startDate && task.dueDate && sprint.endDate){
      return task.startDate >= sprint.startDate && task.dueDate <= sprint.endDate; 
    }else{
      return true;
    }
  }

  return (
    <div>
         <div className="flex-1 bg-gray-100 p-2 rounded-lg w-full">
          <Headings text={t('tasks')} type="h4"/>
          <div className="py-2 pt-4 px-2 flex flex-col gap-5 overflow-y-auto" style={{maxHeight:'calc(90dvh - 260px)'}}>
            {sprint && sprint.backlog.length > 0 ? 
            <>
              {sprint.backlog.map((backlog, bkey)=>{
                const task:Task = backlog as unknown as Task;
                const inRange = isWithinSprint(task, sprint);
                return (
                  <div key={`${bkey}-${task._id}`}>
                    <div className="bg-white box-shadow-sm flex flex-1 rounded-md flex-row gap-2">
                      <div className="flex-1 p-2">
                        <div className="flex justify-between items-center border-b mb-1 pb-1">
                            <div className={`text-sm  font-bold ${task.status === 'completed' ? 'text-slate-300' : 'text-green-500 '}`}>{task._cid}</div>
                            {!inRange && 
                              <CustomTooltip content={t('outOfSprintRange_info')}>
                                <div className="bg-red-100 text-red-400 p-1 text-xs rounded-md">{t('outOfSprintRange')}</div>
                              </CustomTooltip>
                            }
                            
                            <div className={`p-1 text-xs rounded-md ${task.status === 'completed' ? 'bg-green-100 text-green-500' : 'bg-slate-100 text-slate-500'}`}>
                              {t(`${task.status}`)}
                            </div>
                          </div>
                          <h2 className={`font-bold text-sm ${task.status === 'completed' && ' line-through  text-slate-400'}`}>{task.name}</h2>
                            {task.description && 
                                <CustomTooltip content={task.description ? task.description : '' }>
                                  <p
                                      className="text-xs line-clamp-2 cursor-pointer relative text-slate-500"
                                      dangerouslySetInnerHTML={{ __html: task.description}}
                                    >
                                  </p>
                              </CustomTooltip>
                            }
                          
                          <div className="flex gap-2 justify-between mt-1 border-t pt-1 text-xs">
                              <div className="flex flex-col items-left gap-x-1">
                                <span className="text-slate-400">{t('startDate')}</span>
                                {task.startDate ? 
                                  <span className="">{format(task.startDate, 'dd.MM.yyyy')}</span>
                                : <>-</> }
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-col items-left gap-x-1">
                                <span className=" text-slate-400">{t('dueDate')}</span>
                                {task.dueDate ? 
                                  <span className="">{format(task.dueDate, 'dd.MM.yyyy')}</span>
                                : <>-</> }
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-col items-left gap-x-1">
                                <span className=" text-slate-400">{t('endDate')}</span>
                                {task.endDate ? 
                                  <span className="">{format(task.endDate, 'dd.MM.yyyy')}</span>
                                  : <>-</> }
                              </div>
                          </div>
                          <div className="flex gap-2 justify-between mt-1 border-t pt-1 ">
                              <div className="flex flex-row gap-x-1 justify-center items-center">
                                <span className="text-primary text-lg"><MdPerson /></span>
                                {task.responsiblePerson ? 
                                  <span className="text-sm font-semibold">{(task.responsiblePerson as unknown as User).name}</span>
                                : <>-</> }
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-row gap-x-1 justify-center items-center">
                                <CustomTooltip content={t('storyPoints')}>
                                  <span className="text-primary text-sm">SP: </span>
                                  <span className="text-sm font-semibold">{task.storyPoints ? task.storyPoints : 1}</span>
                                </CustomTooltip>
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-row gap-x-1 justify-center items-center">
                                <CustomTooltip content={t('storyPoints')}>
                                  <span className="text-primary text-sm">{t('subtasks')}: </span>
                                  <span className="text-sm font-semibold">{task.subtasks ? task.subtasks.length : 0}</span>
                                </CustomTooltip>
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-row gap-x-1 justify-center items-center">
                                <CustomTooltip content={`${t('expectedTime_info')} <b>sprint</b>`}>
                                  <span className="text-primary text-sm">{t('expectedTime') }:</span>
                                  <span className="text-sm">{getTaskET(task)}</span>
                                </CustomTooltip>
                              </div>
                          </div>
                        
                      </div>
                      <div className="flex flex-col justify-between border-l p-2 max-w-[50px]">
                        <CustomTooltip content={t('sprint_task_remove')}>
                          <div onClick={()=>removeTaskAlert(sprint, task)} 
                            className={`apsect-1/1 rounded-full p-1 text-red-300 hover:bg-red-100 hover:text-red-500`}>
                            <MdClose /> 
                          </div>
                          </CustomTooltip>
                            <div onClick={()=>getTaskDetail(task)} className="apsect-1/1 rounded-full p-1 text-slate-400 hover:bg-primary-light hover:text-primary cursor-pointer">
                          <MdInfoOutline />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </> :
            <NoData content="no Tasks" />
            }
          </div>
        </div>
    </div>
  )
}

export default TasksList