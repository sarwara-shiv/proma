import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import { AlertPopupType, DeleteRelated, FlashPopupType, MainTask, Milestone, NavItem, PaginationProps, Project, RelatedUpdates, User } from '@/interfaces';
import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom';
import MainTaskForm from './MainTaskForm';
import { ObjectId } from 'mongodb';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { FaEye, FaPencilAlt, FaTasks } from 'react-icons/fa';
import { IoMdAdd} from 'react-icons/io';
import { CustomAlert, FlashPopup, Headings } from '../../../../components/common';
import { ColumnDef } from '@tanstack/react-table';
import { CustomDropdown } from '../../../../components/forms';
import { getColorClasses } from '../../../../mapping/ColorClasses';
import { TaskStatuses,MainTaskStatuses } from '../../../../config/predefinedDataConfig';
import CustomDateTimePicker2 from '../../../../components/forms/CustomDateTimePicker';
import DataTable from '../../../../components/table/DataTable';
import CustomContextMenu from '../../../../components/common/CustomContextMenu';
import { DeleteById } from '../../../../components/actions';
import { extractAllIds } from '../../../../utils/tasksUtils';
import { MdRocketLaunch } from 'react-icons/md';
import { DiScrum } from 'react-icons/di';
import { IoBarChartSharp, IoDocumentAttach } from 'react-icons/io5';
interface ArgsType {
    cid?:string | null;
    action?:"add" | "update";
    data?: Project; 
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
    navItems?:NavItem[];
    checkDataBy?:string[];
}

const pinnedColumns = ['actions_cell', 'name'];
const fixedWidthColumns = ['actions_cell', 'startDate', 'dueDate', 'endDate', 'action'];

const MainTasksProject:React.FC<ArgsType> = ({cid, action, data, checkDataBy=['name'], setSubNavItems, navItems}) => {
  const {id} = useParams();
  const {t} = useTranslation();
  const [projectData, setProjectData] = useState<Project>();
  const [milestones, setMilestones] = useState<Milestone[]>();
  const [projectId, setProjectId] = useState<ObjectId | string | null>(cid ? cid : id ? id : null);
  const [mainTasks, setMainTasks] = useState<MainTask[]>();
  const [editTask, setEditTask] = useState<MainTask | null>();
  const [paginationData, setPaginationData] = useState<PaginationProps>({currentPage:1,totalRecords:0, limit:5, totalPages:0})
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});

  const PnavItems: NavItem[] = [
    { link: `projects/view/${id}`, title: "project", icon:<FaEye />},
    { link: `projects/maintasks/${id}`, title: "maintasks", icon:<FaTasks />},
    { link: `projects/kickoff/${id}`, title: "kickOff", icon:<MdRocketLaunch />},
    { link: `projects/sprints/${id}`, title: "sprints", icon:<DiScrum />}, 
    { link: `projects/report/${id}`, title: "report", icon:<IoBarChartSharp />}, 
    { link: `projects/documentation/${id}`, title: "documentation", icon:<IoDocumentAttach />},
  ];

  useEffect(()=>{
    if(setSubNavItems){
      setSubNavItems(PnavItems);
    }
  },[])

  const onDelete = (delData:any)=>{
    if(delData.status === "success"){ 
      getData();
    }else{
      console.error({error:delData.message, code:delData.code}); 
    }
}

  //---------- table columns model
  const columns:ColumnDef<MainTask, any>[] = useMemo(()=>[
    {
      header: '',
      id:"actions_cell",
      cell: ({ getValue, row }) => { 
        const _id = row.original._id ? row.original._id as unknown as string : '';
        const _pid = row.original._pid ?  row.original._pid : null;
        const ids = extractAllIds(row.original);
        let deleteRelated:DeleteRelated[];
        let relatedUpdates:RelatedUpdates[]= [{
          collection:'projects',
          field:'mainTasks',
          type:'array',
          ids:[_id]
        }]
        console.log(row.original.name,' : ', relatedUpdates);
        const deleteText = <div>
          Do you really want to delelete Main Task <span className='font-bold text-primary'>{row.original.name}</span>?<br/>
          <span className='text-red-400 italic text-xs'>This will also delete {row.original.subtasks?.length} tasks and their subtasks </span>
        </div>
        return (
            <div>
                 <div>
                    <CustomContextMenu >
                            <ul>
                                <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                  <NavLink
                                     to={`${window.location.pathname.replace(/\/[^/]+\/maintasks\/[^/]+$/, '/maintasks/tasks/' + row.original._id)}`}
                                      state={{objectId:row.original._id, data:row.original}} title={`${t('maintasks')}`}
                                      className="flex justify-between items-center text-xs gap-1 hover:text-primary cursor-pointer whitespace-normal break-words"
                                      >
                                        <div>
                                          {t('tasks')}
                                        <span className='ml-1 py-0.7 px-1 bg-slate-200 rounded-sm text-slate-800'>
                                        {row.original.subtasks && row.original.subtasks.length > 0 ? <>{row.original.subtasks.length}</>:
                                        0
                                        }
                                        </span>
                                        </div>

                                        <FaTasks /> 
                                  </NavLink>
                                </li>
                                <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                    <div className='text-xs flex justify-between hover:text-green-700/50 cursor-pointer whitespace-normal break-words' 
                                    data-close-menu='true'
                                        onClick={()=>addUpdateMainTask(_pid, action='update', row.original)}
                                    >
                                        {t('update')} <FaPencilAlt />
                                    </div>
                                  </li>
                                <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                  <DeleteById text={t('delete')} relatedUpdates={relatedUpdates}
                                  deleteRelated={
                                    ids && ids.length >0 ?  deleteRelated=[{collection:'tasks', ids:ids}] : []
                                  }
                                  data={{id:_id, type:'maintasks', page:"projects"}} content={deleteText} onYes={onDelete}/>
                                </li>
                            </ul>
                        </CustomContextMenu>
                </div>
            </div>
        )
      },
        meta:{
            style :{
            textAlign:'left',
            width:'30px'
            },
            noStyle:true,
        },
    },
    {
      header: `${t('name')}`,
      accessorKey: 'name',
      id:"name",
        meta:{
            style :{
            textAlign:'left',
            }
        }
    },
    {
      header: `${t('milestones')}`,
      accessorKey: 'milestone',
      id:"milestone",
      cell:({getValue, row})=>{
        const milestone = getValue() ? getValue() : null;
        const _id = row.original._id ? row.original._id as unknown as string : '';
        const milestoneObj = milestone && milestones ? milestones.find((data)=>data._id?.toString() === milestone ): null;
        const milestoneName = milestoneObj ? milestoneObj.name : '-';
        return(
          <div>
            {milestones  && 
               <CustomDropdown 
                data={milestones} 
                label={''} 
                style='table'
                    name='milestone'
                onChange={handleDataChange} 
                selectedValue={milestone} recordId={_id} 
              />
            }
            {/* {milestoneName} */}
          </div>
        )
      },
        meta:{
            style :{
            textAlign:'left',
            }
        }
    },
    {
      header: `${t('status')}`,
      accessorKey: 'status',
      id:"status",
      cell: ({ getValue, row }) => {
        const status = getValue() && getValue();
        const _id = row.original._id
        return (
            <div className={`flex justify-center items-center ${getColorClasses(status)} text-center text-[10px]`}>  
                <div className='w-full rounded-sm'>
                    <CustomDropdown 
                            data={MainTaskStatuses} 
                        label={''} 
                        style='table'
                            name='status'
                        onChange={handleDataChange} selectedValue={status} recordId={_id} 
                        />
                </div>
            </div>
        ); 
      },
        meta:{
            style :{
            textAlign:'center',
            }
        }
    },
    {
      header: `${t('startDate')}`,
      accessorKey: 'startDate',
      id:"startDate",
      cell: ({ getValue, row }) => {
        const startDate = getValue() && getValue();
        const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
        const _id = row.original._id
        return (
            <div className={`flex relative w-full border-b bg-transparent`}>  
              <CustomDateTimePicker2 
                  selectedDate={startDate}
                  onChange={handleDateChange}
                  showTimeSelect={false}
                  recordId={_id}
                  name="startDate"
                  label=''
                  style='table'
              />
            </div>
        ); 
      },
        meta:{
            style :{
            textAlign:'center',
            width:'120px'
            }
        }
    },
    {
      header: `${t('dueDate')}`,
      accessorKey: 'dueDate',
      id:"dueDate",
      cell: ({ getValue, row }) => {
        const dueDate = getValue() && getValue();
        const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
        const _id = row.original._id
        return (
            <div className={`flex relative w-full border-b bg-transparent`}>  
              <CustomDateTimePicker2 
                  selectedDate={dueDate}
                  onChange={handleDateChange}
                  showTimeSelect={false}
                  recordId={_id}
                  name="dueDate"
                  label=''
                  style='table'
              />
            </div>
        ); 
      },
        meta:{
            style :{
            textAlign:'center',
            width:'120px'
            }
        }
    },
    {
      header: `${t('endDate')}`,
      accessorKey: 'endDate',
      id:"endDate",
      cell: ({ getValue, row }) => {
        const endDate = getValue() && getValue();
        const date = getValue() ? format(new Date(getValue()), 'dd.MM.yyyy') : '';
        const _id = row.original._id
        return (
            <div className={`flex relative w-full border-b bg-transparent`}>  
              <CustomDateTimePicker2 
                  selectedDate={endDate}
                  onChange={handleDateChange}
                  showTimeSelect={false}
                  recordId={_id}
                  name="endDate"
                  label=''
                  style='table'
              />
            </div>
        ); 
      },
        meta:{
            style :{
            textAlign:'center',
            width:'120px'
            }
        }
    },
    {
      header: `${t('createdBy')}`,
      accessorKey: 'createdBy',
      id:"createdBy",
      cell: ({ getValue }: { getValue: () => User }) => {
        const user = getValue() && getValue().name;
        return <span>{user}</span>;
      },
        meta:{
            style :{
            textAlign:'center',
            }
        }
    },
    {
      header: `${t('responsiblePerson')}`,
      accessorKey: 'responsiblePerson',
      id:"responsiblePerson",
      cell: ({ getValue }: { getValue: () => User }) => {
        const user = getValue() && getValue().name;
        return <span>{user}</span>;
      },
        meta:{
            style :{
            textAlign:'center',
            }
        }
    },
    {
      header:`${t('tasks')}`,
      id:'tasks',
      cell: ({ row }: { row: any }) => (
          <div style={{ textAlign: 'center' }} className='hover:bg-white rounded-sm hover:shadow-sm'>
              {/* {row.original.isEditable && <></>
              } */}
              <div className='flex align-center justify-center flex-row py-[1px]'>
              <NavLink
                to={`${window.location.pathname.replace(/\/[^/]+\/maintasks\/[^/]+$/, '/maintasks/tasks/' + row.original._id)}`}// Dynamically build the URL using the _id
                state={{ objectId: row.original._id, data: row.original }} // Passing the _id and data in state
                title={`${t('maintasks')}`}
                className="p-1 ml-1 flex justify-center items-center inline-block text-green-700 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words"
              >
                <FaTasks /> 
                <span className='ml-1 py-0.7 px-1 bg-slate-200 rounded-sm text-slate-800'>
                  {row.original.subtasks && row.original.subtasks.length > 0 ? (
                    <>{row.original.subtasks.length}</>
                  ) : (
                    0
                  )}
                </span>
              </NavLink>
              </div>
          </div>
      ),
      meta:{
          style :{
          textAlign:'center',
          width:"80px"
          }
      }
  },
    {
      header: `${t('action')}`,
      id:"action",
      cell: ({ row }:{ row: any }) => {
        const _id = row.original._id
        const _pid = row.original._pid
        return (
          <div className='cursor-pointer flex justify-center hover:text-green-500' 
          onClick={()=>addUpdateMainTask(_pid, action='update', row.original)}
      >
          <FaPencilAlt /> 
      </div>
        ); 
      },
        meta:{
            style :{
            textAlign:'center',
            width:'50px'
            }
        }
    },
  ],[]);

  //---------- table columns model end

  useEffect(()=>{
      if(!cid){
        cid = id;
      }
      getData();
      // setSubNavItems && setSubNavItems(navItems);
  }, []);

  useEffect(()=>{
      getData();
      setEditTask(null);
  }, [mainTasks]);

  const handleDataChange = async (recordId:string|ObjectId, name: string, value: string, selectedData: { _id: string, name: string }) => {
    console.log(recordId, name, value, selectedData);
    if(recordId && name && value){
      const nData = {[name]:value};
      updateData(recordId, nData);
    }
  };
  const handleDateChange = (recordId:string|ObjectId, value: Date | null, name:string)=>{
    console.log(recordId, value, name);
    if(recordId && name && value){
      const nData = {[name]:value};
      updateData(recordId, nData);
    }
  }

const updateData = async(id:string|ObjectId, newData:any)=>{
  if(id && newData){
    try{
      const res = await addUpdateRecords({id:id as unknown as string, action:'update', type:'maintasks', body:{...newData}});
      if(res){
        const message = `${t(`RESPONSE.${res.code}`)}`;
        if(res.status === 'success'){
          setFlashPopupData({...flashPopupData, isOpen:true, message, type:'success'});
          getData();
        }else{
          setFlashPopupData({...flashPopupData, isOpen:true, message, type:'fail'});
        }
      }
    }catch(err){
      console.log(err);
    }
  }
}

  const getData = async ()=>{
    try{
          const populateFields = [
                { 
                path: 'mainTasks',
                populate: [
                  { path: 'createdBy' },
                  { path: 'responsiblePerson' },
                  {
                    path: 'subtasks',
                    populate: [
                      {
                        path: 'subtasks',
                        populate: [
                          {
                            path: 'subtasks',
                          },
                        ],
                      },
                    ],
                  },
                ]
              }
          ]
          const pid = cid ? cid : id;
          if(pid){
              const res = await getRecordWithID({id:pid, populateFields, type:'projects'});
              console.log(res);

              if(res.status === 'success' && res.data){
                  setProjectData(res.data);
                  console.log(res.data);
                  if(res.data.kickoff && res.data.kickoff.milestones){
                    setMilestones(res.data.kickoff.milestones);
                    console.log(res.data.kickoff.milestones);
                  }
                  data = {...res.data}
                  // setMainTasks(data?.mainTasks ? data.mainTasks as unknown as MainTask[] : [])
              }

          }
      }catch(error){
          console.log(error);
      }
  }


  const updateMainTasks = (value:MainTask[])=>{
    if(value){
      setMainTasks(value);
    }
    
    console.log(value);
  }

  const addUpdateMainTask = (pid:string | ObjectId | null, action:string, taskData:MainTask | null)=>{
    if(pid){
      const projectMilestones:Milestone[] = milestones ? milestones : projectData && projectData.kickoff?.milestones ? projectData.kickoff.milestones : [];
      if(action === 'add'){
        setAlertData({...alertData, isOpen:true, type:'form', title:`${t("add")}`,
        content:<MainTaskForm action='add'  onChange={updateMainTasks} pid={pid} milestones={projectMilestones}
        mainTasks={data && data.mainTasks as unknown as MainTask[] || []}
        />
      })
    }
    
    if(action === 'update' && taskData){
            setAlertData({...alertData, isOpen:true, type:'form',title:<>{t("update")} <span className='text-primary'>{taskData.name}</span></>,
                content:<MainTaskForm action='update'  onChange={updateMainTasks} pid={pid} milestones={projectMilestones}
                mainTask={taskData}
                mainTasks={data && data.mainTasks as unknown as MainTask[] || []}
                />
            })
        }
    }
  }

  return (
    <div>
      {projectData && 
      <div>
        <div className='flex justify-between items-center'>
          <Headings text={projectData.name} type='h1'/>
          <div className='flex justify-end mb-4'>
          <div className="flex justify-center items-center text-md p-2  hover:bg-primary-light hover:text-primary rounded-sm cursor-pointer transition-all"
            onClick={()=>addUpdateMainTask(projectId, 'add', null)}
            >
              <IoMdAdd /> {t('NAV.maintasks_add')}
            </div>
          </div>

        </div>
        <div className='main'>
        {projectData?.mainTasks && 
          <>
            <div className='pagination mb-2'>
                {/* <Pagination
                        currentPage={paginationData.currentPage} 
                        totalPages={paginationData.totalPages} 
                        onPageChange={handlePageChange} 
                        totalRecords={paginationData.totalRecords}
                        />  */}
            </div>
              <div className='card bg-white'>
                <div className='p-0 overflow-auto'  style={{maxHeight:"calc(100dvh - 250px)"}}>
                <DataTable columns={columns} data={projectData.mainTasks} 
                    pinnedColumns={pinnedColumns}
                    fixWidthColumns={fixedWidthColumns}
                  />
                </div>
            </div>
          </>
          }
        </div>
      </div>
      }

        <CustomAlert
          onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
          isOpen={alertData.isOpen}
          content={alertData.content}
          title={alertData.title}
          type={alertData.type || 'info'}  
        />
        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>

    
    </div>
  )
}

export default MainTasksProject
