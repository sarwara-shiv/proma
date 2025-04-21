import { User } from "@/interfaces";
import { useAuthContext } from "../../../context/AuthContext";
import { getChatMessages, getChatUsers } from "../../../hooks/reduxHooks";
import { useEffect, useState } from "react";
import { ChatGroupType, MessageType } from "../../../features/chat/chatTypes";
import { useSocket } from "../../../context/SocketContext";
import { RootState } from "../../../app/store";
import { useSelector, useDispatch } from "react-redux";
import { clearUnreadMessagesFrom } from "../../../features/chat/chatSlice";

interface ArgsType{
    setChatData:React.Dispatch<React.SetStateAction<MessageType[]>>;
    chatData:MessageType[];
    setReceiver: (receiver: { user?: User; group?: ChatGroupType } | null) => void;
    receiver:{ user?: User; group?: ChatGroupType} | null
}

const ChatUsers:React.FC<ArgsType> = ({setChatData, setReceiver, receiver, chatData}) => {
    // const unreadMessages = useSelector((state: RootState) => state.chat.unreadMessages);
    // const unreadCount = useSelector((state: RootState) => state.chat.unreadCount);
    const socket = useSocket();
    const {user} = useAuthContext();
    const [usersData, setUsersData] = useState({
        users: [],
        groups: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMessages, setNewMessages] = useState<{senderId:string, message:MessageType, type:'group'|'user' }[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});

    // SOCKET
    useEffect(() => {
        if (!socket || !user) {
            console.log('⛔ No socket or user');
            return;
        }
    
        const handlePrivateMessage = (message: MessageType) => {
            console.log("📩 New private message received:", message);
            const audio = new Audio('/sounds/notification.wav');
            
            if (receiver?.user && message.sender === receiver.user._id) {
                setChatData((prev: MessageType[]) => [...prev, message]);
            } else {
                audio.play().catch(err => console.warn("🔇 Unable to play sound:", err));
                // setChatData((prev: MessageType[]) => [...prev, message]);
                const senderId = message.group || message.sender;
                  setUnreadMessages(prev => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1
                  }));
            }
        };
    
        const handleGroupMessage = (message: MessageType) => {
            console.log("📩 New group message received:", message);
    
            if (receiver?.group && message.group === receiver.group._id) {
                setChatData((prev: MessageType[]) => [...prev, message]);
            } else {
                  const senderId = message.group || message.sender;
                  setUnreadMessages(prev => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1
                  }));
            }
        };

        const handleMessageLiked = (message:MessageType)=>{
            console.log(message);
            if(message){
                setChatData((prevChat) => {
                    const index = prevChat.findIndex(msg => msg._id === message._id);
                
                    if (index !== -1) {
                      // Replace existing message
                      const updatedChat = [...prevChat];
                      updatedChat[index] = message;
                      return updatedChat;
                    } else {
                      // Add new message
                      return [...prevChat, message];
                    }
                  });
            }
        }

        const handleMessagesRead = ( response:any) => {
            console.log("📩 mesages read:", response);
            const receiverId = receiver?.group?._id || receiver?.user?._id
            if(receiverId && response.userId && response.userId === receiverId && response.messageIds && response.messageIds.length > 0){
                console.log('message read');
                setChatData((prevChatData:any[]) =>
                    prevChatData.map((msg) => {
                      if (response.messageIds.includes(msg._id)) {
                        const updatedReadStatus = msg.readStatus.map((status:any) =>
                          status.user === receiverId
                            ? { ...status, status: 'read' }
                            : status
                        );
                
                        return {
                          ...msg,
                          readStatus: updatedReadStatus,
                        };
                      }
                      console.log(msg);
                      return msg;
                    })
                  );
            }

        };
    
        socket.emit("user-connected", user._id); // 👈 make sure to send the user ID!
    
        socket.on("receive-private-message", handlePrivateMessage);
        socket.on("receive-group-message", handleGroupMessage);
        socket.on("messages-read", handleMessagesRead);
        socket.on("message-liked", handleMessageLiked);
    
        return () => {
            socket.off("receive-private-message", handlePrivateMessage);
            socket.off("receive-group-message", handleGroupMessage);
            socket.off("messages-read", handleMessagesRead);
            socket.off("message-liked", handleMessageLiked);
        };
    }, [socket, user, receiver, setChatData]);

    useEffect(() => {
        getUsersData();
    }, []);
    useEffect(() => {
        console.log(unreadMessages)
    }, [unreadMessages]);

    const getUsersData = async () => {
        try {
            
            if(user){
                console.log(user);
                const response = await getChatUsers({id:user._id})
                
                console.log(response);
                if(response.status === 'success'){
                    setUsersData({
                        users: response.users,
                        groups: response.groups
                    });

                    if(response.unreadMessages){
                        setUnreadMessages(unreadMessages);
                    }

                    if (response.users.length > 0) {
                        handleSelect({ user: response.users[0] });
                    } else if (response.groups.length > 0) {
                        handleSelect({ group: response.groups[0] });
                    }
                }
                setLoading(false);
            }
        } catch (err: any) {
            setError("Error fetching data");
            setLoading(false);
            console.error("Error:", err);
        }
    };

    // GET MESSAGES
    const handleSelect = async (receiverData: { user?: User; group?: ChatGroupType }) => {
        if (!user || !socket) return;

        setReceiver(receiverData);

        const rData = { receiverId: receiverData.user?._id, groupId: receiverData.group?._id };
        const response = await getChatMessages({ id: user._id, ...rData });

        if (response.status === "success" && response.data) {
            setChatData(response.data);



            // Extract message IDs that are unread
            const unreadMessageIds = response.data
                .filter((msg: MessageType) => {
                    const userReadStatus = msg.readStatus?.find((status: any) => status.user === user._id);
                    return userReadStatus?.status === 'unread';
                })
                .map((msg: MessageType) => msg._id);

            // Emit to backend to mark as read
            if (unreadMessageIds.length > 0) {
                socket.emit("mark-messages-read", unreadMessageIds, user._id);

                const key = receiverData.user?._id || receiverData.group?._id;
                if (key) {
                    setUnreadMessages((prev) => {
                      const updated = { ...prev };
                      delete updated[key];
                      return updated;
                    });
                }
            }

        } else {
            setChatData([]); // fallback
        }
    };



    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            {usersData.users.map((sUser: any) => {
                // const unreadMessage = newMessages.filter((msg) => msg.senderId === sUser._id && msg.type === 'user').length;
                const unreadMessage = unreadMessages[sUser._id] ?  unreadMessages[sUser._id] : 0;
                return (
                <div key={sUser._id} className={`p-2 rounded 
                    ${receiver && receiver.user && receiver.user._id === sUser._id ? 'bg-primary-light ' : 'bg-white  hover:bg-gray-100 '} 
                    cursor-pointer flex justify-between items-center`}
                onClick={()=>handleSelect({ user: sUser })}
                >
                    <div className="flex justify-start flex-1 gap-x-2 items-center">
                        <div className="w-8 h-8 border bg-primary-light rounded-full"></div>
                        <div className="text-sm">
                            {sUser.name}
                            <div className="text-xs italic text truncate text-slate-400">
                                {sUser._id}
                            </div>
                        </div>
                    </div>
                    { unreadMessage > 0 && 
                        <div className="aspect-1/1 h-4 min-w-4 flex justify-center items-center text-xs bg-primary text-white rounded-lg">
                            {unreadMessage}
                        </div>
                    }  
                </div>
            )}
            )}
            {usersData.groups.map((group: any) => {
                const unreadMessage = unreadMessages[group._id] ?  unreadMessages[group._id] : 0;
                return (
                <div key={group._id} className={`p-2 bg-white rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center`}
                onClick={()=>handleSelect({ group: group })}
                >
                    <div className="flex justify-start flex-1 gap-x-2 items-center">
                        <div className="w-8 h-8 border bg-primary-light rounded-full"></div>
                        <div className="text-sm">
                            {group.name}
                            <div className="text-xs italic text truncate text-slate-400">
                                
                            </div>
                        </div>
                    </div>    
                    { unreadMessage > 0 && 
                        <div className="aspect-1/1 h-4 min-w-4 flex justify-center items-center text-xs bg-primary text-white rounded-lg">
                            {unreadMessage}
                        </div>
                    }  
                </div>
            )}
            )}
        </div>
    );
};

export default ChatUsers;
