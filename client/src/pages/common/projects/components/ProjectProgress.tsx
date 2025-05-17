import { MainTask, Project, Task } from "@/interfaces";
import { getTasksStoryPoints } from "../../../../utils/tasksUtils";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "../../../../components/common";
import { getColorClasses } from "../../../../mapping/ColorClasses";

interface ArgsType {
    project:Project;
    showCount?:boolean;
    showTaskStatus?:boolean;
}
const ProjectProgress:React.FC<ArgsType> = ({project, showCount=true, showTaskStatus=true})=>{
    const {t} = useTranslation();

    if(!project || !project.mainTasks || project.mainTasks.length === 0) return null;
    const mainTasks:MainTask[] = project.mainTasks as unknown as MainTask[];

    const tasks: Task[] = mainTasks.flatMap(task => task.subtasks ?? []);
    if (!tasks || tasks.length === 0) return null;

    const sp:Record<string, number> = getTasksStoryPoints(tasks);
    if (!sp || Object.keys(sp).length === 0) return null;

    const totalStoryPoints = sp.total as number || 0;
    const completed = sp.completed as number || 0;
    const countByStatus = sp.countByStatus as unknown as Record<string, number>;

    const progress = totalStoryPoints && completed ? (completed / totalStoryPoints) * 100 : 0;
    const progressPercent = Number(progress.toFixed(2));

    return (
        <div className="w-full">
            {showCount && 
            <div className="mb-4 flex gap-4">
                <div className="flex justify-between  gap-1 items-center  py-0.5 bg-white shadow-sm rounded-md">
                    <span className="text-xs text-slate-400">{t('maintasks')} / {t('milestones')}: </span>
                    <span className="text-sm font-bold text-slate-500">{mainTasks.length}</span>
                </div>
                <div className="flex justify-between  gap-1 items-center py-0.5 bg-white shadow-sm rounded-md">
                    <span className="text-xs text-slate-400">{t('tasks')}: </span>
                    <span className="text-sm font-bold text-slate-500">{tasks.length}</span>
                </div>
            </div>
            }

             <div className="mb-4 flex-col text-xs text-slate-600 rounded-md">
                <CustomTooltip content={t('storyPoints_info')}>
                <div className="text-sm font-bold text-slate-500">{t('storyPoints_full')}</div>
                </CustomTooltip>
                <div className="flex gap-2 flex justify-between">
                    <span>{t('total')}:</span><span>{totalStoryPoints}</span>
                </div>
                <div className="flex gap-2 flex justify-between">
                <span>{t('completed')}:</span><span>{completed}</span>
                </div>
            </div>
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

           
        {showTaskStatus && 
        <div className="flex flex-col text-xs gap-2 py-2 bg-gray-100 p-2 rounded-lg my-2">
          {Object.entries(countByStatus).map(([status, count]) => (
            <div key={status} className="flex flex-row gap-2 justify-between items-center text-slate-500">
              <div className="flex gap-2">
                {/* <div className={`w-4 h-4 border-2 border-white shadow ${getColorClasses(status)}`}></div> */}
                <div>{t(status)}</div>
              </div>
              <div>{count}</div>
            </div>
          ))}
          
        </div>
        }
    </div>
  );
}

export default ProjectProgress;