import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { Sprint, Task } from '../../models/models.js';


const router = express.Router();


// ADD TASKS TO SPRINT
router.post("/add-tasks", verifyToken, async (req, res) => {
    const { ...data } = req.body.data;
    const { id, checkDataBy, relatedUpdates=[], newData=[]} = req.body; 
    const sprintModel = Sprint;
    const taskModel = Task;

    try {
        return res.json({ status: "success", data:{}, code:"success"});
    } catch (error) {
        console.error("Error fetching roles:", error);  
        return res.status(500).json({ status: "error", message: "could not fetch roles", error, code:"unknown_error"});
    }
});

// REMOVE TASKS FROM SPRINT
router.post("/remove-tasks", verifyToken, async (req, res) => {
    const { ...data } = req.body.data;
    const { id, checkDataBy, relatedUpdates=[], newData=[]} = req.body; 
    const sprintModel = Sprint;
    const taskModel = Task;

    try {
        return res.json({ status: "success", data:{}, code:"success"});
    } catch (error) {
        console.error("Error fetching roles:", error);  
        return res.status(500).json({ status: "error", message: "could not fetch roles", error, code:"unknown_error"});
    }
});

export { router as sprintRouter };
