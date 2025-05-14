import { ObjectId } from 'mongodb';
export interface WorklogFilter {
    reportType?:'daily'|'weekly'|'monthyl' | null
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    userId?: string | ObjectId | null;
    taskId?: string | ObjectId | null;
    projectId?: string | ObjectId | null;
  }
  
  export interface ReportByType{
    days:number
    hours:number
    minutes:number
    period:{month?:number, week?:number, year:number} 
    projectId:{_id:string | ObjectId, name:string, taskType:string}
    taskId:{_id:string | ObjectId, name:string, projectType:string}
    taskName?:string
    totalDuration?:number
    users:{_id:string | ObjectId, name:string, email:string, username:string}
  }
  export interface ReportType{
    date:string,
    notes:{worklogId:string, note:string}[]
    officialHours:{days:string, hours:string, minutes:string}
    days:number
    hours:number
    minutes:number
    period:{month?:number, week?:number, year:number} 
    projectId:{_id:string | ObjectId, name:string, taskType:string}
    taskId:{_id:string, name:string, projectType:string}
    taskName?:string
    totalDuration?:number
    users:{_id:string | ObjectId, name:string, email:string, username:string}
  }
  
  export interface AdminUserReportType{
    userId:string,
    userName:string,
    data: {
      date:string,
      days:number,
      hours:number,
      minutes:number,
      notes:{worklogId:string, note:string}[],
      officialHours:{days:string, hours:string, minutes:string},
      projectId:{_id:string, name:string, projectType:string},
      taskId:{_id:string, name:string, taskType:string}
    }[]
  }
  export interface AdminActiveWorklogType{
    userId:string,
    userName:string,
    data: {
      date:string,
      days:number,
      hours:number,
      minutes:number,
      notes:{worklogId:string, startTime:Date}[],
      officialHours:{days:string, hours:string, minutes:string},
      projectId:{_id:string, name:string, projectType:string},
      taskId:{_id:string, name:string, taskType:string}
    }[]
  }