import { useTranslation } from "react-i18next";
import { Logo } from "../../components/common";
import { useAuthContext } from "../../context/AuthContext";
import { useRef, useState, useEffect  } from "react";
import { FaAngleDown, FaAngleUp, FaCheck, FaCheckDouble } from "react-icons/fa";
import { format } from "date-fns";
import ChatInputBox from "./components/ChatInputBox";
import ChatUsers from "./components/ChatUsers";
import { ChatGroupType, MessageType } from "../../features/chat/chatTypes";
import { User } from "@/interfaces";

const Messenger = () => {
    const inputBoxHeight = 190;
    const { user } = useAuthContext();
    const {t} = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [chatData, setChatData] = useState<MessageType[]>([]);
    const [receiver, setReceiver] = useState<{user?:User, group?:ChatGroupType} | null>();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [message, setMessage] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [chatData]);
  

  return (
    <div className="bg-gray-100 min-h-screen min-w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 flex justify-center shadow-md bg-white">
        <div className="max-w-7xl w-full py-4 px-4 flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700">{user?.username}</div>
            <div className="w-8 h-8 border bg-primary-light shadow-md rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="w-full flex justify-center bg-slate-200">
        <div className="max-w-7xl w-full h-[calc(100vh-72px)] flex">
          {/* SIDEBAR */}
          <div className="w-[300px] bg-white border-r flex flex-col">
            {/* Menu Section */}
            <div className="p-2 border-b">
              <button
                className="w-full text-left text-md font-bold flex justify-between items-center text-slate-800"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {t('menu')}
                <span className="text-sm">{isMenuOpen ? <FaAngleUp /> : <FaAngleDown />}</span>
              </button>
              {isMenuOpen && (
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li className="cursor-pointer hover:text-blue-500">Notes</li>
                  <li className="cursor-pointer hover:text-blue-500">Favourites</li>
                  <li className="cursor-pointer hover:text-blue-500">Settings</li>
                </ul>
              )}
            </div>
            <div className="p-2 text-primary">
                <h2 className="text-md font-bold text-slate-800">{t('users')}</h2>
            </div>
            {/* Contacts Section */}
            <div className="flex-1 overflow-y-auto px-2 pt-0 pb-2 space-y-4 text-sm ">
              <ChatUsers setReceiver={setReceiver} setChatData={setChatData} receiver={receiver || null}/> 
            </div>
          </div>

            {/* CHATBOX */}
            <div className={`flex-1 bg-gray-200 flex flex-col justify-between h-full`}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="text-center text-gray-600 mt-8">
                        {receiver && 
                          <>
                            {receiver.group && <p>Group: {receiver.group.name}</p>}
                            {receiver.user && <p>User: {receiver.user.name}</p>}
                          </>
                        }
                        {chatData && chatData.length > 0 ? 
                            <div className="">
                                {chatData.map((chat, idx)=>{
                                  //  const cUser = (idx + 1) % 2 === 0; // is even
                                  const senderId = chat.sender ? typeof chat.sender === 'string' ? chat.sender : (chat.sender as unknown as User)._id : null;
                                   const cUser = senderId && senderId === user?._id.toString();
                                   return (
                                    <div key={idx} className={`w-full flex justify-${cUser ? 'end' : 'start'} my-4`}>
                                        <div className={`shadow-md relative flex flex-col items-${cUser ? 'end rounded-l-md rounded-br-md bg-primary-light': 'start rounded-r-md rounded-bl-md bg-white'} justify-start p-2   max-w-[45%] right-0`}>
                                            {cUser 
                                            ? 
                                            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[0px] border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent border-l-primary-light"></div>
                                            : 
                                            <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-b-[10px] border-r-[10px] border-t-transparent border-b-transparent border-r-white"></div> 
                                            }
                                            <div className={`text-sm ${cUser ? 'text-end' : 'text-start'}`}>{chat.content}</div>
                                            <div className="text-[10px] italic text-slate-400 flex items-center gap-2">
                                              {chat.status === 'sent' && <FaCheck />}
                                              {chat.status === 'delivered' && <FaCheckDouble />}
                                              {chat.status === 'seen' && <FaCheckDouble className="text-primary"/>}
                                              {chat.createdAt && format(chat.createdAt, 'dd.MM.yyy HH:ii')}
                                            </div>
                                        </div>
                                    </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            :
                            <>Select a contact to start chatting</>
                        }
                    </div>
                </div>

                {/* Input */}
                <div className="border-t p-4 bg-white sticky bottom-0">
                    <ChatInputBox setChatData={setChatData} chatData={chatData} receiver={receiver || null}/>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Messenger;
