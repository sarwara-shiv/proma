import { getRecordsWithFilters} from '../../../hooks/dbHooks';
import { AlertPopupType, FlashPopupType, ISprint, NavItem, Project, QueryFilters, SidePanelProps} from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { ObjectId } from 'mongodb';
import { useTranslation } from 'react-i18next';
import { IoMdAdd } from 'react-icons/io';
import { CustomAlert, FlashPopup, Headings, NoData, ToggleSwitch } from '../../../components/common';
import EditSprints from './components/EditSprints';
import SidePanel from '../../../components/common/SidePanel';
import AddUpdateSprint from './components/AddUpdateSprint';
import { DiScrum } from 'react-icons/di';
import { MdDashboard, MdOutlineBarChart, MdOutlineViewTimeline } from 'react-icons/md';
import SprintTimelineTable from './components/SprintTimelineTable';
import SprintStatusChart from './components/SprintStatusChart';
interface ArgsType {
    cid?:string | null;
    action?:"add" | "update";
    data?: Project; 
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
    navItems?:NavItem[];
    checkDataBy?:string[];
}

const Sprints:React.FC<ArgsType> = ({cid, action, data, checkDataBy=['name'], setSubNavItems}) => {
  const {id} = useParams();
  const {t} = useTranslation();
  const [lastSidePanelKey, setLastSidePanelKey] = useState<string|null>();
  const [projectData, setProjectData] = useState<Project |null>(data || null);
  const [projectId, setProjectId] = useState<ObjectId | string | null>(cid ? cid : id ? id : null);
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
  const [spProps, setSpProps] = useState<SidePanelProps>({isOpen:false, title:"AddTasks", children:"Add New Sprint"})
  const [sprintsData, setSprintsData] = useState<ISprint[]>([]);
  const [selectedNav, setSelectedNav] = useState<string>('sprint_all');
  const [taskView, setTaskView] = useState<string>('list');
  //---------- table columns model end

  useEffect(()=>{
    if(!cid){
        cid = id;
    }
    cid && setProjectId(cid);
    console.log(projectData);
      getData();
  }, [projectId]);


// GET SPRINTS
  const getData = async ()=>{
    try{
        const populateFields = [
            {path:'_pid'},
            { 
                path: 'backlog',
                populate: [
                    { path: 'taskId',
                        populate : 'responsiblePerson'
                     },
                ]
            }
        ];
        const pid = cid ? cid : id;

        if(pid){
            const filters:QueryFilters = {
                _pid:pid
            }
            const res = await getRecordsWithFilters({
                populateFields, type: 'sprints',
                limit: 0,
                pageNr: 0,
                filters
            });
            
            console.log(res);

            if(res.status === 'success' && res.data){
                setSprintsData(res.data);
                if(res.data.length >0){
                    setProjectData(res.data[0]._pid);
                }
            }

        }
      }catch(error){
          console.log(error);
      }
  }

  // OPEN SIDE PANEL
  const addUpdateForm = (action:string = 'add')=>{
      if(action === 'add'){
        if(lastSidePanelKey === 'add-form'){
            closeSidePanel();
            return;
        }
        setLastSidePanelKey('add-form');
        setSpProps({...spProps, isOpen:true, title:`${t('sprint_add')}`,
            children:<AddUpdateSprint key="add-form" projectId={projectId}/>
        });
    }
  }

  // CLOSE SIDE PANEL
  const closeSidePanel = ()=>{
    setLastSidePanelKey(null);
    setSpProps({...spProps, isOpen:false, children:''});
  }



  return (
    <div className=''>
         <div className={`flex ${projectData ? 'justify-between' : 'justify-end'} items-center mb-4`}>
                {projectData && 
                <Headings text={projectData.name} type='h1'/>
                }
            <ToggleSwitch type='yesno' noText={t('list')} yesText={t('kanaban')} yesColor='green' noColor='green'
                onChange={(value)=>{value ? setTaskView('kanaban') : setTaskView('list')}}
            />

        </div>
        {/* BOARD */}
       <div className='kanaban-board'>
        {projectId && sprintsData && sprintsData.length > 0 ? (
            <>
                {selectedNav === 'sprint_all' &&  <EditSprints pid={projectId} taskView={taskView}/>}
                {selectedNav === 'timeline' && <SprintTimelineTable sprints={sprintsData} />}
                {selectedNav === 'status' && <SprintStatusChart sprints={sprintsData} />}
                {selectedNav === 'dashboard' && (
                <>
                    <SprintStatusChart sprints={sprintsData} />
                    <SprintTimelineTable sprints={sprintsData} />
                </>
                )}
            </>
            ) : (
            <NoData />
            )}
        </div> 

        {/* NAVIGATION */}
         <div className='sticky bottom-4 right-4 pr-1 mt-10 max-w-5xl m-auto'>
            <div className='flex justify-between items-center mb-2 bg-white rounded-md box-shadow gap-2'>
                {/* ADD NEW SPRINT */}
                <div className='flex items-center gap-2'>

                    <div onClick={()=>addUpdateForm()}
                        className='group flex flex-col justify-center items-center py-1 px-2 cursor-pointer 
                        border-r border-slate-400'
                        >
                        <span className='aspect-1/1 p-1 text-xl group-hover:scale-125 group-hover:text-primary 
                            transition-transform duration-100 ease origin-center
                            '><IoMdAdd/> </span>
                        <span className='text-[11px] '>{t('sprint_add')}</span>
                    </div>
                    {selectedNav && 
                        <div className='text-xl font-bold'>{t(selectedNav)}</div>
                    }
                </div>
                <div className='flex justify-end gap-1'>
                    {/* Dashboard */}
                    <div onClick={()=>{selectedNav !== 'dashboard' && setSelectedNav('dashboard')}}
                        className={`group flex flex-col justify-center items-center py-1 px-2 cursor-pointer 
                            ${selectedNav && selectedNav === 'dashboard' ? 'bg-primary-light ' : ''} rounded-lg border-2 border-white`
                         }
                        >
                        <span 
                        className={`aspect-1/1 p-1 text-xl
                            transition-transform duration-100 ease origin-center
                            ${selectedNav && selectedNav !== 'dashboard' ? 'group-hover:scale-125 group-hover:text-primary' : ''}
                        `}>
                            <MdDashboard/> </span>
                        <span className='text-[11px]'>
                            {t('dashboard')}
                        </span>
                    </div>
                    {/* STATUS*/}
                    <div onClick={()=>{selectedNav !== 'status' && setSelectedNav('status')}}
                        className={`group flex flex-col justify-center items-center py-1 px-2 cursor-pointer 
                            ${selectedNav && selectedNav === 'status' ? 'bg-primary-light ' : ''} rounded-lg border-2 border-white`
                         }
                        >
                        <span 
                        className={`aspect-1/1 p-1 text-xl
                            transition-transform duration-100 ease origin-center
                            ${selectedNav && selectedNav !== 'status' ? 'group-hover:scale-125 group-hover:text-primary' : ''}
                        `}>
                            <MdOutlineBarChart/> </span>
                        <span className='text-[11px]'>
                            {t('status')}
                        </span>
                    </div>
                    {/* TIMELINE*/}
                    <div onClick={()=>{selectedNav !== 'timeline' && setSelectedNav('timeline')}}
                        className={`group flex flex-col justify-center items-center py-1 px-2 cursor-pointer 
                            ${selectedNav && selectedNav === 'timeline' ? 'bg-primary-light ' : ''} rounded-lg border-2 border-white`
                         }
                        >
                        <span 
                        className={`aspect-1/1 p-1 text-xl
                            transition-transform duration-100 ease origin-center
                            ${selectedNav && selectedNav !== 'timeline' ? 'group-hover:scale-125 group-hover:text-primary' : ''}
                        `}>
                            <MdOutlineViewTimeline/> </span>
                        <span className='text-[11px]'>
                            {t('timeline')}
                        </span>
                    </div>

                    {/* ALL NEW SPRINT */}
                    <div onClick={()=>{selectedNav !== 'sprint_all' && setSelectedNav('sprint_all')}}
                        className={`group flex flex-col justify-center items-center py-1 px-2 cursor-pointer 
                           ${selectedNav && selectedNav === 'sprint_all' ? 'bg-primary-light ' : ''} rounded-lg border-2 border-white`
                        }
                        >
                        <span 
                        className={`aspect-1/1 p-1 text-xl
                            transition-transform duration-100 ease origin-center
                            ${selectedNav && selectedNav !== 'sprint_all' ? 'group-hover:scale-125 group-hover:text-primary' : ''}
                        `}>
                            <DiScrum/> </span>
                        <span className='text-[11px] '>{t('sprint_all')}</span>
                    </div>
                </div>
            </div>
        </div>

        <CustomAlert
          onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
          isOpen={alertData.isOpen}
          content={alertData.content}
          title={alertData.title}
          type={alertData.type || 'info'}  
        />

        <SidePanel isOpen={spProps.isOpen} children={spProps.children} title={spProps.title} onClose={closeSidePanel}/>
        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>

    
    </div>
  )
}

export default Sprints
