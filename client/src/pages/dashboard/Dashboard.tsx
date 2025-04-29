import { useAuthContext } from '../../context/AuthContext';
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdSettings } from 'react-icons/md';
import AdminDashboard from './adminDashboard/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './managerDashboard/ManagerDashboard';
import { DecodedToken, User } from '@/interfaces';

interface NavType{
    _id:string,
    label:string,
    icon?:ReactNode
}

const Dashboard:React.FC = ()=>{
    const {t} = useTranslation();
    const {user, roles, isAdmin, isEmployee, isClient, isCustomRole, isManager, isScrumMaster, isTeamLeader} =useAuthContext();
    const [cUser, setCUser] = useState<DecodedToken>();
    console.log(roles);

    useEffect(()=>{
        if(user) setCUser(user)
    },[user]);

    return <div className='page-wrap relative  max-w-full h-full'>
        {(isAdmin) && 
            // <AdminDashboard />

            <ManagerDashboard /> 
        }
        {isManager && 
            <ManagerDashboard />
        }
        {(isEmployee || isCustomRole || isScrumMaster || isTeamLeader) && 
            <EmployeeDashboard />
        }
        
    </div>
}

export default Dashboard