import { useAuthContext } from '../../context/AuthContext';
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { MdSettings } from 'react-icons/md';

interface NavType{
    _id:string,
    label:string,
    icon?:ReactNode
}

const Dashboard:React.FC = ()=>{
    const {t} = useTranslation();
    const {user, roles} =useAuthContext();
    console.log(roles);
    return <div>

    </div>
}

export default Dashboard