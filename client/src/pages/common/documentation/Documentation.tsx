import { PageSubmenu } from '../../../components/common';
import { MainTask, NavItem } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { IoMdAdd } from 'react-icons/io';
import { useLocation, useParams } from 'react-router-dom';
import DocumentationsAll from './components/DocumentationsAll';
import DocumentationsForm from './components/DocumentationsForm';
import ProjectDocumentations from './components/ProjectDocumentations';
const navItems: NavItem[] = [
    { link: "projects", title: "projects_all" },
    { link: "documentation", title: "documentation_all", icon:<IoMdAdd />},
];
const Documentation = () => {
    const {action, id} = useParams();
    const { t } = useTranslation();
    const location = useLocation();
    const { data, objectId, pid } = location.state || {}; 
    const [pageTitle, setPageTitle] = useState("documentation");
    const {pathname} = location;
    const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';
    const [subNavItems, setSubNavItems] = useState<NavItem[]>(navItems);
  
    return (
        <div className='page-wrap relative '>
        <PageSubmenu basePath={basePath} navItems={subNavItems} title={t(`${pageTitle}`)} action={t(`${action ? action : "all"}`)}/>
        <div className='content mb-7 relative'>
            <div className='content-wrap relative'>
                {action && 
                    action === 'add' && id ? <DocumentationsForm setSubNavItems={setSubNavItems}/>:
                    action === 'view' && id ? <ProjectDocumentations setSubNavItems={setSubNavItems}/>:  
                    <DocumentationsAll  setSubNavItems={setSubNavItems}/>
                }
            </div>
        </div>
        </div>
    )
}

export default Documentation
