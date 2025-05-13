import React, { act, useEffect, useState } from 'react';
import { AlertPopupType, FlashPopupType, Kickoff, KickoffApproval, KickoffResponsibility, MainTask, Milestone, NavItem, Project, User, UserGroup } from '@/interfaces';
import { CustomAlert, CustomIconButton, CustomSmallButton, FlashPopup, Headings, ImageIcon, PageTitel, PersonName } from '../../../../components/common';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { CustomDropdown } from '../../../../components/forms';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import { useParams } from 'react-router-dom';
import { ApprovalStatus, milestoneStatuses } from '../../../../config/predefinedDataConfig';
import RichTextArea from '../../../../components/forms/RichTextArea';
import {useAuthContext } from '../../../../context/AuthContext';
import { FaEye, FaTasks } from 'react-icons/fa';
import { MdOutlineEdit, MdRocketLaunch } from 'react-icons/md';
import { DiScrum } from 'react-icons/di';
import { IoBarChartSharp, IoDocumentAttach } from 'react-icons/io5';
import MainTaskForm from '../../projects/components/MainTaskForm';

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
    const {user} = useAuthContext();
    const {id} = useParams();
    const [createdBy, setCreatedBy] = useState<User>();
    const [projectData, setProjectData] = useState<Project>();
    const [mainTasks, setMainTasks] = useState<MainTask[]>();
    const [kickoffData, setKickoffData] = useState<Kickoff>(kickoffDataInitial);
    const [responsibilities, setResponsibilities] = useState<KickoffResponsibility[]>([]);
    const [alertData, setAlertData] = useState<AlertPopupType>({isOpen:false, content:"", type:"info", title:""}); 
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
    const [noteValues, setNoteValues] = useState<string[]>([]);
    const [noteEdited, setNoteEdited] = useState<boolean[]>([]);

      const subNavItems: NavItem[] = [
        { link: `projects/view/${id}`, title: "project", icon:<FaEye />},
        { link: `projects/maintasks/${id}`, title: "maintasks", icon:<FaTasks />},
        { link: `projects/kickoff/${id}`, title: "kickOff", icon:<MdRocketLaunch />},
        { link: `projects/sprints/${id}`, title: "sprints", icon:<DiScrum />}, 
        { link: `projects/report/${id}`, title: "report", icon:<IoBarChartSharp />}, 
        { link: `projects/documentation/${id}`, title: "documentation", icon:<IoDocumentAttach />},
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
            const user: User = data.createdBy as unknown as User;
            setCreatedBy(user);
        }
    }, [kickoffData]);

    const getData = async ()=>{
        try{
            const populateFields = [
                {path:'mainTasks'},
                {path: 'kickoff.responsibilities.role'},
                {path: 'kickoff.responsibilities.persons'},
                {path: 'kickoff.approval.user'},
            ]
            if(cid){
                const res = await getRecordWithID({id:cid, populateFields, type:'projects'});
                if(res.status === 'success' && res.data){
                    if(res.data.kickoff) setResponsibilities(res.data.kickoff.responsibilities);
                    if (res.data.kickoff) {
                        setKickoffData(res.data.kickoff);
                    }
                    if(res.data.mainTasks){
                        setMainTasks(res.data.mainTasks);
                    }
                    setProjectData(res.data);
                    data = {...res.data}
                }

            }
        }catch(error){
            console.error(error);
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

    const addMainTask = (defaultMilestone:Milestone, action:"add"|"remove"="add")=>{
        if(!defaultMilestone || !projectData || !projectData._id) return null;

        if(action === 'add'){
            setAlertData({...alertData, isOpen:true, 
                title:<span>Add <span className='text-primary'>{t('mainTask')}</span> to Milestone: <span className='text-primary'>{defaultMilestone.name}</span></span>
                , type:"form",
                content: <MainTaskForm action='add' pid={projectData?._id} defaultMilestone={defaultMilestone} />
            });
        }
    }

    const changeMilestone = async (index:number, value:Milestone['status'])=>{
        let saveKickoff = false;
        if(index >= 0){
            setKickoffData(prevVal => {
                if (index >= 0 && prevVal.milestones && prevVal.milestones.length > 0) {
                    const updatedMilestones = prevVal.milestones.map((milestone, i) => {
                        if (i === index) {
                            saveKickoff = true;
                            return {
                                ...milestone,
                                status: value
                            };
                        }
                        return milestone;
                    });
                    
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
                  }
    
            }catch(error){
                console.error(error);
            }
        }
    }

    useEffect(() => {
        if (kickoffData?.approval?.length) {
            setNoteValues(kickoffData.approval.map(a => a.note || ''));
            setNoteEdited(kickoffData.approval.map(() => false));
        }
    }, [kickoffData]);

    const handleApprovalNoteChange = (index: number, dvalue: string, name: string = 'note') => {
        setNoteValues(prev => {
            const updated = [...prev];
            updated[index] = dvalue;
            return updated;
        });
    
        setNoteEdited(prev => {
            const updated = [...prev];
            const original = kickoffData.approval 
                            && (kickoffData.approval as unknown as KickoffApproval[]).length > 0 
                            && (kickoffData.approval as unknown as KickoffApproval[])[index]['note'] || ''; 
            updated[index] = dvalue !== original;
            return updated;
        });
    };

    const saveApproval = async (index: number, dvalue: string, name: string = 'status') => {
        if (index < 0) return;
    
        setKickoffData(prevVal => {
            if (!prevVal.approval || prevVal.approval.length === 0) return prevVal;
    
            let saveKickoff = false;
            const value = name === 'status'
                ? (dvalue as unknown as KickoffApproval['status'])
                : dvalue;
    
            // Update specific approval
            const updatedApproval = prevVal.approval.map((approval, i) => {
                if (i === index) {
                    saveKickoff = true;
                    return { ...approval, [name]: value };
                }
                return approval;
            });
    
            // Determine final project status based on all approval statuses
            const statuses = updatedApproval.map(a => a.status);
            const uniqueStatuses = Array.from(new Set(statuses));
    
            let finalStatus: Kickoff['status'];
    
            if (uniqueStatuses.every(s => s === 'approved' || s === 'notRequired')) {
                finalStatus = 'approved';
            } else if (uniqueStatuses.includes('rejected')) {
                finalStatus = 'rejected';
            } else if (uniqueStatuses.includes('needWork')) {
                finalStatus = 'needWork';
            } else if (uniqueStatuses.length === 1) {
                finalStatus = uniqueStatuses[0] as Kickoff['status'];
            } else {
                finalStatus = 'inReview';
            }
    
            // Build final updated kickoff data
            const cValue: Kickoff = {
                ...prevVal,
                approval: updatedApproval,
                status: finalStatus,
            };
    
            if (saveKickoff) {
                saveKickoffData(cValue);
            }
    
            return cValue;
        });
    };
    

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
                    {kickoffData &&  
                    <>
                        <div className='card flex flex-col p-4 gap-2 mb-8'>
                            <div className='flex justify-between'>

                                <div className='flex justify-left gap-3'>
                                    {kickoffData.startDate && 
                                    <div>
                                        <span className='text-slate-400 text-xs'>{t('startDate')}: </span>
                                        <span className='text-sm text-slate'>
                                            {format(kickoffData.startDate, 'dd.MM.yyyy')}
                                        </span>
                                        </div>
                                    }
                                    {kickoffData.endDate && 
                                    <div>
                                        <span className='text-slate-400 text-xs'>{t('endDate')}: </span>
                                        <span className='text-sm text-slate'>
                                        {format(kickoffData.endDate, 'dd.MM.yyyy')}
                                        </span>
                                        </div>
                                    }
                                </div>

                                    {getStatusData(kickoffData) && 
                                        ((astatus) => {
                                            return (
                                                <div className={`text-xs rounded-md  border-white border-1 
                                                    px-1 py-1
                                                     ${astatus && astatus.color ? getColorClasses(astatus.color) : ''} 
                                                        text-xs flex justify-center items-center rounded-md 
                                                    `}>
                                                      {astatus && astatus.name}  
                                                </div>
                                            );
                                        })(getStatusData(kickoffData))
                                    }
                            </div>
                            <div>
                                <div>
                                    <Headings text={t('context')} type='h4' />
                                </div>
                                <div className='text-sm text-slate-500' 
                                    dangerouslySetInnerHTML={{__html:kickoffData?.context || ''}}>
                                </div>
                            </div>
                        </div>
                        {kickoffData && kickoffData.approval && kickoffData.approval.length > 0 &&  
                            <div className='card- mb-8 bg-white'>
                                <div className='mb-3'>
                                    <Headings text={`${t('needApprovalFrom')}`} type='h3' />
                                </div>
                                <div className='grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {kickoffData.approval.map((ad, ai)=>{
                                        const auser = ad.user as unknown as User;
                                        const statusexists = ApprovalStatus.filter((d)=>d._id === ad.status)
                                        const astatus:{_id:string, name:string, color?:string} | null = statusexists ? statusexists[0] : null
                                        return (
                                            <div key={`kodap-${ai}`} className={`
                                                my-1 p-4  rounded-md  card bg-yellow-50 mb-0
                                                ${user && user._id as unknown as string === auser._id ? 'border-green-200  bg-white' : 'border bg-gray-100'}
                                            `}>
                                                <div  className='
                                                    flex justify-between 
                                                '>
                                                    <div className='flex-1 font-semibold mb-2'>
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
                                                    <div className='flex'>
                                                        
                                                        <RichTextArea 
                                                        height='70'
                                                        textSize='xs'
                                                        label={t('FORMS.note')}
                                                            defaultValue={ad.note || ''}
                                                            onChange={(name, value)=>handleApprovalNoteChange(ai, value, 'note')}
                                                        />
                                                        {noteEdited[ai] && (
                                                            <div className='flex justify-center items-end pl-0.5'>

                                                                <button onClick={() => saveApproval(ai, noteValues[ai], 'note')} 
                                                                className=' flex p-1 bg-primary-light rounded-full hover:bg-primary hover:text-white transition-all'>
                                                                    <MdOutlineEdit />
                                                                </button>
                                                            </div>
                                                        )}
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
                    </>
                    }

                    {/* Objectives */}
                    <div className='bg-white mb-6'>
                    <div className='text-left mb-2'>
                        <Headings text={`${t('objectives')}`}  type='h3' />
                    </div>
                    <div 
                        className='grid grid-cols-1 lg:grid-cols-2 pb-4 gap-8'
                    >
                        <div className=' p-4 rounded-md card mb-0'>
                            <Headings text={`${t('projectGoals')}`}  type='h5' />
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
                        <div className='bg-white p-4 rounded-md card mb-0'>
                            <Headings text={`${t('projectDeliverables')}`}  type='h5' />
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
                    <div className='card- mb-6 bg-white'>
                    <div className='text-left mb-2'>
                        <Headings text={`${t('projectScope')}`}  type='h3' />
                    </div>
                    <div 
                        className='grid grid-cols-1 lg:grid-cols-2 pb-4 gap-8'
                    >
                        <div className='bg-white card p-4 rounded-md mb-0'>
                            <Headings text={`${t('inScope')}`}  type='h5' classes='border-b'/>
                            <ul className='p-2'>
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
                        <div className='bg-white p-4 rounded-md card mb-0'>
                            <Headings text={`${t('outOfScope')}`}  type='h5' classes='border-b'/>
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
                    <div className='card- mb-6 bg-white'>
                        <div className='text-left mb-2'>
                            <Headings text={`${t('projectMilestones')}`}  type='h3' />
                        </div>
                        <ul className='bg-white rounded-md flex flex-col gap-4'>
                        {kickoffData.milestones && kickoffData.milestones.map((item, index)=>{
                            const kMT = mainTasks && mainTasks.length > 0 && mainTasks.filter((mt)=>mt.milestone?.toString() === item._id?.toString());
                            return (
                                <li key={`kdm-${index}`}
                                    className='
                                    mb-3 p-4 card mb-0
                                    rounded-md'
                                >
                                    <div className=''>
                                        <div className='flex justify-between'>

                                            <div className='mb-1 pb-1'>
                                                <span className='text-md font-semibold text-slate-600'>{item.name}</span>
                                                <span className='ml-2'>
                                                    <i className='text-slate-400 text-xs'>{t('dueDate')}: </i> {item.dueDate ? format(new Date(item.dueDate), 'dd.MM.yyyy'): ''}
                                                </span>
                                            </div>
                                            <div className='flex justify-end'>
                                                <span onClick={()=>toggleMilestoneStatus(index, item )}
                                                    className={`cursor-pointer flex items-center justify-center ml-2 text-xs py-1 px-2 rounded-md ${getColorClasses(item.status)}`}
                                                    >
                                                    {/* <i className='text-slate-400'>{t('status')}: </i>  */}
                                                    {t(`${item.status}`)}</span>
                                            </div>
                                        </div>
                                        {item.description  && 
                                            <div className='text-xs px-2 mb-2 text-slate-500' 
                                                dangerouslySetInnerHTML={{__html: item.description || ''}}>
                                            </div>
                                        }
                                    </div>
                                    {kMT && kMT.length > 0 &&
                                        <div className='bg-gray-100 p-2 mt-2 rounded-md'>
                                            <div className='mb-1'>
                                                <Headings text={t('maintasks')} type='h5'/>
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                {kMT.map((mtdata, midx)=>{
                                                    return (
                                                        <div key={midx} className={`flex gap-2 justify-between text-sm mb-1 items-center bg-slate-100 pb-1 pt-2
                                                            ${midx !== 0 && 'border-t'}
                                                        `}>
                                                            <div className='flex gap-2'>
                                                                <div className='font-semibold'>{mtdata.name}</div>
                                                                <div className='h-4 border-r border-slate-400'></div>
                                                                <div className={``}>
                                                                    <span className='text-xs text-slate-400'>{t('subtasks')}: </span>   
                                                                    <span className='text-md font-bold'>{mtdata.subtasks?.length}</span>
                                                                </div>
                                                            </div>
                                                            <div className={`text-xs ${getColorClasses(mtdata.status)} py-0.5 px-1 rounded-md shadow`}>{mtdata.status}</div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    }

                                    <div className='flex justify-end py-2'>
                                        <CustomSmallButton text={`${t('add')} ${t('task')}`} size='sm' type='add' onClick={()=>addMainTask(item)}/>
                                    </div>
                                </li>
                            )
                        }

                        )}
                        </ul>
                    </div>

                    {/* Responsibilities */}

                    <div className='card- mb-6 bg-white'>
                        <div className='mb-3 text-left '>
                            <Headings text={`${t('projectResponsibilities')}`}  type='h3' />
                        </div>
                        <ul className='rounded-md flex flex-col gap-4'>
                            {responsibilities && responsibilities.map((item,index)=>{
                                const role:UserGroup = item.role as unknown as UserGroup; 
                                const persons:User[] = item.persons as unknown as User[]; 
                                const work = item.work;
                                const details = item.details;
                                return (
                                    <li key={`prespo-${index}`} className='
                                        p-4 my-3  card rounded-md mb-0
                                    '>
                                        <div>
                                            <Headings text={role.displayName} type='h4' />
                                            <div className='flex gap-4 my-2'>

                                                {persons && persons.map((per,perIndex)=>{
                                                    const seperator = perIndex !== 0 && ', ';
                                                    return (
                                                        <PersonName user={per} key={`pers-${index}-${perIndex}`}/>
                                                    )
                                                })}
                                            </div>
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
