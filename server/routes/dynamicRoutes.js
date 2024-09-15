import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation } from '../models/models.js';
import { UserRolesModel } from '../models/userRolesModel.js';
import UserModel from '../models/userModel.js'; 

const router = express.Router();

const getModel = (resource) => {
    switch (resource) {
      case 'projects':
        return Project;
      case 'tasks':
        return Task;
      case 'roles':
        return UserRolesModel;
      case 'auth':
        return UserModel;
      case 'documentation':
        return Documentation;
      default:
        return null;
    }
};

// Helper function to check for existing records by fields
const checkIfRecordExists = async (model, fieldsToCheck) => {
  try {
    const existingRecord = await model.findOne(fieldsToCheck);
    return existingRecord !== null;
  } catch (error) {
    throw new Error('Error checking for existing record');
  }
};

router.post('/:resource/add', verifyToken, async (req, res) => {
  const { resource } = req.params;
  const model = getModel(resource);
  const { checkdataby, ...data } = req.body.data; // Extract checkdataby and other fields from the request body

  if (!model) {
    return res.status(400).json({ status: "error", message: 'Model not found', code: "invalid_resource" });
  }

  try {
    // If checkdataby fields are provided, check if a record already exists
    if (checkdataby && Object.keys(checkdataby).length > 0) {
      const exists = await checkIfRecordExists(model, checkdataby);
      if (exists) {
        return res.status(409).json({ status: "error", message: 'Record exists', code: "record_exists" });
      }
    }

    const newRecord = new model(data);
    const savedRecord = await newRecord.save();

    // Send a success response
    return res.status(201).json({ status: "success", message: 'Record added', code: "record_added", data: savedRecord });
  } catch (error) {
    // Log error details and send an error response
    console.error('Error details:', error); // Log detailed error information
    return res.status(500).json({ status: "error", message: 'Server error', code: "unknown_error", error: error.message });
  }
});

// Common update route: /tasks/update (pass id in the body)
router.post('/:resource/update', verifyToken, async (req, res) => {
  const { resource } = req.params;
  const { id, checkdataby, ...data } = req.body.data; // Extract checkdataby and other fields from the request body
  const model = getModel(resource);

  if (!model) {
    return res.json({ status: "error", message:'Model not found', code:"invalid_resource" });
  }

  if (!id) {
    return res.json({ status: "error", message:'ID not found', code:"id_required" });
  }

  try {
    // If checkdataby fields are provided, check if a record already exists
    if (checkdataby && Object.keys(checkdataby).length > 0) {
      const exists = await checkIfRecordExists(model, checkdataby);
      if (exists) {
        // return res.status(409).json({ error: 'Record already exists with the specified fields' });
        return res.json({ status: "error", message:'Record exists', code:"record_exists" });
      }
    }

    const updatedRecord = await model.findByIdAndUpdate(id, data, { new: true });
    if (!updatedRecord) {
      // return res.status(404).json({ error: 'Record not found' });
      return res.json({ status: "error", message:'Record not found', code:"record_not_found" });
    }
    return res.status(200).json({ status: "success", message:'Record updated', code:"record_updated" });
  } catch (error) {
    return res.json({ status: "error", message:'Server error', code:"unknown_error", error });
  }
});

// Common delete route: /tasks/delete (pass id in the body)
router.post('/:resource/delete', verifyToken, async (req, res) => {
  const { resource } = req.params;
  const { id } = req.body.data; // The ID should be passed in the body
  const model = getModel(resource);

  if (!model) {
    // return res.status(400).json({ error: 'Invalid resource type' });
    return res.json({ status: "error", message:'model not found', code:"invalid_resource" });
  }

  if (!id) {
    // return res.status(400).json({ error: 'ID is required for deletion' });
    return res.json({ status: "error", message:'ID not found', code:"id_required" });
  }

  try {
    const deletedRecord = await model.findByIdAndDelete(id);
    if (!deletedRecord) {
      // return res.status(404).json({ error: 'Record not found' });
      return res.json({ status: "error", message:'Record not found', code:"record_not_found" });
    }
    // res.status(200).json({ message: 'Record deleted successfully' });
    return res.json({ status: "success", message:'Record deleted', code:"record_deleted" });
  } catch (error) {
    return res.json({ status: "error", message:'Server error', code:"unknown_error", error });
  }
});

export { router as resourceRouter };