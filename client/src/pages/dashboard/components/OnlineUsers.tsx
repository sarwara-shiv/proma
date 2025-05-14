import { setOnlineUsers } from "@/features/chat/chatSlice";
import { getUsers } from "../../../hooks/dbHooks";
import { User } from "@/interfaces";
import React, { useEffect, useState } from "react";
import { Headings, ImageIcon } from "../../../components/common";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { MdRefresh } from "react-icons/md";
import { useSocket } from "../../../context/SocketContext";

interface ArgsType{
    online?:boolean;
    client?:boolean;
    orderby?:string;
}
const OnlineUsers:React.FC<ArgsType> = ({online=false, client=false, orderby="isOnline"})=>{
    const [usersData, setUsersData] = useState<User[]>([]);
    const [newLogin, setNewLogin] = useState<number>(0);
    const {t} = useTranslation();
    const socket = useSocket();

    useEffect(() => {
      if(socket){
          socket.on('user-loggedin', (payload:any) => {
              setNewLogin((prev)=>prev+1);
          });
          socket.on('user-loggedout', (payload:any) => {
              console.log('🔔 stopped:', payload);
              setNewLogin((prev)=>prev-1);
          });
      }
      return () => {
          if (socket) {
            socket.off('user-loggedin'); 
            socket.off('user-loggedout');  
          }
        };
    }, []);

    useEffect(()=>{
        getUsersData();
    },[newLogin])

    const getUsersData = async()=>{
        try{
            const res = await getUsers({orderby, online, client});
            if(res.data ){
                setUsersData(res.data);
                const lUsers = res.data.filter((user:User)=>user.isOnline);
                setNewLogin((prev)=>lUsers.length)
            }
        }catch(err){
            console.error(err);
        }
    }

    return (
        <div>
            <div className='mb-3 flex justify-between gap-1 items-center'>
                <Headings text={t('users')} type='section' />
                <div className="text-lg transition-all ">
                    <MdRefresh className="cursor-pointer transition-all hover:rotate-90" onClick={getUsersData}/>
                </div>
            </div> 
            <div className="max-h-[calc(100dvh_-_190px)] overflow-y-auto ">
                {usersData && usersData.length > 0 && usersData.map((user, idx)=>{
                    return(
                        <div key={`${idx}-${user._id}`} className="relative flex justify-between text-sm gap-1 p-1 text-slate-600 items-center bg-gray-100 mb-2 rounded-md">
                            <div className="flex justify-start items-center gap-1">
                                <div className="">
                                    {user.image && 
                                        <ImageIcon image={user.image} title={user.name || ''} fullImageLink={true}/>
                                    }
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold">{user.name}</span>
                                    <span className="italic text-[10px]">
                                        {user.isOnline && 
                                            <>{user.onlineTimestamp?.startTime && format(user.onlineTimestamp?.startTime, 'dd.MM.yyyy HH:ii')}</>
                                        }
                                        {!user.isOnline && 
                                            <>{user.onlineTimestamp?.endTime && format(user.onlineTimestamp?.endTime, 'dd.MM.yyyy HH:ii')}</>
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className={` absolute left-0 top-0 w-3 h-3 border-2 border-white shadow rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-red-400'}`}>

                            </div>
                        </div>
                    )})
                }
            </div>
        </div>
    )
}

export default OnlineUsers;

function userEffect(arg0: () => void, arg1: never[]) {
    throw new Error("Function not implemented.");
}
