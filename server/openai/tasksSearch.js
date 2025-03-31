import { OpenAI } from 'openai';
import moment from "moment/moment.js";
import 'dotenv/config';

const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to detect intent using OpenAI API
async function detectIntent(query) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI assistant that classifies user queries into predefined intent categories." },
        { role: "user", content: `Classify this query: '${query}' into one of these categories: requestType, search tasks, recent tasks, completed tasks, in-progress tasks, todo tasks, search project, tasks assigned to user, tasks with project, tasks with priority, tasks that are rework.` },
      ],
      temperature: 0,
    });
    
    console.log("OpenAI Intent Response:", response);
    return response.choices?.[0]?.message?.content || "unknown";
  } catch (error) {
    console.error("Error detecting intent:", error);
    return "unknown";
  }
}

// Function to extract entities using OpenAI API
async function extractEntities(query) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that extracts structured data (entities) from user queries."
        },
        {
          role: "user",
          content: `Extract entities from this query: '${query}'. Return a JSON object with keys like user, requestType, project, taskType, date, status, assignedTo, assignedBy.`
        }
      ],
      temperature: 0,
    });

    console.log("OpenAI Entity Extraction Response:", response);  // Log full response to see the content

    // Extracting the raw content from the response
    let content = response.choices?.[0]?.message?.content;
    console.log("Raw Content:", content); // Log raw content for debugging

    // Remove the Markdown code block syntax (```json ...```)
    content = content.replace(/```json|```/g, '').trim();
    console.log("Cleaned Content:", content); // Log cleaned content for debugging

    // Try to parse the cleaned content as JSON
    let parsedEntities = {};
    try {
      parsedEntities = JSON.parse(content);
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
    }

    // Detect the date type (startDate, endDate, dueDate)
    const dateType = getDateTypeFromQuery(query);
    parsedEntities.dateType = dateType;

    // Handle relative time expressions dynamically
    parsedEntities.startDate = getStartDateFromQuery(query);
    parsedEntities.endDate = getEndDateFromQuery(query);
    parsedEntities.dueDate = getDueDateFromQuery(query);

    return parsedEntities;

  } catch (error) {
    console.error("Error extracting entities:", error);
    return {};
  }
}


async function detectIntentAndExtractEntities(query) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Extract intent, request type, and structured entities from a user query. Keep response minimal and accurate." },
        { role: "user", content: `Analyze this query: '${query}'.` }
      ],
      functions: [
        {
          name: "extract_intent_entities",
          description: "Extracts intent, request type, and structured entities from a user query.",
          parameters: {
            type: "object",
            properties: {
              reqType: { type: "string", enum: ["get", "create", "update"], description: "Action requested (get = retrieve, create = add, update = modify)." },
              intent: { 
                type: "string", 
                enum: [
                  "search_tasks", "recent_tasks", "completed_tasks", "in_progress_tasks", "todo_tasks",
                  "search_project", "tasks_assigned", "tasks_with_project", "tasks_with_priority", "rework_tasks"
                ],
                description: "User intent from query."
              },
              user: { type: "string", description: "User mentioned in the query, if any." },
              project: { type: "string", description: "Project name if provided." },
              taskType: { type: "string", description: "Type of task mentioned." },
              status: { type: "string", description: "Task status (completed, in-progress, etc.)." },
              assignedTo: { type: "string", description: "Person assigned to the task." },
              assignedBy: { type: "string", description: "Person who assigned the task." },
              dateType: { 
                type: "string",
                enum: ["startDate", "endDate", "dueDate"],
                description: "Type of date specified in query."
              },
              startDate: { type: "string", format: "date", description: "Start date extracted from query, if any." },
              endDate: { type: "string", format: "date", description: "End date extracted from query, if any." },
              dueDate: { type: "string", format: "date", description: "Due date extracted from query, if any." }
            },
            required: ["reqType", "intent"]
          }
        }
      ],
      function_call: { name: "extract_intent_entities" },
      temperature: 0,
    });

    console.log("OpenAI Response:", response);
    console.log("Full OpenAI Response:", JSON.stringify(response, null, 2));
    // const parsedEntities = JSON.parse(response.choices[0].message.function_call.arguments);
    // Validate response
    if (!response.choices || response.choices.length === 0) {
      throw new Error("OpenAI response does not contain 'choices'.");
    }

    const message = response.choices[0].message;

    // Check if the response contains 'function_call'
    if (!message.function_call || !message.function_call.arguments) {
      throw new Error("OpenAI response does not contain valid function arguments.");
    }

    // Parse the extracted entities from the function call arguments
    let parsedEntities;
    try {
      parsedEntities = JSON.parse(message.function_call.arguments);
    } catch (jsonError) {
      throw new Error("Error parsing function arguments as JSON: " + jsonError.message);
    }

      // Handle relative time expressions dynamically
      parsedEntities.startDate = getStartDateFromQuery(query);
      parsedEntities.endDate = getEndDateFromQuery(query);
      parsedEntities.dueDate = getDueDateFromQuery(query);

    return parsedEntities;
    
  } catch (error) {
    console.error("Error detecting intent & extracting entities:", error);
    return {};
  }
}


// Helper function to determine the date type (startDate, endDate, dueDate) based on the query
function getDateTypeFromQuery(query) {
  // Lowercase the query to avoid case-sensitivity issues
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("starting") || lowerQuery.includes("from") || lowerQuery.includes("beginning")) {
    return "startDate";
  }

  if (lowerQuery.includes("ending") || lowerQuery.includes("to") || lowerQuery.includes("until") || lowerQuery.includes("by")) {
    return "endDate";
  }

  if (lowerQuery.includes("due") || lowerQuery.includes("deadline") || lowerQuery.includes("must be completed")) {
    return "dueDate";
  }

  return "unknown"; // If no recognizable date type is found
}

// Helper function to determine the due date based on the query
function getDueDateFromQuery(query) {
  const dueDateMatch = query.match(/due\s+on\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?\s+\d{4})/i);
  if (dueDateMatch) {
    return moment(dueDateMatch[1], 'MMMM Do YYYY').format('YYYY-MM-DD');
  }

  return null;  // Return null if no due date is found
}

function getDayOfWeekDate(query, relativeTerm) {
  const dayRegex = /(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i;
  const dayMatch = query.toLowerCase().match(dayRegex);

  if (!dayMatch) return null; // If no weekday found in the query

  const dayName = dayMatch[0].toLowerCase();
  const today = moment(); // Current date
  const dayIndex = daysOfWeek.indexOf(dayName);

  // Get the date for "this", "last", or "next" relative term
  if (relativeTerm === "this") {
    // Return the start of the current week for the specified day
    return today.day(dayIndex).format("YYYY-MM-DD");
  } else if (relativeTerm === "last") {
    // Return the start of the previous week for the specified day
    return today.subtract(1, 'week').day(dayIndex).format("YYYY-MM-DD");
  } else if (relativeTerm === "next") {
    // Return the start of the next week for the specified day
    return today.add(1, 'week').day(dayIndex).format("YYYY-MM-DD");
  }

  return null; // If no valid date found
}

// Helper function to determine the start date based on the query
function getStartDateFromQuery(query) {
  // Check for explicit date ranges like "from [start date] to [end date]"
  const dateRangeMatch = query.match(/from\s+([\w\s,]+)\s+to\s+([\w\s,]+)/i);
  if (dateRangeMatch) {
    const startDate = moment(dateRangeMatch[1], 'MMMM Do YYYY').format('YYYY-MM-DD');
    return startDate;
  }

  // Handle relative time expressions like "this week", "last week", etc.
  if (query.toLowerCase().includes("this week")) {
    return getStartOfWeek();  // Get the start of this week
  }
  if (query.toLowerCase().includes("last week")) {
    return getStartOfWeek(-1);  // Get the start of last week
  }
  if (query.toLowerCase().includes("next week")) {
    return getStartOfWeek(1);  // Get the start of next week
  }
  if (query.toLowerCase().includes("this month")) {
    return getStartOfMonth();  // Get the start of this month
  }
  if (query.toLowerCase().includes("last month")) {
    return getStartOfMonth(-1);  // Get the start of last month
  }
  if (query.toLowerCase().includes("next month")) {
    return getStartOfMonth(1);  // Get the start of next month
  }

  // Handle specific weekday references like "this Monday", "last Tuesday"
  const relativeTerm = query.toLowerCase().includes("this") ? "this" :
                      query.toLowerCase().includes("last") ? "last" : 
                      query.toLowerCase().includes("next") ? "next" : null;
  if (relativeTerm) {
    return getDayOfWeekDate(query, relativeTerm);
  }

  return null;  // No start date found
}

// Helper function to determine the end date based on the query
function getEndDateFromQuery(query) {
  // Check for explicit date ranges like "from [start date] to [end date]"
  const dateRangeMatch = query.match(/from\s+([\w\s,]+)\s+to\s+([\w\s,]+)/i);
  if (dateRangeMatch) {
    const endDate = moment(dateRangeMatch[2], 'MMMM Do YYYY').format('YYYY-MM-DD');
    return endDate;
  }

  // Handle relative time expressions like "this week", "last week", etc.
  if (query.toLowerCase().includes("this week")) {
    return getEndOfWeek();  // Get the end of this week
  }
  if (query.toLowerCase().includes("last week")) {
    return getEndOfWeek(-1);  // Get the end of last week
  }
  if (query.toLowerCase().includes("next week")) {
    return getEndOfWeek(1);  // Get the end of next week
  }
  if (query.toLowerCase().includes("this month")) {
    return getEndOfMonth();  // Get the end of this month
  }
  if (query.toLowerCase().includes("last month")) {
    return getEndOfMonth(-1);  // Get the end of last month
  }
  if (query.toLowerCase().includes("next month")) {
    return getEndOfMonth(1);  // Get the end of next month
  }
  return null;  // No end date found
}

// Helper function to get the start of the current week (Sunday)
function getStartOfWeek(weekOffset = 0) {
  return moment().startOf('week').add(weekOffset, 'weeks').format('YYYY-MM-DD');
}

// Helper function to get the end of the current week (Saturday)
function getEndOfWeek(weekOffset = 0) {
  return moment().endOf('week').add(weekOffset, 'weeks').format('YYYY-MM-DD');
}

// Helper function to get the start of the month
function getStartOfMonth(monthOffset = 0) {
  return moment().startOf('month').add(monthOffset, 'months').format('YYYY-MM-DD');
}

// Helper function to get the end of the month
function getEndOfMonth(monthOffset = 0) {
  return moment().endOf('month').add(monthOffset, 'months').format('YYYY-MM-DD');
}

// Function to process user query into a MongoDB query
async function processTasksQuery(userQuery) {
  try {
    // Extract both intent & entities in a single call
    const result = await detectIntentAndExtractEntities(userQuery);

    console.log("Extracted Result:", result);

    if (!result.intent || result.intent === "unknown") {
      console.error("Unknown intent detected");
      return {};
    }

    let mongoQuery = { type: "search", limit: 10, filter: {} };

    // Handling different task-related intents
    if (result.intent.includes("tasks")) {
      if (result.intent.includes("recent")) {
        mongoQuery.type = "recent";
        mongoQuery.limit = 5;
      }
      if (result.status) mongoQuery.filter.status = result.status;
      if (result.user) mongoQuery.filter.responsiblePerson = result.user;
      if (result.project) mongoQuery.filter.project = result.project;
      if (result.taskType) mongoQuery.filter.taskType = result.taskType;
      if (result.assignedTo) mongoQuery.filter.assignedTo = result.assignedTo;
      if (result.assignedBy) mongoQuery.filter.assignedBy = result.assignedBy;
      if (result.dateType) mongoQuery.filter.dateType = result.dateType;
      if (result.reqType) mongoQuery.filter.requestType = result.reqType;

      // Date range filtering
      if (result.startDate && result.endDate) {
        mongoQuery.filter.dateRange = {
          $gte: new Date(result.startDate),
          $lte: new Date(result.endDate),
        };
      }else{
        if (result.startDate) mongoQuery.filter.startDate = result.startDate;
        if (result.endDate) mongoQuery.filter.endDate = result.endDate;
      }

      // Special handling for "today"
      if (userQuery.toLowerCase().includes("today")) {
        const today = new Date().toISOString().split("T")[0];
        mongoQuery.filter.dueDate = today;
      }
    }

    console.log("Generated MongoDB Query:", mongoQuery);
    return mongoQuery;
  } catch (error) {
    console.error("Error processing query:", error);
    return {};
  }
}


export {processTasksQuery };
