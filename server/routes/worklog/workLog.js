import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { WorkLog, DailyReport } from '../../models/models.js'; 
import { generateUniqueId } from '../../utils/idGenerator.js';
import { parseDateRange } from '../../utils/DateUtil.js';


const router = express.Router();

// START Worklog & END CURRENT WORKLOG
router.post("/start", verifyToken, async (req, res) => {
    try {
        const { id, task, project, populateFields = [], ...data } = req.body.data; // Extract ID, task, and project from request
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
            activeWorkLog.endTime = new Date();
            activeWorkLog.duration = Math.round((activeWorkLog.endTime - activeWorkLog.startTime) / (1000 * 60)); // Duration in minutes
            await activeWorkLog.save();
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


// Report endpoint
router.post('/report', verifyToken, async (req, res) => {
    const {
        userId,
        projectId,
        taskId,
        startDate,
        endDate,
        reportType,
        dateRange, // For range-based filters (e.g., daily, weekly, monthly)
    } = req.body.data; // Filters from request body

    try {
        const { start, end } = parseDateRange(startDate, endDate); // Parse the start and end date for range

        let aggregatePipeline = [];

        // Match worklogs by date range and other filters
        let matchStage = {
            startTime: { $gte: start, $lte: end },
        };

        if (userId) matchStage.user = userId;
        if (projectId) matchStage.project = projectId;
        if (taskId) matchStage.task = taskId;

        // Initial match stage
        aggregatePipeline.push({ $match: matchStage });

        // Aggregation stage for grouping by the type (daily, weekly, monthly)
        let groupStage = {
            _id: {
                user: '$user',
                date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            },
            totalDuration: { $sum: '$duration' },
        };

        switch (reportType) {
            case 'daily':
                // Group by user and day
                groupStage = {
                    _id: {
                        user: '$user',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                    },
                    totalDuration: { $sum: '$duration' },
                };
                break;

            case 'weekly':
                // Group by user and week number
                groupStage = {
                    _id: {
                        user: '$user',
                        week: { $isoWeek: '$startTime' },
                    },
                    totalDuration: { $sum: '$duration' },
                };
                break;

            case 'monthly':
                // Group by user and month
                groupStage = {
                    _id: {
                        user: '$user',
                        month: { $month: '$startTime' },
                    },
                    totalDuration: { $sum: '$duration' },
                };
                break;

            case 'dateRange':
                // Group by user and the specified range
                groupStage = {
                    _id: '$user',
                    totalDuration: { $sum: '$duration' },
                };
                break;

            default:
                groupStage = {
                    _id: '$user',
                    totalDuration: { $sum: '$duration' },
                };
                break;
        }

        // Push the group stage into the aggregation pipeline
        aggregatePipeline.push({ $group: groupStage });

        // Add the sorting stage for the result to be in an ordered format (optional)
        aggregatePipeline.push({
            $sort: {
                '_id.user': 1, // Sort by user (can be changed based on requirements)
            },
        });

        // Execute the aggregation query
        const reportData = await WorkLog.aggregate(aggregatePipeline).populate('user project task');

        res.status(200).json({
            status: 'success',
            message: 'Report generated successfully',
            data: reportData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error generating report' });
    }
});


export { router as worklogRouter };
