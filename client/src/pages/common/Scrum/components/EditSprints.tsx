import { CustomAlert, CustomPopup, CustomTooltip, FlashPopup, Loader, NoData } from "../../../../components/common";
import SidePanel from "../../../../components/common/SidePanel";
import { AlertPopupType, CustomPopupType, FlashPopupType, ISprint, OrderByFilter, QueryFilters, SidePanelProps,Task, User } from "../../../../interfaces";
import { ObjectId } from "mongodb";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DiScrum } from "react-icons/di";
import AddUpdateSprint from "./AddUpdateSprint";
import { getRecordsWithFilters, sprintActions } from "../../../../hooks/dbHooks";
import { format } from "date-fns";
import { FaEllipsisH, FaTasks } from "react-icons/fa";
import { MdAdd, MdClose, MdDelete, MdFormatListBulletedAdd, MdInfo, MdInfoOutline, MdOutlineViewTimeline, MdPerson } from "react-icons/md";
import { FiEdit, FiEdit2, FiEdit3 } from "react-icons/fi";
import { ToggleBtnWithUpdate } from "../../../../components/forms";
import Backlog from "./Backlog";
import SprintTimeLine from "./SprintTimeline";
import { calculateWorkingHours } from "../../../../utils/dateUtils";

interface ArgsType {
  pid:string|ObjectId
}

const EditSprints: React.FC<ArgsType> = ({pid}) => {
  const {id} = useParams();
  const {t} = useTranslation();
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [selectedSprint, setSelectedSprint] = useState<ISprint>();
  const [projectId, setProjectId] = useState<string|ObjectId>(pid);
  const [lastSidePanelKey, setLastSidePanelKey] = useState<string|null>();
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  const [popupData, setPopupData] = useState<CustomPopupType>({ isOpen: false, content: "", title: "", yesFunction:()=>{} });
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
  const [spProps, setSpProps] = useState<SidePanelProps>({isOpen:false, title:"AddTasks", children:"Add New Sprint", onClose:()=>closeSidePanel()})
  const [sprintsData, setSprintsData] = useState<ISprint[]>();

  useEffect(()=>{
    getData();
}, []);

useEffect(() => {
  if (sprintsData && sprintsData.length > 0 && !selectedSprint) {
    selectSprint(sprintsData[0]);
  }
}, [sprintsData, selectedSprint]);


const getData = async ()=>{
  console.warn('######### running');
  setIsLoader(true);
  try{
      const populateFields = [
          { 
              path: 'backlog',
              populate: [
                  { path: 'responsiblePerson'},
              ]
          }
      ];

      if(projectId){
          const filters:QueryFilters = {
              _pid:projectId as unknown as string
          }

          const orderBy:OrderByFilter={
            isActive:'desc'
          }

          const res = await getRecordsWithFilters({
              populateFields, type: 'sprints',
              limit: 0,
              pageNr: 0,
              filters,
              orderBy
          });
          
          console.log(res);

          if(res.status === 'success' && res.data){
              setSprintsData(res.data);
              console.log(res.data);
          }

      }
      setIsLoader(false);
      
    }catch(error){
      setIsLoader(false);
        console.log(error);
    }
}

  // ADD UPDATE SPRINT
  const addUpdateForm = (sprint:ISprint|null = null)=>{
    if(!sprint){
      setLastSidePanelKey('add-sprint');
      setSpProps({...spProps, isOpen:true, title:`${t('sprint_add')}`,onClose:closeSprintSidePanel,
        children:<AddUpdateSprint key="add-sprint" projectId={projectId} />
      });
      return;
    }

    if (lastSidePanelKey === `${sprint._id}-update`) {
      closeSidePanel();
      return;
    }
    setLastSidePanelKey(`${sprint._id}-update`);
    setSpProps({...spProps, isOpen:true, title:`${t('sprint_update')}`, onClose:closeSprintSidePanel,
        children:<AddUpdateSprint key={`${sprint._id}-update`} projectId={projectId} sprint={sprint}/>
    });
  }
  // ADD TASKS TO SPRINT
  const addTasksToSprint = (sprint:ISprint)=>{
    console.log(sprint, projectId);
    if (lastSidePanelKey === `${sprint._id}-backlog`) {
      closeSidePanel();
      return;
    }
    setLastSidePanelKey(sprint._id+'-backlog');
    setSpProps({...spProps, isOpen:true, title:`${sprint._cid}`, onClose:closeSprintSidePanel,
        children:<Backlog key={`${sprint._id}-backlog`} projectId={projectId} sprint={sprint} 
        onUpdate={(sprint, action)=>setTimeout(()=>{ handleSprintUpdate(sprint) ;console.log(sprint, action)},500)}
        />
    });
  }
  // REMOVE TASK FROM SPRINT
  const removeTaskFromSprint = async (sprint:ISprint, task:Task)=>{
    console.log(sprint, task);
    if(sprint && task){
      try{
        const res = await sprintActions({type:'remove-tasks', body:{id:sprint._id, tasks:[task._id]}});
        if(res.status === 'success' && res.data){
          handleSprintUpdate(res.data);
          if(selectedSprint && selectedSprint._id === (res.data as unknown as ISprint)._id){
            setSelectedSprint(res.data);
          }
        }
        closePopup();
      }catch(error){
        console.error(error);
      }
    }
    return;
  }

  // REMOVE TASK ALERT
  const removeTaskAlert = (sprint:ISprint, task:Task)=>{
    setPopupData({...popupData, 
      isOpen:true, 
      title:t('removeData?', {data:'Task'}),
      content:<div className="text-xs">
          <div><b>Sprint</b>: </div> ({sprint._cid})<i>{sprint.name} </i><br/>
          <div><b>Task</b>: </div> ({task._cid})<i>{task.name}</i>
      </div>,
      yesFunction:()=>{removeTaskFromSprint(sprint, task)}
    })
  }

  // UPDATE OBJECT DATA
  const updateObjectData = (id:string|ObjectId, name:string, value:string|boolean)=>{
    if(id && name){
      
      setSprintsData((prevState) => {
        // Find and update the specific sprint in the array
        if(!prevState) return;
        return prevState.map((sprint) => {
          if (sprint._id === id) {
            return {
              ...sprint, // Spread the original sprint
              [name]: value, // Update the field dynamically
            };
          }
          return sprint; // Return the rest of the sprints unchanged
        });
      });
    }
  }

  const handleSprintUpdate = async (sprint: ISprint, action: "add" | "remove" = "add") => {
    try {
      setSprintsData(prev => {
        const safePrev = prev || [];
  
        if (action === "remove") {
          // Remove sprint by filtering it out
          return safePrev.filter(s => s._id !== sprint._id);
        } else {
          // Update or add sprint
          const exists = safePrev.some(s => s._id === sprint._id);
          return exists
            ? safePrev.map(s => (s._id === sprint._id ? { ...sprint } : s))
            : [...safePrev, sprint];
        }
      });
    } catch (error) {
      console.error("Failed to update sprint:", error);
    }
  };

  // close sprint sidepanel
  const closeSprintSidePanel = ()=>{
    console.log('close');
    setLastSidePanelKey(null);
    getData();
    closeSidePanel();
  }

  // CLOSE SIDE PANEL
  const closeSidePanel = ()=>{
    setLastSidePanelKey(null);
    setSpProps({...spProps, isOpen:false, children:''});
  }

  // OPEN SPRINT ALERT
  const openSprintAlert = (sprint:ISprint)=>{
    if(sprint){
      setAlertData({...alertData,
        isOpen:true,
        title:<>{sprint._cid}</>,
        content:<div>
          <div>
            <div className="font-bold">{sprint.name}</div>
            <div className="flex flex-row gap-2 ">
              <div>Tasks: {sprint.backlog.length}</div>
              <div>Story Points: {sprint.totalStoryPoints ? sprint.totalStoryPoints : 0}</div>
            </div>
          </div>
          <div className="p-1 border bg-slate-100">
            <p
            className="text-xs"
            dangerouslySetInnerHTML={{ __html: sprint.goal ? sprint.goal : '' }}
            ></p>
            </div> 
        </div>

      })
    }
  }

  const selectSprint = (sprint:ISprint)=>{
    if(sprint){
      setSelectedSprint(sprint);
    }
  }

  const isWithinSprint = (task:Task, sprint:ISprint) =>{
    if(task.startDate && sprint.startDate && task.dueDate && sprint.endDate){
      return task.startDate >= sprint.startDate && task.dueDate <= sprint.endDate; 
    }else{
      return true;
    }
  }

  // close yeno popup
  const closePopup = ()=>{
    setPopupData({...popupData, isOpen:false, content:'', title:'', yesFunction:()=>{}});
  }

  const getSprintET = (sprint:ISprint)=>{
   return  sprint.expectedTime ? sprint.expectedTime : 
    sprint.startDate && sprint.endDate ? calculateWorkingHours(sprint.startDate, sprint.endDate)
    : 0
  }
  const getTaskET = (task:Task)=>{
   return  task.expectedTime ? task.expectedTime : 
   task.startDate && task.dueDate ? calculateWorkingHours(task.startDate, task.dueDate)
    : 0
  }

  return (
    <div className="py-4 max-w-7xl mx-auto">
      {isLoader && <Loader type="full"/>}
      {/* <h2 className="text-3xl font-bold text-center mb-8">Sprint Tasks</h2> */}
      <div className="flex justify-start items-start gap-8 overflow-x-auto pb-8 flex-col lg:flex-row">
        <div className="w-full bg-gray-100 p-2 rounded-lg lg:w-1/3 lg:min-w-[350px]" >
          <h3 className="text-left font-bold pb-1 border-b border-slate-300 ">{t('sprints')}</h3>
          <div className="py-2 pt-4 flex flex-col gap-5 overflow-y-auto" style={{maxHeight:'calc(90dvh - 190px)'}}>
            {sprintsData && sprintsData.length > 0 ? 
            <>
              {sprintsData.map((sprint:ISprint, key:number)=>{
                return (
                  <div key={`${key}-${sprint._id}`}>
                    <div onClick={()=> {!selectedSprint || selectedSprint._id !== sprint._id && selectSprint(sprint)}}
                    className={`rounded-lg flex gap-1 flex-col-stretch overflow-clip 
                        border bg-white transition-all ease duration-200
                        ${selectedSprint && selectedSprint._id === sprint._id ? 'border-primary' : 'cursor-pointer box-shadow-sm  border-white'} 
                      `}>
                      <div className="border-r p-2 flex flex-col gap-2 justify-between">
                          <CustomTooltip content={t('tasks_add')}>
                            <div onClick={()=>addTasksToSprint(sprint)} 
                            className={`apsect-1/1 rounded-full p-1 text-slate-400 hover:bg-primary-light hover:text-primary`}>
                              <MdFormatListBulletedAdd /> 
                            </div>
                          </CustomTooltip>
                          <CustomTooltip content={t('sprint_update')}>
                            <div onClick={()=>{addUpdateForm(sprint)}}
                            className="apsect-1/1 rounded-full p-1 text-slate-400 hover:bg-primary-light hover:text-primary">
                              <FiEdit3 /> 
                            </div>
                          </CustomTooltip>
                          <CustomTooltip content={t('sprint_delete')}>
                            <div className="apsect-1/1 rounded-full text-red-300 p-1 hover:bg-red-200 hover:text-red-500">
                              <MdDelete /> 
                            </div>
                          </CustomTooltip>
                          <span onClick={()=>openSprintAlert(sprint)} 
                          className="apsect-1/1 rounded-full p-1 text-slate-400 hover:bg-primary-light hover:text-primary cursor-pointer">
                              <MdInfoOutline/>
                          </span>
                            
                        </div>
                        <div className="flex-1 py-2 pe-2">
                          <div className="flex justify-between items-center border-b mb-1 pb-1 ">
                            <div className={`text-sm font-bold ${sprint.isActive ? 'text-green-500' : 'text-slate-300 '}`}>{sprint._cid}</div>
                            
                            <div className="">
                              {sprint._id && <ToggleBtnWithUpdate id={sprint._id} collection="sprints" name="isActive"
                                onChange={(name,value,data, saved)=>{sprint._id && saved && setTimeout(()=>{
                                  updateObjectData(sprint._id as unknown as string, 'isActive', value as unknown as boolean)
                                  console.log(name, value, data, saved);
                                }, 500)}}
                                initialState={sprint.isActive}
                              />}
                              
                            </div>
                          </div>
                          <h4 className="text-sm font-bold">{sprint.name}</h4>
                          {sprint.goal && 
                            <CustomTooltip content={sprint.goal ? sprint.goal : '' }>
                              <p
                                className="text-xs line-clamp-2 cursor-pointer relative text-slate-500"
                                dangerouslySetInnerHTML={{ __html: sprint.goal}}
                                >
                              </p>
                            </CustomTooltip>
                            }
                           
                          <div className="flex gap-2 justify-between mt-1 border-t pt-1 text-xs">
                              <div className="flex flex-col items-left gap-x-1">
                                <span className="text-slate-400">{t('startDate')}</span>
                                {sprint.startDate ? 
                                  <span className="">{format(sprint.startDate, 'dd.MM.yyyy')}</span>
                                : <>-</> }
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-col items-left gap-x-1">
                                <span className=" text-slate-400">{t('endDate')}</span>
                                {sprint.endDate ? 
                                  <span className="">{format(sprint.endDate, 'dd.MM.yyyy')}</span>
                                : <>-</> }
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-col items-center gap-x-1">
                                <span className=" text-slate-400">{t('tasks')}</span>
                                {sprint.endDate ? 
                                  <span className="">{sprint.backlog.length}</span>
                                : <>-</> }
                              </div>
                              <CustomTooltip content={`${t('expectedTime_info')} <b>sprint</b>`}>
                                <div className="flex flex-col items-center gap-x-1">
                                    <span className=" text-slate-400">{t('expectedTime') }</span>
                                  <span className="">{getSprintET(sprint)}</span>
                                </div>
                              </CustomTooltip>
                          </div>
                        </div>
                    </div>
                  </div>
                )
              })}
            </>

            
            : <NoData content=" No Sprint Found"/>
            }
          </div>
        </div>
        
        {/* SPRINT BACKLOG */}
        <div className="flex-1 bg-gray-100 p-2 rounded-lg shadow-lg w-full">
          <h3 className="text-left font-bold pb-1 border-b border-slate-300 ">{t('tasks')}</h3>
          <div className="py-2 pt-4 flex flex-col gap-5 overflow-y-auto" style={{maxHeight:'calc(90dvh - 200px)'}}>
            {selectedSprint && selectedSprint.backlog.length > 0 ? 
            <>
              {selectedSprint.backlog.map((backlog, bkey)=>{
                console.log('---------', bkey);
                console.log(backlog);
                const task:Task = backlog as unknown as Task;
                const inRange = isWithinSprint(task, selectedSprint);
                return (
                  <div key={`${bkey}-${task._id}`}>
                    <div className="bg-white box-shadow-sm flex flex-1 rounded-md flex-row gap-2">
                      <div className="flex-1 p-2">
                        <div className="flex justify-between items-center border-b mb-1 pb-1 ">
                            <div className={`text-sm  font-bold ${task.status === 'completed' ? 'text-slate-300' : 'text-green-500 '}`}>{task._cid}</div>
                            {!inRange && 
                              <CustomTooltip content={t('outOfSprintRange_info')}>
                                <div className="bg-red-100 text-red-400 p-1 text-xs rounded-md">{t('outOfSprintRange')}</div>
                              </CustomTooltip>
                            }
                            
                            <div className={`p-1 text-xs rounded-md ${task.status === 'completed' ? 'bg-green-100 text-green-500' : 'bg-slate-100 text-slate-500'}`}>
                              {t(`${task.status}`)}
                            </div>
                          </div>
                          <h2 className={`font-bold text-sm ${task.status === 'completed' && ' line-through  text-slate-400'}`}>{task.name}</h2>
                            {task.description && 
                                <CustomTooltip content={task.description ? task.description : '' }>
                                  <p
                                      className="text-xs line-clamp-2 cursor-pointer relative text-slate-500"
                                      dangerouslySetInnerHTML={{ __html: task.description}}
                                    >
                                  </p>
                              </CustomTooltip>
                            }
                          
                          <div className="flex gap-2 justify-between mt-1 border-t pt-1 text-xs">
                              <div className="flex flex-col items-left gap-x-1">
                                <span className="text-slate-400">{t('startDate')}</span>
                                {task.startDate ? 
                                  <span className="">{format(task.startDate, 'dd.MM.yyyy')}</span>
                                : <>-</> }
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-col items-left gap-x-1">
                                <span className=" text-slate-400">{t('dueDate')}</span>
                                {task.dueDate ? 
                                  <span className="">{format(task.dueDate, 'dd.MM.yyyy')}</span>
                                : <>-</> }
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-col items-left gap-x-1">
                                <span className=" text-slate-400">{t('tasks')}</span>
                                {task.endDate ? 
                                  <span className="">{format(task.endDate, 'dd.MM.yyyy')}</span>
                                  : <>-</> }
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-col items-center gap-x-1">
                                <span className=" text-slate-400">{t('subtasks') }</span>
                                <span className="">{
                                  task.subtasks ? task.subtasks.length : 0
                                  }</span>
                              </div>
                          </div>
                          <div className="flex gap-2 justify-between mt-1 border-t pt-1 ">
                              <div className="flex flex-row gap-x-1 justify-center items-center">
                                <span className="text-primary text-lg"><MdPerson /></span>
                                {task.responsiblePerson ? 
                                  <span className="text-sm font-semibold">{(task.responsiblePerson as unknown as User).name}</span>
                                : <>-</> }
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-row gap-x-1 justify-center items-center">
                                <CustomTooltip content={t('storyPoints')}>
                                  <span className="text-primary text-sm">SP: </span>
                                  <span className="text-sm font-semibold">{task.storyPoints ? task.storyPoints : 1}</span>
                                </CustomTooltip>
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-row gap-x-1 justify-center items-center">
                                <CustomTooltip content={t('storyPoints')}>
                                  <span className="text-primary text-sm">{t('subtasks')}: </span>
                                  <span className="text-sm font-semibold">{task.subtasks ? task.subtasks.length : 0}</span>
                                </CustomTooltip>
                              </div>
                              <div className="border-r"></div>
                              <div className="flex flex-row gap-x-1 justify-center items-center">
                                <CustomTooltip content={`${t('expectedTime_info')} <b>sprint</b>`}>
                                  <span className="text-primary text-sm">{t('expectedTime') }:</span>
                                  <span className="text-sm">{getTaskET(task)}</span>
                                </CustomTooltip>
                              </div>
                          </div>
                        
                      </div>
                      <div className="flex flex-col justify-between border-l p-2 max-w-[50px]">
                        <CustomTooltip content={t('sprint_task_remove')}>
                          <div onClick={()=>removeTaskAlert(selectedSprint, task)} 
                            className={`apsect-1/1 rounded-full p-1 text-red-300 hover:bg-red-100 hover:text-red-500`}>
                            <MdClose /> 
                          </div>
                        </CustomTooltip>
                          <div className="apsect-1/1 rounded-full p-1 text-slate-400 hover:bg-primary-light hover:text-primary cursor-pointer">
                          <MdInfoOutline />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </> :
            <NoData content="no Tasks" />
            }
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
        <CustomPopup 
          isOpen={popupData.isOpen}
          title={popupData.title}
          content={popupData.content}
          yesFunction={popupData.yesFunction}
          noFunction={closePopup}
          onClose={closePopup}
        />

        <SidePanel isOpen={spProps.isOpen} children={spProps.children} title={spProps.title} onClose={spProps.onClose}/>
        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>

    </div>
  );
};

export default EditSprints;
