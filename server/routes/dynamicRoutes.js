import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { io, onlineUsers } from '../socket.js'; 
import bcrypt from 'bcrypt';
import { ChangeLog, Sprint, TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation, QaTask, MainTask, DailyReport, WorkLog } from '../models/models.js';
import { UserRolesModel } from '../models/userRolesModel.js';
import UserModel from '../models/userModel.js'; 
import UserGroupModel from '../models/userGroupModel.js'; 
import { checkIfRecordExists } from '../middleware/checkIfRecordExists.js';
import { generateUniqueId } from '../utils/idGenerator.js';
import moment from 'moment/moment.js';
import { deleteMaintaskTasks, deleteProjectTasks } from './controllers/deleteProjectTasks.js';
import { logChanges } from '../utils/ChangeLog.js';   
// import { upsertToChroma, deleteFromChroma, searchInChroma } from '../pinecone/chromadb.js';
// import { processTasksQuery } from '../openai/tasksSearch.js';
import { processTasksQuery} from '../openai/tasksSearchTA.js';
import { processTaskSchemaQuery} from '../openai/tasksSchemaSearch.js';
import { updateUserWorkload } from '../utils/dbUtilFunctions.js';
import { fixTasksOverdueQuery } from '../utils/TaskAiUtils.js';

const router = express.Router();

const getModel = (resource) => {
    switch (resource) {
      case 'projects':
        return Project;
      case 'tasks':
        return Task;
      case 'sprints':
        return Sprint;
      case 'roles':
        return UserRolesModel;
      case 'auth':
        return UserModel;
      case 'users':
        return UserModel;
      case 'groups':
        return UserGroupModel; 
      case 'documentation':
        return Documentation;
      case 'qataks':
        return QaTask;
      case 'maintasks':
        return MainTask;
      case 'worklogs':
        return WorkLog;
      case 'dailyreports':
        return DailyReport;
      default:
        return null;
    }
};

// sample related updates
// "relatedUpdates": [
//   {
//     "collection": "projects", // collection name
//     "field": "mainTasks", // field to be updated 
//     "type": "array",  // Add to the array
//     "ids": ["projectId1", "projectId2"]
//   },


/**
 * TODO
 * create route to assign tasks
 * seperate it from dynamnic route
 * 
 */
router.post('/tasks/assign', verifyToken, async (req, res) => {
  let { data } = req.body; 
  let { relatedUpdates, id } = req.body; 
  const model = getModel('tasks'); 
  if (!model) {
    return res.json({ status: "error", message:'Model not found', code:"invalid_resource" });
  }

  if (!id) {
    return res.json({ status: "error", message:'ID not found', code:"id_required" });
  }

  try{
    const originalRecord = await model.findById(id); 
    if (!originalRecord) {
      return res.json({ status: "error", message: 'Record not found', code: "record_not_found" }); 
    }

    if(originalRecord.responsiblePerson && data.responsiblePerson){
       await updateUserWorkload([[originalRecord.responsiblePerson, -1, originalRecord], [data.responsiblePerson, 1, , originalRecord]]);
    }

    const assignedBy = data.assignedBy;
    const rPerson = data.responsiblePerson;
    const isRework = data.isRework;
    const reason = data.reason;
    const updatedRecord = await model.findByIdAndUpdate(
      id,
      {
        $set: {
          responsiblePerson: rPerson,
          assignedBy: assignedBy,
          isRework: isRework,
          assignedDate: new Date(),
          reason: isRework ? reason : 'todo'
        },
        $push: {
          revisions: {
            assignedBy: assignedBy,
            reason: reason,
            timestamp: new Date()
          }
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedRecord) {
      // return res.status(404).json({ error: 'Record not found' });
      return res.json({ status: "error", message:'Record not found', code:"record_not_found" });
    }

    // EMIT TASK ASSIGNED EVENT
    if (data && data.responsiblePerson) {
      const socket = req.app.get('socket'); 
      const assignedUserSocketId = onlineUsers.get(data.responsiblePerson.toString());        
      if (assignedUserSocketId) {
        socket.to(assignedUserSocketId).emit('new-task-assigned', updatedRecord);
      }
    }
    // add logs
    await logChanges('tasks', id, data, originalRecord, req.user._id);  

    if (relatedUpdates && Array.isArray(relatedUpdates)) {
      for (const update of relatedUpdates) {

        const relatedModel = getModel(update.collection); // Get the model for the related collection
        if (relatedModel) {
          if (update.type === 'array') {
            // Add the new record ID to an array field

            await relatedModel.updateMany(
              { _id: { $in: update.ids } },  // IDs to match in the related collection
              { $addToSet: { [update.field]: update.value ? update.value : updatedRecord._id } }  // Add the ID to the array field
            );
          } else if (update.type === 'string') {

           const res= await relatedModel.updateMany(
              { _id: { $in: update.ids } },  // IDs to match in the related collection
              { $set: { [update.field]: update.value ? update.value : updatedRecord._id  } }  // Replace the ID in the field
            );
          }
        }
      }
    }

    return res.status(200).json({ status: "success", message:'Task Assigned', code:"task_assigned", data:updatedRecord });
  }catch(error){
    return res.json({ status: "error", message:'Server error', code:"unknown_error", error });
  }

  return res.json({ status: "working", message:'working', code:"working", data:{data, relatedUpdates, id} });
})


//add update general records
router.post('/:resource/add', verifyToken, async (req, res) => {
  const { resource } = req.params;
  const model = getModel(resource);  // Retrieve the model based on the resource
  let { data } = req.body;         // Destructure the data from req.body
  const { checkDataBy, relatedUpdates=[] } = req.body;  // Fields to check for existing records

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

      const _cid = await generateUniqueId(resource);
      if(_cid) data = {...data, _cid};

      const newRecord = new model(data);
      const savedRecord = await newRecord.save();

     
      if (relatedUpdates && Array.isArray(relatedUpdates)) {
        for (const update of relatedUpdates) {
          const relatedModel = getModel(update.collection); // Get the model for the related collection

          if (relatedModel) {
            if (update.type === 'array') {
              // Add the new record ID to an array field

              await relatedModel.updateMany(
                { _id: { $in: update.ids } },  // IDs to match in the related collection
                { $addToSet: { [update.field]: update.value ? update.value : savedRecord._id } }  // Add the ID to the array field
              );
            } else if (update.type === 'string') {
              // Replace the existing ID in the field with the new record ID
              await relatedModel.updateMany(
                { _id: { $in: update.ids } },  // IDs to match in the related collection
                { $set: { [update.field]: update.value ? update.value : savedRecord._id } }  // Replace the ID in the field
              );
            }
          }
        }
      }
       // Emit task updated event to the assigned user using Socket.io
       if ((resource === 'tasks' || resource ===  'maintasks') && savedRecord._id && savedRecord.responsiblePerson) {
        
        // updae user workload
        await updateUserWorkload([[savedRecord.responsiblePerson, 1, savedRecord]]);

        const assignedUserSocketId = onlineUsers.get(savedRecord.responsiblePerson.toString());         
        if (assignedUserSocketId) {
          io.to(assignedUserSocketId).emit('new-task-assigned', savedRecord);
        }
      }

  
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
  const { id, checkDataBy, relatedUpdates=[], newData=[]} = req.body; 

  const model = getModel(resource);

  if (!model) {
    return res.json({ status: "error", message:'Model not found', code:"invalid_resource" });
  }

  if (!id) {
    return res.json({ status: "error", message:'ID not found', code:"id_required" });
  }
  try {
    const originalRecord = await model.findById(id); 
    if (!originalRecord) {
      return res.json({ status: "error", message: 'Record not found', code: "record_not_found" });
    }

    const exists = checkDataBy && checkDataBy.length > 0 
      ? await checkIfRecordExists(model, checkDataBy, data, id) 
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

      //  encode password
      const hasPassword = Object.prototype.hasOwnProperty.call(data, 'password');
      if(hasPassword){
        const password = data.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        data.password = hashedPassword;
      }

      // add end date
      const hasStatus = Object.prototype.hasOwnProperty.call(data, 'status');
      if(hasStatus && data.status === 'completed'){
        data['endDate'] =  Date.now(); 
      }

      const updatedRecord = await model.findByIdAndUpdate(id, data, { new: true });
      if (!updatedRecord) {
        // return res.status(404).json({ error: 'Record not found' });
        return res.json({ status: "error", message:'Record not found', code:"record_not_found" });
      }

      // Emit task updated event to the assigned user using Socket.io
      if ((resource === 'tasks' || resource ===  'maintasks') && data && data.responsiblePerson) {
        const socket = req.app.get('socket'); 
        const assignedUserSocketId = onlineUsers.get(data.responsiblePerson.toString());         
        if (assignedUserSocketId) {
          socket.to(assignedUserSocketId).emit('new-task-assigned', updatedRecord);
        }
      }


      // Log changes
      if(resource === 'tasks' || resource === "maintasks"){
        await logChanges(resource, id, data, originalRecord, req.user._id);  
      }

      if (relatedUpdates && Array.isArray(relatedUpdates)) {
        for (const update of relatedUpdates) {

          const relatedModel = getModel(update.collection); // Get the model for the related collection
          if (relatedModel) {
            if (update.type === 'array') {
              // Add the new record ID to an array field

              await relatedModel.updateMany(
                { _id: { $in: update.ids } },  // IDs to match in the related collection
                { $addToSet: { [update.field]: update.value ? update.value : updatedRecord._id } }  // Add the ID to the array field
              );
            } else if (update.type === 'string') {

             const res= await relatedModel.updateMany(
                { _id: { $in: update.ids } },  // IDs to match in the related collection
                { $set: { [update.field]: update.value ? update.value : updatedRecord._id  } }  // Replace the ID in the field
              );
            }
          }
        }
      }

      // ADD TASKS TO PINECONE
      // if(resource === 'tasks' || resource === "maintasks"){
      //   // Log changes
      //   const populatedTask = await Task.findById(updatedRecord._id)
      //     .populate('createdBy responsiblePerson subtasks customPriority customStatus')
      //     .exec();
      //     const taskDetails = {
      //       name: populatedTask.name,
      //       description: populatedTask.description || "",  // If there's no description, provide a fallback
      //       priority: populatedTask.priority,
      //       status: populatedTask.status,
      //       responsiblePerson: populatedTask.responsiblePerson ? populatedTask.responsiblePerson.name : '',
      //       createdBy: populatedTask.createdBy ? populatedTask.createdBy.name : '',
      //       dueDate: populatedTask.dueDate,
      //       startDate: populatedTask.startDate,
      //       resource:resource,
      //       subtasks: populatedTask.subtasks.map(subtask => subtask.name).join(", "),
      //       customFields: populatedTask.customFields.length > 0 ? populatedTask.customFields.map(field => field.value).join(", ") : ''
      //     };
      //     const taskText = `
      //       Task: ${taskDetails.name}
      //       Description: ${taskDetails.description}
      //       Priority: ${taskDetails.priority}
      //       Status: ${taskDetails.status}
      //       Responsible Person: ${taskDetails.responsiblePerson}
      //       Created By: ${taskDetails.createdBy}
      //       Due Date: ${taskDetails.dueDate ? taskDetails.dueDate.toISOString() : 'N/A'}
      //       Start Date: ${taskDetails.startDate ? taskDetails.startDate.toISOString() : 'N/A'}
      //       Subtasks: ${taskDetails.subtasks}
      //       Custom Fields: ${taskDetails.customFields}
      //       resource:${taskDetails.resource}
      //     `;

      //  await upsertToPinecone(updatedRecord._id.toString(), taskText);
      // }


      return res.status(200).json({ status: "success", message:'Record updated', code:"record_updated", data:updatedRecord });
    }
  } catch (error) {
    return res.json({ status: "error", message:'Server error', code:"unknown_error", error });
  }
});

// Common delete route: /tasks/delete (pass id in the body)
router.post('/:resource/delete', verifyToken, async (req, res) => {
  const { resource } = req.params;
  const { id } = req.body.data; // The ID should be passed in the body
  const { relatedUpdates, deleteRelated=[] } = req.body; // remove ids from other objects as well
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

    let runDeleteRelated = true;
    let  deletedRecord = null;
    // delete project related maintasks, tasks, subtasks
    if(resource === 'projects'){
      runDeleteRelated = false;
       await deleteProjectTasks(id);
    }
    // delete  maintasks related tasks, subtasks
    if(resource === 'maintasks'){
      runDeleteRelated = false;
      await deleteMaintaskTasks(id);
    }
    
    deletedRecord = await model.findByIdAndDelete(id);
    console.log('******', deletedRecord);


    if (!deletedRecord) {
      // return res.status(404).json({ error: 'Record not found' });
      return res.json({ status: "error", message:'Record not found', code:"record_not_found" });
    }

    if(deletedRecord.responsiblePerson){
      await updateUserWorkload([[deletedRecord.responsiblePerson, -1, deletedRecord]]);
    }
     // Handle related updates

     if (relatedUpdates && Array.isArray(relatedUpdates) ) {
      await Promise.all(
        relatedUpdates.map(async (update) => {
          const { collection, field, type, ids } = update;
          const relatedModel = getModel(collection);

          if (!relatedModel) return; // Skip if related model not found

          // If the field type is 'array', remove the provided ids from the field
          if (type === 'array') {
            await relatedModel.updateMany(
              { [field]: { $in: ids } }, // Look for documents containing the ids in the specified field
              { $pull: { [field]: { $in: ids } } } // Pull the ids from the array field
            );
          }

          // If the field type is 'string', unset the field if the id matches
          if (type === 'string') {
            await relatedModel.updateMany(
              { [field]: { $in: ids } }, // Look for documents containing the id in the field
              { $unset: { [field]: "" } } // Remove the field if the id matches
            );
          }
        })
      );
    }

    // handle delete records 
    // run if runDeleteRelated true 
    if (deleteRelated && Array.isArray(deleteRelated) && runDeleteRelated) {
      for (const related of deleteRelated) {
        const { collection, ids } = related;

        // Get the model for the related collection
        const relatedModel = getModel(collection);
        if (!relatedModel) {
          return res.json({ status: "error", message: `Model not found for collection: ${collection}`, code: "invalid_related_resource" });
        }

        // Delete records in the related collection
        const result = await relatedModel.deleteMany({ _id: { $in: ids } });
        if (!result) {
          return res.json({ status: "error", message: `Error deleting records from collection: ${collection}`, code: "related_deletion_failed" });
        }
      }
    }

    // if(resource === 'tasks' || resource === "maintasks"){
    //   await deleteFromPinecone(id);
    // }


    // res.status(200).json({ message: 'Record deleted successfully' });
    return res.json({ status: "success", message:'Record deleted', code:"record_deleted" });
  } catch (error) {
    return res.json({ status: "error", message:'Server error', code:"unknown_error", error });
  }
});

// Common delete route: /tasks/delete (pass id in the body)
router.post('/:resource/getRecordsWithId', verifyToken, async (req, res) => {
  const { resource } = req.params;
  const { id, populateFields=[] } = req.body; // The ID should be passed in the body
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
    let records;
    if(Array.isArray(id)){

      records = await model.find({_id:{$in:id}});
    }else{

      // records = await model.findById(id);

      let query = model.findById(id);

      // Dynamically populate fields if provided
      if (populateFields && Array.isArray(populateFields)) {
        populateFields.forEach((field) => {
          query = query.populate(field);
        });
      }

      records = await query;
    }
    if (!records) {
      // return res.status(404).json({ error: 'Record not found' });
      return res.json({ status: "error", message:'Record not found', code:"record_not_found" });
    }
    // res.status(200).json({ message: 'Record deleted successfully' });
    return res.json({ status: "success", message:'Record found', code:"record_found", data:records});
  } catch (error) {
    return res.json({ status: "error", message:'Server error', code:"unknown_error", error });
  }
});


// get data
// Common delete route: /tasks/delete (pass id in the body)
router.post('/:resource/getRecordsWithLimit', verifyToken, async (req, res) => {
  const { resource } = req.params;
  let { pageNr=1, limit=2, populateFields=[] } = req.body;
  const model = getModel(resource);

  if (!model) {
    // return res.status(400).json({ error: 'Invalid resource type' });
    return res.json({ status: "error", message:'model not found', code:"invalid_resource" });
  }

  pageNr = parseInt(pageNr);
  limit = parseInt(limit);
  const skip = (pageNr-1)*limit;
  try{

    let query = model.find().skip(skip).limit(limit);

      // Dynamically populate fields if provided
      if (populateFields && Array.isArray(populateFields)) {
        populateFields.forEach((field) => {
          query = query.populate(field);
        });
      }

      // Execute the query
      const records = await query;
    const totalRecords = await model.countDocuments(); 
  
    if (!records) {
      return res.json({ status: "error", message:'Record not found', code:"empty" });
    }
  
    return res.json({ status: "success", totalRecords, totalPages: Math.ceil(totalRecords / limit), currentPage:pageNr, limit:limit, message:'Record found', code:"records_found", data:records});
  }catch(error){
    return res.json({ status: "error", message:'Server error', code:"unknown_error", error });
  }
})


// get data
// Common delete route: /tasks/delete (pass id in the body)
router.post('/:resource/getRecordsWithFilters', verifyToken, async (req, res) => {
  const { resource } = req.params;
  let { filters = {}, pageNr = 1, limit = 10, populateFields = [], orderBy={} } = req.body;
  const model = getModel(resource);

  if (!model) {
    return res.json({ status: "error", message: 'Model not found', code: "invalid_resource" });
  }

  pageNr = parseInt(pageNr);
  limit = parseInt(limit);
  const skip = (pageNr - 1) * limit;

  try {
    // Initialize the query object
    let queryObj = {};

    // Dynamically construct the query object based on filterData
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (Array.isArray(value)) {
        // ✅ If value is an array (e.g., ["active", "pending"])
        queryObj[key] = { $in: value };
      }else 
      // If the value is an object, check if it's a range (e.g., { from: X, till: Y })
      if (typeof value === 'object' && value !== null) {

        // date range
        if (value.from || value.till) {
          // Check if it's a date range or a number range
          if (value.type === 'date') {
            // Date or range filtering
            queryObj[key] = {};
        
            if (value.from) {

              let fromDate = new Date(value.from);
              if(value.format){
                fromDate = value.from ? moment(value.from, value.format).toDate() : null;
              }
              queryObj[key].$gte = fromDate 
            }
        
            if (value.till) {
              let tillDate = new Date(value.from);
              if(value.format){
                tillDate = value.till ? moment(value.till, value.format).toDate() : null;
              }
              queryObj[key].$lte = tillDate 
            }
          }

          // numbers
          if (value.type === 'number') {
            // Number range filtering
            queryObj[key] = {};
        
            if (value.from) {
              queryObj[key].$gte = parseInt(value.from);  // Greater than or equal to 'from'
            }
        
            if (value.till) {
              queryObj[key].$lte = parseInt(value.till);  // Less than or equal to 'till'
            }
          }
        }

        // exact date
        if(value.date){
          const format = value.format ? value.format : 'DD.MM.YYYY';
          const fromDate = moment(value.date, format).startOf('day').toDate();
          const tillDate = moment(value.date, format).endOf('day').toDate();
          
          queryObj[key] = { $gte: fromDate, $lte: tillDate };

        }

        // not equal to
        if(value.type === 'notEqualTo'){
          // queryObj[key] = { $ne: value.value };
          if (Array.isArray(value.value)) {
            // If value is an array => use $nin (Not In array)
            queryObj[key] = { $nin: value.value };
          } else {
            // Single value => use $ne (Not Equal)
            queryObj[key] = { $ne: value.value };
          }
        }

        
      } else {
        if(value === 'empty'){
          queryObj[key] = {
            $ne: null,  // Field is not null
            $ne: "",    // Field is not an empty string
            $exists: true // Field exists in the document
          };
        }else{
          if (value !== null && value !== undefined && value !== "") {
            queryObj[key] = value;
          } 
        }

        // For other fields, simply assign the value (exact match)
        queryObj[key] = value;
      }
    });
    // METHOD:1
    let query = model.find();
    // if (Object.keys(orderBy).length > 0) {
    //   query = model.find().sort(orderBy);
    // }
    if (Object.keys(orderBy).length > 0) {
      const sortObj = {};
      
      Object.keys(orderBy).forEach((field) => {
        // Handle date fields specifically
        if (filters[field]?.type === 'date') {
          sortObj[field] = orderBy[field] === 'desc' ? -1 : 1;
        } else {
          const sortDirection = orderBy[field] === 'desc' ? -1 : 1;
          sortObj[field] = sortDirection;
        }
      });

      // Apply the sort to the query
      query = query.sort(sortObj);
    }

    if (Object.keys(queryObj).length > 0) {
      query = query.find(queryObj);
    }

    query = query.skip(skip).limit(limit);

    // METHOD:2
    // let query = Object.keys(queryObj).length > 0 
    //   ? model.find(queryObj).skip(skip).limit(limit) 
    //   : model.find().skip(skip).limit(limit);

    //   // sort data
    //   if (Object.keys(orderBy).length > 0) {
    //     query = query.sort(orderBy);
    //   }
  

    // Dynamically populate fields if provided
    if (populateFields && Array.isArray(populateFields)) {
      populateFields.forEach((field) => {
        query.populate(field);
      });
    }



    // Execute the query
    const records = await query;
    const totalRecords = await model.countDocuments(queryObj); // Count using the same query object

    if (!records || records.length === 0) {
      return res.json({ status: "error", message: 'Record not found', code: "empty" });
    }

    return res.json({
      status: "success",
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: pageNr,
      limit: limit,
      message: 'Record found',
      code: "records_found",
      data: records
    });
  } catch (error) {
    return res.json({ status: "error", message: 'Server error', code: "unknown_error", error });
  }
})


/**
 * 
 * search records 
 * 
 */
router.post('/:resource/search', verifyToken, async (req, res) => {
  const { resource } = req.params;
  const { query } = req.body.data;
  const model = getModel(resource);

  if (!model) {
    return res.json({ status: "error", message: 'Model not found', code: "invalid_resource" });
  }
  console.log("---------- query ---------");
  console.log(query);
  try {
    if(resource === 'tasks' || resource === "maintasks"){
      // const searchResults = await processTasksQuery(query);
      const searchResults = await processTaskSchemaQuery(query);
      if(searchResults && searchResults.type){
        // GET TASKS
        if(searchResults.type == 'get'){
          if(searchResults.intent && searchResults.intent == 'overdue_tasks'){
            // TODO - function to get overdue tasks
            const data = await fixTasksOverdueQuery(searchResults);
            console.log('----- fixed query: ', data);
          }else{
            // TODO - get tasks based on filters
          }
        }
        // UPDATE TASKS
        if(searchResults.type == 'update'){

        }
      }

      console.log("----------- Result --------");
      console.log(searchResults);
      res.status(200).json({ status: 'success', matches: searchResults });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to search tasks' });
  }

})


// search user by username
// Search by name for a given model (resource) dynamically
router.get('/:resource/search-by-name', async (req, res) => {
  const { resource } = req.params;
  const query = req.query.name;
  const { role } = req.query; // Optional role filter
  
  // Dynamically get the model based on the resource
  const model = getModel(resource); // Assuming getModel maps 'resource' to a model (like UserModel, TaskModel, etc.)
  
  console.log(resource);
  if (query && model) {
    try {
      let filter = { name: { $regex: query, $options: 'i' } }; // Search filter for the name field
      
      // If the type is 'auth' (special case), apply the default role filter
      if (resource === 'users') {
        const clientRole = await UserRolesModel.findOne({ name: "client" });
        if (!clientRole) {
          return res.status(400).json({ status: "error", message: "Client role not found." });
        }

        // Default role filter for 'users' (if not 'auth')
        if (!role || role.toLowerCase() !== "auth") {
          filter.roles = { $nin: [clientRole._id] };
        }
      }

      // Dynamically fetch the data from the model using the filter
      const results = await model.find(filter).limit(10); // Limiting the results to 10

      return res.json({
        status: "success",
        message: `${resource} found`,
        code: `${resource}_found`,
        data: results
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(400).json({ message: 'Invalid query or model' });
  }
});

/**
 * 
 * GET RECORD TOTALS
 * 
 */
router.get('/:resource/get-totals', async (req, res) => {
  const { resource } = req.params;
  let filters = req.query || {}; // Get filters from query params

  // Handle the `selectFields` if provided, otherwise set it to null
  const selectFields = filters.selectFields ? filters.selectFields.split(',').join(' ') : null;

  // Check if 'ids' field is present in filters (make it optional)
  const fetchIds = filters.ids ? true : false;

  // check if overdue 
  let isOverdue = filters.overdue;

  // Remove `selectFields` and `ids` from the filters to avoid them in the query object
  delete filters.selectFields;
  delete filters.ids;
  delete filters.overdue;

  const model = getModel(resource);

  console.log(req.query);

  if (!model) {
    return res.status(500).json({ status: 'error', message: 'model not found', code: 'model_not_found' });
  }

  try {
    const queryObj = {};

    Object.keys(filters).forEach((key) => {
      let value = filters[key];

      try {
        // Attempt to parse JSON if possible (for range or complex filters passed as stringified JSON)
        value = JSON.parse(value);
      } catch (e) {
        // It's a simple string value, no problem
      }
      if (Array.isArray(value)) {
        // ✅ If value is an array (e.g., ["active", "pending"])
        queryObj[key] = { $in: value };
      }else 
      if (typeof value === 'object' && value !== null) {
        // RANGE handling
        if (value.from || value.till) {
          if (value.type === 'date') {
            queryObj[key] = {};

            if (value.from) {
              let fromDate = new Date(value.from);
              if (value.format) {
                fromDate = value.from ? moment(value.from, value.format).toDate() : null;
              }
              queryObj[key].$gte = fromDate;
            }

            if (value.till) {
              let tillDate = new Date(value.till);
              if (value.format) {
                tillDate = value.till ? moment(value.till, value.format).toDate() : null;
              }
              queryObj[key].$lte = tillDate;
            }
          }

          if (value.type === 'number') {
            queryObj[key] = {};
            if (value.from) {
              queryObj[key].$gte = parseInt(value.from);
            }
            if (value.till) {
              queryObj[key].$lte = parseInt(value.till);
            }
          }
        }

        // EXACT date
        if (value.date) {
          const format = value.format || 'DD.MM.YYYY';
          const fromDate = moment(value.date, format).startOf('day').toDate();
          const tillDate = moment(value.date, format).endOf('day').toDate();

          queryObj[key] = { $gte: fromDate, $lte: tillDate };
        }

        // NOT EQUAL
        if (value.type === 'notEqualTo') {
          if (Array.isArray(value.value)) {
            // If value is an array => use $nin (Not In array)
            queryObj[key] = { $nin: value.value };
          } else {
            // Single value => use $ne (Not Equal)
            queryObj[key] = { $ne: value.value };
          }
        }

      } else {
        if (value === 'empty') {
          queryObj[key] = {
            $exists: true,
            $nin: [null, ""]
          };
        } else if (value === 'null') {
          queryObj[key] = null;
        } else {
          queryObj[key] = value;
        }
      }
    });

    if (isOverdue) {
      // If 'overdue' is a string and equals 'yes' or 'true'
      if (typeof isOverdue === 'string' && (isOverdue === 'yes' || isOverdue === 'true')) {
        const currentDate = new Date();
        queryObj.dueDate = { $lt: currentDate }; // Filter for overdue tasks
      } else if (typeof isOverdue === 'boolean' && isOverdue === true) {
        const currentDate = new Date();
        queryObj.dueDate = { $lt: currentDate }; // Filter for overdue tasks
      } else {
        // If the `overdue` filter doesn't match the condition, use it as a field key
        queryObj[isOverdue] = true;  // For cases where `overdue` is another field name
      }
    }

    const totalRecords = await model.countDocuments(queryObj);
    let recordIds = [];
    let fieldData = [];

    if (selectFields) {
      fieldData = await model.find(queryObj).select(selectFields).lean();
      if(fetchIds) recordIds = fieldData.map(r => r._id);
    } else {
      const records = await model.find(queryObj).select('_id').lean();
      if(fetchIds)recordIds = records.map(r => r._id);
    }

    return res.status(200).json({ status: 'success', message: 'found', totalRecords, recordIds, fieldData });

  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message, code: 'server_error' });
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