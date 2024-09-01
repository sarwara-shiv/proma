// src/components/common/PageSubmenu.tsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavItem {
  link: string;
  title: string;
  icon?: React.ReactNode;
}

interface PageSubmenuProps {
  basePath:string;
  navItems: NavItem[];
}

const PageSubmenu: React.FC<PageSubmenuProps> = ({ basePath, navItems }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname.replace(`${basePath}/`, '');

  return (
    <div className='flex text-xs flex-column'>
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={`${basePath}/${item.link}`}
          className={({ isActive }) =>
            `flex items-center me-2 p-2 rounded-t-md mb-0 hover:bg-primary-light ${isActive && (currentPath === item.link) 
              ? "text-primary border-b-2 border-primary hover:bg-transparent" 
              : "text-gray-700 hover:text-primary "}`
          }
        >
          {item.icon && <span className='icon me-1 p-0'>{item.icon}</span>}
          {t(`NAV.${item.title}`)}
        </NavLink>
      ))}
    </div>
  );
};

export default PageSubmenu;
