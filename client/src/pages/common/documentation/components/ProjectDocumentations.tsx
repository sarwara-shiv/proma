import { NavItem } from '@/interfaces';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
interface ArgsType{
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
}

const ProjectDocumentations:React.FC<ArgsType> = ({setSubNavItems}) => {
    const {action, id} = useParams();
    const navItems: NavItem[] = [
        { link: `projects`, title: "projects_all" },
        { link: `documentation/add/${id}`, title: "documentation_add" },
        { link: `documentation/update/${id}`, title: "documentation_update" },
      ];

      useEffect(()=>{
        setSubNavItems && setSubNavItems(navItems);
      },[])
  return (
    <div>
        project documentation {id}
    </div>
  )
}

export default ProjectDocumentations
