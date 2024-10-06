import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import { TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation, QaTask, MainTask } from '../models/models.js';
import { UserRolesModel } from '../models/userRolesModel.js';
import UserModel from '../models/userModel.js'; 
import UserGroupModel from '../models/userGroupModel.js'; 
import { checkIfRecordExists } from '../middleware/checkIfRecordExists.js';
import { generateUniqueId } from '../utils/idGenerator.js';
import moment from 'moment/moment.js';

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
      case 'groups':
        return UserGroupModel; 
      case 'documentation':
        return Documentation;
      case 'qataks':
        return QaTask;
      case 'maintasks':
        return MainTask;
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
      }

      const _cid = await generateUniqueId(resource);
      if(_cid) data = {...data, _cid};
      const newRecord = new model(data);
      const savedRecord = await newRecord.save();
      console.log('-----------relatedUpdates--------------')
      console.log(relatedUpdates)
      if (relatedUpdates && Array.isArray(relatedUpdates)) {
        for (const update of relatedUpdates) {
          console.log(update);
          const relatedModel = getModel(update.collection); // Get the model for the related collection
          console.log(relatedModel);
          if (relatedModel) {
            if (update.type === 'array') {
              // Add the new record ID to an array field
              console.log('-------------------------')
              console.log(savedRecord._id, update.ids)
              await relatedModel.updateMany(
                { _id: { $in: update.ids } },  // IDs to match in the related collection
                { $addToSet: { [update.field]: savedRecord._id } }  // Add the ID to the array field
              );
            } else if (update.type === 'string') {
              // Replace the existing ID in the field with the new record ID
              await relatedModel.updateMany(
                { _id: { $in: update.ids } },  // IDs to match in the related collection
                { $set: { [update.field]: savedRecord._id } }  // Replace the ID in the field
              );
            }
          }
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

  if (!model) {
    return res.json({ status: "error", message:'Model not found', code:"invalid_resource" });
  }

  if (!id) {
    return res.json({ status: "error", message:'ID not found', code:"id_required" });
  }
  try {

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
    const deletedRecord = await model.findByIdAndDelete(id);
    if (!deletedRecord) {
      // return res.status(404).json({ error: 'Record not found' });
      return res.json({ status: "error", message:'Record not found', code:"record_not_found" });
    }
     // Handle related updates
     if (relatedUpdates && Array.isArray(relatedUpdates)) {
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
    if (deleteRelated && Array.isArray(deleteRelated)) {
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
  console.log('------ids');
  console.log(id);
  try {
    let records;
    if(Array.isArray(id)){
      console.log('------ids 2');
      console.log(id);
      records = await model.find({_id:{$in:id}});
    }else{
      console.log(id);
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
          console.log({ $gte: fromDate, $lte: tillDate })
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

      // Debugging output for sorting object
      console.log('Sorting by:', sortObj);

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
 * TODO
 * - get records / with / without pagination
 * - get record by id
 * - update field
 * - give permissions to user to update details and password
 */

export { router as resourceRouter };