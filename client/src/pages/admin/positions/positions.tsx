import { useLocation, useParams } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa';
import { MdAdd } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import PageSubmenu from '../../../components/common/PageSubmenu';
import { useAppContext } from '../../../context/AppContext';

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  { link: "users", title: "users_all", icon: <FaUserTie /> },
  { link: "users/register", title: "users_add", icon: <MdAdd /> },
];

const Positions = () => {
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const { data, objectId } = location.state || {}; 
  // const [pageTitle, setPageTitle] = useState("users");
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
  const {pageTitle, setPageTitle} = useAppContext();
  useEffect(()=>{
    setPageTitle(t('positions'))
  },[]);

  return (
    <div className='page-wrap relative'>
      <PageSubmenu basePath={basePath} navItems={navItems} title={t(`${action ? action : "all"}`)}/>
      <div className='content mb-7'>
        <div className='content-wrap p-4 '>
           
        </div>
      </div>
    </div>
  );
}

export default Positions;
