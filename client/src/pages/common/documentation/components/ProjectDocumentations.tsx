import { useAuth } from '../../../../hooks/useAuth';
import { Documentation, NavItem } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
interface ArgsType{
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
}

const ProjectDocumentations:React.FC<ArgsType> = ({setSubNavItems}) => {
    const {action, id} = useParams();
    const {t} = useTranslation();
    const {user} = useAuth();
    const [records, setRecords] = useState<Documentation[]>([]);
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
