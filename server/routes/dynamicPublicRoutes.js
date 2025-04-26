import { ChangeLog, Sprint, TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation, QaTask, MainTask, DailyReport, WorkLog } from '../models/models.js';
import { UserRolesModel } from '../models/userRolesModel.js';
import UserModel from '../models/userModel.js'; 
import UserGroupModel from '../models/userGroupModel.js'; 
import express from 'express';
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
/**
 * 
 * GET TOTALS
 * 
 */
router.get('/get-totals', async (req, res) => {
  const { resource } = req.params;
  let filters = req.query || {}; // Now from query params

  const model = getModel(resource);

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
            queryObj[key] = { $nin: value.values };
          } else {
            // Single value => use $ne (Not Equal)
            queryObj[key] = { $ne: value.values };
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

    const totalRecords = await model.countDocuments(queryObj);
    return res.status(200).json({ status: 'success', message: 'found', totalRecords });

  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message, code: 'server_error' });
  }
});

export { router as publicRouter };