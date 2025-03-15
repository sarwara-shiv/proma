import { NavLink, useLocation, useParams } from 'react-router-dom';
import PageTitel from '../../../../components/common/PageTitel';
import React, { ReactNode, useEffect, useState } from 'react';
import { IoPlay, IoPauseSharp } from "react-icons/io5";
import { MdAdd } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import PageSubmenu from '../../../../components/common/PageSubmenu';
import {useAuthContext } from '../../../../context/AuthContext';

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  { link: "mytasks", title: "mytasks", icon: <IoPlay /> },
];

const ActiveTask = () => {
  const {user} = useAuthContext();
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const { data, objectId } = location.state || {}; 
  const [pageTitle, setPageTitle] = useState("users");
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
  return (
    <div className='page-wrap relative'>
      <div className='content mb-7'>
        <div className='content-wrap p-4 '>
           
        </div>
      </div>
    </div>
  );
}

export default ActiveTask;
