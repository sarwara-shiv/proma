import { User } from "@/interfaces";
import { useAuthContext } from "../../../context/AuthContext";
import { getChatMessages, getChatUsers } from "../../../hooks/reduxHooks";
import { useEffect, useState } from "react";
import { ChatGroupType, MessageType } from "../../../features/chat/chatTypes";
import { useSocket } from "../../../context/SocketContext";

interface ArgsType{
    setChatData:React.Dispatch<React.SetStateAction<MessageType[]>>;
    setReceiver: (receiver: { user?: User; group?: ChatGroupType } | null) => void;
    receiver:{ user?: User; group?: ChatGroupType} | null
}

const ChatUsers:React.FC<ArgsType> = ({setChatData, setReceiver, receiver}) => {
    const socket = useSocket();
    const {user} = useAuthContext();
    const [usersData, setUsersData] = useState({
        users: [],
        groups: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMessages, setNewMessages] = useState<{senderId:string, message:MessageType, type:'group'|'user' }[]>([]);

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
                setChatData((prev: MessageType[]) => [...prev, message]);
                setNewMessages((prev) => [
                    ...prev,
                    { senderId: message.sender, message, type:'user' },
                  ]);
            }
        };
    
        const handleGroupMessage = (message: MessageType) => {
            console.log("📩 New group message received:", message);
    
            if (receiver?.group && message.group === receiver.group._id) {
                setChatData((prev: MessageType[]) => [...prev, message]);
            } else {
                setNewMessages((prev) => [
                    ...prev,
                    { senderId: message.sender, message, type:'group' },
                  ]);
            }
        };
    
        socket.emit("user-connected", user._id); // 👈 make sure to send the user ID!
    
        socket.on("receive-private-message", handlePrivateMessage);
        socket.on("receive-group-message", handleGroupMessage);
    
        return () => {
            socket.off("receive-private-message", handlePrivateMessage);
            socket.off("receive-group-message", handleGroupMessage);
        };
    }, [socket, user, receiver, setChatData]);

    useEffect(() => {
        getUsersData();
    }, []);

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
        if (!user) return;

        setReceiver(receiverData);
        
        const rData = {receiverId:receiverData.user?._id, groupId:receiverData.group?._id}

        const response = await getChatMessages({ id: user._id, ...rData });
        console.log(response);
        if (response.status === "success" && response.data) {
            setChatData(response.data);
        } else {
            setChatData([]); // Fallback in case of error
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
                const unreadMessage = newMessages.filter((msg) => msg.senderId === sUser._id && msg.type === 'user').length;
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
                const unreadMessage = newMessages.filter((msg) => msg.senderId === group._id && msg.type === 'user').length;
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
