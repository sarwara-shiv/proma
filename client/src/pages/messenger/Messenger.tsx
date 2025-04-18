import { useTranslation } from "react-i18next";
import { Logo } from "../../components/common";
import { useAuthContext } from "../../context/AuthContext";
import { useRef, useState, useEffect  } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { format } from "date-fns";
import ChatInputBox from "./components/ChatInputBox";

interface IChat {
    text:string,
    date:Date
}

const Messenger = () => {
    const inputBoxHeight = 190;
    const { user } = useAuthContext();
    const {t} = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [chatData, setChatData] = useState<IChat[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [message, setMessage] = useState<string>("");


  

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
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className={`p-2 bg-white rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center`}>
                    <div className="flex justify-start flex-1 gap-x-2 items-center">
                        <div className="w-8 h-8 border bg-primary-light rounded-full"></div>
                        <div className="text-sm">
                            Contact name {i+1}
                            <div className="text-xs italic text truncate text-slate-400">
                                some random text here
                            </div>
                        </div>
                    </div>    
                    <div className="aspect-1/1 h-4 min-w-4 flex justify-center items-center text-xs bg-primary text-white rounded-lg">
                        2
                    </div>
                </div>
              ))}
            </div>
          </div>

            {/* CHATBOX */}
            <div className={`flex-1 bg-gray-200 flex flex-col justify-between h-full`}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="text-center text-gray-600 mt-8">
                        {chatData && chatData.length > 0 ? 
                            <div className="">
                                {chatData.map((chat, idx)=>{
                                   const cUser = (idx + 1) % 2 === 0; // is even
                                   return (
                                    <div className={`w-full flex justify-${cUser ? 'end' : 'start'} my-4`}>
                                        <div className={`shadow-md relative flex flex-col items-${cUser ? 'end rounded-l-md rounded-br-md bg-primary-light': 'start rounded-r-md rounded-bl-md bg-white'} justify-start p-2   max-w-[45%] right-0`}>
                                            {cUser 
                                            ? 
                                            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[0px] border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent border-l-primary-light"></div>
                                            : 
                                            <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-b-[10px] border-r-[10px] border-t-transparent border-b-transparent border-r-white"></div> 
                                            }
                                            <div className={`text-sm ${cUser ? 'text-end' : 'text-start'}`}>{chat.text}</div>
                                            <div className="text-xs italic text-slate-400">{format(chat.date, 'dd.MM.yyy HH:ii')}</div>
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>

                            :
                            <>Select a contact to start chatting</>
                        }
                    </div>
                </div>

                {/* Input */}
                <div className="border-t p-4 bg-white sticky bottom-0">
                    <ChatInputBox setChatData={setChatData} chatData={chatData}/>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Messenger;
