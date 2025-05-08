import { Priorities, ProjectStatuses } from '../../../../config/predefinedDataConfig';
import { FloatingBottomMenu, Headings, Loader, PageTitel } from '../../../../components/common';
import { getRecordWithID } from '../../../../hooks/dbHooks';
import {useAuthContext } from '../../../../context/AuthContext';
import { AlertPopupType, DynamicCustomField, FlashPopupType, MainTask, NavItem, Project, Task, User } from '@/interfaces';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { NavLink, useParams } from 'react-router-dom';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import PieChartWithPaddingAngle from '../../../../components/charts/PieChartWithPaddingAngle';
import ProjectProgress from './ProjectProgress';
import { countSubtasksByStatus } from '../../../../utils/tasksUtils';
import TasksStatusPieChart from '../../../../components/charts/TasksStatusPieChart';
import { IoMdAdd } from 'react-icons/io';
import { MdEdit, MdOutlineModeEdit, MdRocketLaunch } from 'react-icons/md';
import { FaPencilAlt, FaRegEdit, FaTasks } from 'react-icons/fa';
import { DiScrum } from 'react-icons/di';
import { IoDocumentAttach } from 'react-icons/io5';
import { useAppContext } from '../../../../context/AppContext';
interface ArgsType {
    cid?:string | null;
    data?: Project; 
    navItems:NavItem[];
    setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
  }
const ProjectDetails:React.FC<ArgsType> = ({cid,data, navItems, setSubNavItems}) => {
    const { t } = useTranslation();
    const {isAdmin, slug} = useAuthContext();
    const {id} = useParams();
    const {setPageTitle} = useAppContext();
    const [projectData, setProjectData] = useState<Project>();
    const [loading, setLoading] = useState<boolean>(false);
    const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
    const [mainTasksStatus, setMainTasksStatus] = useState<{[key:string]:number}[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskStatus, setTasksStatus] = useState<{[key:string]:number}[]>([]);
    const [tasksChartData, setTasksChartData] = useState<Record<string, number>>({});
    const [subtasks, setSubTasks] = useState<Task[]>([]);
    const [subtasksStatus, setSubtasksStatus] = useState<{[key:string]:number}[]>([]);
    const [alertData, setAlertData] = useState<AlertPopupType>({isOpen:false, content:"", type:"info", title:""}); 
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});

    const PnavItems: NavItem[] = [
      { link: `projects/update/${id}`, title: "projects_update", icon:<FaPencilAlt />},
      { link: `projects/maintasks/${id}`, title: "maintasks", icon:<FaTasks />},
      { link: `projects/kickoff/${id}`, title: "maintasks", icon:<MdRocketLaunch />},
      { link: `projects/sprints/${id}`, title: "maintasks", icon:<DiScrum />},
      { link: `projects/documentation/${id}`, title: "documentation", icon:<IoDocumentAttach />},
      { link: `projects/add`, title: "projects_add", icon:<IoMdAdd />},
    ];

    useEffect(()=>{
      if(navItems){
        navItems = [...navItems]
        setSubNavItems(navItems);
      }
      setPageTitle(t('project'));
        getRecords();
    },[])
    
    

    const subNav:{_id:string, label:string, icon?:React.ReactNode, path:string}[] = [
      {_id:'tasks', label:t('tasks'), icon:'', path:`maintasks`},
      {_id:'kickoff', label:t('kickOff'), icon:'', path:`kickoff`},
      {_id:'documentation', label:t('documentation'), icon:'', path:`documentation`},
      {_id:'report', label:t('report'), icon:'', path:`report`}
    ]

   


    const getRecords = async()=>{
      setLoading(true);
      try{
        const populateFields = [
            {path: 'kickoff.responsibilities.role'},
            {path: 'kickoff.responsibilities.persons'},
            {path: 'kickoff.approval.user'},
            {path: 'createdBy'},
            {path: 'client'},
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
                  const chartData = countSubtasksByStatus(res.data.mainTasks);
                  setTasksChartData(chartData);
                  console.log(chartData);
                  // set tasks
                  const allSubtasks: Task[] = (res.data.mainTasks as unknown as MainTask[]).flatMap(mt => mt.subtasks as Task[]);
                  setTasks(allSubtasks);
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
    <div className='relative pb-10'>
      {loading && <Loader type='full'/>}
      {projectData && 
        <div>
          <div className={`flex justify-end items-center mb-0`}>
                  <NavLink
                            to={`/${slug}/projects/update/${id}`}
                            className={({ isActive }) => {
                            return `flex justify-center items-center text-md p-2  hover:bg-primary-light hover:text-primary rounded-sm cursor-pointer transition-all`;
                            }}
                        >

                  <span className='flex justify-center items-center gap-2'><FaRegEdit /> {t('update')}</span>
                  </NavLink>
            </div>
          <div className='p-3 mb-3  text-slate-500'>
            <div className=''>
            {projectData.client && typeof projectData.client === 'object' && 
              <div className='relative flex w-fit items-center  rounded-md mb-2 pr-2 py-1'>
                  <div className=''>
                    <span className='text-primary text-2xl font-bold pr-2'>{(projectData.client as unknown as User).name}</span>
                    <span>( {(projectData.client as unknown as User).firma})</span>
                  </div>
              </div>
              }
              <div className='flex justify-left gap-3'>
                {projectData.createdAt && 
                  <div>
                    <span className='text-slate-400 text-xs'>{t('createdAtDate')}: </span>
                    <span className='text-sm text-slate'>
                      {format(projectData.createdAt, 'dd.MM.yyyy')}
                    </span>
                    </div>
                }
                {projectData.dueDate && 
                  <div>
                    <span className='text-slate-400 text-xs'>{t('dueDate')}: </span>
                    <span className='text-sm text-slate'>
                      {format(projectData.dueDate, 'dd.MM.yyyy')}
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
        
                <div>
                  <Headings text={projectData.name} type='h1'/>
                </div>
                <div className='flex justify-cols gap-3'>

                  {getStatusData(projectData.status) && 
                    ((astatus) => {
                        return (
                          <div className='flex items-center flex-cols bg-white gap-2 px-1 rounded-md border'>
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
                          <div className='flex items-center flex-cols gap-2 bg-white px-1 rounded-md border'>
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
          <div className='flex flex-col sm:flex-row gap-6 mb-8'>
            {/* TASKS */}
            <div className='bg-gray-100 rounded-md p-2 w-fit'>
              <div className=''>
                <div className='text-slate-500 font-bold text-sm flex justify-between'>
                    <span>{t('maintasks')} / {t('milestones')} </span>
                    <span className='font-bold'>{mainTasks ? mainTasks.length : 0}</span>
                </div>
                <div className='text-slate-500 font-bold text-sm flex justify-between'>
                    <span>{t('tasks')}</span>
                    <span className='font-bold'>{tasks ? tasks.length : 0}</span>
                </div>
              </div>
              <div className='relative '>
                {/* <PieChartWithPaddingAngle data={mainTasks}/> */}
                <TasksStatusPieChart data={tasksChartData}/>
              </div>
            </div>

            <div className='flex-1 max-w-sm bg-gray-100 rounded-md p-2'>
              <ProjectProgress project={projectData} showCount={false}/>
            </div>

          </div>

          {/* Description */}
          <div className='card- bg-white p-2 rounded-md mb-6'>
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
          <div className='card- '>
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

      {subNav && subNav.length > 0 && 
        <div className='sticky bottom-4 right-4 pr-1 mt-10'>
          <div className='w-full flex justify-center items-center bg-white shadow-card p-2 rounded-md gap-4'>
            {subNav.map((item, index)=>{
              return(
                <NavLink
                  to={`${window.location.pathname.replace("view", item.path)}`}
                    className={({ isActive }) =>
                        `bg-primary-light px-2 py-1 text-sm rounded-md text-primary shadow-md 
                      cursor-pointer
                      hover:shadow-sm hover:bg-primary hover:text-primary-light
                      transition-all duration-200 ease`
                    }
                >

                      {item.label}
                  </NavLink>
              )
            })}
          </div>
        </div>
      }

      <FloatingBottomMenu nav={subNav} onClick={(value)=>console.log(value)}/>
    </div>
  )
}

export default ProjectDetails
