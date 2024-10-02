import { NavItem, Project } from '@/interfaces';
import React, { useEffect } from 'react'
interface ArgsType {
    cid?:string | null;
    data?: Project; 
    navItems:NavItem[];
    setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
  }
const ProjectDetails:React.FC<ArgsType> = ({cid,data, navItems, setSubNavItems}) => {
    useEffect(()=>{
        setSubNavItems(navItems);
        console.log(data, cid); 
    },[])
  return (
    <div>
      Project Details
    </div>
  )
}

export default ProjectDetails
