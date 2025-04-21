import { useAuthContext } from "../../../context/AuthContext";
import { ChatGroupType, MessageType } from "../../../features/chat/chatTypes";
import { User } from "@/interfaces";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../context/SocketContext";
import { useTranslation } from "react-i18next";
import { IoMdAdd, IoMdSend } from "react-icons/io";
import { EmojiPicker } from "../../../components/common";
import { createPortal } from "react-dom";

interface ArgsType {
  setChatData: React.Dispatch<React.SetStateAction<MessageType[]>>;
  receiver: { user?: User; group?: ChatGroupType } | null;
  chatData: MessageType[];
}

const MentionListPortal = ({ 
  users, 
  position, 
  onSelect, 
  selectedIndex 
}: {
  users: User[];
  position: { top: number; left: number; direction: 'top' | 'bottom' };
  onSelect: (user: User) => void;
  selectedIndex: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Calculate position based on available space
  const getPositionStyle = () => {
    const style: React.CSSProperties = {
      position: 'fixed',
      left: `${position.left}px`,
    };

    if (position.direction === 'top') {
      style.bottom = `${window.innerHeight - position.top + 10}px`;
    } else {
      style.top = `${position.top + 20}px`;
    }

    return style;
  };

  return createPortal(
    <div
      ref={ref}
      className="absolute bg-white shadow-lg rounded-md border z-50 w-48 max-h-60 overflow-auto"
      style={getPositionStyle()}
    >
      {users.length > 0 ? (
        users.map((user, index) => (
          <div 
            key={user._id}
            className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
              index === selectedIndex ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelect(user)}
          >
            {user.name}
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-gray-500">No users found</div>
      )}
    </div>,
    document.body
  );
};

const ChatInputBox: React.FC<ArgsType> = ({ setChatData, chatData, receiver }) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const socket = useSocket();
  const editorRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ 
    top: 0, 
    left: 0,
    direction: 'bottom' as 'top' | 'bottom'
  });
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  // Populate users list
  useEffect(() => {
    // This should be replaced with your actual users data
    // For example, if you're in a group chat, use the group members
    const fetchUsers = async () => {
      if (receiver?.group) {
        // In a real app, you would fetch the complete user objects for these IDs
        
      } else {
        // For 1:1 chats, you might want to show other users the person frequently chats with
        // const response = await api.getUsers();
        // setUsers(response.data);
        setUsers([
          { _id: '1', name: 'John Doe', email: 'john@example.com', username:""},
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com', username:""},
          {
            _id: '3', name: 'Bob Johnson', email: 'bob@example.com',
            username: ""
          },
        ]);
      }
    };
    fetchUsers();
  }, [receiver]);

  const checkAvailableSpace = (cursorTop: number) => {
    const spaceBelow = window.innerHeight - cursorTop;
    return spaceBelow > 200 ? 'bottom' : 'top';
  };

  const addEmoji = (emoji: any) => {
    const sym = emoji.native;
    const el = editorRef.current;
    if (el) {
      el.focus();
      document.execCommand('insertText', false, sym);
    }
  };

  const sendMessageSocket = (messageContent: string) => {
    if (!socket || !receiver || !user) return;

    if (receiver.user) {
      socket.emit("private-message", receiver.user._id, messageContent, user._id);
    } else if (receiver.group) {
      const groupMembers: string[] = receiver.group.members;
      socket.emit("group-message", receiver.group, messageContent, user._id, groupMembers);
    }
  };

  const sendMessage = (rawHtml: string) => {
    const messageHtml = rawHtml;
    if (receiver && user && messageHtml.trim()) {
      const newMessage: MessageType = {
        content: messageHtml,
        sender: user._id.toString(),
        status: "sent",
        likes: [],
        readStatus: [],
        createdAt: new Date(),
      };

      setChatData((prev) => [...prev, newMessage]);
      sendMessageSocket(messageHtml);
      setMessage("");
      if (editorRef.current) editorRef.current.innerHTML = "";
    }
  };

  const convertUrlsToLinks = (text: string): string => {
    const urlRegex = /(?:https?|ftp):\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/g;

    return text.replace(urlRegex, (url) => {
      const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
      const ext = url.split(".").pop()?.toLowerCase();
      const isImageUrl = ext ? imageExtensions.includes(ext) : false;
      if (isImageUrl) {
        return `<img src="${url}" alt="Image" class="w-32 h-auto rounded-lg cursor-pointer" />`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`;
    });
  };

  const adjustHeight = () => {
    if (editorRef.current) {
      editorRef.current.style.height = "auto";
      const scrollHeight = editorRef.current.scrollHeight;
      const maxHeight = 190;
      editorRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  const handleInput = () => {
    const text = editorRef.current?.innerHTML || "";
    setMessage(text);
    adjustHeight();
    checkForMentionTrigger(text);
  };

  const checkForMentionTrigger = (text: string) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const cursorPos = range.startOffset;

    // Get text from the start of the node to the cursor position
    const textBeforeCursor = node.textContent?.substring(0, cursorPos) || "";

    // Check if we're at a mention trigger (@)
    const atSymbolIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atSymbolIndex >= 0 && 
        (textBeforeCursor.length === atSymbolIndex + 1 || 
         /\s/.test(textBeforeCursor[atSymbolIndex + 1]))) {
      // Get the position of the cursor
      const rect = range.getBoundingClientRect();
      const direction = checkAvailableSpace(rect.bottom);
      
      setMentionPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        direction
      });
      
      setMentionIndex(atSymbolIndex);
      setShowMentionList(true);
      setMentionQuery("");
      setSelectedUserIndex(0);
      setFilteredUsers(users); // Show all users initially
    } else if (showMentionList) {
      // If we're in mention mode, update the query
      if (mentionIndex >= 0) {
        const query = textBeforeCursor.substring(mentionIndex + 1);
        setMentionQuery(query);
        setFilteredUsers(
          users.filter(user => 
            user.name && user.name.toLowerCase().includes(query.toLowerCase())
          )
        );
        setSelectedUserIndex(0); // Reset selection when query changes
      } else {
        setShowMentionList(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    if (showMentionList) {
      // Handle up/down arrows for mention selection
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedUserIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedUserIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredUsers.length > 0) {
          insertMention(filteredUsers[selectedUserIndex]);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowMentionList(false);
        return;
      }
      if (e.key === "Backspace" && mentionQuery === "") {
        e.preventDefault();
        setShowMentionList(false);
        return;
      }
    }

    if (e.key === "Enter" && !showMentionList) {
      e.preventDefault();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const el = editorRef.current;

      if (el) {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        if (isCtrlOrCmd && range) {
          range.deleteContents();
          const br = document.createElement("br");
          range.insertNode(br);
          const newRange = document.createRange();
          newRange.setStartAfter(br);
          newRange.setEndAfter(br);
          selection?.removeAllRanges();
          selection?.addRange(newRange);
          el.focus();
          adjustHeight();
        } else {
          const convertedMessage = convertUrlsToLinks(el.innerHTML || '');
          sendMessage(convertedMessage);
        }
      }
    }

    if (isCtrlOrCmd) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          document.execCommand("bold");
          return;
        case "i":
          e.preventDefault();
          document.execCommand("italic");
          return;
        case "u":
          e.preventDefault();
          document.execCommand("underline");
          return;
      }
    }
  };

  const insertMention = (user: User) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    
    // Get the text from the node
    const text = node.textContent || "";
    
    // Find the @ position in the current node
    const atPos = text.lastIndexOf('@', range.startOffset - 1);
    
    if (atPos >= 0) {
      // Create a range that covers from @ to cursor
      const mentionRange = document.createRange();
      mentionRange.setStart(node, atPos);
      mentionRange.setEnd(node, range.startOffset);
      
      // Delete the @ and query text
      mentionRange.deleteContents();
      
      // Insert the mention span
      const mentionNode = document.createElement("span");
      mentionNode.contentEditable = "false";
      mentionNode.className = "mention bg-blue-100 text-blue-800 px-1 rounded";
      mentionNode.textContent = `@${user.name}`;
      mentionNode.dataset.userId = user._id;
      mentionRange.insertNode(mentionNode);
      
      // Add a space after the mention
      const spaceNode = document.createTextNode(" ");
      mentionRange.insertNode(spaceNode);
      
      // Move cursor after the space
      const newRange = document.createRange();
      newRange.setStartAfter(spaceNode);
      newRange.setEndAfter(spaceNode);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    setShowMentionList(false);
    editorRef.current.focus();
    adjustHeight();
  };

  const cleanMessage = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
  
    while (div.firstChild && div.firstChild.nodeName === "BR") {
      div.removeChild(div.firstChild);
    }
  
    while (div.lastChild && div.lastChild.nodeName === "BR") {
      div.removeChild(div.lastChild);
    }
  
    const processedHtml = div.innerHTML.replace(/<br\s*\/?>/gi, "\n");
  
    return processedHtml.trim();
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const plainText = e.clipboardData ? e.clipboardData.getData("text/plain") : '';
    document.execCommand("insertText", false, plainText);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.addEventListener("paste", handlePaste as EventListener);
      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener("paste", handlePaste as EventListener);
        }
      };
    }
  }, []);

  return (
    <div className="flex items-end gap-2 relative">
      <div className="flex items-center justfiy-between gap-1"> 
        <button className="p-2 aspect-1/1 rounded-full text-2xl hover:bg-gray-100">
          <IoMdAdd />
        </button>
        <EmojiPicker
          editorRef={editorRef}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          />
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        data-placeholder="Type a message"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="flex-1 min-h-[38px] max-h-[190px] overflow-auto rounded-md border px-3 py-2 text-sm focus:outline-none focus:shadow-md"
        style={{ whiteSpace: "pre-wrap" }}
      />

      {showMentionList && (
        <MentionListPortal
          users={filteredUsers}
          position={mentionPosition}
          onSelect={insertMention}
          selectedIndex={selectedUserIndex}
        />
      )}

      <button
        className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
        onClick={() => sendMessage(editorRef.current?.innerHTML || "")}
      >
        <IoMdSend />
      </button>
    </div>
  );
};

export default ChatInputBox;