import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { WorkLog, DailyReport } from '../../models/models.js'; 
import { generateUniqueId } from '../../utils/idGenerator.js';
import { sortReportByProjects, sortReportByUsers, sortReportByTasks } from '../../utils/utilFunctions.js';
import { parseDateRange } from '../../utils/DateUtil.js';
import moment from 'moment';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';


const router = express.Router();

// START Worklog & END CURRENT WORKLOG
router.post("/start", verifyToken, async (req, res) => {
    try {
        const { id, task, project, notes='', populateFields = [], ...data } = req.body.data; // Extract ID, task, and project from request
        let resData = null;

        // Find any active work log for the user
        const activeWorkLog = await WorkLog.findOne({ user: req.user._id, status: 'active' });

        
        let createNew = false;
        let stopOld = false;

        if (!id) {
            // CASE 1: No id provided → Start a new work log
            createNew = true;
            stopOld = true;
        } else if (activeWorkLog && activeWorkLog._id.toString() === id) {
            // CASE 2: Provided id matches active work log → Stop it, do not create a new one
            stopOld = true;
            createNew = false;
        } else {
            // CASE 3: Provided id does not match active work log → Stop current and create new
            stopOld = true;
            createNew = true;
        }

        // Stop active work log if required
        if (stopOld && activeWorkLog) {
            activeWorkLog.status = 'completed';
            activeWorkLog.notes = notes;
            activeWorkLog.endTime = new Date();
            activeWorkLog.duration = Math.round((activeWorkLog.endTime - activeWorkLog.startTime) / (1000 * 60)); // Duration in minutes

            if (activeWorkLog.duration > 0) {
                await activeWorkLog.save();  // Save only if duration > 0
            } else {
                await activeWorkLog.deleteOne();  // Delete if duration is 0
            }
        }

        // Create new work log if needed
        if (createNew) {
            if (!task || !project) {
                return res.status(400).json({
                    status: "error",
                    message: "Task and Project are required to start a new work log",
                    code: "missing_task_or_project"
                });
            }

            let newWorkLogData = {
                ...data,
                user: req.user._id,
                task,
                project,
                status: 'active',
                startTime: new Date()
            };

            const _cid = await generateUniqueId('worklogs');
            if (_cid) newWorkLogData._cid = _cid;

            const newWorkLog = new WorkLog(newWorkLogData);
            await newWorkLog.save();
            resData = newWorkLog;
        }

        // Handle Daily Report
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check for existing daily report
        const existingReport = await DailyReport.findOne({
            user: req.user._id,
            date: { $gte: today }
        });

        // Close open reports from previous days
        await DailyReport.updateMany(
            { user: req.user._id, date: { $lt: today }, status: 'open' },
            { $set: { status: 'closed' } }
        );

        if (!existingReport) {
            // Create a new daily report
            const newDailyReport = new DailyReport({
                user: req.user._id,
                date: new Date(),
                totalDuration: 0,
                notes: '',
                workLogs: resData ? [resData._id] : [],
                status: 'open'
            });

            const _ciddr = await generateUniqueId('dailyreports');
            if (_ciddr) newDailyReport._cid = _ciddr;
            await newDailyReport.save();
        } else if (resData) {
            // Add new work log to existing daily report
            existingReport.workLogs.push(resData._id);
            await existingReport.save();
        }

        // Populate dynamic fields if necessary
        if (resData && populateFields && Array.isArray(populateFields)) {
            // Apply population for each field provided
            const query = WorkLog.findOne({ _id: resData._id }); // Query for the created or updated work log

            populateFields.forEach((field) => {
                query.populate(field); // Dynamically populate the specified fields
            });

            // Execute the query with population
            resData = await query.exec();
        }

        return res.status(201).json({
            status: "success",
            message: createNew ? "New work log started" : "Work log stopped",
            code: createNew ? "worklog_started" : "worklog_stopped",
            data: createNew ? resData : null
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Unknown error",
            code: "unknown_error"
        });
    }
});


// STOP WORKLOG
router.post("/stop/:id", verifyToken, async (req, res) => {
    try {
        const {...data} = req.body.data;
        // Find the work log by ID
        const workLog = await WorkLog.findById(req.params.id);

        // If work log is not found
        if (!workLog) {
            return res.json({ status: "error", message: 'Record not found', code: "record_not_found" });
        }

        // Update the work log with the completed status, current end time, and notes from the request body
        workLog.status = 'completed';
        workLog.endTime = new Date(); // Set the current date-time as end time
        workLog.notes = data.notes || workLog.notes; // Update notes with data from request body (if provided)

        // Recalculate the duration based on the new endTime
        workLog.duration = Math.round((workLog.endTime - workLog.startTime) / (1000 * 60)); // Convert ms to minutes

        // Save the updated work log
        await workLog.save();

        // Return the updated work log as the response
        return res.status(200).json({ status: "success", message:'Record updated', code:"record_updated", data:'' });
    } catch (error) {
        console.error(error);
        return res.status(200).json({ status: "error", message:"unknown_error", code:"unknown_error"});
    }
});

// UPDATE Worklog (for general updates)
router.post("/update/:id", verifyToken, async (req, res) => {
    try {
        const {...data} = req.body.data;
        // Find the work log by ID
        const workLog = await WorkLog.findById(req.params.id);

        // If work log is not found
        if (!workLog) {
            return res.json({ status: "error", message: 'Record not found', code: "record_not_found" });
        }

        // Update fields based on the request body
        if (data.status) {
            workLog.status = data.status; // Update status (active/completed)
        }
        if (data.notes) {
            workLog.notes = data.notes; // Update notes
        }
        if (data.endTime) {
            workLog.endTime = new Date(data.endTime); // Update end time
        }
        if (data.startTime) {
            workLog.startTime = new Date(data.startTime); // Update start time
        }

        // Recalculate the duration if endTime is updated
        if (workLog.endTime && workLog.startTime) {
            workLog.duration = Math.round((workLog.endTime - workLog.startTime) / (1000 * 60)); // Convert ms to minutes
        }

        // Save the updated work log
        await workLog.save();

        // Return the updated work log as the response
        return res.status(200).json({
            status: "success", 
            message: 'Worklog updated successfully', 
            code: "worklog_updated", 
            data: workLog
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error", 
            message: "unknown_error", 
            code: "unknown_error"
        });
    }
});


/**
 * 
 * @param userId : optional
 * @param projectId : optional
 * @param taskId : optional
 * @param startDate : from when
 * @param endDate : untill when
 * @param reportType : daily, weekly, monthly
 * 
 */
// Report endpoint
router.post('/report', verifyToken, async (req, res) => {
    const {
        userId,
        projectId,
        taskId,
        startDate,
        endDate,
        reportType
    } = req.body.data; // Filters from request body

    try {
        let start, end;

        // If startDate is not provided, set default values based on report type
        if (!startDate) {
            const today = moment().startOf('day');
            if (reportType === 'weekly') {
                start = today.clone().subtract(7, 'days').toDate();
            } else if (reportType === 'monthly') {
                start = today.clone().subtract(1, 'month').toDate();
            } else {
                start = today.toDate();
            }
        } else {
            start = moment(startDate).startOf('day').toDate();
        }

        // If endDate is not provided, set it to the end of the current day
        end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

        let aggregatePipeline = [];

        const userObjectId = new ObjectId(userId);

        // Match worklogs by date range and other filters
        let matchStage = {
            // startTime: { $gte: start, $lte: end },
            user: userObjectId,
            status: 'completed'
        };

        // If projectId or taskId is provided, include them in the match stage
        if (startDate || endDate) matchStage.startTime = { $gte: start, $lte: end }; // if start date or end date given only show dates else show all data
        if (projectId) matchStage.project = new ObjectId(projectId);
        if (taskId) matchStage.task = new ObjectId(taskId);

        // Initial match stage
        aggregatePipeline.push({ $match: matchStage });

        // Aggregation stage for grouping by the type (daily, weekly, monthly)
        let groupStage = {
            _id: '$user',
            totalDuration: { $sum: '$duration' },
        };

        // Modify the group stage based on the report type (daily, weekly, monthly)
        switch (reportType) {
            case 'daily':
                groupStage = {
                    _id: {
                        user: '$user',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                    },
                    totalDuration: { $sum: '$duration' },
                };
                break;

            case 'weekly':
                groupStage = {
                    _id: {
                        user: '$user',
                        week: { $isoWeek: '$startTime' },
                    },
                    totalDuration: { $sum: '$duration' },
                };
                break;

            case 'monthly':
                groupStage = {
                    _id: {
                        user: '$user',
                        month: { $month: '$startTime' }, // Grouping by month number
                        year: { $year: '$startTime' } // Ensuring cross-year reports work
                    },
                    totalDuration: { $sum: '$duration' },
                };
                break;

            default:
                groupStage = {
                    _id: '$user',
                    totalDuration: { $sum: { $ifNull: ['$duration', 0] } },
                };
                break;
        }

        
        // If projectId is provided, include the project in the group
        if (projectId) {
            groupStage._id.project = '$project'; // Add project to the group stage
        }

        // If taskId is provided, include the task in the group
        if (taskId) {
            groupStage._id.task = '$task'; // Add task to the group stage
        }

        // Push the group stage into the aggregation pipeline
        aggregatePipeline.push({ $group: groupStage });
        // Adding the conversion to days, hours, minutes
        const convertDuration = {
            $project: {
                _id: 1,
                projectId: { $ifNull: [{ $ifNull: ['$_id.project', null] }, null] },
                userId: { $ifNull: [{ $ifNull: ['$_id.user', null] }, null] },
                days: { $floor: { $divide: ['$totalDuration', 1440] } }, // 1 day = 1440 minutes
                hours: {
                    $floor: { $divide: [{ $mod: ['$totalDuration', 1440] }, 60] } // 1 hour = 60 minutes
                },
                minutes: {
                    $floor: { $mod: [{ $mod: ['$totalDuration', 1440] }, 60] } // remainder after dividing by 60
                },
                officeHours:{
                    days: { 
                        $floor: { 
                            $divide: ['$totalDuration', 480] // 1 working day = 480 minutes (8 hours) 
                        } 
                    },
                    hours: {
                        $floor: { 
                            $divide: [{ $mod: ['$totalDuration', 480] }, 60] // 1 hour = 60 minutes
                        }
                    },
                    minutes: {
                        $floor: { 
                            $mod: [{ $mod: ['$totalDuration', 480] }, 60] // 1 minute = 60 seconds
                        }
                    }
                }

            }
        };
        aggregatePipeline.push(convertDuration);
        // Sorting stage (sorting by user and date)
        aggregatePipeline.push({
            $sort: {
                '_id.user': 1,
            },
        });

        // Execute the aggregation query
        let reportData = await WorkLog.aggregate(aggregatePipeline);

       
        reportData = await WorkLog.populate(reportData, [
            { path: '_id.user', model: 'User', select:'name email username' },
            { path: '_id.project', model: 'Project', select:'name projectType'  },
            { path: '_id.task', model: 'Task', select:'name assignedBy',
                populate: { 
                    path: 'assignedBy', 
                    model: 'User', 
                    select: 'name email'
                } 
              }
        ]);

        const sortedByProjects = projectId ? sortReportByProjects(reportData) : [];
        const sortedByUsers = projectId ? sortReportByProjects(reportData) : [];


        // Return the result
        res.status(200).json({
            status: 'success',
            message: 'Report generated successfully',
            data: reportData,
            sortedByProjects:sortedByProjects, 
            sortedByUsers:sortedByUsers,
            params: { startDate: start, endDate: end, reportType, taskId, projectId }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error generating report' });
    }
});

router.post('/report2', verifyToken, async (req, res) => {
    const { userId, projectId, taskId, startDate, endDate } = req.body.data; // Filters from request body

    try {
        let start = startDate ? moment(startDate).startOf('day').toDate() : moment().startOf('day').toDate();
        let end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

        let aggregatePipeline = [];
        const userObjectId = new ObjectId(userId);

        // Match worklogs by date range and other filters
        let matchStage = {
            user: userObjectId,
            status: 'completed',
            startTime: { $gte: start, $lte: end }
        };

        if (projectId) matchStage.project = new ObjectId(projectId);
        if (taskId) matchStage.task = new ObjectId(taskId);

        aggregatePipeline.push({ $match: matchStage });

        // Grouping by project, task, and date, and combining notes with worklog IDs
        let groupStage = {
            _id: {
                user: '$user',
                project: '$project',
                task: '$task',
                date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }
            },
            totalDuration: { $sum: '$duration' },
            notes: { 
                $push: {
                    worklogId: '$_id',
                    note: '$notes'
                }
            }
        };

        aggregatePipeline.push({ $group: groupStage });

        // Adding the conversion to days, hours, minutes
        aggregatePipeline.push({
            $project: {
                _id: 1,
                projectId: '$_id.project',
                userId: '$_id.user',
                taskId: '$_id.task',
                date: '$_id.date',
                totalDuration: 1,
                notes: 1,
                days: { $floor: { $divide: ['$totalDuration', 1440] } },
                hours: { $floor: { $divide: [{ $mod: ['$totalDuration', 1440] }, 60] } },
                minutes: { $mod: [{ $mod: ['$totalDuration', 1440] }, 60] },
                officeHours: {
                    days: { $floor: { $divide: ['$totalDuration', 480] } },
                    hours: { $floor: { $divide: [{ $mod: ['$totalDuration', 480] }, 60] } },
                    minutes: { $mod: [{ $mod: ['$totalDuration', 480] }, 60] }
                }
            }
        });

        // Sorting stage
        aggregatePipeline.push({ $sort: { 'date': 1 } });

        // Execute the aggregation query
        let reportData = await WorkLog.aggregate(aggregatePipeline);

        // Populate user, project, and task details
        reportData = await WorkLog.populate(reportData, [
            { path: 'userId', model: 'User', select: 'name email username' },
            { path: 'projectId', model: 'Project', select: 'name projectType' },
            { path: 'taskId', model: 'Task', select: 'name assignedBy',
                populate: { path: 'assignedBy', model: 'User', select: 'name email' }
            }
        ]);

        const sortedByProjects = projectId ? sortReportByProjects(reportData) : [];
        const sortedByUsers = userId ? sortReportByUsers(reportData) : [];

        res.status(200).json({
            status: 'success',
            message: 'Report generated successfully',
            data: reportData,
            sortedByProjects,
            sortedByUsers,
            params: { startDate: start, endDate: end, taskId, projectId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error generating report' });
    }
});

router.post('/reportByType', verifyToken, async (req, res) => {
    const { userId, projectId, taskId, reportType, year, month } = req.body.data;

    try {
        let aggregatePipeline = [];
        const userObjectId = new ObjectId(userId);

        // Match worklogs by user and status
        let matchStage = {
            user: userObjectId,
            status: 'completed'
        };

        // Use current year if no year is provided
        const currentYear = new Date().getFullYear();
        const filterYear = year ? parseInt(year) : currentYear;

        // Apply year and month filters if provided
        if (projectId) matchStage.project = new ObjectId(projectId);
        if (taskId) matchStage.task = new ObjectId(taskId);

        matchStage["$expr"] = { "$eq": [{ "$year": "$startTime" }, filterYear] };

        if (month) {
            matchStage["$expr"] = {
                "$and": [
                    { "$eq": [{ "$year": "$startTime" }, filterYear] },
                    { "$eq": [{ "$month": "$startTime" }, parseInt(month)] }
                ]
            };
        }

        aggregatePipeline.push({ $match: matchStage });
        // Sort by startDate (startTime) before grouping
        aggregatePipeline.push({
            $sort: { startTime: 1 }  // Sort in ascending order of startTime
        });

        // Define grouping logic based on reportType (weekly or monthly)
        let groupStage = {
            _id: {
                user: '$user',
                project: '$project',
                task: '$task'
            },
            totalDuration: { $sum: '$duration' }
        };

        if (reportType === 'weekly') {
            groupStage._id.week = { $isoWeek: '$startTime' };
            groupStage._id.year = { $year: '$startTime' };
        } else if (reportType === 'monthly') {
            groupStage._id.month = { $month: '$startTime' };
            groupStage._id.year = { $year: '$startTime' };
        }

        aggregatePipeline.push({ $group: groupStage });

        // Convert totalDuration to days, hours, minutes
        aggregatePipeline.push({
            $project: {
                _id: 0,
                projectId: '$_id.project',
                userId: '$_id.user',
                taskId: '$_id.task',
                totalDuration: 1,
                period: reportType === 'weekly' ? { week: '$_id.week', year: '$_id.year' } : { month: '$_id.month', year: '$_id.year' },
                days: { $floor: { $divide: ['$totalDuration', 1440] } },
                hours: { $floor: { $divide: [{ $mod: ['$totalDuration', 1440] }, 60] } },
                minutes: { $mod: [{ $mod: ['$totalDuration', 1440] }, 60] }
            }
        });

        // Execute the aggregation query
        let reportData = await WorkLog.aggregate(aggregatePipeline);

        // Populate project and task details
        reportData = await WorkLog.populate(reportData, [
            { path: 'userId', model: 'User', select: 'name email username' },
            { path: 'projectId', model: 'Project', select: 'name projectType' },
            { path: 'taskId', model: 'Task', select: 'name assignedBy',
                populate: { path: 'assignedBy', model: 'User', select: 'name email' }
            }
        ]);

        // Now combine the data by task
        const groupedByTask = reportData.reduce((acc, item) => {
            // Check if the task is already in the accumulator
            const taskIndex = acc.findIndex(task => task.taskId.toString() === item.taskId.toString());

            if (taskIndex === -1) {
                // If task doesn't exist in the accumulator, add it
                acc.push({
                    taskId: item.taskId,
                    taskName: item.taskId.name,
                    projectId: item.projectId, // Add projectId if needed
                    totalDuration: item.totalDuration,
                    period: item.period,
                    days:item.days,
                    hours:item.hours,
                    minutes:item.minutes,
                    user:item.userId,
                    users: [
                        {
                            userId: item.userId,
                            userName: item.userId.name,
                            totalDuration: item.totalDuration,
                            period: item.period
                        }
                    ]
                });
            } else {
                // If task exists, add the user data to the existing task
                acc[taskIndex].totalDuration += item.totalDuration;
                acc[taskIndex].users.push({
                    userId: item.userId,
                    userName: item.userId.name,
                    totalDuration: item.totalDuration,
                    period: item.period
                });
            }

            return acc;
        }, []);

        // Sort the result by period (week or month)
        groupedByTask.sort((a, b) => {
            if (reportType === 'weekly') {
                return a.period.week - b.period.week;  // Sort by week
            } else if (reportType === 'monthly') {
                return a.period.month - b.period.month;  // Sort by month
            }
            return 0;
        });

        res.status(200).json({
            status: 'success',
            message: 'Report generated successfully',
            data: groupedByTask,
            params: { reportType, projectId, taskId, year: filterYear, month }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error generating report' });
    }
});

/**
 * 
 * ADMIN REPORTS
 * get data for specific id or for all ids
 * 
 */
router.post('/adminReport', verifyToken, async (req, res) => {
    const { projectId, taskId, startDate, endDate, userId } = req.body.data; // Optional filters

    try {
        let start = startDate ? moment(startDate).startOf('day').toDate() : moment().startOf('day').toDate();
        let end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

        let aggregatePipeline = [];

        // Match worklogs by date range, project, task, status, and optionally userId
        let matchStage = {
            status: 'completed',
            startTime: { $gte: start, $lte: end }
        };

        if (projectId) matchStage.project = new ObjectId(projectId);
        if (taskId) matchStage.task = new ObjectId(taskId);
        if (userId) matchStage.user = new ObjectId(userId);  // Filter by user if provided

        aggregatePipeline.push({ $match: matchStage });

        // Grouping by user, project, task, and date to calculate total durations
        let groupStage = {
            _id: {
                user: '$user',
                project: '$project',
                task: '$task',
                date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }
            },
            totalDuration: { $sum: '$duration' },
            notes: { 
                $push: {
                    worklogId: '$_id',
                    note: '$notes'
                }
            }
        };

        aggregatePipeline.push({ $group: groupStage });

        // Project the necessary fields: total duration, first start date, last end date
        aggregatePipeline.push({
            $project: {
                _id: 1,
                projectId: '$_id.project',
                userId: '$_id.user',
                taskId: '$_id.task',
                date: '$_id.date',
                totalDuration: 1,
                notes: 1,
                days: { $floor: { $divide: ['$totalDuration', 1440] } },
                hours: { $floor: { $divide: [{ $mod: ['$totalDuration', 1440] }, 60] } },
                minutes: { $mod: [{ $mod: ['$totalDuration', 1440] }, 60] },
                officeHours: {
                    days: { $floor: { $divide: ['$totalDuration', 480] } },
                    hours: { $floor: { $divide: [{ $mod: ['$totalDuration', 480] }, 60] } },
                    minutes: { $mod: [{ $mod: ['$totalDuration', 480] }, 60] }
                }
            }
        });

        // Sorting by date
        aggregatePipeline.push({ $sort: { 'date': 1 } });

        // Execute the aggregation query
        let reportData = await WorkLog.aggregate(aggregatePipeline);

        // Populate user, project, and task details
        reportData = await WorkLog.populate(reportData, [
            { path: 'userId', model: 'User', select: 'name email username' },
            { path: 'projectId', model: 'Project', select: 'name projectType' },
            { path: 'taskId', model: 'Task', select: 'name assignedBy',
                populate: { path: 'assignedBy', model: 'User', select: 'name email' }
            }
        ]);

        // Group the report data by user
        let groupedByUsers = reportData.reduce((acc, item) => {
            const userId = item.userId._id.toString();  // Ensure we use the string representation for key comparison
            if (!acc[userId]) {
                acc[userId] = {
                    userId: item.userId._id,
                    userName: item.userId.name,
                    data: []
                };
            }
            acc[userId].data.push(item); // Add the item to the user's data array
            return acc;
        }, {});

        // Convert grouped data to an array of objects
        const result = Object.values(groupedByUsers);

        res.status(200).json({
            status: 'success',
            message: 'Report generated successfully',
            data: result,
            params: { startDate: start, endDate: end, taskId, projectId, userId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error generating report' });
    }
});


router.post('/adminReportByType', verifyToken, async (req, res) => {
    const { projectId, taskId, reportType, year, month, userId } = req.body.data;

    try {
        let aggregatePipeline = [];

        // Use current year if no year is provided
        const currentYear = new Date().getFullYear();
        const filterYear = year ? parseInt(year) : currentYear;

        // Match worklogs by status (without userId by default)
        let matchStage = {
            status: 'completed'
        };

        // Apply year and month filters if provided
        matchStage["$expr"] = { "$eq": [{ "$year": "$startTime" }, filterYear] };

        if (month) {
            matchStage["$expr"] = {
                "$and": [
                    { "$eq": [{ "$year": "$startTime" }, filterYear] },
                    { "$eq": [{ "$month": "$startTime" }, parseInt(month)] }
                ]
            };
        }

        if (projectId) matchStage.project = new ObjectId(projectId);
        if (taskId) matchStage.task = new ObjectId(taskId);

        if (userId) {
            matchStage.user = new ObjectId(userId);  // Filter by user if userId is provided
        }

        aggregatePipeline.push({ $match: matchStage });

        // Sort by startDate (startTime) before grouping
        aggregatePipeline.push({
            $sort: { startTime: 1 }  // Sort in ascending order of startTime
        });

        // Define grouping logic based on reportType (weekly or monthly)
        let groupStage = {
            _id: {
                user: '$user',
                project: '$project',
                task: '$task'
            },
            totalDuration: { $sum: '$duration' }
        };

        if (reportType === 'weekly') {
            groupStage._id.week = { $isoWeek: '$startTime' };
            groupStage._id.year = { $year: '$startTime' };
        } else if (reportType === 'monthly') {
            groupStage._id.month = { $month: '$startTime' };
            groupStage._id.year = { $year: '$startTime' };
        }

        aggregatePipeline.push({ $group: groupStage });

        // Convert totalDuration to days, hours, minutes
        aggregatePipeline.push({
            $project: {
                _id: 0,
                projectId: '$_id.project',
                userId: '$_id.user',
                taskId: '$_id.task',
                totalDuration: 1,
                period: reportType === 'weekly' ? { week: '$_id.week', year: '$_id.year' } : { month: '$_id.month', year: '$_id.year' },
                days: { $floor: { $divide: ['$totalDuration', 1440] } },
                hours: { $floor: { $divide: [{ $mod: ['$totalDuration', 1440] }, 60] } },
                minutes: { $mod: [{ $mod: ['$totalDuration', 1440] }, 60] }
            }
        });

        // Execute the aggregation query
        let reportData = await WorkLog.aggregate(aggregatePipeline);

        // Populate project and task details
        reportData = await WorkLog.populate(reportData, [
            { path: 'userId', model: 'User', select: 'name email username' },
            { path: 'projectId', model: 'Project', select: 'name projectType' },
            { path: 'taskId', model: 'Task', select: 'name assignedBy',
                populate: { path: 'assignedBy', model: 'User', select: 'name email' }
            }
        ]);

        // Group the data by userId, then by task and period
        const groupedByUser = reportData.reduce((acc, item) => {
            const userId = item.userId._id.toString();  // Ensure we use the string representation for key comparison

            if (!acc[userId]) {
                acc[userId] = {  // Initialize user if not already present
                    userId: item.userId._id,
                    userName: item.userId.name,
                    data: []
                };
            }

            // Add task data to the corresponding user
            acc[userId].data.push({
                taskId: item.taskId._id,
                taskName: item.taskId.name,
                projectId: item.projectId._id,
                projectName: item.projectId.name,
                totalDuration: item.totalDuration,
                period: item.period,
                days: item.days,
                hours: item.hours,
                minutes: item.minutes
            });

            return acc;
        }, {});

        // Convert the grouped data into the desired format
        const result = groupedByUser;

        res.status(200).json({
            status: 'success',
            message: 'Report generated successfully',
            data: result,
            params: { reportType, projectId, taskId, year: filterYear, month, userId }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error generating report' });
    }
});

router.post('/projectReport', verifyToken, async (req, res) => {
    const { projectId } = req.body.data;  // Optional projectId parameter

    try {
        let aggregatePipeline = [];

        // Match worklogs by project and status
        let matchStage = {
            status: 'completed'
        };

        if (projectId) {
            matchStage.project = new ObjectId(projectId);  // Filter by project if provided
        }

        aggregatePipeline.push({ $match: matchStage });

        // Sort worklogs by startTime to find the earliest and latest dates
        aggregatePipeline.push({
            $sort: { startTime: 1 }  // Sort in ascending order of startTime
        });

        // Group by project, task, and user to calculate total durations
        let groupStage = {
            _id: {
                project: '$project',
                task: '$task',
                user: '$user'
            },
            totalDuration: { $sum: '$duration' },
            firstStartTime: { $min: '$startTime' },  // Earliest start time for the project
            lastEndTime: { $max: '$endTime' }  // Latest end time for the project
        };

        aggregatePipeline.push({ $group: groupStage });

        // Project the necessary fields: total duration, first start date, last end date
        aggregatePipeline.push({
            $project: {
                _id: 0,
                projectId: '$_id.project',
                taskId: '$_id.task',
                userId: '$_id.user',
                totalDuration: 1,
                firstStartTime: 1,
                lastEndTime: 1
            }
        });

        // Execute the aggregation query
        let reportData = await WorkLog.aggregate(aggregatePipeline);

        // Populate project, task, and user details
        reportData = await WorkLog.populate(reportData, [
            { path: 'projectId', model: 'Project', select: 'name projectType' },
            { path: 'taskId', model: 'Task', select: 'name assignedBy' },
            { path: 'userId', model: 'User', select: 'name email' }
        ]);

        // Organize the data to get the total duration for each project, task, and user
        const projectSummary = reportData.reduce((acc, item) => {
            // For project level summary
            if (!acc[item.projectId._id]) {
                acc[item.projectId._id] = {
                    project: item.projectId, // Store the full project object
                    totalDuration: 0,
                    users: [],
                    tasks: {},
                    firstStartDate: item.firstStartTime,
                    lastEndDate: item.lastEndTime
                };
            }

            // Add total duration to the project
            acc[item.projectId._id].totalDuration += item.totalDuration;

            // Track the users who worked on the project
            if (!acc[item.projectId._id].users.find(user => user.userId.toString() === item.userId.toString())) {
                acc[item.projectId._id].users.push({
                    userId: item.userId,
                    userName: item.userId.name,
                    totalDuration: item.totalDuration
                });
            }

            // Track total duration by task
            if (!acc[item.projectId._id].tasks[item.taskId]) {
                acc[item.projectId._id].tasks[item.taskId] = {
                    taskId: item.taskId,
                    taskName: item.taskId.name,
                    totalDuration: 0
                };
            }
            acc[item.projectId._id].tasks[item.taskId].totalDuration += item.totalDuration;

            // Update the earliest start time and latest end time for the project
            if (item.firstStartTime < acc[item.projectId._id].firstStartDate) {
                acc[item.projectId._id].firstStartDate = item.firstStartTime;
            }
            if (item.lastEndTime > acc[item.projectId._id].lastEndDate) {
                acc[item.projectId._id].lastEndDate = item.lastEndTime;
            }

            return acc;
        }, {});

        // Helper function to convert duration to days, hours, minutes
        const convertDuration = (duration) => {
            const days = Math.floor(duration / 1440);  // 1 day = 1440 minutes
            const hours = Math.floor((duration % 1440) / 60);  // 1 hour = 60 minutes
            const minutes = duration % 60;  // Remaining minutes
            return { days, hours, minutes };
        };

        // Helper function to convert to working days, hours, minutes
        const convertToWorkingTime = (duration) => {
            const workingDays = Math.floor(duration / 480);  // 1 working day = 480 minutes
            const workingHours = Math.floor((duration % 480) / 60);  // Remaining working hours
            const workingMinutes = duration % 60;  // Remaining minutes
            return { workingDays, workingHours, workingMinutes };
        };

        // Format the final response with converted times
        const formattedReport = Object.keys(projectSummary).map(projectId => {
            const projectData = projectSummary[projectId];
            const totalDuration = projectData.totalDuration;

            // Convert project total duration to days, hours, minutes
            const projectTime = convertDuration(totalDuration);

            // Convert project total duration to working days, hours, minutes
            const workingProjectTime = convertToWorkingTime(totalDuration);

            // Process the tasks with their durations converted
            const tasks = Object.values(projectData.tasks).map(task => {
                const taskTime = convertDuration(task.totalDuration);
                const workingTaskTime = convertToWorkingTime(task.totalDuration);
                return {
                    taskId: task.taskId,
                    taskName: task.taskName,
                    totalDuration: task.totalDuration,
                    time: taskTime,
                    workingTime: workingTaskTime
                };
            });

            // Process the users with their durations converted
            const users = projectData.users.map(user => {
                const userTime = convertDuration(user.totalDuration);
                const workingUserTime = convertToWorkingTime(user.totalDuration);
                return {
                    userId: user.userId,
                    userName: user.userName,
                    totalDuration: user.totalDuration,
                    time: userTime,
                    workingTime: workingUserTime
                };
            });

            return {
                projectId: projectData.project,  // Full project object
                totalDuration: totalDuration,
                projectTime,  // Days, hours, minutes
                workingProjectTime,  // Working days, hours, minutes
                users,
                tasks,
                timePeriod: {
                    startDate: projectData.firstStartDate,
                    endDate: projectData.lastEndDate
                }
            };
        });

        res.status(200).json({
            status: 'success',
            message: 'Project report generated successfully',
            data: formattedReport,
            params: { projectId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error generating project report' });
    }
});



// sort array
function sortByProjects(reportData){
    const sortedByProjects = [];
    reportData.forEach(entry => {
        const projectId = entry.projectId.toString();
        const userId = entry.userId.toString();
 
        // Find or create the project group in the array
        let projectGroup = sortedByProjects.find(group => group.projectId === projectId);
        if (!projectGroup) {
            projectGroup = { projectId: projectId, users: [] };
            sortedByProjects.push(projectGroup);
        }
    
        // Add the user to the project group, if the user is not already in the list
        let userGroup = projectGroup.users.find(user => user.userId === userId);
        if (!userGroup) {
            userGroup = { userId: userId, durations: [] };
            projectGroup.users.push(userGroup);
        }
    
        // Add the user's duration info to the user group
        userGroup.durations.push(entry);
    });
    
    // Sort the projects by their projectId and users by userId within each project
    sortedByProjects.forEach(project => {
        // Sort users within each project by userId
        project.users.sort((a, b) => a.userId.localeCompare(b.userId.toString()));
    });

    // Sort the entire array of projects by projectId
    sortedByProjects.sort((a, b) => a.projectId.localeCompare(b.projectId.toString()));

    return sortedByProjects;
}

// sort array
function sortByUsers(reportData){
    const sortedByUsers = [];
    // Group by users and sort projects within each user
    reportData.forEach(entry => {
        const projectId = entry.projectId.toString();
        const userId = entry.userId.toString();

        // Find or create the user group in the array
        let userGroup = sortedByUsers.find(group => group.userId === userId);
        if (!userGroup) {
            userGroup = { userId: userId, projects: [] };
            sortedByUsers.push(userGroup);
        }

        // Add the project to the user group, if the project is not already in the list
        let projectGroup = userGroup.projects.find(project => project.projectId === projectId);
        if (!projectGroup) {
            projectGroup = { projectId: projectId, durations: [] };
            userGroup.projects.push(projectGroup);
        }

        // Add the project's duration info to the project group
        projectGroup.durations.push(entry);
    });
    
    // Sort the users by userId
    sortedByUsers.sort((a, b) => a.userId.localeCompare(b.userId.toString()));

    // Sort projects within each user by projectId
    sortedByUsers.forEach(user => {
        user.projects.sort((a, b) => a.projectId.localeCompare(b.projectI.toString()));
    });

    return sortedByUsers;
}



export { router as worklogRouter };
