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
        dailyReport.totalDuration = Math.round((dailyReport.endDate - dailyReport.startDate) / (1000 * 60)); // Convert ms to minutes

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
