// tasksUtils.ts

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
  