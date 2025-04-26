import { useAuthContext } from '../../../context/AuthContext';
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdSettings } from 'react-icons/md';
import AdminProjectsList from './subComponents/AdminProjectsList';

// TODO - project status change add reason 

interface NavType{
    _id:string,
    label:string,
    icon?:ReactNode
}

const AdminDashboard:React.FC = ()=>{
    const {t} = useTranslation();
    const {user, roles, isAdmin, isEmployee, isClient, isCustomRole, isManager, isScrumMaster, isTeamLeader} =useAuthContext();
    const [nav, setNav] = useState<NavType[]>([
        {_id:'settings', label:'settings', icon:<MdSettings />}
    ]);
    return <div>
        <AdminProjectsList isAdmin={isAdmin} isManager={isManager} />
    </div>
}

export default AdminDashboard