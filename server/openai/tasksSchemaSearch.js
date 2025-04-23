import Together from "together-ai";
import moment from "moment/moment.js";
import 'dotenv/config';
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});
const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const taskSchemaFields = [
    "_id", "_cid", "expectedTime", "storyPoints", "name", "status", "assignedTo", "dueDate", "startDate", "priority", "project", "taskType", "assignedBy"
  ];
  
  const projectSchemaFields = [
    "name", "status", "startDate", "endDate", "client", "priority"
  ];
  
  const userSchemaFields = [
    "name", "email", "roles"
  ];

  async function detectIntentAndExtractEntities(query) { 
    try {
        const systemPrompt = `
        You are an assistant that extracts structured data from user queries related to task management.
        Your task is to identify the type of request and extract key details about tasks or projects from the query.
        The query might include information about tasks assigned to specific users, their status, priority, or status other than particular status, user other than particular user etc.
        
        The fields to be extracted are:
        - reqType: 'get' | 'create' | 'update'  (based on action implied in query)
        - limit: number (optional, how many result to return)
        - intent: task-related query intent, including one of the following: 
          ['search_tasks', 'update_tasks', 'recent_tasks', 'completed_tasks', 'in_progress_tasks', 'todo_tasks', 'search_project', 'tasks_assigned', 'tasks_with_project', 'tasks_with_priority', 'rework_tasks']
        - user: string (optional, refers to the user field, e.g., "assignedTo")
        - id: string (optional, refers to the task _id, e.g., "6702f910c130d21c3275d38f")
        - cid: string (optional, refers to the task _cid field, e.g., "TA1019")
        - name: string (optional, refers to the task name field, e.g., "Kickoff page")
        - project: string (optional, refers to the project field)
        - taskType: string (optional, task type, e.g., "Task", "QaTask")
        - status: string (optional, the task status options 'toDo', 'inProgress', 'completed', 'onHold','blocked', 'pendingReview', 'approved', if reqType is create then default is toDo)
        - priority: string (optional, referst to task priority like 'high', 'low', 'medium')
        - storyPoints: number (optional, this is difficulty level of the task and refers to task storyPoints options 1,2,3,5,8,13)
        - expectedTime: number (optional, This is expected time to finish the task and refers to task expectedTime in hours)
        - assignedTo: string (optional, ObjectId reference for user responsible, e.g., "shiv")
        - assignedBy: string (optional, ObjectId for user who assigned)
        - dateType: 'startDate' | 'endDate' | 'dueDate' (optional)
        - startDate, endDate, dueDate: ISO format dates (optional)
        
        always match the field values to provided options above if not from these options then use default value or skip the field
        if there is status with not equal to intent then convert it to relevent object for example if status is not equal to completed then convert it to 
        status: {'$ne': 'completed'}. Do same for all other fields.
        if query is to update and there are two status then extract update json for example:
        change status from inprogress to completed then : updateFields:{$set:{status:completed}} and status:inProgress. Apply same accordingly to all other fields.
        keep all update fields inside updateFields key
        example: 
        query: update task 6702f910c130d21c3275d38f where status is completed to inprogress
        wrong resonse: {
            "reqType": "update",
            "intent": "update_tasks",
            "id": "6702f910c130d21c3275d38f",
            "status": {"$ne": "completed", "$set": "inProgress"},
            "updateFields": {"$set": {"status": "inProgress"}}
        }
        right response: 
        {
            "reqType": "update",
            "intent": "update_tasks",
            "id": "6702f910c130d21c3275d38f",
            "status": {"$eq": "completed"},
            "updateFields": {"$set": {"status": "inProgress"}}
        }
        example 2: 
        query: update task 6702f910c130d21c3275d38f where status is completed to inprogress and priority to low get max 20 results
        wrong result: {
            "reqType": "update",
            "intent": "update_tasks",
            "id": "6702f910c130d21c3275d38f",
            "status": {"$eq": "completed"},
            "priority": {"$ne": null, "$set": "low"},
            "updateFields": {"$set": {"status": "inProgress", "priority": "low"}},
            "limit": 20
        }

        right result: {
            "reqType": "update",
            "intent": "update_tasks",
            "id": "6702f910c130d21c3275d38f",
            "status": {"$eq": "completed"},
            "updateFields": {"$set": {"status": "inProgress", "priority": "low"}},
            "limit": 20
        }
        if multiple field updates then change accordingly. and put all update fields inside updateFields for example: "updateFields": {"$set": {"status": "inProgress", "priority": "low"}}.
        do not place in root json.
        get values from set of values provided above if not there then exclude field
        example: 
        query: update task 6702f910c130d21c3275d38f where status is completed to inprogress and priority to not valid get max 20 results
        here priority not valid is not in option then 
         "updateFields": {"$set": {"status": "inProgress"}},
         note: in above query not valid is not part of options in that case priority is skipped from updateFields. Do same for all queries if 
         user option not part of schema then skip the field.
        stick to options if option does not match then skip the field in general for all fields
        Only respond with the JSON object and nothing else.
        `;
  
        const prompt = `${systemPrompt}\n\nUser query: "${query}"`;
  
        const response = await together.chat.completions.create({
          model: "meta-llama/Llama-3-8b-chat-hf",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: query },
          ],
          temperature: 0,
        });
  
        const content = response.choices[0].message.content;
  
        // Debug: Check raw output
        console.log("Raw Model Output:", content);
  
        // Try parsing the returned JSON
        let parsedEntities;
        try {
          parsedEntities = JSON.parse(content);
          console.log('parsedEntities',parsedEntities);
        } catch (e) {
          console.error("Failed to parse model output as JSON:", content);
          throw new Error("Error in parsing JSON response.");
        }

        // Adjust the intent based on extracted fields
        if (parsedEntities.assignedTo && parsedEntities.dueDate && parsedEntities.status && parsedEntities.project) {
          // If all necessary fields are found, set a more specific intent
          parsedEntities.intent = "tasks_assigned_inProgress_due_project"; // New, more specific intent
        }

        // Append extracted dates
        parsedEntities.startDate = getStartDateFromQuery(query);
        parsedEntities.endDate = getEndDateFromQuery(query);
        parsedEntities.dueDate = getDueDateFromQuery(query);

        // Map the response to the schema
        const schemaAwareResult = mapFieldsToSchema(parsedEntities);
  
        return schemaAwareResult;
      } catch (error) {
        console.error("Error detecting intent & extracting entities:", error);
        return {};
      }
}

function getDueDateFromQuery(query) {
    const dueDateMatch = query.match(/due\s+on\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?\s+\d{4})/i);
    if (dueDateMatch) {
      return moment(dueDateMatch[1], 'MMMM Do YYYY').format('YYYY-MM-DD');
    }
  
    return null;  // Return null if no due date is found
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
  

  // This function maps extracted fields to schema fields
function mapFieldsToSchema(parsedEntities) {
    const schemaAwareResult = {};
  
    // Task-related fields
    if (parsedEntities.project && projectSchemaFields.includes("name")) {
      schemaAwareResult.project = parsedEntities.project;
    }
    if (parsedEntities.intent ) {
      schemaAwareResult.intent = parsedEntities.intent;
    }
    if (parsedEntities.reqType ) {
      schemaAwareResult.reqType = parsedEntities.reqType;
    }
  
    if (parsedEntities.status && taskSchemaFields.includes("status")) {
      schemaAwareResult.status = parsedEntities.status;
    }
  
    if (parsedEntities.taskType && taskSchemaFields.includes("taskType")) {
      schemaAwareResult.taskType = parsedEntities.taskType;
    }
    if (parsedEntities.cid && taskSchemaFields.includes("_cid")) {
      schemaAwareResult._cid = parsedEntities.cid;
    }
    if (parsedEntities._cid && taskSchemaFields.includes("_cid")) {
      schemaAwareResult._cid = parsedEntities._cid;
    }
    if (parsedEntities.id && taskSchemaFields.includes("_id")) {
      schemaAwareResult._id = parsedEntities.id;
    }
    if (parsedEntities._id && taskSchemaFields.includes("_id")) { 
      schemaAwareResult._id = parsedEntities._id;
    }
  
    if (parsedEntities.assignedTo && taskSchemaFields.includes("assignedTo")) {
      schemaAwareResult.assignedTo = parsedEntities.assignedTo;
    }
    if (!parsedEntities.assignedTo && parsedEntities.user && taskSchemaFields.includes("assignedTo")) {
      schemaAwareResult.assignedTo = parsedEntities.user;
    }
  
    if (parsedEntities.assignedBy && taskSchemaFields.includes("assignedBy")) {
      schemaAwareResult.assignedBy = parsedEntities.assignedBy;
    }
    if (parsedEntities.project && taskSchemaFields.includes("project")) {
      schemaAwareResult.project = parsedEntities.project;
    }
    if (parsedEntities.storyPoints && taskSchemaFields.includes("storyPoints")) {
      schemaAwareResult.storyPoints = parsedEntities.storyPoints;
    }
    if (parsedEntities.expectedTime && taskSchemaFields.includes("expectedTime")) {
      schemaAwareResult.expectedTime = parsedEntities.expectedTime;
    }
  
    // Date-related fields
    if (parsedEntities.startDate && taskSchemaFields.includes("startDate")) {
      schemaAwareResult.startDate = parsedEntities.startDate;
    }
  
    if (parsedEntities.endDate && taskSchemaFields.includes("endDate")) {
      schemaAwareResult.endDate = parsedEntities.endDate;
    }
  
    if (parsedEntities.dueDate && taskSchemaFields.includes("dueDate")) {
      schemaAwareResult.dueDate = parsedEntities.dueDate;
    }
    if (parsedEntities.priority && taskSchemaFields.includes("priority")) {
      schemaAwareResult.priority = parsedEntities.priority;
    }
    if (parsedEntities.name && taskSchemaFields.includes("name")) {
      schemaAwareResult.name = parsedEntities.name;
    }
    if (parsedEntities.updateFields) {
      schemaAwareResult.updateFields = parsedEntities.updateFields;
    }
  
    // Handle dateType (startDate, endDate, dueDate)
    if (parsedEntities.dateType) {
      schemaAwareResult.dateType = parsedEntities.dateType;
    }
    if (parsedEntities.limit) {
      schemaAwareResult.limit = parsedEntities.limit;
    }
  
    return schemaAwareResult;
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
async function processTaskSchemaQuery(userQuery) {
    try {
      const result = await detectIntentAndExtractEntities(userQuery);
      console.log("Extracted Result:", result);
  
      // Basic MongoDB query template
      let mongoQuery = { type: "search", limit: 10, filter: {} };
    
      if (!result.intent || result.intent === "unknown") {
        console.error("Unknown intent detected");
        return {};
      }
  
      // Dynamically build the MongoDB query
      if (result.intent.includes("tasks")) {
        if (result.intent.includes("recent")) {
          mongoQuery.type = "recent";
          mongoQuery.limit = 5;
        }

        if (result.reqType) mongoQuery.type = result.reqType;
        if (result.limit) mongoQuery.limit = result.limit;
        if (result.status) mongoQuery.filter.status = result.status;
        if (result.name) mongoQuery.filter.name = result.name;
        if (result.project) mongoQuery.filter.project = result.project;
        if (result.priority) mongoQuery.filter.priority = result.priority;
        if (result.taskType) mongoQuery.filter.taskType = result.taskType;
        if (result.assignedTo) mongoQuery.filter.assignedTo = result.assignedTo;
        if (result.assignedBy) mongoQuery.filter.assignedBy = result.assignedBy;
        if (result.expectedTime) mongoQuery.filter.expectedTime = result.expectedTime;
        if (result.storyPoints) mongoQuery.filter.storyPoints = result.storyPoints;
        if (result._id) mongoQuery.filter._id = result._id;
        if (result._cid) mongoQuery.filter._cid = result._cid;

        if(result.updateFields && result.reqType === 'update') mongoQuery.update = result.updateFields;
  
        // Handle date range filtering
        if (result.startDate && result.dueDate) {
          mongoQuery.filter.dateRange = {
            $gte: new Date(result.startDate),
            $lte: new Date(result.dueDate),
          };
        } else {
          if (result.startDate) mongoQuery.filter.startDate = result.startDate;
          if (result.dueDate) mongoQuery.filter.dueDate = result.dueDate;
        }
  
        // Handle special cases like "today"
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
  


export {processTaskSchemaQuery }; 
