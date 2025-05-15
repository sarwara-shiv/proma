
import Logo from '../../components/common/Logo';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {useAuthContext } from '../../context/AuthContext';
import ToggleDailyReport from '../../components/specific/dailyReport/ToggleDailyReport';
import ActiveWorkLog from './ActiveWorkLog';
import { useSocket } from "../../context/SocketContext";
import { FlashPopupType, INotification } from '@/interfaces';
import { FlashPopup } from '../../components/common';
import HeaderNotifications from './HeaderNotification';
import BurgerToX from '../../components/common/BurgerToX';

const HeaderLayout = () => {
    const { isSidebarOpen, setIsSidebarOpen, pageTitle } = useAppContext();
    const { t } = useTranslation();
    const {user} = useAuthContext();
    const socket = useSocket();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [fpProps, setFpProps] = useState<FlashPopupType>({isOpen:false,type:"info", position:'top-right', message:''})
    // Function to toggle sidebar for small screens
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        if(socket){
            socket.on('send-notification', (payload:INotification) => {
                console.log('🔔 Notification received:', payload);
                setNotifications([...notifications, payload]);
                // setFpProps({...fpProps, isOpen:true, message:`🔔 ${payload.message}`});
                // Optionally show toast, update UI, or route based on `payload.link`
            });
        }
        return () => {
            if (socket) {
              socket.off('new-task-assigned'); 
            }
          };
      }, []);

    // Adjust sidebar state based on screen size
    useEffect(() => {
        // Function to check screen width and adjust sidebar state
        const handleResize = () => {
            if (window.innerWidth >= 640) {  
                // Automatically close sidebar for larger screens
                setIsSidebarOpen(true);
            } else {
                // Automatically open sidebar for smaller screens
                setIsSidebarOpen(false);
            }
        };

        // Initial check on component mount
        handleResize();

        // Add event listener to handle resize
        window.addEventListener("resize", handleResize);

        // Cleanup event listener when the component unmounts
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [setIsSidebarOpen]); 
    return (
        <header className="text-gray-900 w-full px-4 py-1 mb-2 w-full top-1 left-0 right-0 z-30 flex justify-between ">
            <div className="text-lg font-semibold flex justify-start gap-2 items-center">
                <button
                    onClick={toggleSidebar}
                    className={`mt-0 text-parimary-dark  flex justify-center items-center py-0 text-3xl bg-white
                        rounded-sm hover:bg-primary-dark hover:text-white transition-colors duration-200 font-800
                        `}
                >
                    {/* {isSidebarOpen ? <MdClose /> : <MdMenu /> } */}
                    
                </button>
                <BurgerToX initialState={isSidebarOpen} size={35} onClick={()=>setIsSidebarOpen(!isSidebarOpen)}/>
                <Logo />

                <div className='border-l-2 border-slate-400 ml-2 pl-4 font-bold text-2xl text-slate-700'>
                    {pageTitle}
                </div>
            </div>
            

            <div className="text-sm flex gap-4 items-center">
                <div>
                    <ToggleDailyReport />
                </div>
                <ActiveWorkLog />
                <div>
                    <span className="text-primary font-bold">{t('hello')} </span>
                    {user?.username && <>{user.username}</>}
                </div> 
                <HeaderNotifications notifications={notifications}/>
            </div>
            <FlashPopup 
                isOpen={fpProps.isOpen}
                message={fpProps.message}
                type={fpProps.type}
                position={fpProps.position}
                onClose={()=>{setFpProps({...fpProps, isOpen:false})}}
            />
        </header>
    )
}

export default HeaderLayout