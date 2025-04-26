import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdPerson2, MdSettings } from 'react-icons/md';
import { Headings } from '../../../components/common';
import TasksOverview from './components/TasksOverview';
import { useAuthContext } from '../../../context/AuthContext';

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
    return <div className='flex flex-row w-full h-full'>
            <div className='w-full flex-1 p-4 h-full'>
                <TasksOverview />
            </div>
            <div className='w-60 border-l p-4 h-full'>
                <Headings text='Active users' type='section' />
            </div>
    </div>
}

export default ManagerDashboard