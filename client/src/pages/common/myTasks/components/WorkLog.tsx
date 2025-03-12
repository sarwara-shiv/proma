import { NavLink, useLocation, useParams } from 'react-router-dom';
import PageTitel from '../../../../components/common/PageTitel';
import React, { ReactNode, useEffect, useState } from 'react';
import { IoPlay, IoPauseSharp } from "react-icons/io5";
import { MdAdd } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import PageSubmenu from '../../../../components/common/PageSubmenu';
import { useAuth } from '../../../../hooks/useAuth';
import { WorkLogType } from '../../../../interfaces';
import { workLogActions } from '../../../../hooks/dbHooks';
import { ObjectId } from 'mongodb';

interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  { link: "mytasks", title: "mytasks", icon: <IoPlay /> },
];

const WorkLog = () => {
  const {user} = useAuth();
  const {action, id} = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const { data, objectId } = location.state || {}; 
  const [pageTitle, setPageTitle] = useState("users");
  const [myWorklog, setMyWorkLog] = useState<WorkLogType[]>([]);
  const [worklogType, setWorklogType] = useState<string>('weekly');
  const {pathname} = location;
  const basePath = location.pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/';

  useEffect(()=>{
    getWorkLog();
  },[])

  const getWorkLog= async(type?:string)=>{
    const wtype = type ? type : worklogType;
    const userId = user?._id as unknown as ObjectId;
    if(userId && wtype){
      try{
        const projectId = '6712b34aec33d905712ccf72';
        // const projectId = '67c76ae1d1823709654ba843';
        const res = await workLogActions({type:'report', body:{userId, reportType:wtype, projectId}});
        console.log(res);
      }catch(error){
        console.log(error);
      }
    }

  }

  return (
    <div className='page-wrap relative'>
      <div className='content mb-7'>
        <div className='content-wrap p-4 '>
           
        </div>
      </div>
    </div>
  );
}

export default WorkLog;
