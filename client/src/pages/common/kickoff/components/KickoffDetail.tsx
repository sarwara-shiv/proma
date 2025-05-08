import React, { useEffect, useState } from 'react';
import { AlertPopupType, FlashPopupType, Kickoff, KickoffApproval, KickoffResponsibility, Milestone, NavItem, Project, User, UserGroup } from '@/interfaces';
import { CustomAlert, FlashPopup, Headings, PageTitel } from '../../../../components/common';
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
                    {kickoffData && kickoffData.approval && kickoffData.approval.length > 0 &&  
                    <div className='card- mb-6 bg-white'>
                        <div className='mb-3'>
                        <Headings text={`${t('needApprovalFrom')}`} type='h3' />
                        </div>
                        <div className='grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 '>
                            {kickoffData.approval.map((ad, ai)=>{
                                const auser = ad.user as unknown as User;
                                const statusexists = ApprovalStatus.filter((d)=>d._id === ad.status)
                                const astatus:{_id:string, name:string, color?:string} | null = statusexists ? statusexists[0] : null
                                return (
                                    <div key={`kodap-${ai}`} className={`
                                        my-1 p-2  rounded-md  border
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
                    {/* Project Details */}
                    <div className='mb-6 py-2'>
                    <table className='card- bg-white w-full text-sm mb-6'>
                        <tbody>
                            <tr className='border-1 border-slate-100 text-left'>
                                <th colSpan={2} className='p-2'>
                                    <div className='flex justify-between items-start'>
                                        <Headings text={`${t('projectDetails')} (${projectData._cid})`}  type='h3' />
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
                                <th className='max-w-[200px] text-left text-slate-400 bg-gray-100- p-2 border border-slate-300 text-sm'>{t('project')}</th>
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
                    </div>

                    {/* Objectives */}
                    <div className='bg-white mb-6'>
                    <div className='text-left mb-2'>
                        <Headings text={`${t('projectObjectives')}`}  type='h3' />
                    </div>
                    <div 
                        className='grid grid-cols-1 lg:grid-cols-2 pb-4 gap-8'
                    >
                        <div className='border p-2 rounded-md lg:border-r'>
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
                        <div className='bg-white p-2 rounded-md border'>
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
                        <div className='bg-white border p-2 rounded-md '>
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
                        <div className='bg-white p-2 rounded-md border'>
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
                        <ul className='bg-white rounded-md'>
                        {kickoffData.milestones && kickoffData.milestones.map((item, index)=>{
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

                    <div className='card- mb-6 bg-white'>
                        <div className='mb-3 text-left '>
                            <Headings text={`${t('projectResponsibilities')}`}  type='h3' />
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
