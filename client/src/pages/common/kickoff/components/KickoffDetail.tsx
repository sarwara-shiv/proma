import React, { useEffect, useState } from 'react';
import { Kickoff, KickoffResponsibility, Project, User } from '@/interfaces';
import { PageTitel } from '../../../../components/common';
import EnterInput from '../../../../components/forms/EnterInput';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { IoRemove } from 'react-icons/io5';
import DragAndDropList from '../../../../components/forms/DragAndDropList';
import KickoffResponsibilities from './KickoffResponsibilities';

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

    // Load data when the component mounts
    useEffect(() => {
        if (data) {
            const user: User = data.createdBy as unknown as User;
            setCreatedBy(user);

            if (data.kickoff) {
                setKickoffData(data.kickoff);
            }
            if (data.kickoff?.responsibilities) {
                setResponsibilities(data.kickoff.responsibilities);
            }
        }
    }, [kickoffData]);

    // Handle adding a new goal
    const handleOnEnter = ({ name, value }: { name: string, value: string }) => {
        console.log(value);
        if (value && name) {
            setKickoffData((prevData) => {
                // Make sure the name corresponds to an array in kickoffData
                if (name === 'goals' || name === 'inScope' || name === 'outOfScope' || name==='keyDeliverables') {
                    return {
                        ...prevData,
                        [name]: [...(prevData[name] || []), value] // Add the new value to the array
                    };
                }
                return prevData;
            });
        }
    };

    // Handle removing a goal
    const removeFromArray = ({ name, index }: { name: string, index: number }) => {
        if ((index || index === 0) && name) {
            // setKickoffData((prevData) => ({
            //     ...prevData,
            //     [name]: prevData[name]?.filter((_, i) => i !== index) || [] // Remove goal at index
            // }));
            setKickoffData((prevData) => {
                // Make sure the name corresponds to an array in kickoffData
                if (name === 'goals' || name === 'inScope' || name === 'outOfScope' || name==='keyDeliverables') {
                    return {
                        ...prevData,
                        [name]: prevData[name]?.filter((_, i) => i !== index) || [] // Add the new value to the array
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

                    {/* Project goals */}
                    <div className='border-collapse my-4 w-full'>
                        <div className='text-left mt-4 border-b border-slate-200'>
                            <PageTitel text={`${t('FORMS.objectives')}`} color='slate-300' />
                        </div>
                        <div className='bg-white p-2 text-left my-2 rounded-md'>
                            <div className='block pt-2 pb-2'>
                                <PageTitel text={`${t('FORMS.projectGoals')}`} color='slate-700' size='md' />
                            </div>
                            {kickoffData.goals && kickoffData.goals.length > 0 ? (
                                <>
                                    {/* Use DragAndDropList to render project goals */}
                                    <DragAndDropList
                                        name='goals'
                                        items={kickoffData.goals}
                                        onFinalUpdate={handleFinalUpdateGoals} // Handle final update after changes
                                    />
                                </>
                            ) : (
                                <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                            )}
                            {/* Input for adding new goals */}
                            <EnterInput name="goals" onEnter={handleOnEnter} />
                        </div>
                        <div className='bg-white p-2 text-left my-2 rounded-md'>
                                <div className='block pt-2 pb-2'>
                                    <PageTitel text={`${t('FORMS.keyDeliverables')}`} color='slate-700' size='md' />
                                </div>
                                {kickoffData.keyDeliverables && kickoffData.keyDeliverables.length > 0 ? (
                                    <>
                                        {/* Use DragAndDropList to render project goals */}
                                        <DragAndDropList
                                            name='keyDeliverables'
                                            items={kickoffData.keyDeliverables}
                                            onFinalUpdate={handleFinalUpdateGoals} // Handle final update after changes
                                        />
                                    </>
                                ) : (
                                    <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                                )}
                                {/* Input for adding new goals */}
                                <EnterInput name="keyDeliverables" onEnter={handleOnEnter} />
                        </div>

                        <div className='mt-4 text-left'>
                            <PageTitel text={`${t('FORMS.projectScope')}`} color='slate-300' />
                        </div>
                        <div className='bg-white p-2 text-left my-2 rounded-md'>
                                <div className='block pt-2 pb-2'>
                                    <PageTitel text={`${t('FORMS.inScope')}`} color='slate-700' size='md'  />
                                </div>
                                {kickoffData.inScope && kickoffData.inScope.length > 0 ? (
                                    <>
                                        {/* Use DragAndDropList to render project goals */}
                                        <DragAndDropList
                                            name='inScope'
                                            items={kickoffData.inScope}
                                            onFinalUpdate={handleFinalUpdateGoals} // Handle final update after changes
                                        />
                                    </>
                                ) : (
                                    <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                                )}
                                {/* Input for adding new goals */}
                                <EnterInput name="inScope" onEnter={handleOnEnter} />
                        </div>
                        <div className='bg-white p-2 text-left my-2 rounded-md'>
                                <div className='block pt-2 pb-2'>
                                    <PageTitel text={`${t('FORMS.outOfScope')}`} color='slate-700' size='md'  />
                                </div>
                                {kickoffData.outOfScope && kickoffData.outOfScope.length > 0 ? (
                                    <>
                                        {/* Use DragAndDropList to render project goals */}
                                        <DragAndDropList
                                            name='outOfScope'
                                            items={kickoffData.outOfScope}
                                            onFinalUpdate={handleFinalUpdateGoals} // Handle final update after changes
                                        />
                                    </>
                                ) : (
                                    <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                                )}
                                {/* Input for adding new goals */}
                                <EnterInput name="outOfScope" onEnter={handleOnEnter} />
                        </div>
                    </div>

                     {/* Project goals */}
                     <div className='border-collapse my-4 w-full'>
                        {/* <div className='text-left mt-4 border-b border-slate-200'>
                            <PageTitel text={`${t('responsibilities')}`} color='slate-300' />
                        </div> */}

                        <div>
                            <KickoffResponsibilities selectedValues={[]} onChange={handleResponsibilites}/>
                        </div>
                    </div>
                </>
            }
        </div>
    );
};

export default KickoffDetail;
