import {  useLocation, useParams } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { IoPlay, IoTimerOutline } from "react-icons/io5";
import { useTranslation } from 'react-i18next';
import PageSubmenu from '../../../components/common/PageSubmenu';
import AllMyTasks from './components/AllMyTasks';
import WorkLog from './components/WorkLog';

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  { link: "mytasks/worklog", title: "worklog", icon: <IoTimerOutline /> },
  { link: "mytasks", title: "myTasks_all", icon: <IoPlay /> },
];

const MyTasks = () => {
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("My Tasks");
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
 
  return (
    <div className='page-wrap relative'>
      <PageSubmenu basePath={basePath} navItems={navItems} title={t(`${pageTitle}`)} action={t(`${action ? action : "all"}`)}/>
      <div className='content mb-7'>
        <div className='content-wrap p-4 '>
            {
              action && 
              action ==="worklog" ? <WorkLog />   : <AllMyTasks />  
            //   action ==="update" ? <MyTasks  data={data} id={objectId as string}  action='update'/> : <AllMyTasks />  
            }
        </div>
      </div>
    </div>
  );
}

export default MyTasks;
