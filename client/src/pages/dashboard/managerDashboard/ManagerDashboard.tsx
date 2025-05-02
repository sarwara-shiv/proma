import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdPerson2, MdSettings } from 'react-icons/md';
import { FloatingBottomMenu, Headings } from '../../../components/common';
import TasksOverview from './components/TasksOverview';
import { useAuthContext } from '../../../context/AuthContext';
import OnlineUsers from '../components/OnlineUsers';
import ProjectsOverview from './components/ProjectsOverview';
import { useAppContext } from '../../../context/AppContext';

// TODO - project status change add reason 

interface NavType{
    _id:string,
    label:string,
    icon?:ReactNode
}

const ManagerDashboard:React.FC = ()=>{
    const {t} = useTranslation();
    const {user, roles, isAdmin, isEmployee, isClient, isCustomRole, isManager, isScrumMaster, isTeamLeader} =useAuthContext();
    const {setPageTitle} = useAppContext();
    const [selectedNav, setSelectedNav] = useState<string>('tasks');
    const [nav, setNav] = useState<NavType[]>([
        {_id:'tasks', label:'tasks', icon:<MdSettings />},
        {_id:'projects', label:'projects', icon:<MdSettings />},
        {_id:'settings', label:'settings', icon:<MdSettings />},
    ]);

    useEffect(()=>{
        setPageTitle(t('dashboard'))
    },[])


    return (
        <div className='py-4 mx-auto h-full'>
            <div className=' flex h-full'>
                <div className='flex-1 min-w-0 p-4 h-full w-full'>
                    {selectedNav === 'tasks' && 
                        <TasksOverview />
                    }
                    {selectedNav === 'projects' && 
                        <ProjectsOverview user={user}/>
                    }
                </div>
                <div className='min-w-0 w-[200px] border-l p-4 h-full'>
                    <OnlineUsers />
                </div>
            </div>
            <FloatingBottomMenu nav={nav} onClick={(value)=>setSelectedNav(value) } selectedNav={selectedNav}/>
        </div>
    )
}

export default ManagerDashboard