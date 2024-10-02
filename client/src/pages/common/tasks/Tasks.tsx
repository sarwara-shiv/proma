import { NavItem, Project } from '@/interfaces';
import React, { useEffect, useState } from 'react'
interface ArgsType {
    cid?:string | null;
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
const Tasks:React.FC<ArgsType> = ({cid, action, data, checkDataBy, setSubNavItems}) => {
    useEffect(()=>{
        setSubNavItems(navItems);
    }, []);

  return (
    <div>
      tasks
    </div>
  )
}

export default Tasks
