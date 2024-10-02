import React, { useEffect, useState } from 'react'
import { NavItem } from '@/interfaces'
import PageTitel from '../../../components/common/PageTitel';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AllProjects from './components/AllProjects';
import ProjectsForm from './components/ProjectsForm';
import Tasks from '../tasks/Tasks';
import Kickoff from '../kickoff/Kickoff';
import ProjectDetails from './components/ProjectDetails';
import { IoMdAdd } from 'react-icons/io';
import PageSubmenu from '../../../components/common/PageSubmenu';
import KickoffForm from '../kickoff/components/KickoffForm';

const navItems: NavItem[] = [
  { link: "projects", title: "projects_all" },
  { link: "projects/add", title: "projects_add", icon:<IoMdAdd />},
];

const Project = () => {
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const { data, objectId } = location.state || {}; 
  const [pageTitle, setPageTitle] = useState("projects");
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
  const [subNavItems, setSubNavItems] = useState<NavItem[]>(navItems);

  return (
    <div className='page-wrap relative mt-8'>
      <PageSubmenu basePath={basePath} navItems={subNavItems} title={t(`${pageTitle}`)} action={t(`${action ? action : "all"}`)}/>
      <div className='content py-14  mb-7'>
        <div className='content-wrap p-4 '>
            {
              action && 
              action === "add" ? <ProjectsForm setSubNavItems={setSubNavItems} navItems={navItems}/> : 
              action ==="update" ? <ProjectsForm  data={data} id={objectId as string}  action='update' setSubNavItems={setSubNavItems} navItems={navItems}/> : 
              action ==="tasks" ? <Tasks  data={data} id={objectId as string} setSubNavItems={setSubNavItems}/> : 
              action ==="kickoff" ? <Kickoff  data={data} id={objectId as string} setSubNavItems={setSubNavItems}/> : 
              action ==="kickoff-update" ? <KickoffForm  data={data} id={objectId as string} setSubNavItems={setSubNavItems}/> : 
              action=== "view" && id ? <ProjectDetails setSubNavItems={setSubNavItems} navItems={navItems} id={id} data={data}/>  :
              <AllProjects setSubNavItems={setSubNavItems} navItems={navItems}/>  
            }
        </div>
      </div>
    </div>
  )
}

export default Project 
