import { NavLink, useLocation, useParams } from 'react-router-dom';
import PageTitel from '../../../components/common/PageTitel';
import React, { ReactNode, useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa';
import { MdAdd } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import PageSubmenu from '../../../components/common/PageSubmenu';
import GroupsForm from './components/GroupsForm'
import AllGroups from './components/AllGroups';

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  { link: "groups", title: "userGroups_all", icon: <FaUserTie /> },
  { link: "groups/add", title: "userGroups_add", icon: <MdAdd /> },
];

const UserGroups = () => {
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("userGroups");
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
  useEffect(()=>{

  },[])

  return (
    <div className='page-wrap relative'>
      <header className='border-b border-1 border-slate-200 mt-2 pt-4 fixed mx-auto px-4 left-0 ml-64 right-0 bg-gray-100 top-14'>
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
              action === "add" ? <GroupsForm /> : 
              action ==="update" ? <p>update</p> : <AllGroups />
            }
        </div>
      </div>
    </div>
  );
}

export default UserGroups;
