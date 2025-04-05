/**
 * 
 * NOTE
 * working in step by step
 * 
 * ISSUE
 * - sometimes combining questions
 * - not getting json data
 * 
 * 
 */
import Together from "together-ai";
import dotenv from 'dotenv';
dotenv.config();

const together = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

// Conversation & data state
let conversationHistory = [];
let collectedData = {};

// Default system prompt
const SYSTEM_PROMPT = `
You are a professional lead manager for an IT company. Your task is to collect the following information from the potential client in a concise, professional, and human-like manner.
Keep responses as short as possible. Instead of bombarding user with all the questions at once you have to ask them one question at a time. You have to be as short in your questions as possible so that
user is not overwhelmed. if user does not understand your question please provide them with options. Once one question is answered or dened by the user only then move to next question.Do not tell user your next question
untill previous question is not answered.

1. **Project Type**: What type of website are you looking for? (Website, Webshop, Mobile App, Custom System)
2. **Work Type**: Are you looking for a development or an update to your website? (Development, update, not sure)
3. **Server Needed**: Do you already have server? 
4. **Maintenance**: Who will maintain the website after it's built? (by us, client himself, not sure)
5. **Design**: Do you already have a design for the website? (Yes, no, not sure)
6. **Hosting**: Do you already have hosting for the website? (Yes, no, not sure)
7. **Start Time**: When would you like to start the project? (ASAP, sometime in months, not sure)
8. **Budget**: What is your budget range for the project? (min 999€, not sure)
9. **Contact Details**: We need your salutation, first name, last name, phone, and email to proceed.
10. **Phone Call Time**: When would you like to schedule a phone call? Please provide the date and time.

Collect responses step-by-step and ensure that you skip any question that has already been answered.
Keep responses short, professional, and human-like. Avoid unnecessary repetition of questions. Use natural language for the options and ask in a conversational tone.
`;

const resetConversation = () => {
  conversationHistory = [{ role: 'system', content: SYSTEM_PROMPT }]; 
  collectedData = {};
};

resetConversation();

const callTogetherAI = async (messages) => {
    try {
      const response = await together.chat.completions.create({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1", // ✅ Serverless model
        messages,
        temperature: 0.7,
        max_tokens: 150,
      });
  
      const aiResponse = response.choices[0].message.content;
      return aiResponse;
    } catch (error) {
      console.error("Error during TogetherAI call:", error);
      return "Sorry, something went wrong with the AI service.";
    }
  };

const saveDataToDatabase = async (data) => {
  try {
    console.log('Saving data to the database...', data);
    return { success: true };
  } catch (error) {
    console.error('Error saving data to database:', error);
    return { success: false, error: error.message };
  }
};

const processUserMessage = async (message) => {
  if (message.toLowerCase() === 'start fresh') {
    resetConversation();
    return { response: 'Conversation reset. How can I assist you today?' };
  }

  conversationHistory.push({ role: 'user', content: message });

  try {
    const aiResponse = await callTogetherAI(conversationHistory);
    conversationHistory.push({ role: 'assistant', content: aiResponse });

    // Now extract data
    const extractionPrompt = [
      ...conversationHistory,
      {
        role: 'system',
        content: `Based on the conversation so far, please extract the information and update the following fields in the JSON object:
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
        Respond only with valid JSON.`,
      },
    ];

    const extracted = await callTogetherAI(extractionPrompt);

    try {
      const parsedData = JSON.parse(extracted);
      collectedData = { ...collectedData, ...parsedData };
    } catch (e) {
      console.error('Failed to parse JSON:', extracted);
    }

    console.log("******************");
    console.log(collectedData);

    const allFieldsFilled =
      collectedData.projectType &&
      collectedData.workType &&
      collectedData.serverNeeded &&
      collectedData.maintenance &&
      collectedData.design &&
      collectedData.hosting &&
      collectedData.startTime &&
      collectedData.budget &&
      collectedData.contactDetails &&
      collectedData.phoneCallTime;

    if (allFieldsFilled) {
      const {
        projectType,
        workType,
        serverNeeded,
        maintenance,
        design,
        hosting,
        startTime,
        budget,
        contactDetails,
        phoneCallTime,
      } = collectedData;

      const summaryTable = `
        <ul>
          <li><strong>Project Type:</strong> ${projectType}</li>
          <li><strong>Work Type:</strong> ${workType}</li>
          <li><strong>Server Needed:</strong> ${serverNeeded}</li>
          <li><strong>Maintenance:</strong> ${maintenance}</li>
          <li><strong>Design:</strong> ${design}</li>
          <li><strong>Hosting:</strong> ${hosting}</li>
          <li><strong>Start Time:</strong> ${startTime}</li>
          <li><strong>Budget:</strong> ${budget}</li>
          <li><strong>Contact:</strong><br/>
            ${contactDetails.firstName} ${contactDetails.lastName}<br/>
            Email: ${contactDetails.email}<br/>
            Phone: ${contactDetails.phone}
          </li>
          <li><strong>Phone Call Time:</strong> ${phoneCallTime}</li>
        </ul>
      `;

      const saveResult = await saveDataToDatabase(collectedData);

      return {
        response: summaryTable,
        summaryTable,
        jsonSummary: collectedData,
        dataSaved: saveResult.success,
        message: saveResult.success,
      };
    }

    return { response: aiResponse };
  } catch (error) {
    console.error('Error during processing:', error);
    return { response: 'Sorry, an error occurred while processing your message.' };
  }
};

export { processUserMessage };
