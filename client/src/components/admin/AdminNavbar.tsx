import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface SubMenuItem {
  link: string;
  title: string;
  type: string;
}

interface NavItem {
  link: string;
  title: string;
  subMenu?: SubMenuItem[];
}

const navItems: NavItem[] = [
  { link: "roles", title: "roles", subMenu: [{ link: "add", title: "roles_add", type: "add" }] },
  { link: "users", title: "users", subMenu: [{ link: "add", title: "users_add", type: "add" }] },
  { link: "workspace", title: "workspace", subMenu: [] },
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
                <Link
                  to={`/admin/${item.link}`}
                  className="flex-1 text-gray-700 hover:text-primary rounded-lg"
                >
                  {t(`NAV.${item.title}`)}
                </Link>
                
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
                      <Link
                        to={`/admin/${item.link}/${subItem.link}`}
                        className="flex items-center p-1 text-sm text-gray-700 hover:text-primary rounded-lg"
                      >
                        {t(`NAV.${subItem.title}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminNavbar;
