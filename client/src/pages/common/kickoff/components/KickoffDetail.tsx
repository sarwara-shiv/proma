import React, { useEffect, useState } from 'react';
import { Kickoff, KickoffResponsibility, Milestone, Project, User, UserGroup } from '@/interfaces';
import { PageTitel } from '../../../../components/common';
import EnterInput from '../../../../components/forms/EnterInput';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { IoRemove } from 'react-icons/io5';
import DragAndDropList from '../../../../components/forms/DragAndDropList';
import KickoffResponsibilities from './KickoffResponsibilities';
import KickoffMilestones from './KickoffMilestones';
import { CustomInput } from '../../../../components/forms';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { getRecordWithID } from '../../../../hooks/dbHooks';
import { ObjectId } from 'mongodb';

interface ArgsType {
    id?: string | null;
    data?: Project;
}


const kickoffDataInitial: Kickoff = {
    goals: [],
    inScope: [],
    outOfScope: [],
    keyDeliverables: [],
    responsibilities: [],
    milestones:[],
    questions: [],
    notes: [],
    actionItems: [],
    mainTasks: [],
    context: ''
};



const KickoffDetail: React.FC<ArgsType> = ({ id, data }) => {
    const { t } = useTranslation();
    const [createdBy, setCreatedBy] = useState<User>();
    const [kickoffData, setKickoffData] = useState<Kickoff>(kickoffDataInitial);
    const [responsibilities, setResponsibilities] = useState<KickoffResponsibility[]>([]);

    useEffect(()=>{
        getData();
    }, [])

    // Load data when the component mounts
    useEffect(() => {
        if (data) {
            console.log(data);
            const user: User = data.createdBy as unknown as User;
            setCreatedBy(user);

            if (data.kickoff) {
                setKickoffData(data.kickoff);
            }
        }
    }, [kickoffData]);

    const getData = async ()=>{
        try{
            const populateFields = [
                {path: 'kickoff.responsibilities.role'},
                {path: 'kickoff.responsibilities.persons'},
            ]
            if(id){
                const res = await getRecordWithID({id, populateFields, type:'projects'});
                console.log(res);

                if(res.status === 'success' && res.data){
                    if(res.data.kickoff) setResponsibilities(res.data.kickoff.responsibilities);
                    if (res.data.kickoff) {
                        setKickoffData(res.data.kickoff);
                    }
                    data = {...res.data}

                    console.log(res.data.kickoff.responsibilities);
                }

            }
        }catch(error){
            console.log(error);
        }
    }

    // Handle adding a new goal
    const handleOnEnter = ({ name, value }: { name: string, value: string | Date | null }) => {
        if (value && name) {
            setKickoffData((prevData) => {
                // Make sure the name corresponds to an array in kickoffData
                if (name === 'goals' || name === 'inScope' || name === 'outOfScope' || name==='keyDeliverables') {
                    return {
                        ...prevData,
                        [name]: [...(prevData[name] || []), value] // Add the new value to the array
                    };
                }else{
                    return {
                        ...prevData,
                        [name]: value // Add the new value to the array
                    };
                }

                return prevData;
            });
        }
    };


    // Handle final update after drag-and-drop reordering
    const handleFinalUpdateGoals = (name:string, updatedItems: string[]) => {
        setKickoffData((prevData) => ({
            ...prevData,
            [name]: updatedItems // Update the project goals after reordering/removal
        }));
    };


    // responsibilities
    const handleResponsibilites = (value:KickoffResponsibility[])=>{
        setKickoffData((prevData) => ({
            ...prevData,
            responsibilities: value 
        }));
    }
    // responsibilities
    const handleMilestone = (name:string, value:Milestone[])=>{
        console.log(value);
        setKickoffData((prevData) => ({
            ...prevData,
            milestones: value 
        }));
    }

    return (
        <div className='data-wrap'>
            {data &&
                <>
                    {/* Project Details */}
                    <table className='border-collapse my-4 w-full'>
                        <tr className='border-1 border-slate-100 text-left'>
                            <th colSpan={2} className='p-2'>
                                <PageTitel text={`Project Details (${data._cid})`} color='slate-300' />
                            </th>
                        </tr>
                        <tr className='border-1 border-slate-100'>
                            <th className='max-w-[200px] text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('projectName')}</th>
                            <td className='border border-slate-300 p-2 text-2xl font-bold text-slate-800'>{data.name}</td>
                        </tr>

                        <tr>
                            <th className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('startDate')}</th>
                            <td className='border border-slate-300 p-2'>
                                {data.kickoff && data.kickoff.startDate ? format(new Date(data.kickoff.startDate), 'dd.MM.yyyy') : '-'}
                            </td>
                        </tr>

                        <tr>
                            <th className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('endDate')}</th>
                            <td className='border border-slate-300 p-2'>
                                {data.endDate && format(new Date(data.endDate), 'dd.MM.yyyy')}
                                {data.kickoff && data.kickoff.endDate ? format(new Date(data.kickoff.endDate), 'dd.MM.yyyy') : '-'}
                            </td>
                        </tr>

                        <tr>
                            <th className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('createdBy')}</th>
                            <td className='border border-slate-300 p-2'>{createdBy && createdBy.name}</td>
                        </tr>
                        <tr>
                            <th colSpan = {2} className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('description')}</th>
                        </tr>
                        <tr>
                            <td colSpan = {2} className='border border-slate-300 p-2'>{data.description}</td>
                        </tr>
                        <tr>
                            <th colSpan = {2} className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('context')}</th>
                        </tr>
                        <tr>
                            <td colSpan = {2} className='border border-slate-300 p-2'>{data.kickoff?.context || ''}</td>
                        </tr>
                    </table>

                    {/* Objectives */}
                    <div className='mt-4 text-left'>
                        <PageTitel text={`${t('projectObjectives')}`} color='slate-600' />
                    </div>
                    <div 
                        className='grid grid-cols-1 lg:grid-cols-2'
                    >
                        <div className='mt-3'>
                            <PageTitel text={t('projectGoals')} />
                            <ul>
                                {kickoffData.goals ? kickoffData.goals.map((goal,index)=>{

                                    return (
                                        <li key={`pgoals-${index}`}>
                                            <span className='font-bold pr-2'>{index + 1}</span>{goal}
                                        </li>
                                    )
                                }) :
                                <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                            }
                            </ul>
                        </div>
                        <div className='mt-3'>
                            <PageTitel text={t('projectDeliverables')} />
                            <ul>
                                {kickoffData.keyDeliverables ? kickoffData.keyDeliverables.map((item,index)=>{

                                    return (
                                        <li key={`pdel-${index}`}>
                                            <span className='font-bold pr-2'>{index + 1}</span>{item}
                                        </li>
                                    )
                                }) :
                                <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                            }
                            </ul>
                        </div>
                    </div>

                    {/* Project Scope */}
                    <div className='mt-4 text-left'>
                        <PageTitel text={`${t('projectScope')}`} color='slate-600' />
                    </div>
                    <div 
                        className='grid grid-cols-1 lg:grid-cols-2'
                    >
                        <div className='mt-3'>
                            <PageTitel text={t('inScope')} />
                            <ul>
                                {kickoffData.inScope ? kickoffData.inScope.map((item,index)=>{

                                    return (
                                        <li key={`pinscope-${index}`}>
                                            <span className='font-bold pr-2'>{index + 1}</span>{item}
                                        </li>
                                    )
                                }) :
                                <li className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</li>
                            }
                            </ul>
                        </div>
                        <div className='mt-3'>
                            <PageTitel text={t('outOfScope')} />
                            <ul>
                                {kickoffData.outOfScope ? kickoffData.outOfScope.map((item,index)=>{

                                    return (
                                        <li key={`pdel-${index}`}>
                                            <span className='font-bold pr-2'>{index + 1}</span>{item}
                                        </li>
                                    )
                                }) :
                                <li className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</li>
                            }
                            </ul>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className='mt-4'>
                        <div className='mt-4 text-left mb-2'>
                            <PageTitel text={`${t('projectMilestones')}`} color='slate-600' />
                        </div>
                        <ul>
                        {kickoffData.milestones && kickoffData.milestones.map((item, indes)=>{

                            return (
                                <li 
                                className=''
                                >
                                <span>{item.name}</span>
                                <span>{item.dueDate ? format(new Date(item.dueDate), 'dd.MM.yyyy'): ''}</span>
                                <span
                                    className={getColorClasses(item.status)}
                                >{t(`${item.status}`)}</span>
                                </li>
                            )
                        }

                        )}
                        </ul>
                    </div>

                    {/* Responsibilities */}

                    <div className='mt-4'>
                        <div className='mt-4 text-left mb-2'>
                            <PageTitel text={`${t('projectResponsibilities')}`} color='slate-600' />
                        </div>
                        <ul>
                            {responsibilities && responsibilities.map((item,index)=>{
                                const role:UserGroup = item.role as unknown as UserGroup; 
                                const persons:User[] = item.persons as unknown as User[]; 
                                const work = item.work;
                                const details = item.details;
                                return (
                                    <li key={`prespo-${index}`}>
                                        <span 
                                        className='font-bold pr-1'
                                        > {role.displayName}</span>
                                       
                                        {persons && persons.map((per,perIndex)=>{
                                            return (
                                                <span key={`pers-${index}-${perIndex}`}>{per.name}</span>
                                            )
                                        })}

                                        <span> {work}</span>
                                        <span> {details}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </>
            }
        </div>
    );
};

export default KickoffDetail;
