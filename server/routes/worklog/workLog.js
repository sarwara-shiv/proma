import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { WorkLog } from '../../models/models.js'; 
import { generateUniqueId } from '../../utils/idGenerator.js';
import { parseDateRange } from '../../utils/DateUtil.js';


const router = express.Router();

// START Worklog & END CURRENT WORKLOG
router.post("/start", verifyToken, async (req, res) => {
    try {
        // Step 1: Find any active work log for the user
        const activeWorkLog = await WorkLog.findOne({ user: req.user._id, status: 'active' });

        // Step 2: If an active work log exists, stop it (set status to completed and endTime)
        if (activeWorkLog) {
            activeWorkLog.status = 'completed';
            activeWorkLog.endTime = new Date(); // Set the current time as the end time
            activeWorkLog.duration = Math.round((activeWorkLog.endTime - activeWorkLog.startTime) / (1000 * 60)); // Calculate the duration in minutes

            // Save the updated active work log
            await activeWorkLog.save();
        }

        // Step 3: Create a new work log
        const newWorkLogData = {
            ...req.body,  // Data passed in the request body
            user: req.user._id, // Assign the authenticated user's ID
            status: 'active',  // Set status as active for the new work log
            startTime: new Date() // Set the current date-time as the start time
        };

        const _cid = await generateUniqueId('worklogs');
        if(_cid) newWorkLogData = {...newWorkLogData, _cid};

        const newWorkLog = new WorkLog(newWorkLogData); // Create a new WorkLog instance
        await newWorkLog.save(); // Save the new work log

        // Step 4: Check if the daily report exists for the current date
        const today = new Date();
        const existingReport = await DailyReport.findOne({
            user: req.user._id,
            date: {
                $gte: new Date(today.setHours(0, 0, 0, 0)), // Start of today
                $lt: new Date(today.setHours(23, 59, 59, 999)) // End of today
            }
        });

         // If no daily report exists for today, create a new one
         if (!existingReport) {
            const newDailyReport = new DailyReport({
                user: req.user._id,
                date: new Date(),
                totalDuration: 0,
                notes: '',
                workLogs: [newWorkLog._id], // Add the current work log to the daily report
                status: 'open'
            });
            const _ciddr = await generateUniqueId('dailyreports');
            if(_ciddr) newWorkLogData = {...newWorkLogData, _cid:_ciddr};

            await newDailyReport.save(); // Save the new daily report
        } else {
            // If the daily report exists, add the new work log to it
            existingReport.workLogs.push(newWorkLog._id);
            await existingReport.save(); // Save the updated daily report
        }

        // Return success response with the newly created work log
        return res.status(201).json({
            status: "success",
            message: "Old work log stopped and new work log created",
            code: "data_added",
            data: newWorkLog
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
        // Find the work log by ID
        const workLog = await WorkLog.findById(req.params.id);

        // If work log is not found
        if (!workLog) {
            return res.json({ status: "error", message: 'Record not found', code: "record_not_found" });
        }

        // Update the work log with the completed status, current end time, and notes from the request body
        workLog.status = 'completed';
        workLog.endTime = new Date(); // Set the current date-time as end time
        workLog.notes = req.body.notes || workLog.notes; // Update notes with data from request body (if provided)

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
        // Find the work log by ID
        const workLog = await WorkLog.findById(req.params.id);

        // If work log is not found
        if (!workLog) {
            return res.json({ status: "error", message: 'Record not found', code: "record_not_found" });
        }

        // Update fields based on the request body
        if (req.body.status) {
            workLog.status = req.body.status; // Update status (active/completed)
        }
        if (req.body.notes) {
            workLog.notes = req.body.notes; // Update notes
        }
        if (req.body.endTime) {
            workLog.endTime = new Date(req.body.endTime); // Update end time
        }
        if (req.body.startTime) {
            workLog.startTime = new Date(req.body.startTime); // Update start time
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
    } = req.body; // Filters from request body

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
