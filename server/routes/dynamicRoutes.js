import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import { TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation } from '../models/models.js';
import { UserRolesModel } from '../models/userRolesModel.js';
import UserModel from '../models/userModel.js'; 
import { checkIfRecordExists } from '../middleware/checkIfRecordExists.js';

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
      case 'users':
        return UserModel;
      case 'documentation':
        return Documentation;
      default:
        return null;
    }
};


router.post('/:resource/add', verifyToken, async (req, res) => {
  const { resource } = req.params;
  const model = getModel(resource);  // Retrieve the model based on the resource
  const { data } = req.body;         // Destructure the data from req.body
  const { checkDataBy } = req.body;  // Fields to check for existing records

  if (!model) {
    return res.status(400).json({ 
      status: "error", 
      message: 'Model not found', 
      code: "invalid_resource" 
    });
  }

  try {
    // Check if any record exists based on fields provided in checkDataBy
    const exists = checkDataBy && checkDataBy.length > 0 
      ? await checkIfRecordExists(model, checkDataBy, data) 
      : {};

    console.log('-----exists', exists);

    // If any key in the 'exists' object is true, it means a conflict exists
    if (Object.values(exists).some(value => value)) {
      return res.status(200).json({ 
        status: "error", 
        message: 'Record already exists', 
        code: "record_exists", 
        data: exists 
      });
    }else{
      const hasPassword = Object.prototype.hasOwnProperty.call(data, 'password');
      if(hasPassword){
        const password = data.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        data.password = hashedPassword;
        console.log("-------", data);
      }
      const newRecord = new model(data);
      const savedRecord = await newRecord.save();
  
      // Send a success response
      return res.status(201).json({ 
        status: "success", 
        message: 'Record added', 
        code: "record_added", 
        data: savedRecord 
      });
    }


  } catch (error) {
    // Log error details and send an error response
    console.error('Error details:', error);
    return res.status(500).json({ 
      status: "error", 
      message: 'Server error', 
      code: "unknown_error", 
      error: error.message 
    });
  }
});


// Common update route: /tasks/update (pass id in the body)
router.post('/:resource/update', verifyToken, async (req, res) => {
  const { resource } = req.params;
  const { ...data } = req.body.data;
  const { id, checkDataBy } = req.body; 
  const model = getModel(resource);

  console.log(id, checkDataBy);
  if (!model) {
    return res.json({ status: "error", message:'Model not found', code:"invalid_resource" });
  }

  if (!id) {
    return res.json({ status: "error", message:'ID not found', code:"id_required" });
  }
  try {

    const exists = checkDataBy && checkDataBy.length > 0 
      ? await checkIfRecordExists(model, checkDataBy, data) 
      : {};

    // If any key in the 'exists' object is true, it means a conflict exists
    if (Object.values(exists).some(value => value)) {
        return res.status(200).json({ 
          status: "error", 
          message: 'Record already exists', 
          code: "record_exists", 
          data: exists 
        });
    }else{

      const hasPassword = Object.prototype.hasOwnProperty.call(data, 'password');
      if(hasPassword){
        const password = data.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        data.password = hashedPassword;
      }

      const updatedRecord = await model.findByIdAndUpdate(id, data, { new: true });
      if (!updatedRecord) {
        // return res.status(404).json({ error: 'Record not found' });
        return res.json({ status: "error", message:'Record not found', code:"record_not_found" });
      }
      return res.status(200).json({ status: "success", message:'Record updated', code:"record_updated" });
    }
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


/**
 * 
 * TODO
 * - get records / with / without pagination
 * - get record by id
 * - update field
 * - give permissions to user to update details and password
 */

export { router as resourceRouter };