import React, { ReactNode, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router-dom";
import {FaUsers, FaUserTie} from 'react-icons/fa';
import { MdOutlineInstallDesktop } from "react-icons/md";
import LogoutButton from '../auth/LogoutButton';


interface SubMenuItem {
  link: string;
  title: string;
  type: string;
}

interface NavItem {
  link: string;
  title: string;
  icon? :ReactNode;
  subMenu?: SubMenuItem[];
}

const navItems: NavItem[] = [
  { link: "roles", title: "roles", icon: <FaUserTie />, subMenu: [] },
  { link: "users", title: "users", icon: <FaUsers />, subMenu: [] },
  { link: "workspace", title: "workspace", icon:<MdOutlineInstallDesktop />, subMenu: [] },
];

const AdminNavbar = () => {
  const { t } = useTranslation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleToggleSubMenu = (title: string) => {
    setOpenSubMenu(openSubMenu === title ? null : title);
  };

  return (
    <div className="w-64 bg-white text-gray-700 max-h-[60vh] overflow-auto shadow-xs">
      <nav className="flex flex-col p-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={index} className="relative">
                <div className="flex items-center justify-between p-1">
                <NavLink
                  to={`/admin/${item.link}`}
                  className={({ isActive }) =>
                    `flex-1 rounded-lg flex items-center justify-start  ${isActive ? "text-primary " : "text-gray-700 hover:text-primary "}`
                  }
                >
                  <span className='icon me-2 rounded-full bg-primary-light p-1'>{item.icon}</span> {t(`NAV.${item.title}`)}
                </NavLink>
                
                {item.subMenu && item.subMenu.length > 0 && (
                  <button
                    className="ml-2 flex items-center justify-center w-8 h-4 text-gray-700 hover:text-primary rounded-lg"
                    onClick={() => handleToggleSubMenu(item.title)}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${openSubMenu === item.title ? "rotate-180" : "rotate-0"}`}
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
              {item.subMenu && openSubMenu === item.title && (
                <ul className="space-y-1 pl-2 mt-1 bg-gray-200 rounded-md"> 
                  {item.subMenu.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <NavLink
                        to={`/admin/${item.link}/${subItem.link}`}
                        className={({ isActive }) =>
                          `flex items-center p-1 text-sm rounded-lg ${isActive ? "text-primary font-semibold" : "text-gray-700 hover:text-primary"}`
                        }
                      >
                        {t(`NAV.${subItem.title}`)}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li> <LogoutButton /> </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminNavbar;
