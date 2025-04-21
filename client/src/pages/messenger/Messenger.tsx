import { useTranslation } from "react-i18next";
import { CustomTooltip, Logo } from "../../components/common";
import { useAuthContext } from "../../context/AuthContext";
import { useRef, useState, useEffect  } from "react";
import { FaAngleDown, FaAngleUp, FaCheck, FaCheckDouble, FaRegHeart, FaReply, FaStar } from "react-icons/fa";
import { format, isToday, isYesterday } from "date-fns";
import ChatInputBox from "./components/ChatInputBox";
import ChatUsers from "./components/ChatUsers";
import { ChatGroupType, MessageType } from "../../features/chat/chatTypes";
import { User } from "@/interfaces";
import { NavLink } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { MdOutlineEventNote, MdOutlinePushPin, MdPushPin } from "react-icons/md";
import ChatMenu from "./components/ChatMenu";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import ChatLike from "./components/ChatLike";


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
    const isFirstRender = useRef(true);

    const scrollToBottom = (smooth: boolean = true) => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    };


    useEffect(() => {
      scrollToBottom(!isFirstRender.current);
      if (isFirstRender.current) {
        isFirstRender.current = false;
      }
      
    }, [chatData]);

    const getChatLikes = (chat: MessageType) => {
      if (!chat.likes || chat.likes.length === 0) return null;
    
      // Group likes by emoji (optional enhancement)
      const emojiCounts: { [emoji: string]: number } = {};
      chat.likes.forEach(like => {
        emojiCounts[like.text] = (emojiCounts[like.text] || 0) + 1;
      });
    
      return (
        <div className="flex gap-1 mt-1 flex-wrap">
          {Object.entries(emojiCounts).map(([emoji, count], idx) => (
            <div
              key={`${chat._id}-${idx}`}
              className="text-[9px] p-[3px] bg-slate-100 aspect-1/1 rounded-full border border-slate-300 flex items-center gap-1"
            >
              {emoji} {count > 1 && <span className="text-xs text-slate-500">{count}</span>}
            </div>
          ))}
        </div>
      );
    };


    const groupMessagesByDate = (messages: MessageType[]) => {
      return messages.reduce((acc: Record<string, MessageType[]>, msg) => {
        const date = msg.createdAt ? new Date(msg.createdAt) : new Date();
        const key = isToday(date)
          ? "Today"
          : isYesterday(date)
          ? "Yesterday"
          : format(date, "MMMM d, yyyy");
    
        if (!acc[key]) acc[key] = [];
        acc[key].push(msg);
        return acc;
      }, {});
    };

    const groupedMessages = chatData ? groupMessagesByDate(chatData) : null;

   

  return (
    <div className=" min-h-screen min-w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 flex justify-center bg-gray-200">
        <div className="max-w-7xl w-full py-4 px-4 flex justify-between items-center bg-white border-b">
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
   
          <div className="w-[350px] bg-white border-r flex flex-row">
            <div className="flex flex-row w-full">
              {/* MENU SECTION */}
              <div className="flex flex-col w-[35px] border-r py-4 gap-4 bg-slate-100">
                  <div className="flex items-center justify-center p-1">
                    <NavLink
                      to={`/admin`}
                      className={({ isActive }) => {
                        return `flex-1 rounded-sm text-lg flex transition-all ease items-center justify-center ${isActive ? "text-primary font-bold" : "text-gray-500 font-light hover:text-gray-800 hover:font-bold"}`;
                        }}
                      >
                          {({ isActive }) => (
                          <>
                              <span className={`text-lg flex justify-center items-center aspect-1/1 hover:bg-primary-light icon  rounded-full ${isActive ? 'bg-primary-light' : 'bg-gray-100'} p-1`}>
                              <IoMdHome />
                              </span>
                          </>
                          )}
                    </NavLink>
                  </div>
                  <div className="flex items-center justify-center p-1">
                    <CustomTooltip content="Pinned">
                      <span className={`cursor-pointer text-lg flex justify-center items-center aspect-1/1 bg-gray-100 hover:bg-primary-light icon rounded-full p-1`}>
                        <MdOutlinePushPin />
                      </span>
                     </CustomTooltip>
                  </div>
                  <div className="flex items-center justify-center p-1">
                    <CustomTooltip content="Favourites">
                      <span className={`cursor-pointer text-lg flex justify-center items-center aspect-1/1 bg-gray-100 hover:bg-primary-light icon rounded-full p-1`}>
                        <FaRegHeart />
                      </span>
                    </CustomTooltip>
                  </div>
                  <div className="flex items-center justify-center p-1">
                    <CustomTooltip content={'Notes'}>
                      <span className={`cursor-pointer text-lg flex justify-center items-center aspect-1/1 bg-gray-100 hover:bg-primary-light icon rounded-full p-1`}>
                        <MdOutlineEventNote />
                      </span>
                    </CustomTooltip>
                  </div>
                </div>
                {/*  USERS SECTION */}
                <div className="flex flex-col flex-1 w-full">
                  {/* Menu Section */}
                  {/* <div className="p-2 border-b">
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
                  </div> */}
                  <div className="p-2 text-primary">
                      <h2 className="text-md font-bold text-slate-800">{t('users')}</h2>
                  </div>
                  {/* Contacts Section */}
                  <div className="flex-1 overflow-y-auto px-2 pt-0 pb-2 space-y-4 text-sm ">
                    <ChatUsers setReceiver={setReceiver} setChatData={setChatData} receiver={receiver || null}/> 
                  </div>
                </div>
            </div>
          </div>

            {/* CHATBOX */}
            <div className={`flex-1 bg-gray-100 flex flex-col justify-between h-full`}>
                {/* Messages */}
                {receiver && 
                    <div className={`w-full  bg-slate-100 border-b flex p-3 space-y-1 flex gap-2 text-sm`}>
                        <div className="w-8 h-8 border bg-white rounded-full"></div>
                        <div className="text-sm">
                          {receiver.group && <p>{receiver.group.name}</p>}
                          {receiver.user && <p>{receiver.user.name}</p>}
                          <div className="text-xs italic text truncate text-slate-400">
                              
                          </div>
                        </div>
                    </div>
                  }
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="text-center text-gray-600 mt-6">
                    {groupedMessages && Object.entries(groupedMessages).map(([date, messages]) => (
                        <div key={date}>
                          <div className="sticky top-2 z-10 text-center my-4">
                            <span className="inline-block bg-white text-gray-700 z-2 text-sm px-4 py-1 rounded-full shadow">{date}</span>
                          </div>
                          {messages.map((chat, idx) => {
                            const senderId = typeof chat.sender === 'string' ? chat.sender : (chat.sender as User)?._id;
                            const cUser = senderId === user?._id;
                            let hasUserLiked:boolean|undefined = false;
                            if(user && user._id){
                               hasUserLiked = chat?.likes?.some(like => like.user === user._id.toString());
                            }

                            return (
                              <div key={idx} className={`relative  w-full flex justify-${cUser ? 'end' : 'start'} my-8`}>

                                <div className={`relative group shadow-md relative flex flex-col 
                                  items-${cUser ? 'end rounded-l-md rounded-br-md bg-primary-light': 'end rounded-r-md rounded-bl-md bg-white'} 
                                  justify-start px-2 py-1 max-w-[45%] right-0`}>
                                    {cUser && 
                                      <div className="absolute z-50 -left-6 opacity-0 group-hover:opacity-100">
                                        <ChatLike messageId={chat._id || ''} userId={user?._id || ''} chat={chat}/> 
                                      </div>
                                    }
                                    <ChatMenu message={chat} user={user || null}/>
                                    {cUser 
                                      ? <div className="absolute top-0 -right-2 w-0 h-0 border-t-[0px] border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent border-l-primary-light"></div>
                                      : <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-b-[10px] border-r-[10px] border-t-transparent border-b-transparent border-r-white"></div>
                                    }
                                    
                                    <div className={`w-full text-sm ${cUser ? 'text-end' : 'text-start'}`} dangerouslySetInnerHTML={{ __html: chat.content }} />
                                    <div className="text-[10px] italic text-slate-400 flex pt-1 items-center gap-2">
                                       {/* PINNED MESSAGE */}
                                       {user && (chat.stars && chat.stars.length > 0 && chat.stars.some((id)=> id === user._id.toString())) && 
                                       <FaStar className="text-yellow-500 text-md"/>
                                       }
                                      {user && ((chat.pinned?.group ? true : false )||
                                      (chat.pinned?.personal?.some((id) => id.toString() === user._id.toString()) ? true : false) ) && 
                                          <div className={` flex text-sm text-primary `} ><MdPushPin /></div>
                                      }
                                      {chat.createdAt && format(chat.createdAt, 'HH:mm')}
                                      {chat.status === 'sent' && <IoCheckmarkSharp className="text-slate-700"/>}
                                      {chat.status === 'delivered' && <IoCheckmarkDoneSharp className="text-slate-700"/>}
                                      {chat.status === 'seen' && <IoCheckmarkDoneSharp className="text-primary"/>}
                                    </div>
                                    {chat.likes && chat.likes.length > 0 &&
                                      <div className="absolute -bottom-4">{getChatLikes(chat)} {hasUserLiked}</div>
                                    }
                                  {!cUser && 
                                      <div className="absolute z-50 transition-all duration-200 ease -right-0 opacity-0 group-hover:opacity-100 group-hover:-right-6">
                                        <ChatLike messageId={chat._id || ''} userId={user?._id || ''} chat={chat}/> 
                                      </div>
                                    }
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} /> 
                        </div>
                      ))}

                        {/* {chatData && chatData.length > 0 ? 
                            <div className="">
                                {chatData.map((chat, idx)=>{
                                  //  const cUser = (idx + 1) % 2 === 0; // is even
                                  const senderId = chat.sender ? typeof chat.sender === 'string' ? chat.sender : (chat.sender as unknown as User)._id : null;
                                   const cUser = senderId && senderId === user?._id.toString();
                                   return (
                                    <div key={idx} className={`relative group w-full flex justify-${cUser ? 'end' : 'start'} my-4`}>
                                       <ChatMenu message={chat} user={user || null}/>
                                        <div className={`shadow-md relative flex flex-col 
                                          items-${cUser ? 'end rounded-l-md rounded-br-md bg-primary-light': 'end rounded-r-md rounded-bl-md bg-white'} 
                                          justify-start px-2 py-1   
                                          max-w-[45%] right-0`
                                          }>
                                            {cUser 
                                            ? 
                                            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[0px] border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent border-l-primary-light"></div>
                                            : 
                                            <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-b-[10px] border-r-[10px] border-t-transparent border-b-transparent border-r-white"></div> 
                                            }
                                            <div className={`w-full text-sm ${cUser ? 'text-end' : 'text-start'}`}>{chat.content}</div>
                                            <div className="text-[10px] italic text-slate-400 flex pt-1 items-center gap-2">
                                              {chat.createdAt && format(chat.createdAt, 'HH:ii')}
                                              {chat.status === 'sent' && <IoCheckmarkSharp className="text-slate-700"/>}
                                              {chat.status === 'delivered' && <IoCheckmarkDoneSharp className="text-slate-700"/>}
                                              {chat.status === 'seen' && <IoCheckmarkDoneSharp className="text-primary"/>}
                                            </div>
                                        </div>
                                    </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            :
                            <>Select a contact to start chatting</>
                        } */}
                    </div>
                </div>

                {/* Input */}
                {receiver && 
                <div className="border-t p-4 bg-white sticky bottom-0">
                    <ChatInputBox setChatData={setChatData} chatData={chatData} receiver={receiver || null}/>
                </div>
                }
            </div>

        </div>
      </div>
    </div>
  );
};

export default Messenger;
