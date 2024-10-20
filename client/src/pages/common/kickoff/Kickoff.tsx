import React, { useEffect, useState } from 'react'
import { NavItem, Project } from '@/interfaces'
import PageTitel from '../../../components/common/PageTitel';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import KickoffForm from './components/KickoffForm';
import { IoMdAdd } from 'react-icons/io';
import PageSubmenu from '../../../components/common/PageSubmenu';
import NoData from '../../../components/common/NoData';
import KickoffDetail from './components/KickoffDetail';
import { IoPencil } from 'react-icons/io5';
import { FaEye, FaRegEdit } from 'react-icons/fa';
import CustomIconButton from '../../../components/common/CustomIconButton';
import { MdOutlineInstallDesktop, MdRocketLaunch } from 'react-icons/md';
interface ArgsType {
    cid?:string | null;
    data?: Project; 
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>; 
    checkDataBy?:string[];
}

const Kickoff:React.FC<ArgsType> = ({cid, data, checkDataBy, setSubNavItems}) => {
  const {t} = useTranslation();
  const {id, action} = useParams();
  const [pageTitle, setPageTitle] = useState("kickOff");
  const [pageType, setPageType] = useState<string>('view');
  const location = useLocation();
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';

  const subNavItems: NavItem[] = [
    { link: "projects", title: "projects_all", icon:<MdOutlineInstallDesktop/> },
    { link: `projects/kickoff/${cid || id}`, title: "kickoff", icon:<MdRocketLaunch /> },
    { link: `projects/kickoff-update/${cid || id}`, title: "kickoff_update" },
    { link: `projects/maintasks/${cid || id}`, title: "tasks" },
  ];

  console.log(useLocation)
    useEffect(()=>{
      setSubNavItems && setSubNavItems(subNavItems);
    }, []);

  return (
    <>
    <div>

      <CustomIconButton 
        text={`${pageType === 'view' ? t('NAV.update') : t('NAV.view')}`}
        icon={pageType === 'view' ? <FaRegEdit /> : <FaEye />}
        onClick={() => setPageType(pageType === 'view' ? 'update' : 'view')}
        />
    </div>


        <div
          className={` hidden
            cursor-pointer
            fixed bottom-[1em] right-[1em] h-[50px]
            text-2xl shadow-md rounded-full z-50
            flex items-center justify-start gap-2
            bg-primary-light text-primary
            border border-white
            transition-all duration-300 ease-in-out
            overflow-hidden
            w-[50px] hover:w-[150px]     // Default and expanded width
            hover:bg-primary hover:text-white hover:shadow-sm
          `}
          onClick={() => setPageType(pageType === 'view' ? 'update' : 'view')}
        >
          <div className="flex items-center pl-2">
            {/* Icon */}
            {pageType === 'view' ? <FaRegEdit /> : <FaEye />}
          </div>

          {/* Text with hover effect */}
          <span
            className={` 
              whitespace-nowrap
              opacity-0 transition-opacity duration-50
              ml-2
              ${'hover:opacity-100'}     // Show text on hover
            `}
          >
            {pageType === 'view' ? t('NAV.update') : t('NAV.view')}
          </span>
        </div>


      {
          pageType && 
          pageType === "add" ? <KickoffForm data={data} cid={cid} setSubNavItems={setSubNavItems}/> : 
          pageType === "update" ? <KickoffForm data={data} cid={cid} setSubNavItems={setSubNavItems}/> :
          data && data.kickoff ? <KickoffDetail data={data} cid={cid} setSubNavItems={setSubNavItems}/>: 
          <>
          <KickoffDetail data={data} cid={cid}/>
          </>
        }
    </>
  )
}

export default Kickoff
