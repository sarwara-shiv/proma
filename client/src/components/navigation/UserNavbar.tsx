import React, { useState } from 'react';
import PagesConfig, { PageConfig } from '../../config/pagesConfig';
import { useAuth } from '../../hooks/useAuth';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LogoutButton from '../auth/LogoutButton';

const UserNavbar = () => {
    const { t } = useTranslation();
    const { user, permissions } = useAuth();
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    // Check user permissions
    const hasAccess = (page: PageConfig): boolean => {
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
        <div className="w-64 bg-white text-gray-700 max-h-[60vh] overflow-auto shadow-xs">
            <nav className="flex flex-col p-4">
                <ul className="space-y-2">
                    {sortedPages.map((page, index) => {
                        if (hasAccess(page)) {
                            return (
                                <li key={index} className="relative">
                                    <div className="flex items-center justify-between p-1">
                                        <NavLink
                                            to={`/user/${page.root}`}
                                            className={({ isActive }) =>
                                                `flex-1 rounded-lg flex items-center justify-start ${isActive ? "text-primary" : "text-gray-700 hover:text-primary"}`
                                            }
                                        >
                                            <span className='icon me-2 rounded-full bg-primary-light p-1'>
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

export default UserNavbar;
