// tasksUtils.ts

import { MainTask, Project, Task, TasksByProject, TasksByProjectMainTasks, TaskStatus } from "../interfaces";
import { ObjectId } from "mongodb";

/**
 * Recursively extracts all `_id` values from a task/subtask structure.
 * 
 * @param subtask - The task or subtask object that may contain nested subtasks
 * @returns An array of all `_id` values found in the task/subtasks structure
 */
export const extractAllIds = (subtask: any, field='subtasks'): string[] => {
    let ids: string[] = [];
  
    // Check if the current object has an _id and add it to the ids array
    if (subtask._id) {
      ids.push(subtask._id);
    }
  
    // If the current object has subtasks, recursively extract IDs from each subtask
    if (subtask[field] && Array.isArray(subtask[field])) {
      subtask[field].forEach((nestedSubtask: any) => {
        ids = [...ids, ...extractAllIds(nestedSubtask)];
      });
    }

  
    return ids;
};

/**
 * 
 * Filter Tasks by Project Array
 * @param tasks - All tasks array
 * @returns result[] - array of results
 *  @var byProject - array of tasks categorsed by project
 *  @var tasks  - original tasks
 * 
 */


export const filterTaskByProject = (tasks: Task[]): { tasks: Task[], byProject: TasksByProject[]} => {
  let byProject: TasksByProject[] = [];

  if (tasks && tasks.length > 0) {
    tasks.forEach((task: Task) => {
      const tProject: Project | null =
        task._mid &&
        typeof task._mid === "object" &&
        task._mid !== null &&
        typeof (task._mid as unknown as MainTask)._pid === "object" &&
        (task._mid as unknown as MainTask)._pid !== null
          ? ((task._mid as unknown as MainTask)._pid as unknown as Project)
          : null;

      if (tProject) {
        const projectId = tProject._id as unknown as string;

        // Check if the project already exists in `byProject`
        const existingProjectIndex = byProject.findIndex(p => p.projectID === projectId);

        if (existingProjectIndex === -1) {
          // If the project does not exist, create a new project entry
          byProject.push({
            projectID: projectId,
            project: tProject,
            tasks: [task],
          });
        } else {
          // If the project exists, just add the task to the existing project
          byProject[existingProjectIndex].tasks.push(task);
        }
      }
    });
  }

  return { tasks, byProject }; // Always return an object
};


export const filterTaskByMainTasks= (
  tasks: Task[]
): {
  tasks: Task[];
  byProject: TasksByProject[];
  result: TasksByProjectMainTasks[];
} => {
  const byProject: TasksByProject[] = [];
  const result: TasksByProjectMainTasks[] = [];

  if (tasks && tasks.length > 0) {
    tasks.forEach((task: Task) => {
      const mainTask = task._mid as unknown as MainTask | undefined;
      const project = mainTask?._pid as Project | undefined;

      if (mainTask && project) {
        const projectID = project._id as unknown as string;

        // --- byProject (flat grouping) ---
        let byProjectEntry = byProject.find(p => p.projectID === projectID);
        if (!byProjectEntry) {
          byProjectEntry = {
            projectID,
            project,
            tasks: [task],
          };
          byProject.push(byProjectEntry);
        } else {
          byProjectEntry.tasks.push(task);
        }

        // --- result (nested grouping with mainTasks) ---
        let resultEntry = result.find(r => r.projectID === projectID);
        if (!resultEntry) {
          resultEntry = {
            projectID,
            project,
            tasks: [task],
            mainTasks: [
              {
                mainTask: mainTask,
                tasks: [task],
              },
            ],
          };
          result.push(resultEntry);
        } else {
          resultEntry.tasks.push(task);

          let mainTaskEntry = resultEntry.mainTasks.find(m => m.mainTask._id === mainTask._id);
          if (!mainTaskEntry) {
            mainTaskEntry = {
              mainTask: mainTask,
              tasks: [task],
            };
            resultEntry.mainTasks.push(mainTaskEntry);
          } else {
            mainTaskEntry.tasks.push(task);
          }
        }
      }
    });
  }

  return { tasks, byProject, result };
};

/**
 * 
 * GET STORY POINTS
 * @param tasks : tasks array
 * 
 */

export const getTasksStoryPoints = (tasks:Task[])=>{
  let result = {};
  if(tasks && tasks.length > 0){
    const totalTasks = tasks.length;

    const totalStoryPoints = tasks.reduce((sum, task) => {
      return sum + (typeof task.storyPoints === 'number' ? task.storyPoints : 0);
    }, 0);

    const defaultStatusTotals: Record<Task["status"], number> = {
      toDo: 0,
      inProgress: 0,
      onHold: 0,
      inReview: 0,
      blocked: 0,
      completed: 0,
    };

    const storyPointsByStatus = tasks.reduce((acc, task) => {
      const points = typeof task.storyPoints === 'number' ? task.storyPoints : 0;
      acc[task.status] += points;
      return acc;
    }, defaultStatusTotals);

    const defaultTaskCountByStatus: Record<Task["status"], number> = {
      toDo: 0,
      inProgress: 0,
      onHold: 0,
      inReview: 0,
      blocked: 0,
      completed: 0,
    };
    
    const countByStatus = tasks.reduce((acc, task) => {
      acc[task.status] += 1;
      return acc;
    }, { ...defaultTaskCountByStatus });

    result = {total:totalStoryPoints, ...storyPointsByStatus, countByStatus, totalTasks};
  }


  return result;
}

/**
 * 
 * GET TASKS COUNT BY STATUS FROM PROJECT MAIN TASKS
 * 
 * @param MainTasks : main tasks array
 * 
 * 
 */

export const countSubtasksByStatus = (milestones: MainTask[]) => {
  type Status = 'toDo' | 'inProgress' | 'onHold' | 'inReview' | 'blocked' | 'completed';

  const ALL_STATUSES: Status[] = ['toDo', 'inProgress', 'onHold', 'inReview', 'blocked', 'completed'];

  const statusCount: Record<Status, number> = Object.fromEntries(
    ALL_STATUSES.map(status => [status, 0])
  ) as Record<Status, number>;

  milestones.forEach(milestone => {
    milestone.subtasks?.forEach(subtask => {
      if (ALL_STATUSES.includes(subtask.status)) {
        statusCount[subtask.status] += 1;
      }
    });
  });

  return statusCount;
};

/**
 * 
 * @param tasks : task array
 * @returns 
 */
export const countTasksByStatus = (tasks: Task[]) => {
  const statusCounts: Record<string, number> = {};

  tasks.forEach((task) => {
    const status = task.status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return statusCounts;
};


  