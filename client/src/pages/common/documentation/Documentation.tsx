import { NavItem } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { IoMdAdd } from 'react-icons/io';
import { useLocation, useParams } from 'react-router-dom';
import DocumentationsAll from './components/DocumentationsAll';
import DocumentationsForm from './components/DocumentationsForm';
import ProjectDocumentations from './components/ProjectDocumentations';
import { useAppContext } from '../../../context/AppContext';
const pnavItems: NavItem[] = [
    { link: "/projects", title: "projects_all" },
    { link: "/documentation", title: "documentation_all", icon:<IoMdAdd />},
];
interface ArgsType{
    navItems?:NavItem[];
}

const Documentation:React.FC<ArgsType> = ({navItems}) => {
    const {action, id} = useParams();
    const { t } = useTranslation();
    const location = useLocation();
    const {pathname} = location;
    const [subNavItems, setSubNavItems] = useState<NavItem[]>(navItems || pnavItems);
    const {setPageTitle} = useAppContext();
    useEffect(()=>{
      setPageTitle(t('documentation'))
    },[]);
  
    return (
        <div className='page-wrap relative '>
        {/* <PageSubmenu basePath={basePath} navItems={subNavItems} title={t(`${pageTitle}`)} action={t(`${action ? action : "all"}`)}/> */}
        <div className='content mb-7 relative'>
            <div className='content-wrap relative'>
                {action && 
                    action === 'add' && id ? <DocumentationsForm setSubNavItems={setSubNavItems}/>:
                    action === 'update' && id ? <DocumentationsForm setSubNavItems={setSubNavItems}/>:
                    action === 'view' && id ? <ProjectDocumentations setSubNavItems={setSubNavItems}/>:  
                    <DocumentationsAll  setSubNavItems={setSubNavItems}/>
                }
            </div>
        </div>
        </div>
    )
}

export default Documentation
