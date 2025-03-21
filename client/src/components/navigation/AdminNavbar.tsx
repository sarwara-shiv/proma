import { useEffect, useState } from 'react';
import PagesConfig, { PageConfig } from '../../config/pagesConfig';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LogoutButton from '../auth/LogoutButton';
import {useAuthContext } from '../../context/AuthContext';
import { useSocket } from '@/context/SocketContext';

const AdminNavbar = () => {
    const { t } = useTranslation();
    const { permissions, roles } = useAuthContext();
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

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


    // Toggle submenu
    const handleToggleSubMenu = (title: string) => {
        setOpenSubMenu(openSubMenu === title ? null : title);
    };

    // Sort pages by sortOrder
    const sortedPages = Object.values(PagesConfig).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return (
        <div className="w-full text-gray-200 max-h-[60vh] overflow-auto shadow-xs">
            <nav className="flex flex-col p-4">
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
            </nav>
        </div>
    );
};

export default AdminNavbar;
