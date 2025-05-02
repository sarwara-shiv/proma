import { MdKeyboardArrowDown, MdOutlineKeyboardArrowDown, MdPerson } from "react-icons/md";
import { ISprint, Task, User } from "../../interfaces";
import { ObjectId } from "mongodb";
import { ReactNode, useEffect, useState } from "react";
import { CustomTooltip } from "../../components/common";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { getColorClasses } from "../../mapping/ColorClasses";

interface ArgsType {
  projectId: string | ObjectId;
  title?:ReactNode,
  task: Task;
  onUpdate?: (sprint: ISprint, action: "add" | "remove") => void;
}

const DisplayTaskDetails: React.FC<ArgsType> = ({ projectId, onUpdate, task,title }) => {
  const { t } = useTranslation();
  const [openTasks, setOpenTasks] = useState<string[]>([]);
  const [taskData] = useState<Task>(task);

  useEffect(()=>{
    
  },[])
  const handleOpenTasks = (taskId: string | undefined) => {
    console.log(taskId);
    if (taskId) {
      setOpenTasks((prevTasks) => {
        if (!prevTasks || prevTasks.length <= 0) return [taskId];
  
        if (prevTasks.includes(taskId)) {
          return prevTasks.filter((item) => item !== taskId);
        } else {
          return [...prevTasks, taskId];
        }
      });
    }
  };

  

  const renderTask = (task: Task, level = 0) => {
    const indent = level * 1.25; // control horizontal offset
    const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;

    return (
      <div key={task._id?.toString()} className={`relative `} >
         
        {/* Vertical connector */}
        {level > 0 && (
          <div
            className="absolute border-l border-primary"
            style={{
              left: `${indent - 1.25}rem`,
              top: 0,
              bottom: 0,
            }}
          />
        )}

       

        {/* Task Block */}
        <div
          className={`relative ${level <= 1 && 'border-l border-primary '} pl-0 pb-3`}
          style={{ marginLeft: `${indent}rem` }}
        >
          {/* Dot */}
          <div className="absolute w-2 h-2 rounded-full bg-primary -left-1 top-[0.8rem]"></div>

          {/* Horizontal connector */}
          {level > 0 && (
            <div
              className="absolute h-[1px] bg-primary"
              style={{
                width: "1.25rem",
                left: `-${1.25}rem`,
                top: "1rem",
              }}
            />
          )}
        <div className={`border px-2 py-1 rounded-r-lg box-shadow-sm bg-white mb-4 ${level == 2 && 'border-l border-l-primary '} `}>
          <div className="flex justify-between pb-1 ">
            <div className="flex text-xs gap-1 items-center">
              <span className="text-slate-400">{t("priority")}:</span>
              <span className={`${getColorClasses(task.priority)} p-1 rounded-md `}>
                {t(`${task.priority}`)}
              </span>
            </div>
            <div className="flex text-xs gap-1 items-center">
              {/* <span className="text-slate-400">{t("status")}:</span> */}
              <span className={`${getColorClasses(task.status)} p-1 rounded-md `}>
                {t(`${task.status}`)}
              </span>
            </div>
            
          </div>
 
          <h3 className="font-semibold text-slate-600 text-lg ">{task.name}</h3>
          {task.description && (
            <p
              className="text-xs"
              dangerouslySetInnerHTML={{ __html: task.description }}
            />
          )}

          <div className="flex gap-2 flex-wrap py-2">
            <div className="flex rounded-md bg-white items-center gap-1">
              <span className="text-xs text-slate-400">{t("startDate")}</span>
              {task.startDate ? format(task.startDate, "dd.MM.yyyy") : "-"}
            </div>
            <div className="border-r"></div>
            <div className="flex rounded-md bg-white items-center gap-1">
              <span className="text-xs text-slate-400">{t("dueDate")}</span>
              {task.dueDate ? format(task.dueDate, "dd.MM.yyyy") : "-"}
            </div>
            <div className="border-r"></div>
            <div className="flex rounded-md bg-white items-center gap-1">
              <span className="text-xs text-slate-400">{t("endDate")}</span>
              {task.endDate ? format(task.endDate, "dd.MM.yyyy") : "-"}
            </div>
            <div className="border-r"></div>
            <CustomTooltip content={t("storyPoints")}>
              <div className="flex rounded-md bg-white items-center gap-1">
                <span className="text-xs text-slate-400">{t("SP")}</span>
                {task.storyPoints || 0}
              </div>
            </CustomTooltip>
            <div className="border-r"></div>
            <CustomTooltip content={t("expectedTime_info")}>
              <div className="flex rounded-md bg-white items-center gap-1">
                <span className="text-xs text-slate-400">{t("EP")}</span>
                {task.expectedTime || 0}
              </div>
            </CustomTooltip>
          </div>
        {level === 0 && hasSubtasks && (
          <div
            onClick={()=>handleOpenTasks(task._id?.toString())}
            className="w-full flex justify-end cursor-pointer  underline my-2"
            style={{
              left: `${indent - 1.25}rem`,
              top: 0,
              bottom: 0,
            }}
          >
            <span>{t('subtasks')} ({task.subtasks.length})</span>
              <span className={`text-lg ${task._id && openTasks.includes(task._id.toString()) && 'rotate-180'} transition-all`}>
                <MdKeyboardArrowDown />
              </span>
          </div>
        )}
        </div>
        </div>

        {/* Recursively render subtasks */}
        <div className={`${level === 0 && task._id && !openTasks.includes(task._id.toString()) ? 'hidden' : ''}`}>
        {hasSubtasks &&
          task.subtasks.map((sub: any) => renderTask(sub, level + 1))}
          </div>
          </div>
    );
  };

  return (
    <div className="text-slate-800 text-sm">
        <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
                <MdPerson className="text-primary text-lg" />
                <span className="font-bold text-lg">
                {task.responsiblePerson
                    ? (task.responsiblePerson as unknown as User).name
                    : ""}
                </span>
            </div>
            <div className="flex gap-3 flex-wrap pb-2 text-xs italic">
                <div className="flex gap-1">
                    <span className="text-slate-400">{t("assignedBy")}</span>
                    <span className="text-slate-800">
                    {task.assignedBy ? (task.assignedBy as unknown as User).name : "-"}
                    </span>
                </div>
                <div className="flex gap-1">
                    <span className="text-slate-400">{t("assignedDate")}</span>
                    <span className="text-slate-800">
                    {task.assignedDate ? format(task.assignedDate, "dd.MM.yyyy") : "-"}
                    </span>
                </div>
            </div>
        </div>
      {renderTask(task)}
    </div>
  );
};

export default DisplayTaskDetails;
