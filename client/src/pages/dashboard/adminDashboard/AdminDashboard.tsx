import { useAuthContext } from '../../../context/AuthContext';
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdPerson2, MdSettings } from 'react-icons/md';
import AdminProjectsList from './components/AdminProjectsList';
import { Headings } from '../../../components/common';

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
    return <div className='p-4'>
        <div>
            <div className='font-bold text-sm text-slate-500 mb-2'>
                <Headings text={t('projects')} type={"section"} />
            </div>
            <div className=' flex flex-wrap gap-7 w-full mb-7'>
                <div className='card shadow-none gap-5 min-w-40 bg-blue-100 p-3 rounded-lg flex justify-between items-center'>
                    <div>
                        <div className=' text-xs text-slate-500'>{t('active')}</div>
                        <div className='font-bold text-xl text-slate-800'>80</div>
                    </div>
                    <div className='bg-white p-1 text-blue-400 text-2xl rounded-full'>
                        <MdPerson2 />
                    </div>
                </div>
                <div className='card shadow-none gap-5 bg-blue-100 p-3 rounded-lg flex justify-between items-center'>
                    <div>
                        <div className=' text-xs text-slate-500'>{t('completedThisMonth')}</div>
                        <div className='font-bold text-xl text-slate-800'>20</div>
                    </div>
                    <div className='bg-white p-1 text-blue-400 text-2xl rounded-full'>
                        <MdPerson2 />
                    </div>
                </div>
                <div className='card shadow-none gap-5 bg-blue-100 p-3 rounded-lg flex justify-between items-center'>
                    <div>
                        <div className=' text-xs text-slate-500'>{t('completedThisMonth')}</div>
                        <div className='font-bold text-xl text-slate-800'>20</div>
                    </div>
                    <div className='bg-white p-1 text-blue-400 text-2xl rounded-full'>
                        <MdPerson2 />
                    </div>
                </div>
            </div>
        </div>
        <AdminProjectsList isAdmin={isAdmin} isManager={isManager} />
    </div>
}

export default AdminDashboard