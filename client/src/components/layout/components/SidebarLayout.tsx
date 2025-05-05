import PagesConfig, { PageConfig, UserPagesConfig } from "../../../config/pagesConfig";
import { useAppContext } from "../../../context/AppContext";
import React, { useEffect, useState } from "react";
import LogoutButton from "../../../components/auth/LogoutButton";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {useAuthContext } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import { ReactComponent as LogoIcon } from '../../../assets/images/svg/logo-icon.svg';
import { MdLogout } from "react-icons/md";
import { IoChatbubbles } from "react-icons/io5";


const pConfig = {
    "admin" :PagesConfig,
    "user":UserPagesConfig
}

const SidebarLayout: React.FC = () => {
    const {isSidebarOpen, setIsSidebarOpen} = useAppContext();
    const {user, roles, permissions, isAdmin, slug} = useAuthContext();
    const [navPages, setNavPages] = useState<Record<string, PageConfig>>({});
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const [newTasks, setNewTasks] = useState<number>(0);
    const {t} = useTranslation();
    const socket = useSocket();

    useEffect(()=>{
        if(isAdmin){
            setNavPages(PagesConfig);
            console.log('------admin ',PagesConfig);
        }
        if(!isAdmin){
            setNavPages(UserPagesConfig);
            console.log(UserPagesConfig);
        }
    }, [])

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

    useEffect(() => {
        if (socket) {
          // Listen for the 'new-task-assigned' event
          socket.on('new-task-assigned', (task) => {
            console.log('New task assigned:', task);
            let ntasks = newTasks + 1;
            setNewTasks((pre:number)=>{
                return pre +1;
            })
            console.log(newTasks)
            // Show a notification or update the UI
            // alert(`New task assigned: ${task.name}`);
          });
        }else{
            console.log("no socket");
        }
    
        return () => {
          if (socket) {
            socket.off('new-task-assigned'); 
          }
        };
      }, [socket]);

      const handleNewTasks = async(page:PageConfig)=>{
        if(page && page.name === 'mytasks'){
            setNewTasks((prev:number)=>{return 0})
        }
      }

    // Check user permissions
    const hasAccess = (page: PageConfig): boolean => {
        // const isAdmin = roles.some(d=>d.name === 'admin' || d.name === 'manager');
        if(isAdmin) return true;
        if (page.access?.includes('all')) return true;
        if (permissions) {
            return permissions.some(permission => page.name?.includes(permission.page as string));
        }
        return false;
    };

    const handleToggleSubMenu = (title: string) => {
        setOpenSubMenu(openSubMenu === title ? null : title);
    };

    // Sort pages by sortOrder
    const sortedPages = Object.values(navPages).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return (
    <>
    <aside className={`w-[200px] static left-0 top-2 px-2 pt-4 pb-8 bottom-0 flex flex-col transition-all ease duration-100 mb-10 
    rounded-e-3xl 
    bg-primary-light justify-between
    ${isSidebarOpen ? 'ml-[0px]' : 'ml-[-200px]'}
        `}>
        <div className="flex flex-col max-h-full relative h-full">
            {/* Make the list scrollable */}
            <div className="my-2 text-sm my-1 py-1 rounded-md flex-1 overflow-y-auto flex">
            <ul className="space-y-1">
                {sortedPages.map((page, index) => {
                if (hasAccess(page)) {
                    return (
                    <li key={index} className="relative">
                        <div className="flex items-center justify-between p-1">
                        <NavLink
                            to={`/${slug}/${page.root}`}
                            className={({ isActive }) => {
                            return `flex-1 rounded-sm p-1 text-sm flex transition-all ease items-center justify-start ${isActive ? "text-gray-900 font-bold" : "text-gray-400 font-light hover:text-gray-800 hover:font-bold"}`;
                            }}
                            onClick={() => handleNewTasks(page)}
                        >
                            {({ isActive }) => (
                            <>
                                <span className={`icon me-2 w-[20px] h-[20px] rounded-full ${isActive ? 'bg-white' : 'bg-primary-light'} p-1`}>
                                {page.icon ? <page.icon /> : <LogoIcon className="text-gray-400" />}
                                </span>

                                <div className="flex justify-between items-center flex-1">
                                {t(`NAV.${page.name}`)}
                                {newTasks > 0 && page.name === 'mytasks' && 
                                    <span className="right-0 p-[2px] bg-primary rounded-md h-3 flex justify-center items-center text-[10px] aspect-[1/1] text-white font-bold">
                                    {newTasks}
                                    </span>
                                }
                                </div>
                            </>
                            )}
                        </NavLink>

                        {page.subMenu && Object.keys(page.subMenu).length > 0 && (
                            <>
                                <button
                                className="ml-2 flex items-center justify-center w-8 h-4 text-gray-700 hover:text-primary rounded-lg"
                                onClick={() => handleToggleSubMenu(page.name)}
                                >
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${openSubMenu === page.name ? "rotate-180" : "rotate-0"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                                </button>
                                <div className="absolute left-100">
                                {page.subMenu && Object.entries(page.subMenu).map((obj, idx)=>{
                                    console.log(obj[1]);
                                    const data = obj[1];
                                    return (
                                        <div key={idx}>
                                           <NavLink
                                                to={`/${slug}/${page.root}/${data.root}`}
                                                className={({ isActive }) => {
                                                return `flex-1 rounded-sm p-1 text-sm flex transition-all ease items-center justify-start ${isActive ? "text-gray-900 font-bold" : "text-gray-400 font-light hover:text-gray-800 hover:font-bold"}`;
                                                }}
                                                onClick={() => handleNewTasks(page)}
                                            >
                                                {({ isActive }) => (
                                                <>
                                                    <span className={`icon me-2 w-[20px] h-[20px] rounded-full ${isActive ? 'bg-white' : 'bg-primary-light'} p-1`}>
                                                    {data.icon ? <data.icon /> : <LogoIcon className="text-gray-400" />}
                                                    </span>

                                                    <div className="flex justify-between items-center flex-1">
                                                    {t(`NAV.${data.name}`)}
                                                    {newTasks > 0 && page.name === 'mytasks' && 
                                                        <span className="right-0 p-[2px] bg-primary rounded-md h-3 flex justify-center items-center text-[10px] aspect-[1/1] text-white font-bold">
                                                        {newTasks}
                                                        </span>
                                                    }
                                                    </div>
                                                </>
                                                )}
                                            </NavLink>
                                        </div>
                                    )
                                }) }
                                </div>
                            </>
                        )}

                        </div>
                    </li>
                    );
                }
                return null;
                })}
                <li key={'msgn'}>
                    <div className="flex items-center justify-between p-1">
                    <NavLink
                            to={`/messenger`}
                            className={({ isActive }) => {
                            return `flex-1 rounded-sm p-1 text-sm flex transition-all ease items-center justify-start ${isActive ? "text-gray-900 font-bold" : "text-gray-400 font-light hover:text-gray-800 hover:font-bold"}`;
                            }}
                        >
                            {({ isActive }) => (
                            <>
                                <span className={`icon me-2 w-[20px] h-[20px] rounded-full ${isActive ? 'bg-white' : 'bg-primary-light'} p-1`}>
                                <IoChatbubbles />
                                </span>

                                <div className="flex justify-between items-center flex-1">
                                {t(`NAV.messenger`)}
                                
                                </div>
                            </>
                            )}
                        </NavLink>
                    </div>
                </li>
            </ul>
            </div>

            {/* Fixed logout button at the bottom */}
            <div className='absolute -bottom-5 w-full left-0 right-0 text-sm justify-start mr-0 flex items-center gap-2 pl-5 mt-auto'>
                <MdLogout /> <LogoutButton type='link' />
            </div>
        </div>
        </aside>
    </>
  );
};

export default SidebarLayout;
