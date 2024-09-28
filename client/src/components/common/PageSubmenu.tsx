// src/components/common/PageSubmenu.tsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageTitel from './PageTitel';
import { IoMdAdd } from 'react-icons/io';

interface NavItem {
  link: string;
  title: string;
  icon?: React.ReactNode;
}

interface PageSubmenuProps {
  title:string;
  action?:string;
  basePath:string;
  navItems: NavItem[]; 
}

const PageSubmenu: React.FC<PageSubmenuProps> = ({ basePath, navItems, title, action }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname.replace(`${basePath}/`, '');

  return (
    <header className='border-b z-20 border-none border-slate-200 mt-2 pt-4 fixed mx-auto px-4 left-0 ml-64 right-0 bg-gray-50 top-14'>
        <div className='container flex justify-between flex-col mx-auto'>
          <div className='nav-wrap'>
            <PageTitel text={title} action={action} /> 
          </div>
          <div>
          <div className='flex text-xs flex-row justify-end border-b border-slate-200'>
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
                  {item.icon && <span className='icon me-1/50 text-[15px] p-0'>{item.icon}</span>}
                  {!item.icon && item.title.toLowerCase().indexOf("add") !== -1 && <span className='icon me-1/50 text-[15px] p-0'><IoMdAdd /></span>}
                  {t(`NAV.${item.title}`)}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </header>

    
  );
};

export default PageSubmenu;
