import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use the API key directly
});

// Mock database function to simulate saving data
const saveDataToDatabase = async (data) => {
  // Here we simulate the process of saving data to the database.
  // In a real-world scenario, you will connect to your database and save the data.
  
  try {
    // Simulating database saving with a delay
    console.log('Saving data to the database...', data);
    // Simulate successful save
    return { success: true };
  } catch (error) {
    console.error('Error saving data to database:', error);
    return { success: false, error: error.message };
  }
};

// Create a conversation memory structure
let conversationHistory = [
  {
    role: 'system',
    content: `
      You are a professional lead manager for an IT company. Your task is to collect the following information from the potential client in a concise, professional, and human-like manner.
      Keep responses as short as possible.
      
      1. **Project Type**: What type of website are you looking for? (Website, Webshop, Mobile App, Custom System)
      2. **Work Type**: Are you looking for a development or an update to your website? (Development, update, not sure)
      3. **Server Needed**: Do you already have server? 
      4. **Maintenance**: Who will maintain the website after it's built? (by us, client himself, not sure)
      5. **Design**: Do you already have a design for the website? (Yes, no, not sure)
      6. **Hosting**: Do you already have hosting for the website? (Yes, no, not sure)
      7. **Start Time**: When would you like to start the project? (ASAP, sometime in months, not sure)
      8. **Budget**: What is your budget range for the project? (min 999 €, not sure)
      9. **Contact Details**: We need your salutation, first name, last name, phone, and email to proceed.
      10. **Phone Call Time**: When would you like to schedule a phone call? Please provide the date and time.
      
      Collect responses step-by-step and ensure that you skip any question that has already been answered. 
      Keep responses short, professional, and human-like. Avoid unnecessary repetition of questions. Use natural language for the options and ask in a conversational tone.
    `,
  },
];

// Data storage to hold the collected user responses
let collectedData = {};

// Function to reset the conversation
const resetConversation = () => {
  conversationHistory = [
    {
      role: 'system',
      content: `
        You are a professional lead manager for an IT company. Your task is to collect the following information from the potential client in a concise, professional, and human-like manner.
        Keep responses as short as possible.
        1. **Project Type**: What type of website are you looking for? (Website, Webshop, Mobile App, Custom System)
        2. **Work Type**: Are you looking for a development or an update to your website? (Development, update, not sure)
        3. **Server Needed**: Do You already have server? 
        4. **Maintenance**: Who will maintain the website after it's built? (by us, client himself, not sure)
        5. **Design**: Do you already have a design for the website? (Yes, no, not sure)
        6. **Hosting**: Do you already have hosting for the website? (Yes, no, not sure)
        7. **Start Time**: When would you like to start the project? (ASAP, sometime in months, not sure)
        8. **Budget**: What is your budget range for the project? (min 999€, not sure)
        9. **Contact Details**: We need your salutation, first name, last name, phone, and email to proceed.
        10. **Phone Call Time**: When would you like to schedule a phone call? Please provide the date and time.
      `,
    },
  ];
  collectedData = {}; // Reset the collected data
};

// Function to collect user message and process it
const processUserMessage = async (message) => {
  // If the message is 'start fresh', reset the conversation history
  if (message.toLowerCase() === "start fresh") {
    resetConversation();
    return { response: "Conversation reset. How can I assist you today?" };
  }

  // Add the user input to the conversation history
  conversationHistory.push({ role: 'user', content: message });

  try {
    // Call OpenAI's chat model with the conversation history
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationHistory,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: aiResponse });

    // Extract the correct information from the conversation and update collectedData
    const jsonUpdate = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        ...conversationHistory,
        {
          role: 'system',
          content: `
            Based on the conversation so far, please extract the information and update the following fields in the JSON object:
            {
              "projectType": "",
              "workType": "",
              "serverNeeded": "",
              "maintenance": "",
              "design": "",
              "hosting": "",
              "startTime": "",
              "budget": "",
              "contactDetails": { "firstName": "", "lastName": "", "email": "", "phone": "" },
              "phoneCallTime": ""
            }
          `
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const updatedData = jsonUpdate.choices[0].message.content;

    // Parse the extracted JSON and update the collectedData
    try {
      const parsedData = JSON.parse(updatedData);
      collectedData = { ...collectedData, ...parsedData }; // Merge with existing data
    } catch (error) {
      console.error("Failed to parse extracted data:", error);
    }

    // If all fields have been populated, return a summary and save the data to the database
    if (Object.keys(collectedData).length === 10) {
      const summaryTable = `
        <ul>
          <li><strong>Project Type </strong> : ${collectedData.projectType || 'N/A'}</li>
          <li><strong>Work Type</strong> : ${collectedData.workType || 'N/A'}</li>
          <li><strong>Server Needed </strong> : ${collectedData.serverNeeded || 'N/A'}</li>
          <li><strong>Maintenance</strong> : ${collectedData.maintenance || 'N/A'}</li>
          <li><strong>Design</strong> : ${collectedData.design || 'N/A'}</li>
          <li><strong>Hosting</strong> : ${collectedData.hosting || 'N/A'}</li>
          <li><strong>Start Time</strong> : ${collectedData.startTime || 'N/A'}</li>
          <li><strong>Budget</strong> : ${collectedData.budget || 'N/A'}</li>
          <li><strong>Contact Details</strong> 
            <br>First Name: ${collectedData.firstName || 'N/A'}
            <br>Last Name: ${collectedData.lastName || 'N/A'}
            <br>Email:  ${collectedData.email || 'N/A'}
            <br>Phone:  ${collectedData.phone || 'N/A'}
          </li>
          <li><strong>Phone Call Time</strong> : ${collectedData.phoneCallTime || 'N/A'}</li>
        </ul>
      `;

      // Save data to the database
      const saveResult = await saveDataToDatabase(collectedData);

      // Return the response with the flag indicating whether the data was saved
      return {
        response: aiResponse + dataSaved,
        summaryTable,
        jsonSummary: collectedData,
        dataSaved: saveResult.success,  // Flag indicating success or failure
        message: saveResult.success ? true : false
      };
    }

    return { response: aiResponse };
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    return { response: 'Sorry, I encountered an error while processing your request.' };
  }
};

export { processUserMessage };
