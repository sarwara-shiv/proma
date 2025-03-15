import PagesConfig, { PageConfig } from "../../../config/pagesConfig";
import { useAppContext } from "../../../context/AppContext";
import React, { useState } from "react";
import LogoutButton from "../../../components/auth/LogoutButton";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {useAuthContext } from "../../../context/AuthContext";

const AdminSidebar: React.FC = () => {
    const {isSidebarOpen} = useAppContext();
    const {roles, permissions} = useAuthContext();
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const {t} = useTranslation();
    // Check user permissions
    const hasAccess = (page: PageConfig): boolean => {
        const isAdmin = roles.some(d=>d.name === 'admin' || d.name === 'manager');
        if(isAdmin)return true;
        if (page.access?.includes('all')) return true;
        if (permissions) {
            return permissions.some(permission => page.name?.includes(permission.page as string));
        }
        return false;
    };

    const handleToggleSubMenu = (title: string) => {
        setOpenSubMenu(openSubMenu === title ? null : title);
    };

    const navStyles = 'p-1 text-gray-500 hover:bg-primary-light rounded-xs hover:text-gray-800 hover:font-bold hover:bg-primary-light transition-all ease';
    // Sort pages by sortOrder
    const sortedPages = Object.values(PagesConfig).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
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
                                            to={`/admin/${page.root}`}
                                            className={({ isActive }) =>
                                                `flex-1 rounded-lg text-sm flex items-center justify-start ${isActive ? "text-primary font-bold" : "text-gray-400 font-light hover:text-primary"}`
                                            }
                                        >
                                            <span className='icon me-2 w-[20px] h-[20px] rounded-full bg-primary-light p-1'>
                                                {page.icon && <page.icon />}
                                            </span>
                                            {t(`NAV.${page.name}`)}
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

                    <li><LogoutButton /></li>
                </ul>
      </div>
      
      {/* The second div will take the remaining space and scroll if content overflows */}
      <div className="flex-1 overflow-y-auto text-sm bg-white">
       
      </div>
    </aside>
  );
};

export default AdminSidebar;
