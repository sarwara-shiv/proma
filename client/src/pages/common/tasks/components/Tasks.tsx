import {  MainTask, Project} from '@/interfaces';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { ObjectId } from 'mongodb';
import { useTranslation } from 'react-i18next';
import ProjectTasks from './ProjectTasks';
import AllTasks from './AllTasks';

interface ArgsType {
    cid?:string | null;
    pid?:ObjectId | string; // project id
    mtid?: ObjectId | string // main task id
    mainTask?:MainTask // main task
    action?:"add" | "update";
    data?: Project; 
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
    checkDataBy?:string[];
}


const Tasks:React.FC<ArgsType> = ({cid, setSubNavItems, mtid}) => {
  const {id} = useParams();
  const {t} = useTranslation();

  useEffect(()=>{
      if(!cid){
        cid = id;
      }
  }, []);


  // delete task
  return (
    <div>
      {id ? 
      <ProjectTasks cid={id} mtid={mtid}/>
        : <> <AllTasks /></>
    }
    </div>
  )
}


export default Tasks
