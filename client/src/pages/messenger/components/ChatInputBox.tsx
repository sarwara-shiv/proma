import { useEffect, useRef, useState } from "react";

interface IChat {
    text:string,
    date:Date
}
interface ArgsType {
    setChatData:React.Dispatch<React.SetStateAction<IChat[]>>;
    chatData:IChat[];
}

const ChatInputBox:React.FC<ArgsType> = ({setChatData, chatData})=>{
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
            console.log(chatData);
            if (message.trim()) {
                const newMessage: IChat = {
                  text: message.trim(),
                  date: new Date(),
                };
                setChatData((prev) => [...prev, newMessage]);
                setMessage("");
            }
    
            setMessage(""); // Clear input
          }
        }
      };

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