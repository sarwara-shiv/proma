import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { WorkLog, DailyReport,Task } from '../../models/models.js'; 
import { generateUniqueId } from '../../utils/idGenerator.js';
import { sortReportByProjects, sortReportByUsers, sortReportByTasks } from '../../utils/utilFunctions.js';
import { parseDateRange } from '../../utils/DateUtil.js';
import moment from 'moment';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const router = express.Router();


// START DAILY REPORT
router.post("/start", verifyToken, async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Check if a closed report exists for today
        let existingReport = await DailyReport.findOne({
            user: req.user._id,
            status: 'closed',
            startDate: {
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        // If found, reopen and return it
        if (existingReport) {
            existingReport.status = 'open';
            await existingReport.save();
            return res.status(200).json({
                status: "success",
                message: "Existing dailyReport reopened",
                code: "reopened",
                data: existingReport
            });
        }

        // Else, create new report
        const newDailyReport = new DailyReport({
            user: req.user._id,
            date: new Date(),
            startDate: new Date(),
            totalDuration: 0,
            notes: '',
            workLogs: [],
            status: 'open'
        });

        const _ciddr = await generateUniqueId('dailyreports');
        if (_ciddr) newDailyReport._cid = _ciddr;

        await newDailyReport.save();

        return res.status(201).json({
            status: "success",
            message: "dailyReport started",
            code: "started",
            data: newDailyReport
        });

    } catch (error) {
        console.error(error); // Optional for debugging
        return res.status(500).json({
            status: "error",
            message: "Unknown error",
            code: "unknown_error"
        });
    }
});


// STOP DAILY REPORT
router.post("/stop", verifyToken, async (req, res) => {
    const { id, notes='', endDate= new Date(), startDate=null} = req.body.data; 
    try{

        if(!id){
            return res.json({ status: "error", message: 'ID not found', code: "missing_id" });
        }
        // Find the daily reprot by ID
        const dailyReport = await DailyReport.findById(id);
        // If work log is not found
        if (!dailyReport) {
            return res.json({ status: "error", message: 'Record not found', code: "record_not_found" });
        }

        // Update the work log with the completed status, current end time, and notes from the request body
        dailyReport.status = 'closed';
        dailyReport.endDate = endDate; // Set the current date-time as end time
        dailyReport.notes = notes; // Update notes with data from request body (if provided)

        // Recalculate the duration based on the new endDate
        const totalTimeMs = endDate.getTime() - new Date(dailyReport.startDate).getTime();
        const totalPausedMs = dailyReport.paused.reduce((acc, p) => {
          const start = new Date(p.startTime).getTime();
          const end = new Date(p.endTime || date).getTime();
          return acc + (end - start);
        }, 0);
        dailyReport.totalDuration = Math.round((totalTimeMs - totalPausedMs) / (1000 * 60)); // Duration in minutes

        const workLog = await WorkLog.findOne({
            user: dailyReport.user._id,
            status: "active", // Find active work log
          });
  
          if (workLog) {
            // Mark the work log as completed
            workLog.status = "completed";
            workLog.endDate = date; // Set end date for the work log
            await workLog.save(); // Save the updated work log
          }

         // Save the updated work log
         await dailyReport.save();

         // Return the updated work log as the response
         return res.status(200).json({ status: "success", message:'Daily Report Stopped', code:"report_stopped", data:'' });
        
    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Unknown error",
            code: "unknown_error"
        });
    }
})

/**
 * 
 * @params id - id of active dailyreport
 * @params type - pause, resume, close
 * @params notes : string
 * @params date : data 
 * 
 */
router.post("/update", verifyToken, async (req, res) => {
    const { id, type, notes = "", date = new Date() } = req.body.data;
  
    if (!id || !type) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        code: "missing_fields",
      });
    }
  
    try {
      const dailyReport = await DailyReport.findById(id).populate("workLogs");
  
      if (!dailyReport) {
        return res.status(404).json({
          status: "error",
          message: "Daily report not found",
          code: "report_not_found",
        });
      }
      const workLog = await WorkLog.findOne({
        user: dailyReport.user._id,
        status: "active", // Find active work log
      });

      switch (type) {
        case "pause":
          // Add a new paused interval with endTime as null (paused state)
          dailyReport.paused.push({ startTime: date, endTime: null });
          dailyReport.status = "paused";
          
  
          if (workLog) {
            // Mark the work log as completed
            workLog.status = "completed";
            workLog.endDate = date; // Set end date for the work log
            await workLog.save(); // Save the updated work log
          }
          break;
  
        case "resume":
          // Resume from pause: update last paused interval if endTime is null
          const lastPause = dailyReport.paused[dailyReport.paused.length - 1];
          if (lastPause && !lastPause.endTime) {
            // Make sure the endTime is updated with the current date
            lastPause.endTime = date;
            dailyReport.status = "open"; // Mark as open when resumed
          } else {
            return res.status(400).json({
              status: "error",
              message: "No active paused interval to resume.",
              code: "no_active_pause",
            });
          }
          break;
  
        case "close":
          dailyReport.status = "closed";
          dailyReport.endDate = date;
  
          // Finish last paused interval if still open (i.e., endTime is null)
          const last = dailyReport.paused[dailyReport.paused.length - 1];
          if (last && !last.endTime) {
            last.endTime = date; // Set endTime for the last pause interval
          }
  
          // Recalculate total duration (excluding paused time)
          const totalTimeMs = new Date(date).getTime() - new Date(dailyReport.startDate).getTime();
          const totalPausedMs = dailyReport.paused.reduce((acc, p) => {
            const start = new Date(p.startTime).getTime();
            const end = new Date(p.endTime || date).getTime();
            return acc + (end - start);
          }, 0);
          dailyReport.totalDuration = Math.round((totalTimeMs - totalPausedMs) / (1000 * 60)); // Duration in minutes

           if (workLog) {
            // Mark the work log as completed
            workLog.status = "completed";
            workLog.endDate = date; // Set end date for the work log
            await workLog.save(); // Save the updated work log
            }

          break;
  
        case "notes":
          dailyReport.notes = notes;
          break;
  
        default:
          return res.status(400).json({
            status: "error",
            message: "Invalid update type",
            code: "invalid_type",
          });
      }
  
      await dailyReport.save();
  
      return res.status(200).json({
        status: "success",
        message: `Daily report updated: ${type}`,
        code: `report_${type}_updated`,
        data: dailyReport,
      });
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        code: "server_error",
      });
    }
});

  

// Get active daily report
router.post("/active", verifyToken, async (req, res) => {
    const {  notes='', type='user'} = req.body.data; 
    try{
        let activeReport;
        let oldOpen = false;
        if(type === 'user'){
            // Find the daily reprot by ID
            activeReport = await DailyReport.findOne({ user: req.user._id, status: 'open' }); 
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check for existing daily report
            const openReport = await DailyReport.findOne(
                { user: req.user._id, startDate: { $lt: today }, status: 'open' }
            );

            if(openReport) oldOpen = true;
        }
        
        if(type === 'all' || type === 'admin'){
            activeReport = await DailyReport.find({ status: 'open' }).populate('user');
        }

        // If work log is not found
        if (!activeReport) {
            return res.json({ status: "success", message: 'Record not found', code: "record_not_found" });
        }
        // Return the updated work log as the response
        return res.status(200).json({ status: "success", message:'Daily Report Found', code:"data_found", data:activeReport, oldOpen });
        
    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Unknown error",
            code: "unknown_error"
        });
    }
});

export { router as dailyReportRouter };
