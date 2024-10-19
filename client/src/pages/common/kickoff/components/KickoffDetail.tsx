import React, { useEffect, useState } from 'react';
import { AlertPopupType, FlashPopupType, Kickoff, KickoffApproval, KickoffResponsibility, Milestone, NavItem, Project, User, UserGroup } from '@/interfaces';
import { CustomAlert, FlashPopup, PageTitel } from '../../../../components/common';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { CustomDropdown, CustomInput } from '../../../../components/forms';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import { useParams } from 'react-router-dom';
import { ApprovalStatus, milestoneStatuses } from '../../../../config/predefinedDataConfig';
import { useAuth } from '../../../../hooks/useAuth';
import RichTextArea from '../../../../components/forms/RichTextArea';

interface ArgsType {
    cid?: string | null;
    data?: Project;
    setSubNavItems?:React.Dispatch<React.SetStateAction<any>>;
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



const KickoffDetail: React.FC<ArgsType> = ({ cid, data, setSubNavItems }) => {
    const { t } = useTranslation();
    const {user} = useAuth();
    const {id} = useParams();
    const [createdBy, setCreatedBy] = useState<User>();
    const [projectStatus, setProjectStatus] = useState<any>();
    const [projectData, setProjectData] = useState<Project>();
    const [kickoffData, setKickoffData] = useState<Kickoff>(kickoffDataInitial);
    const [responsibilities, setResponsibilities] = useState<KickoffResponsibility[]>([]);
    const [alertData, setAlertData] = useState<AlertPopupType>({isOpen:false, content:"", type:"info", title:""}); 
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});

    const subNavItems: NavItem[] = [
        { link: "projects", title: "projects_all" },
        { link: `projects/kickoff/${cid || id}`, title: "kickoff" },
        { link: `projects/kickoff-update/${cid || id}`, title: "kickoffUpdate" },
        { link: `projects/maintasks/${cid || id}`, title: "maintasks" }, 
      ];
    
    useEffect(()=>{
        if(!cid){
            cid = id;
        }
        setSubNavItems && setSubNavItems(subNavItems); 

        getData();

    }, [])

    // Load data when the component mounts
    useEffect(() => {
        if (data) {
            console.log(data);
            const user: User = data.createdBy as unknown as User;
            setCreatedBy(user);
        }
    }, [kickoffData]);

    const getData = async ()=>{
        try{
            const populateFields = [
                {path: 'kickoff.responsibilities.role'},
                {path: 'kickoff.responsibilities.persons'},
                {path: 'kickoff.approval.user'},
            ]
            if(cid){
                const res = await getRecordWithID({id:cid, populateFields, type:'projects'});
                console.log(res);

                if(res.status === 'success' && res.data){
                    if(res.data.kickoff) setResponsibilities(res.data.kickoff.responsibilities);
                    if (res.data.kickoff) {
                        setKickoffData(res.data.kickoff);
                    }
                    setProjectData(res.data);
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

    // milestone status
    const toggleMilestoneStatus = (index:number, milestone:Milestone)=>{
        setAlertData({...alertData, isOpen:true, 
            content:<CustomDropdown
            data={milestoneStatuses}
            label={t('status')}
            selectedValue={milestone && milestone.status ? milestone.status : ''}
            onChange={(recordId, name, value, data) => changeMilestone(index, value as Milestone['status'])}
          />
        })
    }

    const changeMilestone = async (index:number, value:Milestone['status'])=>{
        let saveKickoff = false;
        if(index >= 0){
            setKickoffData(prevVal => {
                if (index >= 0 && prevVal.milestones && prevVal.milestones.length > 0) {
                    const updatedMilestones = prevVal.milestones.map((milestone, i) => {
                        if (i === index) {
                            console.log(i, index);
                            saveKickoff = true;
                            return {
                                ...milestone,
                                status: value
                            };
                        }
                        return milestone;
                    });

                    console.log(updatedMilestones);
                    
                    const cValue =  {
                        ...prevVal,
                        milestones: updatedMilestones
                    };
                    
                    saveKickoffData(cValue);

                    return cValue;
                }
                return prevVal;
            })
        }
    }

    const saveKickoffData = async(value:Kickoff)=>{
        const pid = cid ? cid : id;
        if(value && pid){
            try{
                const res = await addUpdateRecords({type:'projects', action:'update', id:pid, body:{kickoff:value}});
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

    const saveApproval = async(index:number, dvalue:string, name:string = 'status')=>{
        let saveKickoff = false;
        const value = name === 'status' ? dvalue as unknown as KickoffApproval['status'] : dvalue
        if(index >= 0){
            setKickoffData(prevVal => {
                if (index >= 0 && prevVal.approval && prevVal.approval.length > 0) {
                   
                    const updatedApproval= prevVal.approval.map((approval, i) => {
                        
                        if (i === index) {
                            saveKickoff = true;
                            return {
                                ...approval,
                                [name]: value
                            };
                        }
                        return approval;
                    });
                    let approvedCount = 0;
                    let statusA:string[] = [];
                    updatedApproval.map((approval, i) => {
                        if(approval.status === 'approved' || approval.status === 'notRequired' ) approvedCount++; 
                        if(statusA.length > 0){
                            if(!statusA.includes(approval.status)){
                                if(approval.status === 'notRequired' && !statusA.includes('approved') || approval.status === 'approved' && !statusA.includes('notRequired')){
                                    statusA.push(approval.status);
                                }
                            }   
                        }else{
                            statusA.push(approval.status);
                        }
                        return approval;
                    });

                    
                    
                    let cValue =  {
                        ...prevVal,
                        approval: updatedApproval
                    };
                    
                    if(saveKickoff){
                        if(updatedApproval.length > 0){
                            if(approvedCount === updatedApproval.length && approvedCount > 0){
                                cValue = {...cValue, status:'approved'}
                            }else{
                                if(statusA.length === 1){
                                    cValue = {...cValue, status:statusA[0] as unknown as Kickoff["status"]}
                                }else{
                                    cValue = {...cValue, status:'inReview'}
                                }
                            }
                        }
                        saveKickoffData(cValue);
                    }

                    return cValue;
                }
                return prevVal;
            })
        }
    }

    const getStatusData = (kickoff:Kickoff)=>{
        let sdata:{_id:string, name:string, color?:string} =  {_id:'', name:'', color:''};
        const ad = kickoff.status || 'inReview';
        const statusexists = ApprovalStatus.filter((d)=>d._id === ad)
        const astatus:{_id:string, name:string, color?:string} | null = statusexists ? statusexists[0] : null;
        if(astatus){
            sdata = astatus
        }

        return sdata;

    }

    return (
        <div className='data-wrap'>
            {projectData &&
                <>  
                    {/* APPROVAL FIELDS */}
                    {kickoffData && kickoffData.approval && kickoffData.approval.length > 0 &&  
                    <div className='card bg-white'>
                        <div className='mb-3'>
                        <PageTitel text={`${t('needApprovalFrom')}`} color='slate-300' size='2xl'/>
                        </div>
                        <div className='grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 '>
                            {kickoffData.approval.map((ad, ai)=>{
                                const auser = ad.user as unknown as User;
                                const statusexists = ApprovalStatus.filter((d)=>d._id === ad.status)
                                const astatus:{_id:string, name:string, color?:string} | null = statusexists ? statusexists[0] : null
                                return (
                                    <div key={`kodap-${ai}`} className='my-1 p-2 border rounded-md bg-yellow-100'>
                                        <div  className='
                                            flex justify-between 
                                        '>
                                            <div className='flex-1'>
                                                <div>{auser.name}</div>
                                            </div>
                                                <div >
                                                {user && user._id as unknown as string === auser._id ? 
                                                <div className={`w-[100px] text-xs rounded-sm  border-white border-1 px-1 ${astatus && astatus.color ? getColorClasses(astatus.color) : ''}` }>
                                                    <CustomDropdown 
                                                        style='table'
                                                        data={ApprovalStatus}
                                                        selectedValue={ad.status}
                                                        onChange={(rid, name, value, data)=>saveApproval(ai, value)}
                                                    />
                                                    </div>
                                                : 
                                                <>
                                                    <div className={`text-xs rounded-sm  border-white border-1 px-1 ${astatus && astatus.color ? getColorClasses(astatus.color) : ''}
                                                        text-xs flex justify-center items-center rounded-sm 
                                                    `}
                                                    >
                                                        {astatus ? astatus.name : ''}
                                                    </div>
                                                </>}
                                                
                                            </div>
                                            
                                        </div>
                                        {user && user._id as unknown as string === auser._id ?
                                            <div>
                                                <RichTextArea 
                                                height='70'
                                                textSize='xs'
                                                label={t('FORMS.note')}
                                                    defaultValue={ad.note || ''}
                                                    onChange={(name, value)=>saveApproval(ai, value, 'note')}
                                                />
                                            </div>
                                            :
                                            <div className='pt-1.5'>
                                                <label className="text-gray-400 flex items-center text-sm">{t('FORMS.note')}</label>
                                                <div
                                                dangerouslySetInnerHTML={{ __html: ad.note || '' }}
                                                className="p-2 border border-gray-300 rounded text-xs text-red-600  min-h-[70px]"
                                                />
                                            </div>
                                        }
                                    </div>
                                )
                            })}
                        </div>
                        </div>
                    }
                    {/* Project Details */}
                    <table className='card bg-white w-full text-sm'>
                        <tbody>
                            <tr className='border-1 border-slate-100 text-left'>
                                <th colSpan={2} className='p-2'>
                                    <div className='flex justify-between items-start'>
                                        <PageTitel text={`${t('projectDetails')} (${projectData._cid})`} color='slate-300' size='2xl'/>

                                        {getStatusData(kickoffData) && 
                                        ((astatus) => {
                                            return (
                                                <div className={`text-xs rounded-sm  border-white border-1 
                                                    px-1 py-1
                                                     ${astatus && astatus.color ? getColorClasses(astatus.color) : ''} 
                                                        text-xs flex justify-center items-center rounded-sm 
                                                    `}>
                                                      {astatus && astatus.name}  
                                                </div>
                                            );
                                        })(getStatusData(kickoffData))
                                    }


                                    </div>
                                </th>
                            </tr>
                            <tr className='border-1 border-slate-100'>
                                <th className='max-w-[200px] text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('project')}</th>
                                <td className='border border-slate-300 p-2 text-2xl font-bold text-slate-800'>{projectData.name}</td>
                            </tr>

                            <tr>
                                <th className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('startDate')}</th>
                                <td className='border border-slate-300 p-2'>
                                    {kickoffData.startDate ? format(new Date(kickoffData.startDate), 'dd.MM.yyyy') : '-'}
                                </td>
                            </tr>

                            <tr>
                                <th className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('endDate')}</th>
                                <td className='border border-slate-300 p-2'>
                                    {kickoffData.endDate ? format(new Date(kickoffData.endDate), 'dd.MM.yyyy') : '-'}
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
                                <td colSpan = {2} className='border border-slate-300 p-2'>
                                <div className='text-sm px-2 mb-2 text-slate-500' 
                                    dangerouslySetInnerHTML={{__html: projectData.description || ''}}>
                                </div>
                                </td>
                            </tr>
                            <tr>
                                <th colSpan = {2} className='max-w-[200px]  text-left bg-gray-100 p-2 border border-slate-300 text-sm'>{t('context')}</th>
                            </tr>
                            <tr>
                                <td colSpan = {2} className='border border-slate-300 p-2'>
                                <div className='text-sm px-2 mb-2 text-slate-500' 
                                    dangerouslySetInnerHTML={{__html:kickoffData?.context || ''}}>
                                </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Objectives */}
                    <div className='card bg-white'>
                    <div className='text-left'>
                        <PageTitel text={`${t('projectObjectives')}`} color='slate-300' size='2xl'/>
                    </div>
                    <div 
                        className='grid grid-cols-1 lg:grid-cols-2 pb-4'
                    >
                        <div className='mt-3 bg-white p-2 rounded-md lg:border-r'>
                            <PageTitel text={t('projectGoals')} color='text-slate-400'/>
                            <ul >
                                {kickoffData.goals ? kickoffData.goals.map((goal,index)=>{

                                    return (
                                        <li key={`pgoals-${index}`} className='text-sm text-slate-500'>
                                            <span className='font-bold pr-2'>{index + 1}</span>{goal}
                                        </li>
                                    )
                                }) :
                                <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                            }
                            </ul>
                        </div>
                        <div className='mt-3 bg-white p-2 rounded-md'>
                            <PageTitel text={t('projectDeliverables')} color='text-slate-400'/>
                            <ul className='bg-white p-2 rounded-md'>
                                {kickoffData.keyDeliverables ? kickoffData.keyDeliverables.map((item,index)=>{

                                    return (
                                        <li key={`pdel-${index}`} className='text-slate-500 text-sm'>
                                            <span className='font-bold pr-2'>{index + 1}</span>{item}
                                        </li>
                                    )
                                }) :
                                <p className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</p>
                            }
                            </ul>
                        </div>
                    </div>
                    </div>

                    {/* Project Scope */}
                    <div className='card bg-white'>
                    <div className='text-left'>
                        <PageTitel text={`${t('projectScope')}`} color='slate-300' size='2xl'/>
                    </div>
                    <div 
                        className='grid grid-cols-1 lg:grid-cols-2 border-b pb-4'
                    >
                        <div className='mt-3 bg-white p-2 rounded-md lg:border-r '>
                            <PageTitel text={t('inScope')} color='text-slate-400'/>
                            <ul className=''>
                                {kickoffData.inScope ? kickoffData.inScope.map((item,index)=>{

                                    return (
                                        <li key={`pinscope-${index}`} className='text-slate-500 text-sm'>
                                            <span className='font-bold pr-2'>{index + 1}</span>{item}
                                        </li>
                                    )
                                }) :
                                <li className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</li>
                            }
                            </ul>
                        </div>
                        <div className='mt-3 bg-white p-2 rounded-md'>
                            <PageTitel text={t('outOfScope')} color='text-slate-400'/>
                            <ul className='bg-white p-2 rounded-md'>
                                {kickoffData.outOfScope ? kickoffData.outOfScope.map((item,index)=>{

                                    return (
                                        <li key={`pdel-${index}`} className='text-slate-500 text-sm'>
                                            <span className='font-bold pr-2'>{index + 1}</span>{item}
                                        </li>
                                    )
                                }) :
                                <li className='pb-4 pt-1 text-slate-300  italic'>{t('empty')}</li>
                            }
                            </ul>
                        </div>
                    </div>
                    </div>

                    {/* Milestones */}
                    <div className='card bg-white'>
                        <div className='text-left mb-2'>
                            <PageTitel text={`${t('projectMilestones')}`} color='slate-300' size='2xl'/>
                        </div>
                        <ul className='bg-white p-2 rounded-md'>
                        {kickoffData.milestones && kickoffData.milestones.map((item, index)=>{
                            console.log(item);
                            return (
                                <li key={`kdm-${index}`}
                                className='
                                grid
                                grid-cols-1 md:grid-cols-2
                                p-2
                                border
                                mb-3
                                rounded-md
                                '
                                >
                                  
                                <div className='mb-1 pb-1'>
                                    <span className='px-2 px-1 text-md font-semibold text-slate-600'>{item.name}</span>
                                    <span className='ml-2'>
                                        <i className='text-slate-400'>{t('dueDate')}: </i> {item.dueDate ? format(new Date(item.dueDate), 'dd.MM.yyyy'): ''}
                                    </span>
                                </div>
                                <div className='flex justify-end'>
                                    <span onClick={()=>toggleMilestoneStatus(index, item )}
                                        className={`cursor-pointer flex items-center justify-center ml-2 text-xs py-1 px-2 rounded-md ${getColorClasses(item.status)}`}
                                    >
                                        {/* <i className='text-slate-400'>{t('status')}: </i>  */}
                                        {t(`${item.status}`)}</span>
                                </div>
                                <div className='text-xs px-2 mb-2 text-slate-500' 
                                    dangerouslySetInnerHTML={{__html: item.description || ''}}>
                                </div>
                                </li>
                            )
                        }

                        )}
                        </ul>
                    </div>

                    {/* Responsibilities */}

                    <div className='card bg-white'>
                        <div className='mb-3 text-left '>
                            <PageTitel text={`${t('projectResponsibilities')}`} color='slate-300' size='2xl'/>
                        </div>
                        <ul className='rounded-md'>
                            {responsibilities && responsibilities.map((item,index)=>{
                                const role:UserGroup = item.role as unknown as UserGroup; 
                                const persons:User[] = item.persons as unknown as User[]; 
                                const work = item.work;
                                const details = item.details;
                                return (
                                    <li key={`prespo-${index}`} className='
                                        p-2 my-3  border rounded-md 
                                    '>
                                        <div>
                                            <span 
                                            className='font-bold pr-1'
                                            > {role.displayName}</span>
                                        
                                            {persons && persons.map((per,perIndex)=>{
                                                const seperator = perIndex !== 0 && ', ';
                                                return (
                                                    <span key={`pers-${index}-${perIndex}`}
                                                    className='text-primary'
                                                    >{seperator} {per.name}</span>
                                                )
                                            })}
                                        </div>
                                        <div className='grid grid-cols-1'>
                                           {work &&  <span className='text-sm'> {work}</span>}
                                            {details && 
                                                <span className='
                                                italic text-xs text-slate-400
                                                '> {details}</span>
                                            }
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <CustomAlert
                            onClose = {()=> setAlertData({...alertData, 'isOpen':!alertData.isOpen})}
                            isOpen ={alertData.isOpen}
                            content = {alertData.content}
                            title = {alertData.title}
                            type={alertData.type || 'info'}
                    />
                    <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>

                </>
            }
        </div>
    );
};

export default KickoffDetail;
