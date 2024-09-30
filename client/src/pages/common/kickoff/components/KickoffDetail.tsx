import { PageTitel } from '../../../../components/common';
import { Kickoff, Project, User } from '@/interfaces';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
interface ArgsType {
    id?:string | null;
    data?: Project; 
}

const kickoffDataInitial:Kickoff = {
    projectGoals:[],
    responsibilities:[],
    projectTimeline:{
        keyMilestones:[]
    },
    questions:[],
    notes:[],
    actionItems:[],
    mainTasks:[],
    description:''
} 
const KickoffDetail:React.FC<ArgsType> = ({id, data}) => {
    const {t} = useTranslation();
    const [createdBy, setCreatedBy] =useState<User>();
    const [kickoffData, setKickoffData] =useState<Kickoff>(kickoffDataInitial);
    console.log(data && data.createdBy);
    
    useEffect(()=>{
        if(data){
            const user:User = data.createdBy as unknown as User;
            setCreatedBy(user);

            if(data.kickoff){
               setKickoffData(data.kickoff);
            }
        }

    }, [])


  return (
    <div className='data-wrap'>
        {data && 
        <>
        <table className='border-collapse my-4 w-full'>
            <tr className='border-1 border-slate-100 text-left'>
                <th colSpan={2} className='p-2 bg-primary-light border border-primary-light'>
                    <PageTitel text='Project Details' color='primary'/>
                </th>
            </tr>
            <tr className='border-1 border-slate-100'>
                <th className='max-w-[200px] text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('projectName')}</th>
                <td className='border border-slate-300 p-2 text-2xl font-bold text-slate-800'>{data.name}</td>
            </tr>
           
            <tr>
                <th className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('startDate')}</th>
                <td className='border border-slate-300 p-2'>{format(new Date(data.startDate), 'dd.MM.yyyy')}</td>
            </tr>

            <tr>
                <th className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('endDate')}</th>
                <td className='border border-slate-300 p-2'>{data.endDate && format(new Date(data.endDate), 'dd.MM.yyyy')}</td>
            </tr>

            <tr>
                <th className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('createdBy')}</th>
                <td className='border border-slate-300 p-2'>{createdBy && createdBy.name}</td>
            </tr>
            <tr>
                <th className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('context')}</th>
                <td className='border border-slate-300 p-2'>{data.description}</td>
            </tr>
        </table>
        </>
        }
      
    </div>
  )
}

export default KickoffDetail
