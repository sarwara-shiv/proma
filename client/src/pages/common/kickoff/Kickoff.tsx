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
interface ArgsType {
    id?:string | null;
    data?: Project; 
    setSubNavItems: React.Dispatch<React.SetStateAction<any>>; 
    checkDataBy?:string[];
}
const subNavItems: NavItem[] = [
    { link: "projects", title: "projects_all" },
    { link: "projects/kickoff", title: "kickoff" },
    { link: "projects/tasks/all", title: "tasks_all" },
  ];
const Kickoff:React.FC<ArgsType> = ({id, data, checkDataBy, setSubNavItems}) => {
  const {t} = useTranslation();
  const {action} = useParams();
  const [pageTitle, setPageTitle] = useState("kickOff");
  const [pageType, setPageType] = useState<string>('view');
  const location = useLocation();
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';

  console.log(useLocation)
    useEffect(()=>{
        setSubNavItems(subNavItems);
    }, []);

  return (
    <>
      {
          pageType && 
          pageType === "add" ? <KickoffForm setSubNavItems={setSubNavItems} navItems={subNavItems}/> : 
          pageType === "update" ? <KickoffForm setSubNavItems={setSubNavItems} navItems={subNavItems}/> :
          data && data.kickoff ? <KickoffDetail data={data} id={id}/>: 
          <>
          <KickoffDetail data={data} id={id}/>
          <NoData content='' >
            <div className='btn btn-outline' onClick={()=>setPageType('add')}>Add Kick-Off Data</div> 
          </NoData>

          
          </>
        }
    </>
  )
}

export default Kickoff
