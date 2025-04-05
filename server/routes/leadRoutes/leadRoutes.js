import express from "express";
// import { processUserMessage } from "../../services/aiLeadServices.js";
import { processUserMessage } from "../../services/aiLeadsServicesTA.js";

const router = express.Router();

// Handle AI-powered conversation
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const response = await processUserMessage(message);
    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Save lead data
router.post("/save", async (req, res) => {
  try {
    console.log(req.body);
    // const newLead = new Lead(req.body);
    // await newLead.save();
    // res.status(201).json({ message: "Lead saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

export { router as leadRoutes };
