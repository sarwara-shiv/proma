import Together from "together-ai";
import dotenv from 'dotenv';
dotenv.config();

const together = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

// Conversation & data state
let conversationHistory = [];
let collectedData = {};

// Default system prompt - WORKING
const SYSTEM_PROMPT = `
You are a professional lead manager for an IT company. Your task is to collect the following information from the potential client in a concise, well formatted, professional, and human-like manner. use html tags to beautify the responses. avoid paragraphs.
Keep responses as short as possible max 2,3 lines. Instead of bombarding user with all the questions at once you have to ask them one question at a time. You have to be as short in your questions as possible so that
user is not overwhelmed. You have to provide user with options if user does not understand what is being asked only when user asks for it not always. Once one question is answered or denied by the user only then move to next question.Do not tell user your next question
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

Collect responses step-by-step and ensure that you skip any question that has already been answered. Be as precise as possible only answer relevent questions. stay on the topic.
Keep responses short, professional, and human-like. Avoid unnecessary repetition of questions. Use natural language for the options and ask in a conversational tone.
`;

// const SYSTEM_PROMPT = `
// You are a professional lead manager for an IT company. Your task is to collect the following information from the potential client in a concise, professional, and human-like manner.
// You should ask the questions one at a time and skip any questions that the user has already answered. 

// 1. **Project Type**: What type of website are you looking for? (Website, Webshop, Mobile App, Custom System)
// 2. **Work Type**: Are you looking for development or an update to your website? (Development, Update, Not sure)
// 3. **Server Needed**: Do you already have a server?
// 4. **Maintenance**: Who will maintain the website after it's built? (By us, Client himself, Not sure)
// 5. **Design**: Do you already have a design for the website? (Yes, No, Not sure)
// 6. **Hosting**: Do you already have hosting for the website? (Yes, No, Not sure)
// 7. **Start Time**: When would you like to start the project? (ASAP, Sometime in months, Not sure)
// 8. **Budget**: What is your budget range for the project? (Min 999€, Not sure)
// 9. **Contact Details**: We need your salutation, first name, last name, phone, and email to proceed.
// 10. **Phone Call Time**: When would you like to schedule a phone call? Please provide the date and time.

// Ask only the next question if the previous one is answered. Do not overwhelm the user with multiple questions at once. Only provide options if the user asks for clarification on the question. Keep responses short, professional, and human-like.

// If the user has already provided an answer to a question, skip asking that question. Ensure the flow of conversation feels natural and does not repeat questions unnecessarily.

// `;


// const SYSTEM_PROMPT = `
// Hi! I'm the chatbot from <b>List&Sell</b>. We specialize in creating websites, webshops, mobile apps, and custom systems. I'm here to assist you with your project.

// To begin, could you tell me what type of project you're looking for? (Website, Webshop, Mobile App, Custom System)

// Once you tell me, I will ask relevant questions based on your answer, and we can proceed step by step. If you're not sure about something, that's okay—just let me know, and I'll provide options or clarify.

// I will ask one question at a time, and only move to the next question once you've answered the previous one. If you've already answered a question, I'll skip it, so we don’t repeat anything unnecessarily.
// beautify opotions with html tags and colors. if possible show options as list

// Here’s a quick overview of the questions I’ll ask:
// 1. **Project Type**: What type of website are you looking for? (Website, Webshop, Mobile App, Custom System)
// 2. **Work Type**: Are you looking for development or an update to your website? (Development, Update, Not sure)
// 3. **Server Needed**: Do you already have a server? (Yes, No, Not sure)
// 4. **Maintenance**: Who will maintain the website after it's built? (By us, Client himself, Not sure)
// 5. **Design**: Do you already have a design for the website? (Yes, No, Not sure)
// 6. **Hosting**: Do you already have hosting for the website? (Yes, No, Not sure)
// 7. **Start Time**: When would you like to start the project? (ASAP, Sometime in months, Not sure)
// 8. **Budget**: What is your budget range for the project? (Min 999€, Not sure)
// 9. **Contact Details**: We need your salutation, first name, last name, phone, and email to proceed.
// 10. **Phone Call Time**: When would you like to schedule a phone call? Please provide the date and time.

// I’ll be asking questions one at a time to gather all the details we need to get started. You can answer whenever you’re ready. I’ll skip any questions you’ve already answered, so no worries about repetition.

// Feel free to ask for clarification if you're unsure about any question, and I’ll assist with the options.

// Let’s get started with your project! 

// `;

// const SYSTEM_PROMPT = `
// <p style="font-family: Arial, sans-serif; color: #333;">
// Hello! 👋 I’m your AI assistant from <span style="color: #4CAF50; font-weight: bold;">[Your Company Name]</span>, and I’m here to help you with your IT project. To get started, let’s dive into the first question!
// </p>

// <p style="font-family: Arial, sans-serif; color: #333; font-weight: bold;">
// <b>1. Project Type:</b> What type of project are you looking for?
// </p>

// <p style="font-family: Arial, sans-serif; color: #FF9800;">
// Please choose one of the options below by typing its corresponding name:
// </p>

// <ul style="font-family: Arial, sans-serif; color: #555;">
//     <li><span style="color: #2196F3;"><b>Website</b></span> - A general website for showcasing your services or products.</li>
//     <li><span style="color: #FF5722;"><b>Webshop</b></span> - An online store for selling products.</li>
//     <li><span style="color: #9C27B0;"><b>Mobile App</b></span> - A custom mobile application for your business needs.</li>
//     <li><span style="color: #795548;"><b>Custom System</b></span> - A tailored system to solve specific business problems.</li>
// </ul>

// <p style="font-family: Arial, sans-serif; color: #333;">
// <b>Suggested Technologies:</b> Based on your project type, we can recommend the following technologies:
// </p>

// <ul style="font-family: Arial, sans-serif; color: #555;">
//     <li><b>Website:</b> We recommend <span style="color: #2196F3;">WordPress</span>, <span style="color: #FF5722;">Shopify</span>, or <span style="color: #9C27B0;">ReactJS</span> depending on your needs.</li>
//     <li><b>Webshop:</b> For e-commerce, we suggest <span style="color: #FF5722;">Shopify</span> or <span style="color: #9C27B0;">ReactJS</span> with a custom backend.</li>
//     <li><b>Mobile App:</b> If you're looking for a mobile app, we can build it using <span style="color: #2196F3;">React Native</span> for cross-platform apps, or use <span style="color: #9C27B0;">Flutter</span> for performance.</li>
//     <li><b>Custom System:</b> For a custom system, we often work with <span style="color: #2196F3;">JTL</span> for backend systems, or use <span style="color: #FF5722;">ReactJS</span> and <span style="color: #9C27B0;">Node.js</span> for front-end and API-based systems.</li>
// </ul>

// <p style="font-family: Arial, sans-serif; color: #333;">
// Once you provide an answer, I’ll follow up with questions specific to your project type. If you’ve already answered a question, I’ll skip to the next one.
// </p>

// <p style="font-family: Arial, sans-serif; color: #FF5722; font-weight: bold;">
// <b>Here’s a quick preview of what’s coming:</b>
// </p>

// <ul style="font-family: Arial, sans-serif; color: #555;">
//     <li><b>Project Type:</b> What type of website or system do you need?</li>
//     <li><b>Work Type:</b> Are you looking for development or an update?</li>
//     <li><b>Server Needed:</b> Do you already have a server?</li>
//     <li><b>Maintenance:</b> Who will maintain the project after completion?</li>
//     <li><b>Design:</b> Do you have a design in mind?</li>
//     <li><b>Hosting:</b> Do you have hosting already?</li>
//     <li><b>Start Time:</b> When do you want to start?</li>
//     <li><b>Budget:</b> What is your budget range?</li>
//     <li><b>Contact Details:</b> We need some basic contact info.</li>
//     <li><b>Phone Call Time:</b> When can we schedule a call?</li>
// </ul>

// <p style="font-family: Arial, sans-serif; color: #333;">
// Ready to get started? Please choose one of the options above by typing its corresponding name, and we’ll dive into the next question! 😊
// </p>
// `;








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
  console.log("******************");
  console.log(message);

  try {
    const aiResponse = await callTogetherAI(conversationHistory);
    conversationHistory.push({ role: 'assistant', content: aiResponse });

    // ✅ Dynamic extraction prompt using latest conversationHistory
    const extractionPrompt = [
      { role: 'system', content: 'You are a JSON extraction assistant. Reply only in JSON.' },
      {
        role: 'user',
        content: `
        Conversation:
        ${conversationHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

        Now extract this info in JSON format. Respond ONLY with valid JSON:

        {
          "projectType": "",
          "workType": "",
          "serverNeeded": "",
          "maintenance": "",
          "design": "",
          "hosting": "",
          "startTime": "",
          "budget": "",
          "contactDetails": {
            "firstName": "",
            "lastName": "",
            "email": "",
            "phone": ""
          },
          "phoneCallTime": ""
        }
        `
      }
    ];

    const extracted = await callTogetherAI(extractionPrompt);
    console.log("****************** -- extracted data");
    console.log(extracted);

    let parsedData;
    try {
      parsedData = safeJsonParse(extracted); // ✅ No redeclaration here
      if (parsedData) {
        collectedData = { ...collectedData, ...parsedData };
      }
    } catch (e) {
      console.error('Failed to parse extracted JSON:', extracted);
    }

    console.log("****************** -- collected data");
    console.log(collectedData);

    // const allFieldsFilled ={
    //   projectType:collectedData.projectType ? collectedData.projectType: '',
    //   workType:collectedData.workType ? collectedData.workType: '', 
    //   serverNeeded:collectedData.serverNeeded ? collectedData.serverNeeded: '',
    //   maintenance:collectedData.maintenance ? collectedData.maintenance: '', 
    //   design:collectedData.design ? collectedData.design: '', 
    //   hosting:collectedData.hosting ? collectedData.hosting: '', 
    //   startTime:collectedData.startTime ? collectedData.startTime: '', 
    //   phoneCallTime:collectedData.phoneCallTime ? collectedData.phoneCallTime: '',
    //   contactDetails:{
    //     firstName:collectedData.contactDetails.firstName ? collectedData.contactDetails.firstName : '', 
    //     lastName:collectedData.contactDetails.lastName ? collectedData.contactDetails.lastName: '', 
    //     email:collectedData.contactDetails.email ? collectedData.contactDetails.email: '',  
    //     phone:collectedData.contactDetails.phone ? collectedData.contactDetails.phone: '', 
    //   }
    // }
    const allFieldsFilled = 
      {
        ...(collectedData.projectType && collectedData.projectType.trim()  != "" && { projectType: collectedData.projectType }),
        ...(collectedData.workType && collectedData.workType.trim()  != "" && { workType: collectedData.workType }),
        ...(collectedData.serverNeeded && collectedData.serverNeeded.trim()  != "" && { serverNeeded: collectedData.serverNeeded }),
        ...(collectedData.maintenance && collectedData.maintenance.trim()  != "" && { maintenance: collectedData.maintenance }),
        ...(collectedData.design && collectedData.design.trim()  != "" && { design: collectedData.design }),
        ...(collectedData.hosting && collectedData.hosting.trim()  != "" && { hosting: collectedData.hosting }),
        ...(collectedData.startTime && collectedData.design.trim()  != "" && { design: collectedData.startTime }),
        ...(collectedData.budget && collectedData.budget.trim()  != "" && { budget: collectedData.budget }),
        ...(collectedData.phoneCallTime && collectedData.phoneCallTime.trim()  != "" && { phoneCallTime: collectedData.phoneCallTime }),
        contactDetails:{
          ...(collectedData.contactDetails.firstName && collectedData.contactDetails.firstName.trim()  != "" && { firstName: collectedData.contactDetails.firstName }),
          ...(collectedData.contactDetails.lastName && collectedData.contactDetails.lastName.trim()  != "" && { firstName: collectedData.contactDetails.lastName }),
          ...(collectedData.contactDetails.email && collectedData.contactDetails.email.trim()  != "" && { firstName: collectedData.contactDetails.email }),
          ...(collectedData.contactDetails.phone && collectedData.contactDetails.phone.trim()  != "" && { firstName: collectedData.contactDetails.phone }),
        }
      }

      console.log('************--- all test');
    console.log(allFieldsFilled);
   
    
    console.log('************--- all fieldsfilled');
    console.log(allFieldsFilled);

    if (allFieldsFilled && Object.keys(allFieldsFilled).length === 10) {
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
        response: aiResponse,
        summaryTable,
        jsonSummary: collectedData,
        dataSaved: saveResult.success,
        message: saveResult.success,
      };
    }

    return { response: aiResponse, jsonSummary:allFieldsFilled };
  } catch (error) {
    console.error('Error during processing:', error);
    return { response: 'Sorry, an error occurred while processing your message.' };
  }
};


const jsonExtractionPrompt = {
  role: 'user',
  content: `
Conversation:
${conversationHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

Now extract this info in JSON format. Respond ONLY with valid JSON:

{
  "projectType": "",
  "workType": "",
  "serverNeeded": "",
  "maintenance": "",
  "design": "",
  "hosting": "",
  "startTime": "",
  "budget": "",
  "contactDetails": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": ""
  },
  "phoneCallTime": ""
}
`
};

const safeJsonParse = (text) => {
  try {
    // Try parsing directly
    return JSON.parse(text);
  } catch (e) {
    // Try to auto-fix minor issues like trailing commas or cut-off strings
    const fixed = text.trim()
      .replace(/,\s*}/g, '}') // remove trailing commas before }
      .replace(/,\s*]/g, ']') // remove trailing commas before ]
      .replace(/("phoneCallTime"\s*:\s*)$/, '$1""') // fix incomplete field
      .replace(/\\n/g, '') // remove escaped newlines (optional)
      .replace(/[\u0000-\u001F]+/g, '') // remove control characters
    ;

    try {
      return JSON.parse(fixed);
    } catch (err) {
      console.error("❌ Still failed to parse:", fixed);
      return null;
    }
  }
};


export { processUserMessage };
