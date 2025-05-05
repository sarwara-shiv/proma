import React, { useEffect, useState } from 'react'
import { NavItem } from '@/interfaces'
import PageTitel from '../../../components/common/PageTitel';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AllProjects from './components/AllProjects';
import ProjectsForm from './components/ProjectsForm';
import Kickoff from '../kickoff/Kickoff';
import ProjectDetails from './components/ProjectDetails';
import { IoMdAdd } from 'react-icons/io';
import PageSubmenu from '../../../components/common/PageSubmenu';
import KickoffForm from '../kickoff/components/KickoffForm';
import MainTasksProject from '../tasks/components/MaintTasksProject';
import ProjectDocumentations from '../documentation/components/ProjectDocumentations';
import DocumentationsForm from '../documentation/components/DocumentationsForm';
import Documentation from '../documentation/Documentation';
import ProjectReport from './components/ProjectReport';
import { useAppContext } from '../../../context/AppContext';
import Sprints from '../Scrum/Sprints';
import { useAuthContext } from '../../../context/AuthContext';
import { FaEye, FaPencilAlt, FaTasks } from 'react-icons/fa';
import { MdRocketLaunch } from 'react-icons/md';
import { DiScrum } from 'react-icons/di';
import { IoDocumentAttach } from 'react-icons/io5';




const Project = () => {
  const {action, id} = useParams();
  const { t } = useTranslation();
  const {slug} = useAuthContext();
  const location = useLocation();
  const { data, objectId } = location.state || {}; 
  const navItems: NavItem[] = [
    { link: `/${slug}/projects`, title: "projects_all" },
    { link: `/${slug}/projects/add`, title: "projects_add", icon:<IoMdAdd />},
    // { link: "projects/report", title: "projects_report", icon:<IoMdAdd />},
  ];
  
  // const [pageTitle, setPageTitle] = useState("projects");
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
  const [subNavItems, setSubNavItems] = useState<NavItem[]>(navItems);

  const PnavItems: NavItem[] = [
    { link: `/${slug}/projects/view/${id}`, title: "view", icon:<FaEye />},
    { link: `/${slug}/projects/update/${id}`, title: "update", icon:<FaPencilAlt />},
    { link: `/${slug}/projects/maintasks/${id}`, title: "maintasks", icon:<FaTasks />},
    { link: `/${slug}/projects/kickoff/${id}`, title: "kickOff", icon:<MdRocketLaunch />},
    { link: `/${slug}/projects/sprints/${id}`, title: "sprints", icon:<DiScrum />}, 
    { link: `/${slug}/projects/documentation/${id}`, title: "documentation", icon:<IoDocumentAttach />},
    { link: `/${slug}/projects/add`, title: "projects_add", icon:<IoMdAdd />},
  ];

  // console.log(action);
  const {pageTitle, setPageTitle} = useAppContext();
    useEffect(()=>{
      setPageTitle(t('projects'))
    },[]);

  return (
    <div className='page-wrap relative'>
      <PageSubmenu basePath={basePath} navItems={subNavItems} title={t(`${action ? action : "all"}`)}/>
      <div className='content mb-7'>
        <div className='content-wrap p-4 '>
            {
              action && 
              action === "add" ? <ProjectsForm setSubNavItems={setSubNavItems} action="add" navItems={navItems}/> : 
              action ==="update" ? <ProjectsForm cid={objectId as string}  action='update' setSubNavItems={setSubNavItems} navItems={PnavItems}/> : 
              action ==="maintasks" ? <MainTasksProject  data={data} cid={objectId as string} setSubNavItems={setSubNavItems} navItems={PnavItems}/> : 
              action ==="sprints" ? <Sprints  data={data} cid={objectId as string} setSubNavItems={setSubNavItems} /> : 
              action ==="kickoff" ? <Kickoff  data={data} cid={objectId as string} setSubNavItems={setSubNavItems} /> : 
              action ==="kickoff-update" ? <KickoffForm  data={data} cid={objectId as string} setSubNavItems={setSubNavItems}/> : 
              action=== "view" && id ? <ProjectDetails setSubNavItems={setSubNavItems} cid={id} data={data} navItems={PnavItems} />  :
              action=== "documentation" && id ? <ProjectDocumentations setSubNavItems={setSubNavItems} navItems={PnavItems}/>  :
              action=== "report" && id ? <ProjectReport setSubNavItems={setSubNavItems} />  :
              <AllProjects setSubNavItems={setSubNavItems} navItems={navItems}/>  
            }
        </div>
      </div>
    </div>
  )
}

export default Project 
