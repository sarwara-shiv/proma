import { useAuthContext } from "../../../context/AuthContext";
import { ChatGroupType, MessageType } from "../../../features/chat/chatTypes";
import { User } from "@/interfaces";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../context/SocketContext";

interface IChat {
    text:string,
    date:Date
}
interface ArgsType {
    setChatData:React.Dispatch<React.SetStateAction<MessageType[]>>;
    receiver:{user?:User, group?:ChatGroupType} | null
    chatData:MessageType[];
}

const ChatInputBox:React.FC<ArgsType> = ({setChatData, chatData, receiver})=>{
    const {user} = useAuthContext(); 
    const socket = useSocket();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [message, setMessage] = useState<string>("");
    const inputBoxHeight = 190;

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = `${Math.min(textarea.scrollHeight, inputBoxHeight)}px`;
        }
      }, [message]);

      useEffect(() => {
        if (!socket || !receiver) return;
      
        // Here you'd set up listeners if needed
        return () => {
          // Cleanup
        };
      }, [receiver]);

      const sendMessageSocket = (messageContent: string) => {
        console.log(socket);
        if (!socket || !receiver || !user){
          console.log('no socket or user');
          return;
        };
      
        if (receiver.user) {
          socket.emit('private-message', receiver.user._id, messageContent, user._id);
        } else if (receiver.group) {
          const groupMembers:string[] = receiver.group.members; // optional if needed
          socket.emit('group-message', receiver.group, messageContent, user._id, groupMembers);
        }
      };
    
      const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const isCtrlOrCmd = e.ctrlKey || e.metaKey; // metaKey is ⌘ on Mac
      
        if (e.key === "Enter") {
          if (isCtrlOrCmd) {
            // Allow newline with Ctrl+Enter or Cmd+Enter
            const cursorPosition = e.currentTarget.selectionStart;
            const newValue =
              message.substring(0, cursorPosition) + "\n" + message.substring(cursorPosition);
      
            setMessage(newValue);
      
            // Wait for the state to update before adjusting height
            requestAnimationFrame(() => {
              const textarea = textareaRef.current;
              if (textarea) {
                textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1;
              }
            });
      
            e.preventDefault(); // prevent actual Enter behavior
          } else {
            e.preventDefault(); // Block default Enter (newline)
            console.log("Sending:", message);
            sendMessage(message);
    
            setMessage(""); // Clear input
          }
        }
      };
    
    // send message
    const sendMessage = (message:string)=>{
      if(receiver && user && message.trim()){
         let newMessage:MessageType = {
            content:message,
            sender:user._id.toString(),
            status:'sent',
            likes:[],
            pinned:'none',
            readStatus:[],
            createdAt:new Date()
         } 

            setChatData((prev) => [...prev, newMessage]);
            sendMessageSocket(message);
            setMessage("");
      }
    }

    return (
        <div className="flex items-end gap-2">
            <button className="p-2 rounded hover:bg-gray-100">📎</button>

            <textarea
                ref={textareaRef}
                value={message}
                rows={1}
                placeholder="Type a message"
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none rounded-md border px-3 py-2 overflow-auto text-sm focus:outline-none focus:shadow-md "
                style={{
                maxHeight: `${inputBoxHeight}px`,
                overflowY: "auto",
                }}
            />

            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                console.log("Sending:", message);
                setMessage("");
                }}
            >
                Send
            </button>
        </div>
    )
}

export default ChatInputBox;