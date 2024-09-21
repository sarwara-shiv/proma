import { NavLink, useLocation, useParams } from 'react-router-dom';
import PageTitel from '../../../components/common/PageTitel';
import React, { ReactNode, useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa';
import { MdAdd } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import PageSubmenu from '../../../components/common/PageSubmenu';
import UsersForm from './components/UsersForm';
import AllUsers from './components/UsersList';

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  { link: "users", title: "users_all", icon: <FaUserTie /> },
  { link: "users/register", title: "users_add", icon: <MdAdd /> },
];

const Users = () => {
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const { data, objectId } = location.state || {}; 
  const [pageTitle, setPageTitle] = useState("users");
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';

  return (
    <div className='page-wrap relative'>
      <header className='border-b border-1 z-20 border-slate-200 mt-2 pt-4 fixed mx-auto px-4 left-0 ml-64 right-0 bg-gray-100 top-14'>
        <div className='container flex justify-between flex-row mx-auto'>
          <div className='nav-wrap'>
            <PageTitel text={t(`${pageTitle}`)} action={t(`${action ? action : "all"}`)} /> 
          </div>
          <div>
            <PageSubmenu basePath={basePath} navItems={navItems} />
          </div>
        </div>
      </header>
      <div className='content py-14  mb-7'>
        <div className='content-wrap p-4 '>
            {
              action && 
              action === "register" ? <UsersForm /> : 
              action ==="update" ? <UsersForm  data={data} id={objectId as string}  action='update'/> : <AllUsers />  
            }
        </div>
      </div>
    </div>
  );
}

export default Users;
