import { INotification } from "@/interfaces"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { FaBell } from "react-icons/fa";

interface ArgsType {
    notifications:INotification[]
}
const HeaderNotifications:React.FC<ArgsType> = ({notifications})=>{
    const notificationRef = useRef<HTMLDivElement | null>(null);
    const {t} = useTranslation();
    const [isNotOpen, setIsNotOpen] = useState<boolean>(false);

    useEffect(()=>{
        const handleClickOutside = (e:MouseEvent)=>{
            if(notificationRef.current && !notificationRef.current.contains(e.target as Node)){
                setIsNotOpen(false)
            }
        }

        if(isNotOpen){
            document.addEventListener('mousedown', handleClickOutside);
        }

        return ()=>{
            document.removeEventListener('mousedown', handleClickOutside);
        }

    },[isNotOpen])

    return (
        <div className='relative' ref={notificationRef}>
            <div className={`relative
                bg-slate-200 p-2 rounded-full cursor-pointer 

            `}
            onClick={()=>setIsNotOpen(!isNotOpen)}
            >
                <FaBell className={` ${notifications && notifications.length > 0 ? 'animate-ring-infinite' : 'hover:animate-ring' } delay-2 `}/>
                {notifications && notifications.length > 0 && 
                    <div className='
                        text-[10px] absolute font-semibold -top-1 -right-2 bg-primary text-white min-w-4 h-4
                        flex justify-center items-center rounded-full
                    '>
                        {notifications.length}
                    </div> 
                }
            </div>
            <div className={`
                    absolute min-w-[250px]
                    max-w-[350px]
                    overflow-y-auto
                    card
                    right-0 rounded-md z-50
                    p-4 bg-white 
                    max-h-[300px]
                    transition-all
                    duration-700
                    ${isNotOpen ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}
                `}>
                    {notifications && notifications.length > 0 ?
                        <div className='flex flex-col gap-2'>
                        {notifications.map((not, idx)=>{return(
                            <div key={idx} className='text-xs p-2 border rounded-md bg-yellow-100/50'>
                                {not.message}
                            </div>
                        )})}
                        </div>
                        :
                        <div className="flex justify-center text-red-400 text-sm font-semibold">
                           🙁 {t('noNewNotification')}
                        </div>
                    }
            </div>
        </div>
    )
}
export default HeaderNotifications