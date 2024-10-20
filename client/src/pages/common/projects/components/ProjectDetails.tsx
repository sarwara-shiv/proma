import { Loader } from '../../../../components/common';
import { getRecordWithID } from '../../../../hooks/dbHooks';
import { useAuth } from '../../../../hooks/useAuth';
import { AlertPopupType, FlashPopupType, NavItem, Project, User } from '@/interfaces';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
interface ArgsType {
    cid?:string | null;
    data?: Project; 
    navItems:NavItem[];
    setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
  }
const ProjectDetails:React.FC<ArgsType> = ({cid,data, navItems, setSubNavItems}) => {
    const { t } = useTranslation();
    const {user} = useAuth();
    const {id} = useParams();
    const [projectData, setProjectData] = useState<Project>();
    const [loading, setLoading] = useState<boolean>(false);
    const [alertData, setAlertData] = useState<AlertPopupType>({isOpen:false, content:"", type:"info", title:""}); 
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});

    useEffect(()=>{
        setSubNavItems(navItems);
        getRecords();
    },[])

    const getRecords = async()=>{
      setLoading(true);
      try{
        const populateFields = [
            {path: 'kickoff.responsibilities.role'},
            {path: 'kickoff.responsibilities.persons'},
            {path: 'kickoff.approval.user'},
            {path: 'createdBy'},
        ]
        if(id){
            const res = await getRecordWithID({id:id, populateFields, type:'projects'});
            if(res.status === 'success' && res.data){
                setProjectData(res.data);
            }


        }
        setLoading(false);
      }catch(error){
        setLoading(false);
        console.log(error);
    }
    }

  return (
    <div>
      {loading && <Loader type='full'/>}
      {projectData && 
        <div>
          <div className='card bg-white text-slate-500'>
            <div className=''>
              <div className='flex justify-left gap-3'>
                {projectData.createdAt && 
                  <div>
                    <span className='text-slate-400 text-xs'>{t('createdAtDate')}: </span>
                    <span className='text-sm text-slate'>
                      {format(projectData.createdAt, 'dd.MM.yyyy')}
                    </span>
                    </div>
                }
                {projectData.createdBy && 
                  <div>
                    <span className='text-slate-400 text-xs'>{t('createdBy')}: </span>
                    <span className='text-sm text-slate'>
                      {(projectData.createdBy as unknown as User).name}
                    </span>
                    </div>
                }
              </div>
              <div className='flex justify-between w-full'>
                <h1 className='text-2xl text-primary font-bold'>{projectData.name}</h1>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default ProjectDetails
