import React, { useEffect, useState } from 'react'
import { NavItem, Project } from '@/interfaces'
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import KickoffForm from './components/KickoffForm';

import KickoffDetail from './components/KickoffDetail';
import { IoBarChartSharp, IoDocumentAttach, IoPencil } from 'react-icons/io5';
import { FaEye, FaRegEdit, FaTasks } from 'react-icons/fa';
import { MdRocketLaunch } from 'react-icons/md';
import { DiScrum } from 'react-icons/di';
import { Headings } from '../../../components/common';
import { getRecordWithID } from '../../../hooks/dbHooks';
interface ArgsType {
    cid?:string | null;
    data?: Project; 
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>; 
    navItems?:NavItem[];
    checkDataBy?:string[];
}

const Kickoff:React.FC<ArgsType> = ({cid, data, checkDataBy, setSubNavItems, navItems}) => {
  const {t} = useTranslation();
  const {id} = useParams();
  const [pageType, setPageType] = useState<string>('view');
  const [projectData, setProjectData] = useState<Project>();
  const location = useLocation();

  useEffect(()=>{
      getData();
  }, [id])

  const getData = async ()=>{
    try{
      console.log(id);
        const populateFields = [
            {path: 'kickoff.responsibilities.role'},
            {path: 'kickoff.responsibilities.persons'},
            {path: 'kickoff.approval.user'},
        ]
        if(id){
            const res = await getRecordWithID({id, populateFields, type:'projects'});
            console.log(res);
            if(res.status === 'success' && res.data){
                setProjectData(res.data);
                data = {...res.data}
                console.log(res.data.kickoff.responsibilities);
            }

        }
    }catch(error){
        console.log(error);
    }
  }
  const PnavItems: NavItem[] = [
    { link: `projects/view/${id}`, title: "project", icon:<FaEye />},
    { link: `projects/maintasks/${id}`, title: "maintasks", icon:<FaTasks />},
    { link: `projects/kickoff/${id}`, title: "kickOff", icon:<MdRocketLaunch />},
    { link: `projects/sprints/${id}`, title: "sprints", icon:<DiScrum />}, 
    { link: `projects/report/${id}`, title: "report", icon:<IoBarChartSharp/>}, 
    { link: `projects/documentation/${id}`, title: "documentation", icon:<IoDocumentAttach />},
  ];
    useEffect(()=>{
      if(setSubNavItems){
        setSubNavItems(PnavItems)
      }
    }, []);

  return (
    <>
      <div className={`flex ${projectData ? 'justify-between' : 'justify-end'} items-center mb-4`}>
        {projectData && 
          <Headings text={<>{projectData.name} <span className='font-normal text-sm'>{projectData._cid}</span></>} type='h1'/>
        }
          <div className="flex justify-center items-center text-md p-2  hover:bg-primary-light hover:text-primary rounded-sm cursor-pointer transition-all"
            onClick={() => setPageType(pageType === 'view' ? 'update' : 'view')}
            >
              {pageType === 'view' ? 
              <span className='flex justify-center items-center gap-2'><FaRegEdit /> {t('update')}</span>
              : 
              <span className='flex justify-center items-center gap-2'><FaEye /> {t('details')}</span>
              }
            </div>

        </div>


      {
          pageType && 
          pageType === "add" ? <KickoffForm data={projectData} cid={cid} setSubNavItems={setSubNavItems}/> : 
          pageType === "update" ? <KickoffForm data={projectData} cid={cid} setSubNavItems={setSubNavItems}/> :
          data && data.kickoff ? <KickoffDetail data={projectData} cid={cid} setSubNavItems={setSubNavItems}/>: 
          <KickoffDetail data={data} cid={cid}/>
        }
    </>
  )
}

export default Kickoff
