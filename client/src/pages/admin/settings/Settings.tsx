import { useLocation, useParams } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa';
import { MdAdd } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import PageSubmenu from '../../../components/common/PageSubmenu';
import { useAppContext } from '../../../context/AppContext';
import OpeningHours from './OpeningHours';

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  { link: "users", title: "users_all", icon: <FaUserTie /> },
  { link: "users/add", title: "users_add", icon: <MdAdd /> },
];

const Settings = () => {
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const { data, objectId } = location.state || {}; 
  // const [pageTitle, setPageTitle] = useState("users");
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
  const {pageTitle, setPageTitle} = useAppContext();
  useEffect(()=>{
    setPageTitle(t('settings'))
  },[]);

  return (
    <div className='page-wrap relative'>
      <PageSubmenu basePath={basePath} navItems={navItems} title={t(`${action ? action : "all"}`)}/>
      <div className='content mb-7'>
        <div className='content-wrap p-4 '>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
                <div className='card'>
                    <OpeningHours />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
