import { PageSubmenu } from '../../../components/common';
import { MainTask, NavItem } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { IoMdAdd } from 'react-icons/io';
import { useLocation, useParams } from 'react-router-dom';
import MainTasksAll from './components/MainTasksAll';
import MainTaskForm from './components/MainTaskForm';
import Tasks from './components/Tasks';
const navItems: NavItem[] = [
    { link: "maintasks", title: "maintasks_all" },
    { link: "maintasks/add", title: "maintasks_add", icon:<IoMdAdd />},
];
const MainTasks = () => {
    const {action, id} = useParams();
    const { t } = useTranslation();
    const location = useLocation();
    const { data, objectId, pid } = location.state || {}; 
    const [pageTitle, setPageTitle] = useState("maintasks");
    const {pathname} = location;
    const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
    const [subNavItems, setSubNavItems] = useState<NavItem[]>(navItems);
  


    return (
        <div className='page-wrap relative mt-8'>
        <PageSubmenu basePath={basePath} navItems={subNavItems} title={t(`${pageTitle}`)} action={t(`${action ? action : "all"}`)}/>
        <div className='content py-14  mb-7'>
            <div className='content-wrap p-4 '>
                {action && 
                    action === 'update' ? <MainTaskForm  mainTask={data} action='update' pid={pid} setSubNavItems={setSubNavItems}/>:
                    action === 'add' ? <MainTaskForm  action='add' pid={pid} setSubNavItems={setSubNavItems}/>:
                    action === 'tasks' ? <Tasks  action='add' pid={pid} mtid={id}  setSubNavItems={setSubNavItems}/>:  
                    <MainTasksAll  setSubNavItems={setSubNavItems}/>
                }
            </div>
        </div>
        </div>
    )
}

export default MainTasks
