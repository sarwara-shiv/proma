import { Priorities, ProjectStatuses } from '../../../../config/predefinedDataConfig';
import { Loader, PageTitel } from '../../../../components/common';
import { getRecordWithID } from '../../../../hooks/dbHooks';
import { useAuth } from '../../../../hooks/useAuth';
import { AlertPopupType, DynamicCustomField, FlashPopupType, MainTask, NavItem, Project, Task, User } from '@/interfaces';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import PieChartWithPaddingAngle from '../../../../components/charts/PieChartWithPaddingAngle';
interface ArgsType {
    cid?:string | null;
    data?: Project; 
    navItems:NavItem[];
    setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
  }
const ProjectDetails:React.FC<ArgsType> = ({cid,data, navItems, setSubNavItems}) => {
    const { t } = useTranslation();
    const {user} = useAuth();
    const {id} = useParams();
    const [projectData, setProjectData] = useState<Project>();
    const [loading, setLoading] = useState<boolean>(false);
    const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
    const [mainTasksStatus, setMainTasksStatus] = useState<{[key:string]:number}[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskStatus, setTasksStatus] = useState<{[key:string]:number}[]>([]);
    const [subtasks, setSubTasks] = useState<Task[]>([]);
    const [subtasksStatus, setSubtasksStatus] = useState<{[key:string]:number}[]>([]);
    const [alertData, setAlertData] = useState<AlertPopupType>({isOpen:false, content:"", type:"info", title:""}); 
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});

    useEffect(()=>{
        setSubNavItems(navItems);
        getRecords();
    },[])

    const getRecords = async()=>{
      setLoading(true);
      try{
        const populateFields = [
            {path: 'kickoff.responsibilities.role'},
            {path: 'kickoff.responsibilities.persons'},
            {path: 'kickoff.approval.user'},
            {path: 'createdBy'},
            {path: 'mainTasks',
              populate : {
                path:'subtasks',
                populate:{
                  path:'subtasks',
                  populate:{
                    path:'subtasks'
                  }
                }
              }
            },
        ]
        if(id){
            const res = await getRecordWithID({id:id, populateFields, type:'projects'});
            if(res.status === 'success' && res.data){
                setProjectData(res.data);
                if(res.data.mainTasks) {
                  setMainTasks(res.data.mainTasks);
                  // set tasks
                  (res.data.mainTasks as unknown as MainTask[]).map((mt)=>{
                    setTasks([...tasks, ...(mt.subtasks as unknown as Task[])])
                  })
                }

                if(res.data.mainTasks.subtasks) setTasks(res.data.mainTasks.subtasks);
            }
        }
        setLoading(false);
      }catch(error){
        setLoading(false);
        console.log(error);
      }
    }

    const getStatusData = (status:string)=>{
      let sdata:{_id:string, name:string, color?:string} =  {_id:'', name:'', color:''};
      const ad = status || 'inReview';
      const statusexists = ProjectStatuses.filter((d)=>d._id === ad)
      const astatus:{_id:string, name:string, color?:string} | null = statusexists ? statusexists[0] : null;
      if(astatus){
          sdata = astatus
        }
        return sdata;
    }
    const getPrioritiesData = (dstring:string)=>{
      let sdata:{_id:string, name:string, color?:string} =  {_id:'', name:'', color:''};
      const ad = dstring || 'low';
      const statusexists = Priorities.filter((d)=>d._id === ad);
      const astatus:{_id:string, name:string, color?:string} | null = statusexists ? statusexists[0] : null;
      if(astatus){
          sdata = astatus
        }
        return sdata;
    }

  return (
    <div>
      {loading && <Loader type='full'/>}
      {projectData && 
        <div>
          <div className='p-3 mb-3  text-slate-500'>
            <div className=''>
              <div className='flex justify-left gap-3'>
                {projectData.createdAt && 
                  <div>
                    <span className='text-slate-400 text-xs'>{t('createdAtDate')}: </span>
                    <span className='text-sm text-slate'>
                      {format(projectData.createdAt, 'dd.MM.yyyy')}
                    </span>
                    </div>
                }
                {projectData.endDate && 
                  <div>
                    <span className='text-slate-400 text-xs'>{t('endDate')}: </span>
                    <span className='text-sm text-slate'>
                      {format(projectData.endDate, 'dd.MM.yyyy')}
                    </span>
                    </div>
                }
                {projectData.createdBy && 
                  <div>
                    <span className='text-slate-400 text-xs'>{t('createdBy')}: </span>
                    <span className='text-sm text-slate'>
                      {(projectData.createdBy as unknown as User).name}
                    </span>
                    </div>
                }
              </div>
              <div className='flex justify-between w-full'>
                <h1 className='text-2xl text-primary font-bold'>{projectData.name}</h1>
                <div className='flex justify-cols gap-3'>

                  {getStatusData(projectData.status) && 
                    ((astatus) => {
                        return (
                          <div className='flex items-center flex-cols bg-white gap-2 px-1 rounded-md shadow-card'>
                            <span className='text-xs text-slate-400'>{t('status')}</span>
                            <div className={`text-xs rounded-sm  border-white border-1 
                                px-1 py-1
                                  ${astatus && astatus.color ? getColorClasses(astatus.color) : ''} 
                                    text-xs flex justify-center items-center rounded-sm 
                                `}>
                                  
                                  {astatus && astatus.name}  
                            </div>
                          </div>
                        );
                    })(getStatusData(projectData.status))
                  }
                  {getPrioritiesData(projectData.priority) && 
                    ((astatus) => {
                        return (
                          <div className='flex items-center flex-cols gap-2 bg-white px-1 rounded-md shadow-card'>
                            <span className=' text-xs text-slate-400'>{t('priority')}</span>
                            <div className={`text-xs rounded-sm  border-white border-1 
                                px-1 py-1
                                  ${astatus && astatus.color ? getColorClasses(astatus.color) : ''} 
                                    text-xs flex justify-center items-center rounded-sm 
                                `}>
                                 
                                  {astatus && astatus.name}  
                            </div>
                          </div>
                        );
                    })(getPrioritiesData(projectData.priority))
                  }

                </div>
              </div>

            </div>
          </div>
          {/* Header details */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
            {/* TASKS */}
            <div className='card bg-blue-100 border-2 border-white p-1'>
              <h2 className='text-blue-500 font-bold text-sm mb-2'>{t('tasks')}</h2>
              <div className='text-xs text-slate-500 flex flex-cols gap-2'>
                  <span>{t('maintasks')}:</span>
                  <span className='font-bold'>{mainTasks ? mainTasks.length : 0}</span>
              </div>
              <div className='text-xs text-slate-500 flex flex-cols gap-2'>
                  <span>{t('tasks')}:</span>
                  <span className='font-bold'>
                    {
                    tasks ? tasks.length : 0
                    }
                    </span>
              </div>
            </div>
            <div className='card bg-green-100 border-2 border-white p-1'>
              <h2 className='text-green-400 font-bold text-sm mb-2'>{t('kickOff')}</h2>
              <div className='relative w-[100px]'>
                <PieChartWithPaddingAngle data={mainTasks}/>
              </div>
            </div>

          </div>

          {/* Description */}
          <div className='card bg-white'>
              <div className='text-left mb-3'>
                <PageTitel text={`${t('description')}`} color='slate-300'  size='2xl'/>
              </div>
              <div>

                <div dangerouslySetInnerHTML={{ __html: projectData.description || '' }}
                        className="text-xs text-slate-400 border rounded-md p-2"
                        />
                </div>
          </div>

          {/* Custom fields */}
          <div className='card bg-white'>
              <div className='text-left mb-3'>
                <PageTitel text={`${t('otherDetails')}`} color='slate-300'  size='2xl'/>
              </div>
              <div className='grid grid-cols-1 lg:grid-cols-1 gap-4'>
              {projectData?.customFields && projectData.customFields.length > 0 && projectData.customFields.map((d, index)=>{
                    const cf = d as unknown as DynamicCustomField;
                    return (
                      <div key={`cf-${index}`} className='p-2 border mb-3 rounded-md mb-2'
                      >
                        <div className='relative flex justify-between items-center text-sm'>
                         <div className='text-md font-bold py-1 mb-1 w-full relative text-slate-600
                         bg-slate-100 px-2 flex justify-between
                         ' 
                         >
                          <div>
                            {cf.name}
                          </div>
                         </div>
                         
                        </div>
                         <div
                            dangerouslySetInnerHTML={{ __html: cf.value || '' }}
                            className="text-xs text-slate-400 px-2"
                            />
                      </div>
                    )
                  })}

              </div>
          </div>



        </div>

        
      }
    </div>
  )
}

export default ProjectDetails
