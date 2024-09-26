import { NavItem, Project } from '@/interfaces';
import React, { useEffect, useState } from 'react'
interface ArgsType {
    id?:string | null;
    action?:"add" | "update";
    data?: Project; 
    setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
    checkDataBy?:string[];
}
const navItems: NavItem[] = [
    { link: "projects", title: "projects_all" },
    { link: "projects/add", title: "projects_add" },
    { link: "projects/kickoff", title: "kickoff" },
    { link: "projects/tasks/all", title: "tasks_all" },
    { link: "projects/tasks/add", title: "tasks_add" },
  ];
const Kickoff:React.FC<ArgsType> = ({id, action, data, checkDataBy, setSubNavItems}) => {
    useEffect(()=>{
        setSubNavItems(navItems);
    }, []);

  return (
    <div>
      Kickoff
    </div>
  )
}

export default Kickoff
