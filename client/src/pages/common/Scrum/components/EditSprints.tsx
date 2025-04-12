import { CustomAlert, CustomTooltip, FlashPopup, Loader, NoData } from "../../../../components/common";
import SidePanel from "../../../../components/common/SidePanel";
import { AlertPopupType, FlashPopupType, ISprint, OrderByFilter, QueryFilters, SidePanelProps } from "../../../../interfaces";
import { ObjectId } from "mongodb";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DiScrum } from "react-icons/di";
import AddUpdateSprint from "./AddUpdateSprint";
import { getRecordsWithFilters } from "../../../../hooks/dbHooks";
import { format } from "date-fns";
import { FaEllipsisH, FaTasks } from "react-icons/fa";
import { MdAdd, MdDelete, MdFormatListBulletedAdd, MdInfo } from "react-icons/md";
import { FiEdit, FiEdit2, FiEdit3 } from "react-icons/fi";
import { ToggleBtnWithUpdate } from "../../../../components/forms";

interface ArgsType {
  pid:string|ObjectId
}

const EditSprints: React.FC<ArgsType> = ({pid}) => {
  const {id} = useParams();
  const {t} = useTranslation();
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string|ObjectId>(pid);
  const [lastSidePanelKey, setLastSidePanelKey] = useState<string|null>();
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
  const [spProps, setSpProps] = useState<SidePanelProps>({isOpen:false, title:"AddTasks", children:"Add New Sprint", onClose:()=>closeSidePanel()})
  const [sprintsData, setSprintsData] = useState<ISprint[]>();
  const [pageNav, setPageNav] = useState<{id:string, icon:React.ReactNode, label:string}>({id:'sprint', icon:<DiScrum/>, label:'sprint_all'});

  useEffect(()=>{
    getData();
}, []);


const getData = async ()=>{
  console.warn('######### running');
  setIsLoader(true);
  try{
      const populateFields = [
          { 
              path: 'backlog',
              populate: [
                  { path: 'taskId',
                      populate : 'responsiblePerson'
                   },
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

  // OPEN SIDE PANEL
  const addUpdateForm = (sprint:ISprint|null = null)=>{
    if(!sprint){
      setLastSidePanelKey('add-sprint');
      setSpProps({...spProps, isOpen:true, title:`${t('sprint_add')}`,onClose:closeSprintSidePanel,
        children:<AddUpdateSprint key="add-sprint" projectId={projectId} />
      });
      return;
    }

    if (lastSidePanelKey === sprint._id) {
      closeSidePanel();
      return;
    }
    setLastSidePanelKey(sprint._id+'-update');
    setSpProps({...spProps, isOpen:true, title:`${t('sprint_update')}`, onClose:closeSprintSidePanel,
        children:<AddUpdateSprint key={sprint._id} projectId={projectId} sprint={sprint}/>
    });
  
    
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
        content:<> <p
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: sprint.goal ? sprint.goal : '' }}
        ></p></>

      })
    }
  }


  return (
    <div className="py-4 max-w-7xl mx-auto">
      {isLoader && <Loader type="full"/>}
      {/* <h2 className="text-3xl font-bold text-center mb-8">Sprint Tasks</h2> */}
      <div className="flex justify-start items-start gap-8 overflow-x-auto pb-8 flex-col lg:flex-row">
        <div className="w-full bg-gray-100 p-2 rounded-lg lg:w-1/3 lg:min-w-[350px]" >
          <h3 className="text-left font-bold pb-1 border-b border-slate-300 ">{t('sprints')}</h3>
          <div className="py-2 pt-4 flex flex-col gap-5">
            {sprintsData && sprintsData.length > 0 ? 
            <>
              {sprintsData.map((sprint:ISprint, key:number)=>{
                return (
                  <div key={`${key}-${sprint._id}`}>
                    <div className={`bg-white box-shadow-sm rounded-lg flex gap-1 flex-col-stretch overflow-clip
                        border-l-2 ${sprint.isActive ? 'border-green-400' : 'border-red-400'} 
                      `}>
                      <div className="border-r p-2 flex flex-col gap-2 justify-between">
                          <CustomTooltip content={t('tasks_add')}>
                            <div className={`apsect-1/1 rounded-full p-1 text-slate-400 hover:bg-primary-light hover:text-primary`}>
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
                            
                        </div>
                        <div className="flex-1 py-2 pe-2">
                          <div className="flex justify-between align-center">
                            <div className="text-slate-300">{sprint._cid}</div>
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
                          <h4 className="text-md font-bold">{sprint.name}</h4>
                          <div onClick={()=>openSprintAlert(sprint)} className="relative">
                          <p
                              className="text-sm line-clamp-1 cursor-pointer relative"
                              dangerouslySetInnerHTML={{ __html: sprint.goal ? sprint.goal : '' }}
                            >
                            </p>
                            <span className="absolute right-0 bottom-0 flex items-center cursor-pointer">
                                <MdInfo className="ml-1 text-sm text-gray-500" />
                              </span>
                          </div>
                          <div className="flex gap-2 justify-between mt-1 border-t pt-1">
                              <div className="flex flex-col items-left gap-x-1">
                                <span className="text-xs text-slate-400">{t('startDate')}</span>
                                {sprint.startDate ? 
                                  <span className="text-sm">{format(sprint.startDate, 'dd.MM.yyyy')}</span>
                                : <>-</> }
                              </div>
                              <div className="flex flex-col items-left gap-x-1">
                                <span className="text-xs text-slate-400">{t('endDate')}</span>
                                {sprint.endDate ? 
                                  <span className="text-sm">{format(sprint.endDate, 'dd.MM.yyyy')}</span>
                                : <>-</> }
                              </div>
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

        <div className="flex-1 bg-gray-100 p-2 rounded-lg shadow-lg w-full">

        </div>
   
      </div>

      <CustomAlert
          onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
          isOpen={alertData.isOpen}
          content={alertData.content}
          title={alertData.title}
          type={alertData.type || 'info'}  
        />

        <SidePanel isOpen={spProps.isOpen} children={spProps.children} title={spProps.title} onClose={spProps.onClose}/>
        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>

    </div>
  );
};

export default EditSprints;
