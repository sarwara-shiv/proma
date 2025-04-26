import { useAuthContext } from '../../context/AuthContext';
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdSettings } from 'react-icons/md';
import AdminDashboard from './adminDashboard/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './managerDashboard/ManagerDashboard';

interface NavType{
    _id:string,
    label:string,
    icon?:ReactNode
}

const Dashboard:React.FC = ()=>{
    const {t} = useTranslation();
    const {user, roles, isAdmin, isEmployee, isClient, isCustomRole, isManager, isScrumMaster, isTeamLeader} =useAuthContext();
    console.log(roles);
    return <div className='h-full'>
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