import React, { useEffect, useState } from 'react';
import { AlertPopupType, FlashPopupType, Kickoff, KickoffResponsibility, Milestone, NavItem, Project, User } from '@/interfaces';
import { CustomAlert, FlashPopup, FormButton, PageTitel } from '../../../../components/common';
import EnterInput from '../../../../components/forms/EnterInput';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { IoRemove } from 'react-icons/io5';
import DragAndDropList from '../../../../components/forms/DragAndDropList';
import KickoffResponsibilities from './KickoffResponsibilities';
import KickoffMilestones from './KickoffMilestones';
import { CustomInput } from '../../../../components/forms';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DraggableTable from '@/components/table/DraggableTable';
import { ColumnDef } from '@tanstack/react-table';
import { ObjectId } from 'mongodb';

interface ArgsType {
    cid?: string | null;
    data?: Project;
    action?:string;
    setSubNavItems?:React.Dispatch<React.SetStateAction<any>>;
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



const KickoffForm_backup: React.FC<ArgsType> = ({ cid, data, action='update', setSubNavItems }) => {
    const { t } = useTranslation();
    const {id} = useParams();
    const [formData, setFormData] = useState<Project>();
    const [projectId, setProjectId] = useState<string|ObjectId>(cid ? cid : id ? id : '');
    const [createdBy, setCreatedBy] = useState<User>();
    const [kickoffData, setKickoffData] = useState<Kickoff>(kickoffDataInitial);
    const [responsibilities, setResponsibilities] = useState<KickoffResponsibility[]>([]);
    const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});

    const tdClasses = 'border-b border-slate-100';

    const subNavItems: NavItem[] = [
        { link: "projects", title: "projects_all" },
        { link: `projects/kickoff/${cid || id}`, title: "kickoff" },
      ];

    // Load data when the component mounts
    useEffect(() => {
        setSubNavItems && setSubNavItems(subNavItems);
        if(!cid){
            cid = id;
            setProjectId(cid ? cid : id ? id : '');
        }
        if (data) {
            const user: User = data.createdBy as unknown as User;
            setCreatedBy(user);
        }
    }, [kickoffData]);

    useEffect(()=>{
        setProjectId(cid ? cid : id ? id : '');
        getData();
    }, [])

    const getData = async ()=>{
        try{
            const populateFields = [
                {path: 'kickoff.responsibilities.role'},
                {path: 'kickoff.responsibilities.persons'},
            ]

            console.log(projectId);

            if(projectId){
                const res = await getRecordWithID({id:projectId, populateFields, type:'projects'});
                console.log(res);

                if(res.status === 'success' && res.data){
                    if(res.data.kickoff) setResponsibilities(res.data.kickoff.responsibilities);
                    if (res.data) {
                        setFormData(res.data);
                        if(res.data.kickOff) setKickoffData(res.data.kickoff);
                    }
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

                //return prevData;
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
    const pid = cid ? cid : id;
      if(verifyData() && pid){
        try{
            console.log(pid);
          const res = await addUpdateRecords({type:'projects', action:'update', id:pid, body:{kickoff:kickoffData}});
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
        <div className='data-wrap'>12345
          <form onSubmit={submitForm}>
            {formData &&
                <>
                <div>formdata</div>
                <div className='w-full my-4 rounded-md px-3 pb-4 bg-slate-100'>
                    <div className='grid grid-cols-1 lg:grid-cols-2'>
                        <div className='text-primary text-2xl md:text-3xl font-bold'>
                            {formData.name}
                        </div>
                        <div className='text-slate-600 text-sm flex items-center justify-end'>
                            <div>
                                <i className='text-slate-400'>{t(`createdBy`)}: </i> {createdBy && createdBy.name}
                            </div>
                            <div className=''> 
                                <span className='mx-2'> | </span>
                                <i className='text-slate-400'>{t(`createdAt`)}: </i> 
                                {formData.createdAt && format(new Date(formData.createdAt), 'dd.MM.yyyy')}
                            </div>
                        </div>
                    </div>

                    <div className='mt-3 grid grid-cols-1'>
                        <i className='text-slate-400'>{t(`description`)}</i>
                        {formData.description}
                    </div>
                </div>

                    <div className='mt-5 w-full '>
                        <div className='bg-slate-100 rounded-md'>
                            <div className='text-left px-3 '>
                                <PageTitel text={`${t('FORMS.timeline')}`} color='slate-300'  size='2xl'/>
                            </div>

                            <div className='grid grid-cols-2 gap-2 p-3 rounded-md '>
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
                        </div>

                        <div className='bg-slate-100 rounded-md mt-5 px-3 pb-4'>
                            <div className='text-left'>
                                <PageTitel text={`${t('FORMS.context')}`} color='slate-300' size='2xl' />
                            </div>
                            <div className='rounded-md'>
                                <CustomInput type='textarea' name='contenxt' value={kickoffData.context}
                                    onChange={(e)=>handleOnEnter({name:'context', value:e.target.value})}

                                />
                            </div>
                        </div>
                    </div>
                    {/* Project goals */}
                    <div className='border-collapse w-full'>
                        <div className='mt-4 pb-4 px-3 bg-slate-100  rounded-md'>
                            <div className='text-left'>
                                <PageTitel text={`${t('FORMS.objectives')}`} color='slate-300' size='2xl' />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2'>
                                <div className='p-2 text-left rounded-md'>
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
                                
                                <div className='p-2 text-left rounded-md'>
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
                            </div>
                        </div>
                        <div className='bg-slate-100 px-3 pb-4 mt-5 rounded-md'>       
                            <div className='text-left'>
                                <PageTitel text={`${t('FORMS.projectScope')}`} color='slate-300' size='2xl'   />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2'>
                                <div className='p-2 text-left md:border-r'>
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
                                <div className='p-2 text-leftrounded-md'>
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
                        </div>  
                    </div>

                     {/* Project milestones */}
                     <div className='bg-slate-100 rounded-md px-3 pb-4  mt-4 w-full'>
                         <div className='block'>
                             <PageTitel text={`${t('FORMS.projectMilestones')}`} color='slate-300' size='2xl'  />
                        </div>
                        {kickoffData.milestones && kickoffData.milestones.length > 0 ? 
                            <></> : <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                        }
                        <div className='rounded-md'>
                            <KickoffMilestones
                                milestones={kickoffData.milestones || []}
                                name="keyMilestones"
                                onChange={handleMilestone}
                                />
                        </div>
                    </div>

                     {/* Project responsibilities */}
                     <div className='border-b mt-5 pb-4 px-3 w-full'>
                        <div className='block '>
                             <PageTitel text={`${t('FORMS.kickoffResponsibilities')}`} color='slate-300' size='2xl'  />
                        </div>
                        <div className=''>
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
          <CustomAlert
          onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
          isOpen={alertData.isOpen}
          content={alertData.content}
          title={alertData.title}
          type={alertData.type || 'info'} 
        />

        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>
 
        </div>
    );
};

export default KickoffForm_backup;