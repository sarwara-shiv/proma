import React, { useState, useRef, useEffect } from "react";
import { sendMessageToAI } from "../../hooks/aiHooks"; // make sure sendMessageToAI makes the correct request to the backend
import { Loader } from "../common";

interface MessageType {
  text: string;
  sender: "user" | "bot";
}

const defaultMessage:MessageType = 
  {
    text: "Welcome to List & Sell. Do you have a query about a new project? Feel free to ask, and I'll assist you with your project needs.",
    sender: "bot",
  }


const LeadChatbot: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  // Create a ref for the chat container
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Reset chat when "start fresh" is entered
  const resetChat = async () => {
    setMessages([
      {
        text: "Welcome to List & Sell. Do you have a query about a new project? Feel free to ask, and I'll assist you with your project needs.",
        sender: "bot",
      },
    ]);
    
    // Send a message to the backend to reset the conversation history
    await sendMessageToAI({ message: "start fresh", isNew: true });
  };

  const handleSend = async () => {
    setIsWriting(true);
    if (!input.trim()) {
      setIsWriting(false);
      return
    }

    // If the user types 'start fresh', reset the chat
    if (input.toLowerCase() === "start fresh") {
      resetChat();
      setMessages([defaultMessage]);
      setInput(""); // Clear input field
      setIsWriting(false);
      return; // Skip sending the message to AI
    }

    // Add user's message to state
    const newMessages: MessageType[] = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput(""); // Clear input

    try {
      const response = await sendMessageToAI({ message: input });
      setIsWriting(false)
      console.log(response);
      // Assuming response is { response: "AI response text" }
      const botResponse = response?.response?.response || "Sorry, something went wrong.";
      setMessages([...newMessages, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      setIsWriting(false)
      setMessages([...newMessages, { text: "Error connecting to AI.", sender: "bot" }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission (if inside a form)
      handleSend();
    }
  };

  // Scroll to the bottom whenever the messages array changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // This runs every time the messages state changes

  return (
    <div className="max-w-lg mx-auto mt-10 p-5 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-3">AI Chatbot</h2>
      <div
        ref={chatContainerRef}
        className="h-64 overflow-y-auto p-2 rounded-md flex flex-col"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`my-1 rounded-md text-sm block ${
              msg.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <div 
                className={`p-0 my-0 rounded-md text-sm inline-block  ${
                    msg.sender === "user" ? "text-primary text-right" : "text-left"
                  }`}
            >
                <div className="flex gap-1 flex-col">
                <small className="italic text-gray-400">{msg.sender === "user" ? "You: " : "BOT: "}</small>
                <div className="border border-gray-100 p-1 shadow-md rounded-md" dangerouslySetInnerHTML={{ __html: msg.text }} ></div>
                </div>
            </div>
          </div>
        ))}
        {isWriting && 
         <div
        
         className={`my-1 rounded-md text-sm block text-left`}>
        <div 
        className={`p-0 my-1 rounded-md text-sm inline-block bg-blue-100 text-left`}>
        <Loader type="small"/>
        </div>
        </div>
        }
      </div>
      <div className="flex mt-3">
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:outline-none text-sm font-600 text-primary"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // Added event listener for Enter key
        />
        <button
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default LeadChatbot;
