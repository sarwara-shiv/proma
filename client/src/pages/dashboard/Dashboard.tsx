import { useAuthContext } from '../../context/AuthContext';
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdSettings } from 'react-icons/md';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';

interface NavType{
    _id:string,
    label:string,
    icon?:ReactNode
}

const Dashboard:React.FC = ()=>{
    const {t} = useTranslation();
    const {user, roles, isAdmin, isEmployee, isClient, isCustomRole, isManager, isScrumMaster, isTeamLeader} =useAuthContext();
    console.log(roles);
    return <div>
        {(isAdmin) && 
            <AdminDashboard />
        }
        {isManager && 
            <AdminDashboard />
        }
        {(isEmployee || isCustomRole || isScrumMaster || isTeamLeader) && 
            <EmployeeDashboard />
        }
        
    </div>
}

export default Dashboard