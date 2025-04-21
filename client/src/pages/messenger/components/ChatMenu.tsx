import { DecodedToken, User } from "@/interfaces";
import CustomContextMenu from "../../../components/common/CustomContextMenu";
import { MessageType } from "../../../features/chat/chatTypes";
import { useTranslation } from "react-i18next"
import { FaAngleDown, FaRegHeart, FaRegStar, FaReply, FaStar } from "react-icons/fa";
import { MdOutlinePushPin, MdPushPin } from "react-icons/md";
import { useEffect, useState } from "react";
import { useSocket } from "../../../context/SocketContext";
interface ArgsType{
    message:MessageType;
    user:DecodedToken | null;
}

const ChatMenu:React.FC<ArgsType> = ({message, user})=>{
    const {t} = useTranslation();
    const [isPinned, setIsPinned] = useState<boolean>(false);
    const [isStared, setIsStared] = useState<boolean>(false);
    const socket = useSocket();
    useEffect(()=>{
        console.log(message);
        if (message && user) {
            setIsPinned(
              (message.pinned?.group ? true : false )||
              (message.pinned?.personal?.some((id) => id.toString() === user._id.toString()) ? true : false)
            );

            setIsStared(message.stars?.some((id) => id.toString() === user._id.toString()) ? true : false);
          }
    },[])

    const pinMessage = ()=>{
        if(message && user && socket){
            console.log(message,user);
            const messageId = message._id;
            const userId = user._id;
            const pinType = message.group ? 'group' : 'personal';
            socket.emit('pin-message', messageId, userId, pinType);
            setIsPinned(true);
        }else{
            console.error('no sockiet');
        }
    }
    const startMessage = ()=>{
        if(message && user && socket){
            console.log(message,user);
            const messageId = message._id;
            const userId = user._id;
            socket.emit('star-message', messageId, userId);
            setIsStared(true);
        }else{
            console.error('no sockiet');
        }
    }

    return  <div className={`transition-all right-0 shadow-md
        ease bg-white  aspect-1/1 absolute z-50 rounded-full opacity-0 
        flex justify-center items-center
        top-[20px]
        group-hover:opacity-100 group-hover:top-0`}
        >
        <CustomContextMenu showIcon={false} text={<FaAngleDown />}>
            <div className="flex flex-col text-sm gap-1 py-2 px-1 min-w-[150px] right-0">
                <div className={`cursor-pointer flex justify-between items-center p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-primary-light`} data-close-menu={true}>
                  <span>{t('reply')}</span><span><FaReply /></span>
                </div>
                <div onClick={startMessage} className={`cursor-pointer flex justify-between items-center p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-primary-light`} data-close-menu={true}>
                  <span>{t('star')}</span><span>{isStared ? <FaStar className="text-primary"/> : <FaRegStar />}</span>
                </div>
                <div onClick={pinMessage} className={`cursor-pointer flex justify-between items-center p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-primary-light`} data-close-menu={true}>
                  <span>{t('pin')}</span><span>
                    {isPinned ? <MdPushPin className="text-primary"/> : <MdOutlinePushPin />}
                    </span>
                </div>
            </div>
        </CustomContextMenu>
      </div>
}

export default ChatMenu;