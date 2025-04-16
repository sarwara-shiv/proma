import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { Sprint, Task, MainTask } from '../../models/models.js';


const router = express.Router();


// ADD TASKS TO SPRINT
router.post("/add-tasks", verifyToken, async (req, res) => {
    const { id, tasks=[], autoAdjustDates=false} = req.body.data; 

    console.log(id, tasks);
    console.log('******* body -----', req.body);
    console.log('******* data -----', req.body.data);

    if (!id || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "Invalid request. 'sprintId' and 'tasks' are required.",
            code: "invalid_input"
        });
    }

    try {
        const sprint = await Sprint.findById(id);
        if (!sprint) {
            return res.status(404).json({
                status: "error",
                message: "Sprint not found.",
                code: "sprint_not_found"
            });
        }

        // Attach sprintId to each task
        await Task.updateMany(
            { _id: { $in: tasks } },
            { $set: { sprintId: id } }
        );

         // Avoid adding duplicate task IDs to the backlog
         const uniqueIdsToAdd = tasks.filter(
            id => !sprint.backlog.includes(id.toString())
        );

        sprint.backlog.push(...uniqueIdsToAdd);
        await sprint.save();

        const sprintTasks = await Task.find({
            _id: { $in: sprint.backlog }
        });

        if (autoAdjustDates && sprintTasks.length > 0) {
          let earliestStart = sprint.startDate || new Date('9999-12-31');
          let latestDue = sprint.endDate || new Date('1970-01-01');
    
          sprintTasks.forEach(task => {
            if (task.startDate && task.startDate < earliestStart) {
              earliestStart = task.startDate;
            }
    
            const endRelevant = task.dueDate || task.endDate;
            if (endRelevant && endRelevant > latestDue) {
              latestDue = endRelevant;
            }
          });
    
          sprint.startDate = earliestStart;
          sprint.endDate = latestDue;
        }

        // pouplate tasks
        await sprint.populate({
            path: 'backlog',
            populate:{
              path:'responsiblePerson'
            }
          });

        return res.json({
            status: "success",
            message: `${uniqueIdsToAdd.length} task(s) linked to sprint.`,
            id: uniqueIdsToAdd,
            code: "tasks_linked",
            sprintTasks,
            data:sprint
        });

    } catch (error) {
        console.error("Error fetching roles:", error);  
        return res.status(500).json({ status: "error", message: "could not fetch roles", error, code:"unknown_error"});
    }
});

// REMOVE TASKS FROM SPRINT
router.post("/remove-tasks", verifyToken, async (req, res) => {
    const { id, tasks=[]} = req.body.data; 
    if (!id || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "Invalid request. 'sprintId' and 'tasks' are required.",
            code: "invalid_input"
        });
    }

    try {
        const sprint = await Sprint.findById(id);
        if (!sprint) {
            return res.status(404).json({
                status: "error",
                message: "Sprint not found.",
                code: "sprint_not_found"
            });
        }

        // Remove sprintId from specified tasks
        await Task.updateMany(
            { _id: { $in: tasks }, sprintId: id },
            { $unset: { sprintId: "" } }
        );

        // Remove task IDs from the backlog
        sprint.backlog = sprint.backlog.filter(
            taskId => !tasks.includes(taskId.toString())
        );

        await sprint.save();
        const sprintTasks = await Task.find({
            _id: { $in: sprint.backlog }
        });
        await sprint.populate({
            path: 'backlog',
            model: 'Task'
          });

        return res.json({
            status: "success",
            message: `${tasks.length} task(s) removed from sprint.`,
            id: tasks,
            data:sprint,
            sprintTasks,
            code: "tasks_removed"
        });

    } catch (error) {
        console.error("Error fetching roles:", error);  
        return res.status(500).json({ status: "error", message: "could not fetch roles", error, code:"unknown_error"});
    }
});

// GET TASKS
router.post("/get-tasks", verifyToken, async (req, res) => {
    const { id: sprintId, projectId } = req.body.data;
  
    try {
      let tasks = [];
  
      // Case 1: Only Sprint ID is provided
      if (sprintId && !projectId) {
        tasks = await Task.find({ sprintId }).populate({
          path:'responsiblePerson'
      });
      }
  
      // Case 2: Project ID is provided (with or without Sprint ID)
      if (projectId) {
        // Get the MainTask for this project
        const mainTask = await MainTask.findOne({ _pid: projectId });
  
        if (!mainTask) {
          return res.status(404).json({ status: "error", message: "MainTask not found for project", code: "main_task_not_found" });
        }
  
        // Filter level 1 subtasks (assuming `subtasks` is an array of ObjectIds)
        const level1Tasks = await Task.find({
          _id: { $in: mainTask.subtasks },
          level: 1,
          $or: [
            { sprintId: { $exists: false } },         // sprintId not present
            { sprintId: null },                       // sprintId is explicitly null
            { sprintId: "" }                          // sprintId is an empty string
          ]
        }).populate({
            path:'responsiblePerson'
        });
  
        tasks = level1Tasks;
      }

  
      return res.json({ status: "success", data: tasks, code: "success" });
  
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return res.status(500).json({
        status: "error",
        message: "Could not fetch tasks",
        error: error.message,
        code: "unknown_error"
      });
    }
  });

  // DELETE SPRINT
  router.post("/delete", verifyToken, async (req, res) => {
    const { id } = req.body.data;
  
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "'sprintId' is required.",
        code: "invalid_input"
      });
    }
  
    try {
      const sprint = await Sprint.findById(id);
  
      if (!sprint) {
        return res.status(404).json({
          status: "error",
          message: "Sprint not found.",
          code: "sprint_not_found"
        });
      }
  
      const taskIds = sprint.backlog.map(taskId => taskId.toString());
  
      // Remove sprintId from associated tasks
      if (taskIds.length > 0) {
        await Task.updateMany(
          { _id: { $in: taskIds }, sprintId: id },
          { $unset: { sprintId: "" } }
        );
      }
  
      // Delete the sprint
      await Sprint.findByIdAndDelete(id);
  
      return res.json({
        status: "success",
        message: `Sprint deleted and sprintId removed from ${taskIds.length} task(s).`,
        affectedTasks: taskIds,
        code: "sprint_deleted"
      });
  
    } catch (error) {
      console.error("Error deleting sprint:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
        error,
        code: "unknown_error"
      });
    }
  });
  

export { router as sprintRouter };
