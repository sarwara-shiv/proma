// src/components/common/PageSubmenu.tsx

import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageTitel from './PageTitel';
import { IoMdAdd } from 'react-icons/io';
import { MdClose, MdMenu } from 'react-icons/md';
import { useAuthContext } from '../../context/AuthContext';

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
  const {slug} = useAuthContext()
  const [navOpen, setNavOpen] = useState(false);
  const currentPath = location.pathname.replace(`${basePath}/`, '');

  useEffect(() => {
    // Function to check screen width and adjust sidebar state
    const handleResize = () => {
        if (window.innerWidth >= 1024) {  
            // Automatically close sidebar for larger screens
            setNavOpen(true);
        } else {
            // Automatically open sidebar for smaller screens
            setNavOpen(false);
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
}, [setNavOpen]); 

  return (
    <header className='border-b z-20 border-none border-slate-200 pt-1 sticky top-0 mx-auto left-0  bg-gray-50 right-0 w-full'>
        <div className=' flex justify-between flex-row w-full  border-b '>
          <div className='px-2  left-0'>
            <PageTitel text={title} action={action} /> 
          </div>
          <div className='flex-1 border-slate-200 w-full flex justify-end '>
            <div className='mr-1 lg:hidden cursor-pointer flex gap-1 bg-gray-100 p-1 items-center rounded-md hover:bg-primary-light' onClick={()=>setNavOpen(!navOpen)}>
              {t('menu')} {navOpen ? <MdClose /> : <MdMenu /> }
            </div>
            <div className={` 
              absolute 
              flex text-xs 
              flex-col
              bg-white
              rounded-md
              shadow-lg
              top-full
              lg:relative 
              lg:flex-row 
              lg:bg-transparent
              lg:rounded-0
              lg:top-auto
              lg:shadow-none
              justify-end flex-wrap 
              ${navOpen ? '' : 'pointer-events-none opacity-0 lg:pointer-events lg:opacity-100'}
              `}
            >
                {navItems.map((item, index) => (
                  <NavLink
                    key={index}
                    to={`/${slug}/${item.link}`}
                    className={({ isActive }) =>
                      `flex items-center me-2 gap-1 p-2 rounded-t-md mb-0 hover:bg-primary-light border-b-2 border-transparent ${isActive 
                        ? "text-primary  border-primary hover:bg-transparent" 
                        : "text-gray-700 hover:text-primary "}`
                    }
                  >
                    {item.icon && <span className='icon text-sm p-0'>{item.icon}</span>}
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
