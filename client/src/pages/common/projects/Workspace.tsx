import React, { useState } from 'react'
import { NavItem } from '@/interfaces'
import PageTitel from '../../../components/common/PageTitel';
import PageSubmenu from '../../../components/common/PageSubmenu';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AllProjects from './components/AllProjects';
import ProjectsForm from './components/ProjectsForm';

const navItems: NavItem[] = [
  { link: "projects", title: "projects_all" },
  { link: "projects/add", title: "projects_add" },
  { link: "projects/kickoff", title: "kickoff" },
  { link: "projects/tasks/all", title: "tasks_all" },
  { link: "projects/tasks/add", title: "tasks_add" },
];

const Project = () => {
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const { data, objectId } = location.state || {}; 
  const [pageTitle, setPageTitle] = useState("projects");
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';


  return (
    <div className='page-wrap relative mt-8'>
      <PageSubmenu basePath={basePath} navItems={navItems} title={t(`${pageTitle}`)} action={t(`${action ? action : "all"}`)}/>
      <div className='content py-14  mb-7'>
        <div className='content-wrap p-4 '>
            {
              action && 
              action === "add" ? <ProjectsForm /> : 
              action ==="update" ? <ProjectsForm  data={data} id={objectId as string}  action='update'/> : <AllProjects />  
            }
        </div>
      </div>
    </div>
  )
}

export default Project 
