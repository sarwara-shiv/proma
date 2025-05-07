import { calculateWorkingHours } from "../../../../utils/dateUtils";
import { CustomTooltip, Headings } from "../../../../components/common";
import { addUpdateRecords } from "../../../../hooks/dbHooks";
import { ISprint, Task, User } from "../../../../interfaces";
import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

import { useTranslation } from "react-i18next";
import { MdClose, MdInfoOutline, MdPerson } from "react-icons/md";

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

interface Data {
  tasks: Task[];
  columns: { [key: string]: Column };
  columnOrder: string[];
}

const TasksKanaban: React.FC<ArgsType> = ({ sprint, setSelectedSprint, getTaskDetail, removeTaskAlert }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<Data>({
    tasks: [],
    columns: {
      toDo: { id: "toDo", title: "To Do", taskIds: [] },
      inProgress: { id: "inProgress", title: "In Progress", taskIds: [] },
      completed: { id: "completed", title: "Completed", taskIds: [] },
    },
    columnOrder: ["toDo", "inProgress", "completed"],
  });

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

      setData({
        tasks,
        columns,
        columnOrder: ["toDo", "inProgress", "completed"],
      });
    }
  }, [sprint]);

  const getTaskET = (task:Task)=>{
    return  task.expectedTime ? task.expectedTime : 
    task.startDate && task.dueDate ? calculateWorkingHours(task.startDate, task.dueDate)
     : 0
   }

  const handleDragEnd = (result: DropResult): void => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const sourceColumn = data.columns[source.droppableId];
    const destColumn = data.columns[destination.droppableId];

    // Handle case when item is dropped in the same column
    if (sourceColumn === destColumn) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...sourceColumn, taskIds: newTaskIds };
      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));
    } else {
      // If dropped in a different column
      const startTaskIds = Array.from(sourceColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const endTaskIds = Array.from(destColumn.taskIds);
      endTaskIds.splice(destination.index, 0, draggableId);

      const updatedTasks = data.tasks.map((task) =>
        task._id === draggableId
          ? { ...task, status: destColumn.id as Task["status"] }
          : task
      );

      const newColumns = {
        ...data.columns,
        [sourceColumn.id]: { ...sourceColumn, taskIds: startTaskIds },
        [destColumn.id]: { ...destColumn, taskIds: endTaskIds },
      };

      setData({
        tasks: updatedTasks,
        columns: newColumns,
        columnOrder: data.columnOrder,
      });

      const movedTask = updatedTasks.find((task) => task._id === draggableId);
      if (movedTask) {
        onTaskStatusChange(movedTask._id!, destColumn.id as Task["status"], updatedTasks);
      }
    }
  };

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

  return (
    <div className="w-auto mx-auto">
      <Headings text={t('tasks')} type="h4"/>
      <div className="flex justify-start items-start gap-4 pb-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex justify-between space-x-8 flex-1 w-auto">
            {data.columnOrder.map((columnId) => {
              const column = data.columns[columnId];
              const tasks = column.taskIds.map((taskId) =>
                data.tasks.find((task) => task._id === taskId)!
              );

              return (
                <div
                  key={columnId}
                  className="w-[350px] bg-gray-100 p-2 rounded-lg shadow-lg"
                >
                  <h3 className="text-sm font-semibold text-left mb-2">{column.title}</h3>
                  <Droppable droppableId={column.id} type="task">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-4 min-h-16 border border-gray-100 hover:border-dotted hover:border hover:border-gray-400"
                      >
                        {tasks.map((task, index) => (
                          <Draggable
                            key={task._id!}
                            draggableId={task._id!}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white rounded-lg shadow-sm cursor-pointer"
                              >
                                <div className="bg-white flex flex-1 rounded-md flex-row gap-2">
                                  <div className="flex-1 p-2">
                                    <div className="flex justify-between">
                                      <div className={`text-sm font-bold ${task.status === 'completed' ? 'text-slate-300' : 'text-green-500 '}`}>
                                        {task._cid}
                                      </div>
                                      <div className="flex flex-row gap-x-1 justify-center items-center">
                                        <span className="text-primary text-md"><MdPerson /></span>
                                        {task.responsiblePerson ? 
                                          <span className="text-xs font-semibold">{(task.responsiblePerson as unknown as User).name}</span>
                                        : <>-</> }
                                      </div>
                                     
                                    </div>

                                    <div className="flex gap-2 justify-between mt-1 border-t pt-1 text-xs">
                                      <div className="flex flex-row gap-x-1 justify-center items-center">
                                        <CustomTooltip content={t('storyPoints')}>
                                          <span className="text-primary ">SP: </span>
                                          <span className="font-semibold">{task.storyPoints ? task.storyPoints : 1}</span>
                                        </CustomTooltip>
                                      </div>
                                      <div className="border-r"></div>
                                      <div className="flex flex-row gap-x-1 justify-center items-center">
                                        <CustomTooltip content={t('storyPoints')}>
                                          <span className="text-primary ">{t('subtasks')}: </span>
                                          <span className="font-semibold">{task.subtasks ? task.subtasks.length : 0}</span>
                                        </CustomTooltip>
                                      </div>
                                      <div className="border-r"></div>
                                      <div className="flex flex-row gap-x-1 justify-center items-center">
                                        <CustomTooltip content={`${t('expectedTime_info')} <b>sprint</b>`}>
                                          <span className="text-primary ">{t('expectedTime') }:</span>
                                          <span className="">{getTaskET(task)}</span>
                                        </CustomTooltip>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col justify-between border-l p-2 max-w-[30px]">
                                    <CustomTooltip content={t('sprint_task_remove')}>
                                      <div onClick={()=>removeTaskAlert(sprint, task)} 
                                        className={`apsect-1/1 rounded-full p-1/2 text-red-300 hover:bg-red-100 hover:text-red-500`}>
                                        <MdClose /> 
                                      </div>
                                      </CustomTooltip>
                                        <div onClick={()=>getTaskDetail(task)} className="apsect-1/1 rounded-full p-1/2 text-slate-400 hover:bg-primary-light hover:text-primary cursor-pointer">
                                      <MdInfoOutline />
                                    </div>
                                  </div>                   
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default TasksKanaban;
