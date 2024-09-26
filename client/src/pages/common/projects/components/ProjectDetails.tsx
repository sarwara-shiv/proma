import { NavItem, Project } from '@/interfaces';
import React, { useEffect } from 'react'
interface ArgsType {
    id?:string | null;
    data?: Project; 
    navItems:NavItem[];
    setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
  }
const ProjectDetails:React.FC<ArgsType> = ({id,data, navItems, setSubNavItems}) => {
    useEffect(()=>{
        setSubNavItems(navItems);
        console.log(data, id); 
    },[])
  return (
    <div>
      Project Details
    </div>
  )
}

export default ProjectDetails
