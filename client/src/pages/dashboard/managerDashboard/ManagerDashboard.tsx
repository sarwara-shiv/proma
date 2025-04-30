import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdPerson2, MdSettings } from 'react-icons/md';
import { Headings } from '../../../components/common';
import TasksOverview from './components/TasksOverview';
import { useAuthContext } from '../../../context/AuthContext';
import OnlineUsers from '../components/OnlineUsers';

// TODO - project status change add reason 

interface NavType{
    _id:string,
    label:string,
    icon?:ReactNode
}

const ManagerDashboard:React.FC = ()=>{
    const {t} = useTranslation();
    const {user, roles, isAdmin, isEmployee, isClient, isCustomRole, isManager, isScrumMaster, isTeamLeader} =useAuthContext();
    const [nav, setNav] = useState<NavType[]>([
        {_id:'settings', label:'settings', icon:<MdSettings />}
    ]);
    return <div className='py-4 mx-auto h-full'>
                    <div className=' flex h-full'>
                        <div className='flex-1 min-w-0 p-4 h-full w-full'>
                            <TasksOverview />
                        </div>
                        <div className='min-w-0 w-[200px] border-l p-4 h-full'>
                            <OnlineUsers />
                        </div>
                    </div>
                </div>
}

export default ManagerDashboard