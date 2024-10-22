import { Documentation, NavItem } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
interface ArgsType{
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
}


const DocumentationsForm:React.FC<ArgsType> = ({setSubNavItems}) => {
    const {action, id} = useParams();
    const [formData, setFormData] = useState<Documentation>({
        _pid:id,
        title:'',
        description:'',
        customFields:[],
        subDocuments:[]
    });
    let navItems: NavItem[] = [
        { link: `projects`, title: "projects_all" },
        { link: `projects/view/${id}`, title: "project" },
        { link: `documentation/add/${id}`, title: "documentation_add" },
        { link: `documentation/update/${id}`, title: "documentation_update" },
    ];

    useEffect(()=>{
        setSubNavItems && setSubNavItems(navItems);
      },[])
  return (
    <div className='data-wrap relative'>
        <div className='card bg-white'>
        </div>
    </div>
  )
}

export default DocumentationsForm
