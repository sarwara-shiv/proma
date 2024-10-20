import { TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation, QaTask, MainTask } from '../../models/models.js';

// delete project, project related maintasks, tasks and subtasks
const deleteProject = async (projectId) => {
    try {
      // Step 1: Find all main tasks related to the project by project ID (_pid)
      const mainTasks = await MainTask.find({ _pid: projectId });
  
      // Step 2: Loop through each main task and delete it along with related tasks/subtasks
      if(Array.isArray(mainTasks) && mainTasks.length > 0){
        for (const mainTask of mainTasks) {
          // Get the subtasks (task IDs) of the main task
          const taskIds = mainTask.subtasks;
    
          // Delete each task and their related subtasks (recursive)
          for (const taskId of taskIds) {
            await deleteTaskRecursively(taskId);
          }
    
          // After all related subtasks are deleted, delete the main task itself
          await MainTask.findByIdAndDelete(mainTask._id);
        }
      }
  
      console.log(`Project ${projectId} and all related tasks deleted successfully.`);

      // Step 4: Finally, delete the project itself
      return await Project.findByIdAndDelete(projectId); 
    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error);
      throw error;
    }
  };

// Delete project related maintasks, tasks and subtasks 
/**
 * 
 * @param {*} projectId 
 */ 
const deleteProjectTasks = async (projectId) => {
    try {
      // Step 1: Find all main tasks related to the project by project ID (_pid)
      const mainTasks = await MainTask.find({ _pid: projectId });
  
      // Step 2: Loop through each main task and delete it along with related tasks/subtasks
      if(Array.isArray(mainTasks) && mainTasks.length > 0){
        for (const mainTask of mainTasks) {
          // Get the subtasks (task IDs) of the main task
          const taskIds = mainTask.subtasks;
    
          // Delete each task and their related subtasks (recursive)
          for (const taskId of taskIds) {
            await deleteTaskRecursively(taskId);
          }
    
          // After all related subtasks are deleted, delete the main task itself
          await MainTask.findByIdAndDelete(mainTask._id);
        }
      }
    
      console.log(`Project ${projectId} and all related tasks deleted successfully.`);
      // Step 4: Finally, delete the project itself
      // return await Project.findByIdAndDelete(projectId); 

    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error);
      throw error;
    }
  };
  

  /**
   * 
   * @param {*} maintaskid 
   * @returns 
   * 
   */
  // DELETE TASKS AND SUBTASKS IN MAINTASKS
  const deleteMaintaskTasks= async (maintaskId) => {
    try {
      // Step 1: Find all main tasks related to the project by project ID (_pid)
      const mainTask = await MainTask.findById(maintaskId);;
  
      const taskIds = mainTask.subtasks;
  
      // Delete each task and their related subtasks (recursive)
      if(Array.isArray(taskIds) && taskIds.length > 0){
        for (const taskId of taskIds) {
          await deleteTaskRecursively(taskId);
        }
      }
      
      console.log(`Project ${maintaskId} and all related tasks deleted successfully.`);
      // return MainTask.findByIdAndDelete(mainTask._id);
    } catch (error) {
      console.error(`Error deleting project ${maintaskId}:`, error);
      throw error;
    }
  };

  /**
   * 
   * @param {*} taskId 
   * @returns 
   */
  const deleteTaskRecursively = async (taskId) => {
    try {
      // Find the task by ID
      const task = await Task.findById(taskId);
  
      if (!task) {
        console.warn(`Task with ID ${taskId} not found, skipping.`);
        return;
      }
  
      // Step 3: If the task has subtasks (array of IDs), delete them recursively
      if (task.subtasks && task.subtasks.length > 0) {
        for (const subTaskId of task.subtasks) {
          await deleteTaskRecursively(subTaskId); // Recursively delete each subtask
        }
      }
  
      // After all subtasks are deleted, delete the task itself
      await Task.findByIdAndDelete(taskId);
      console.log(`Task ${taskId} and its subtasks deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  };

  export { deleteProject, deleteTaskRecursively, deleteProjectTasks, deleteMaintaskTasks };