import { useAuthContext } from '../../../context/AuthContext';
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdSettings } from 'react-icons/md';

interface NavType{
    _id:string,
    label:string,
    icon?:ReactNode
}

const AdminDashboard:React.FC = ()=>{
    const {t} = useTranslation();
    const {user} =useAuthContext();
    const [nav, setNav] = useState<NavType[]>([
        {_id:'settings', label:'settings', icon:<MdSettings />}
    ]);
    return <div>

    </div>
}

export default AdminDashboard