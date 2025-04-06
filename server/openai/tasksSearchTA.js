import Together from "together-ai";
import moment from "moment/moment.js";
import 'dotenv/config';
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});
const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

async function detectIntentAndExtractEntities(query) {
  try {
    const systemPrompt = `
You are an assistant that extracts structured data from user queries.
Return a JSON object with the following fields: 
- reqType: 'get' | 'create' | 'update'
- intent: one of ['search_tasks', 'recent_tasks', 'completed_tasks', 'in_progress_tasks', 'todo_tasks', 'search_project', 'tasks_assigned', 'tasks_with_project', 'tasks_with_priority', 'rework_tasks']
- user: string (optional)
- project: string (optional)
- taskType: string (optional)
- status: string (optional)
- assignedTo: string (optional)
- assignedBy: string (optional)
- dateType: 'startDate' | 'endDate' | 'dueDate' (optional)
- startDate, endDate, dueDate: ISO format dates (optional)

Only respond with the JSON object and nothing else.
`;

    const prompt = `${systemPrompt}\n\nUser query: "${query}"`;

    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3-8b-chat-hf", // or another supported Together model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User query: "${query}"` },
      ],
      temperature: 0,
    });

    const content = response.choices[0].message.content;

    // Try parsing the returned JSON
    let parsedEntities;
    try {
      parsedEntities = JSON.parse(content);
    } catch (e) {
      throw new Error("Failed to parse model output as JSON: " + content);
    }

    // Append extracted dates
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
