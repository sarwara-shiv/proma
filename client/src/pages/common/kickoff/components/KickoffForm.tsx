import React, { useEffect, useState } from 'react';
import { Kickoff, KickoffResponsibility, Milestone, Project, User } from '@/interfaces';
import { FormButton, PageTitel } from '../../../../components/common';
import EnterInput from '../../../../components/forms/EnterInput';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { IoRemove } from 'react-icons/io5';
import DragAndDropList from '../../../../components/forms/DragAndDropList';
import KickoffResponsibilities from './KickoffResponsibilities';
import KickoffMilestones from './KickoffMilestones';
import { CustomInput } from '../../../../components/forms';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import { addUpdateRecords } from '../../../../hooks/dbHooks';

interface ArgsType {
    id?: string | null;
    data?: Project;
    action?:string;
}


const kickoffDataInitial: Kickoff = {
    goals: [],
    inScope: [],
    outOfScope: [],
    startDate:null,
    endDate:null,
    keyDeliverables: [],
    responsibilities: [],
    milestones:[],
    questions: [],
    notes: [],
    actionItems: [],
    mainTasks: [],
    context: ''
};



const KickoffForm: React.FC<ArgsType> = ({ id, data, action='update' }) => {
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
                setKickoffData({...kickoffData, responsibilities:data.kickoff.responsibilities})
            }
        }
    }, [kickoffData]);

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
    // responsibilities
    const handleMilestone = (name:string, value:Milestone[])=>{
        console.log(value);
        setKickoffData((prevData) => ({
            ...prevData,
            milestones: value 
        }));
    }


    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      console.log(kickoffData);

      if(verifyData() && id){
        try{
          const res = await addUpdateRecords({type:'projects', action:'update', id:id, body:{kickoff:kickoffData}});
          if(res.status === 'success'){
            console.log(res);
          }

        }catch(error){
          console.log(error);
        }
      }

    }


    const verifyData = ()=>{
      if(kickoffData.startDate && kickoffData.endDate){
        return true;
      }
      return false;
    }

    return (
        <div className='data-wrap'>
          <form onSubmit={submitForm}>
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

                    <div className='border-collapse my-4 w-full'>
                        <div className='text-left mt-4 border-b border-slate-200'>
                            <PageTitel text={`${t('FORMS.context')}`} color='slate-300' />
                        </div>

                        <div className='grid grid-cols-2 gap-2'>
                            <div>
                            <CustomDateTimePicker 
                                name= 'starDate'
                                label={`${t('FORMS.startDate')}`}
                                onDateChange={(args)=>console.log(args)}
                                selectedDate={kickoffData.startDate || null}
                                onChange={(recordId, value, name) => handleOnEnter({name:'startDate', value:value})}
                            />
                            </div>
                            <div>
                            <CustomDateTimePicker 
                                name= 'endDate'
                                disable= {kickoffData.startDate ? false : true}
                                label={`${t('FORMS.endDate')}`}
                                onDateChange={(args)=>console.log(args)}
                                selectedDate={kickoffData.endDate || null}
                                onChange={(recordId, value, name) => handleOnEnter({name:'endDate', value:value})}
                            />
                            </div>

                        </div>
                        <div className='text-left mt-4 border-b border-slate-200'>
                            <PageTitel text={`${t('FORMS.context')}`} color='slate-300' />
                        </div>
                        <div>
                            <CustomInput type='textarea' name='contenxt' 
                                onChange={(e)=>handleOnEnter({name:'context', value:e.target.value})}

                            />
                        </div>
                    </div>
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

                     {/* Project milestones */}
                     <div className='border-collapse my-4 w-full'>
                         <div className='block pt-2 pb-2'>
                             <PageTitel text={`${t('FORMS.projectMilestones')}`} color='slate-700' size='md'  />
                        </div>
                        {kickoffData.milestones && kickoffData.milestones.length > 0 ? 
                            <></> : <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                        }
                        <div>
                        <KickoffMilestones
                            milestones={kickoffData.milestones || []}
                            name="keyMilestones"
                            onChange={handleMilestone}
                            />
                        </div>
                    </div>
                     {/* Project responsibilities */}
                     <div className='border-collapse my-4 w-full'>
                        <div>
                            <KickoffResponsibilities selectedValues={kickoffData.responsibilities || []} onChange={handleResponsibilites}/>
                        </div>
                    </div>
                </>
            }

          <div className="mt-6 text-right">
            <FormButton  btnText={action === 'update' ? t('update') : t('create')} 
              disable = {!verifyData()}
            />
            {!verifyData() && 
            <span className='italic text-xs text-red-600'>
              {t('FORMS.fillOutRequiredFields')}
            </span>
            }
          </div>
          </form>
        </div>
    );
};

export default KickoffForm;
