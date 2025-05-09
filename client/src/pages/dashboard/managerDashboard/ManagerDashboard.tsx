import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdOutlineWebAsset, MdPerson2, MdSettings } from 'react-icons/md';
import { FloatingBottomMenu, Headings } from '../../../components/common';
import TasksOverview from './components/TasksOverview';
import { useAuthContext } from '../../../context/AuthContext';
import OnlineUsers from '../components/OnlineUsers';
import ProjectsOverview from './components/ProjectsOverview';
import { useAppContext } from '../../../context/AppContext';
import { FaTasks } from 'react-icons/fa';
import { IoTimerOutline } from 'react-icons/io5';
import UsersWorklogs from './components/UsersWorklogs';

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
    const [selectedNav, setSelectedNav] = useState<string>('projects');
    const [nav, setNav] = useState<NavType[]>([
        {_id:'projects', label:t('projects'), icon:<MdOutlineWebAsset />},
        {_id:'tasks', label:t('tasks'), icon:<FaTasks />},
        {_id:'worklogs', label:t('worklog'), icon:<IoTimerOutline />},
        {_id:'settings', label:t('settings'), icon:<MdSettings />},
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
                    {selectedNav === 'worklogs' && 
                        <UsersWorklogs user={user}/>
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