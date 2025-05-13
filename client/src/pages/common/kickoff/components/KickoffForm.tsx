import React, { useEffect, useState } from 'react';
import { AlertPopupType, FlashPopupType, Kickoff, KickoffApproval, KickoffResponsibility, Milestone, NavItem, Project, User } from '@/interfaces';
import { CustomAlert, FlashPopup, FormButton, Headings, PageTitel, PersonName } from '../../../../components/common';
import EnterInput from '../../../../components/forms/EnterInput';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import DragAndDropList from '../../../../components/forms/DragAndDropList';
import KickoffResponsibilities from './KickoffResponsibilities';
import KickoffMilestones from './KickoffMilestones';
import { CustomDropdown, CustomInput } from '../../../../components/forms';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import { useParams } from 'react-router-dom';
import { ObjectId } from 'mongodb';
import ApprovalForm from './ApprovalForm';
import MentionUserInput from '../../../../components/forms/MensionUserInput';
import { ApprovalStatus } from '../../../../config/predefinedDataConfig';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import DeleteSmallButton from '../../../../components/common/DeleteSmallButton';
import { MdRocketLaunch } from 'react-icons/md';

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
    status:'inReview',
    approval:[],
    mainTasks: [],
    context: ''
};



const KickoffForm: React.FC<ArgsType> = ({ cid, data, action='update', setSubNavItems }) => {
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
      ];

    // Load data when the component mounts
    useEffect(() => {
        
    }, [kickoffData]);
    
    useEffect(()=>{
        setProjectId(cid ? cid : id ? id : '');
        getData();
        if(id || cid){
            setSubNavItems && setSubNavItems([...subNavItems,
                { link: `projects/view/${cid || id}`, title: "project" },
                { link: `projects/kickoff/${cid || id}`, title: "kickoff", icon:<MdRocketLaunch /> }
            ]);
        }
    }, [])

    const getData = async ()=>{
        try{
            const populateFields = [
                // {path: 'kickoff.responsibilities.role'},
                {path: 'kickoff.responsibilities.persons'},
                {path: 'kickoff.approval.user'},
            ]

            console.log(projectId);

            if(projectId){
                const res = await getRecordWithID({id:projectId, populateFields, type:'projects'});

                if(res.status === 'success' && res.data){
                    if(res.data.kickoff) setResponsibilities(res.data.kickoff.responsibilities);
                    if (res.data) {
                        setFormData(res.data);
                        console.log(res.data);
                        if(res.data.kickoff) setKickoffData(res.data.kickoff);
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
        setKickoffData((prevData) => ({
            ...prevData,
            milestones: value 
        }));
    }


    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    const pid = cid ? cid : id;
      if(verifyData() && pid){
        try{
            console.log(kickoffData);
          const res = await addUpdateRecords({type:'projects', action:'update', id:pid, body:{kickoff:kickoffData}});
          if(res){
            const msg = `${t(`RESPONSE.${res.code}`)}`
              if(res.status === 'success'){
                setFlashPopupData({...flashPopupData, isOpen:true, message:msg, type:'success'});
              }else{
                setFlashPopupData({...flashPopupData, isOpen:true, message:msg, type:'fail'});
              }
          }else{
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

    // open kickoff approval
    const openKickoffApproval = (index:number = -1)=>{
        let adata = null;
        if(index >= 0){
            const aDataV = kickoffData.approval && kickoffData.approval.length > 0 ? kickoffData.approval.filter((d, i)=> i === index) : null
            if(aDataV){
                adata = aDataV[0];
            }
        }
        setAlertData({...alertData, isOpen:true, type:'form', title:'Approval', content:
            <ApprovalForm defaultValue={adata} />

        })
    }

    const setApprovalUser = (user:User)=>{
        setKickoffData(prevVal=>{
            if(!prevVal) return prevVal;
            let apdata = prevVal.approval && prevVal.approval.length > 0 ? prevVal.approval : [];
            const nap = {user:user, status:'inReview'};
            if(apdata.length <= 0){
                apdata.push(nap as unknown as KickoffApproval)
            }else{

                const userexists = apdata.filter((d)=>(d.user as unknown as User)._id === user._id);
                console.log(userexists);
                if(userexists.length <= 0){
                    apdata.push(nap as unknown as KickoffApproval)
                }
            }

            return {...prevVal, approval:[...apdata]}
        })
    }

    const removeApprovalData = (index:number)=>{
        if(index >= 0){
            setKickoffData(prevVal=>{
                if(!prevVal) return prevVal;
                let apdata = prevVal.approval && prevVal.approval.length > 0 ? prevVal.approval : [];
                if(apdata.length > 0){
                    apdata = apdata.filter((d,i)=> i !==index );
                }
                return {...prevVal, approval:[...apdata]}
            })
        }
    }

    return (
        <div className='data-wrap relative'>
          <form onSubmit={submitForm}>
            {formData &&
                <>
                <div className='w-full mt-4 mb-8 rounded-md px-3 pb-4 shadow-card bg-white'>
                    
                    <div className='flex justify-between gap-2'>
                        <div className='text-slate-600 text-sm flex items-center justify-start py-2'>
                            <div>
                                <i className='text-slate-400'>{t(`createdBy`)}: </i> {createdBy && createdBy.name}
                            </div>
                            <div className=''> 
                                <span className='mx-2'> | </span>
                                <i className='text-slate-400'>{t(`createdAt`)}: </i> 
                                {formData.createdAt && format(new Date(formData.createdAt), 'dd.MM.yyyy')}
                            </div>
                        </div>
                        <div className='w-[150px]'>
                        <CustomDropdown 
                            data={ApprovalStatus}
                            selectedValue={kickoffData.status}
                            onChange={(rid, name, value, data)=>handleOnEnter({name:'status', value:value})}
                        />
                        </div>
                        
                    </div>

                    <div className='mt-3 grid grid-cols-1'>
                        <i className='text-slate-400'>{t(`description`)}</i>
                        <div
                            dangerouslySetInnerHTML={{ __html: formData.description || '' }}
                            className="p-2 border border-gray-300 rounded"
                            />
                    </div>
                </div>

                <div className='w-full mt-4 mb-8 rounded-md p-4 pb-4 shadow-card bg-white'>
                    <div className=' rounded-md'>
                        <div className='text-left mb-3'>
                            <Headings text={`${t('FORMS.timeline')}`} type='h3' />
                        </div>

                        <div className='grid grid-cols-2 gap-2 rounded-md '>
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
                </div>

                <div className='w-full mt-4 mb-8 rounded-md p-4 pb-4 shadow-card bg-white'>
                    <div className='text-left mb-3'>
                        <Headings text={`${t('FORMS.context')}`}  type='h3' />
                    </div>
                    <div className='rounded-md'>
                        <CustomInput type='textarea' name='contenxt' value={kickoffData.context}
                            onChange={(e)=>handleOnEnter({name:'context', value:e.target.value})}

                        />
                    </div>
                </div>
                {/* Project OBJECTIVES */}
                <div className='w-full mt-4 mb-8 rounded-md p-4 pb-4 shadow-card bg-white'>
                    <div className='text-left mb-3'>
                        <Headings text={`${t('FORMS.objectives')}`}  type='h3' />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2'>
                        <div className='p-2 text-left rounded-md md:border-r'> 
                            <div className='block mb-3'>
                                <Headings text={`${t('FORMS.projectGoals')}`}  type='h5' />
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
                            <div className='block mb-3'>
                                <Headings text={`${t('FORMS.keyDeliverables')}`}  type='h5' />
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
                <div className='w-full mt-4 mb-8 rounded-md p-4 pb-4 shadow-card bg-white'>       
                    <div className='text-left'>
                        <Headings text={`${t('FORMS.projectScope')}`}  type='h3' />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2'>
                        <div className='p-2 text-left md:border-r'>
                            <div className='block mb-3'>
                                <Headings text={`${t('FORMS.inScope')}`}  type='h5' />
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
                            <div className='block mb-3'>
                                <Headings text={`${t('FORMS.outOfScope')}`}  type='h5' />
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

                {/* Project milestones */}
                <div className='w-full mt-4 mb-8 rounded-md p-4 pb-4 shadow-card bg-white'>
                    <div className='block mb-3'>
                        <Headings text={`${t('FORMS.projectMilestones')}`}  type='h3' />
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
                <div className='w-full mt-4 mb-8 rounded-md p-4 pb-4 shadow-card bg-white'>
                    <div className='block mb-3'>
                        <Headings text={`${t('FORMS.kickoffResponsibilities')}`}  type='h3' />
                    </div>
                    <div className=''>
                        <KickoffResponsibilities selectedValues={kickoffData.responsibilities || []} onChange={handleResponsibilites}/>
                    </div>
                </div>
                     
                     
                    {/* Project approval by */}
                <div className='w-full mt-4 mb-8 rounded-md p-4 pb-4 shadow-card bg-white'>
                    <div className='block mb-3'>
                        <Headings text={`${t('FORMS.approvalFrom')}`}  type='h3' />
                    </div>
                    <div className='grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 '>
                        {kickoffData.approval && kickoffData.approval.length > 0 && kickoffData.approval.map((ad, ai)=>{
                            const auser = ad.user as unknown as User;
                            const statusexists = ApprovalStatus.filter((d)=>d._id === ad.status)
                            const astatus:{_id:string, name:string, color?:string} | null = statusexists ? statusexists[0] : null
                            const showDelteBtn = !ad.note && ad.status ? true : false;
                            return (

                                <div key={`kodap-${ai}`} className=' my-1 p-2 bg-yellow-50 border rounded-md'>
                                <div  className={`relative flex justify-between items-center ${showDelteBtn ? 'pr-5' : ''}`}
                                    
                                >  
                                    <div className='my-2'>
                                        <PersonName user={auser}/>
                                    </div>
                                    <div className={`text-xs rounded-sm  border-white border-1 py-1 px-2 rounded-md  ${astatus && astatus.color ? getColorClasses(astatus.color) : ''}
                                                    text-xs flex justify-center items-center rounded-sm 
                                                `}
                                    >{astatus ? astatus.name : ''}</div>
                                    {showDelteBtn && 
                                        <DeleteSmallButton onClick={()=>removeApprovalData(ai)} />
                                    }
                                </div>
                                {ad.note && 
                                    <div className='flex justify-start '> 
                                        *
                                        <div
                                        dangerouslySetInnerHTML={{ __html: ad.note || '' }}
                                        className="p-1  rounded text-xs text-red-600"
                                        />
                                    </div>
                                        }
                                </div>
                            )
                        })}
                    </div>
                    <div className='my-2 bg-slate-100 p-2 rounded-md'>
                        <label className='text-slate-400 text-sm'>{t('FORMS.selectUser')}</label>
                        <MentionUserInput type='users' inputType='text' 
                                onClick={(user, data)=>setApprovalUser(user)}
                            />
                    </div>
                </div>

                </>
            }

          <div className="mt-6 text-right sticky bottom-2 flex right-2">
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

export default KickoffForm;
