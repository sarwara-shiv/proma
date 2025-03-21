import { useAppContext } from "../../../context/AppContext";
import React, { useEffect, useState } from "react";
import LogoutButton from "../../../components/auth/LogoutButton";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPagesConfig, UserPageConfig } from "../../../config/userPagesConfig";
import {useAuthContext } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import { ReactComponent as LogoIcon } from '../../../assets/images/svg/logo-icon.svg';

const UserSidebar: React.FC = () => {
    const {isSidebarOpen} = useAppContext();
    const { permissions, role } = useAuthContext();
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const {t} = useTranslation();
    const socket = useSocket();
    const [newTasks, setNewTasks] = useState<number>(0);
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

      const handleNewTasks = async(page:UserPageConfig)=>{
        if(page && page.name === 'mytasks'){
            setNewTasks((prev:number)=>{return 0})
        }
      }

    // Check user permissions
    const hasAccess = (page: UserPageConfig): boolean => {
        console.log(permissions);
        if (permissions) {
            const hasPermission =  permissions.some(permission => 
                page.name?.includes(permission.page as string)
            );

            const hasNavAccess = page.nav && page.nav.length > 0 ? page.nav.includes('all') || page.nav.includes(role as string): true;

            return hasPermission && hasNavAccess;
        }
        return false;
    };

    const handleToggleSubMenu = (title: string) => {
        setOpenSubMenu(openSubMenu === title ? null : title);
    };

    const navStyles = 'p-1 text-gray-500 hover:bg-primary-light rounded-xs hover:text-gray-800 hover:font-bold hover:bg-primary-light transition-all ease';
    // Sort pages by sortOrder
    const sortedPages = Object.values(UserPagesConfig).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return (
    <aside className={`w-[200px] fixed left-0 top-11 px-2 pt-4 py-8 bottom-4 flexflex-col transition-all ease duration-100 bg-white
        ${isSidebarOpen ? 'ml-[0px]' : 'ml-[-200px]'}
    `}>
      {/* <div className="mb-2 text-lg font-bold">
        Menu
      </div> */}
      <div className="my-2 text-sm  my-1 py-1 bg-white rounded-md">
        <ul className="space-y-2">
            {sortedPages.map((page, index) => {
                if (hasAccess(page)) {
                    return (
                        <li key={index} className="relative">
                            <div className="flex items-center justify-between p-1">
                            <NavLink
                                    to={`/user/${page.root}`}
                                        className={({ isActive }) =>{
                                            return  `flex-1 rounded-sm p-1 text-sm flex transition-all ease items-center justify-start ${isActive ? "text-primary font-bold bg-gray-200/50" : "text-gray-400 font-light hover:text-primary hover:bg-gray-200/50"}`
                                        }
                                    }
                                    onClick={()=>handleNewTasks(page)}
                                >
                                    <span className='icon me-2 w-[20px] h-[20px] rounded-full bg-primary-light p-1'>
                                        {page.icon ? <page.icon /> : <LogoIcon className="text-gray-400" />} 
                                    </span>
                                    <div className="flex justify-between items-center flex-1">
                                        {t(`NAV.${page.name}`)}
                                        {newTasks > 0 && page.name === 'mytasks' && 
                                        <span className="
                                             right-0 p-[2px] bg-primary rounded-md h-3 flex justify-center items-center text-[10px] aspect-[1/1] text-white font-bold
                                        ">
                                            {newTasks}
                                            </span>
                                        }
                                    </div>
                                </NavLink>

                                {page.subMenu && Object.keys(page.subMenu).length > 0 && (
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
                                )}
                            </div>
                        </li>
                    );
                }
                return null;
            })}

            {/* <li><LogoutButton /></li> */}
        </ul>
      </div>
      
      {/* The second div will take the remaining space and scroll if content overflows */}
      <div className="flex-1 overflow-y-auto text-sm bg-white">
       
      </div>
    </aside>
  );
};

export default UserSidebar;
