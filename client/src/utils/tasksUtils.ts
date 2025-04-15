// tasksUtils.ts

import { MainTask, Project, Task, TasksByProject } from "../interfaces";
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


export const filterTaskByProject = (tasks: Task[]): { tasks: Task[], byProject: TasksByProject[] } => {
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


  