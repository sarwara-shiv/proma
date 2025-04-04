import { NavLink, useLocation, useParams } from 'react-router-dom';
import PageTitel from '../../../components/common/PageTitel';
import React, { ReactNode, useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa';
import { MdAdd } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import PageSubmenu from '../../../components/common/PageSubmenu';
import RolesForm from './components/RolesForm';
import AllRoles from './components/AllRoles';
import { ObjectId } from 'mongodb';
import { useAppContext } from '../../../context/AppContext';

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  { link: "roles", title: "roles_all", icon: <FaUserTie /> },
  { link: "roles/add", title: "roles_add", icon: <MdAdd /> },
];

const UserRoles = () => {
  const {pageTitle, setPageTitle} = useAppContext();
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  // const [pageTitle, setPageTitle] = useState("roles");
  const {pathname} = location;
  const { data, objectId } = location.state || {}; 
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
  useEffect(()=>{ 
    setPageTitle(t('roles'));
  },[])

  return (
    <div className='page-wrap relative '>
       {/* <PageSubmenu basePath={basePath} navItems={navItems} title={t(`${action ? action : "all"}`)}/> */}
       <PageSubmenu basePath={basePath} navItems={navItems} title={t(`${action ? action : "all"}`)}/>
      <div className='content mb-7'>
        <div className='content-wrap p-4 '> 
            {
              action && 
              action === "add" ? <RolesForm /> : 
              action ==="update" ? <RolesForm  data={data} id={objectId as string} action='update'/> : <AllRoles />
            }
        </div>
      </div>
    </div>
  );
}

export default UserRoles;
