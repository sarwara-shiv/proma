import { NavLink, useLocation, useParams } from 'react-router-dom';
import PageTitel from '../../../components/common/PageTitel';
import React, { ReactNode, useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa';
import { MdAdd } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import GroupsForm from './components/GroupsForm';
import AllGroups from './components/AllGroups';
import { ObjectId } from 'mongodb';
import PageSubmenu  from '../../../components/common/PageSubmenu';
import { useAppContext } from '../../../context/AppContext';

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  { link: "groups", title: "groups_all", icon: <FaUserTie /> },
  { link: "groups/add", title: "groups_add", icon: <MdAdd /> },
];

const UserGroups = () => {
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  // const [pageTitle, setPageTitle] = useState("roles");
  const {pathname} = location;
  const { data, objectId } = location.state || {}; 
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
  const {pageTitle, setPageTitle} = useAppContext();
  useEffect(()=>{
    setPageTitle(t('userGroups'))
  },[]);

  return (
    <div className='page-wrap relative '>
       <PageSubmenu basePath={basePath} navItems={navItems} title={t(`${action ? action : "all"}`)}/>
      <div className='content mb-7'>
        <div className='content-wrap p-4 '> 
            {
              action && 
              action === "add" ? <GroupsForm /> : 
              action ==="update" ? <GroupsForm  data={data} id={objectId as string} action='update'/> : <AllGroups />
            }
        </div>
      </div>
    </div>
  );
}

export default UserGroups;
