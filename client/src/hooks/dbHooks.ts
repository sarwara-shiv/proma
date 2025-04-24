import { DeleteRelated, OrderByFilter, QueryFilters, RelatedUpdates } from '@/interfaces';
import axios from 'axios';
import Cookies from 'js-cookie'; 
import { ObjectId } from 'mongodb';

const JWT_TOKEN = Cookies.get('access_token');  
const API_URL = process.env.REACT_APP_API_URL;
console.log(JWT_TOKEN);
//----- old code
// const headers = {
//   'Authorization': `Bearer ${JWT_TOKEN}`, 
//   'Content-Type': 'application/json'
// }
const headers = {
  'Content-Type': 'application/json',
}

// GET ALL DATA
interface GetRecordsArgs {
  type: string; 
  body?:any
  limit?: number;
  action?:'add' | 'update';
  id?:string | null;
  checkDataBy?:string[];
}

// "relatedUpdates": [
//   {
//     "collection": "projects", // collection name
//     "field": "mainTasks", // field to be updated
//     "type": "array",  // Add to the array
//     "ids": ["projectId1", "projectId2"]
//   },

const getRecords = async (args: GetRecordsArgs) => {
  const { type, body } = args;
  if (type) {

    try {
      const response = await axios.post(`${API_URL}/${type === "users" ? "auth" : type}/get`, 
        {
          page:type === 'auth' ? 'users' : type, data:body?body : {}
        }, 
        {
          headers,
          withCredentials: true 
        });
      return response.data;
    } catch (error) {
      return { status: "error", code: "unknown_error" };
    }
  } else {
    return { status: "error", code: "invalid_data" };
  }
};

// GET RECOREDS WITH LIMIT
interface GetRecorsWithLimit{
  type:string;
  limit:number;
  pageNr:number;
  populateFields?:string[] | pathInterface[]
}

const getRecordsWithLimit = async (args: GetRecorsWithLimit) => {
  console.log(args);
  const { type, limit, pageNr, populateFields=[] } = args;
  if (type) {

    try {
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/getRecordsWithLimit`,
        {
          page:type === 'auth' ? 'users' : type, limit, pageNr,populateFields
        }, 
        {
          headers,
          withCredentials: true 
        });
      return response.data;
    } catch (error) {
      return { status: "error", code: "unknown_error" };
    }
  } else {
    return { status: "error", code: "invalid_data" };
  }
};


interface GetRecorsWithFilters{ 
  type:string;
  limit:number;
  filters?: QueryFilters;
  pageNr:number;
  populateFields?:string[]| pathInterface[]
  orderBy?:OrderByFilter
}

const getRecordsWithFilters = async (args: GetRecorsWithFilters) => {
  const { type, limit, pageNr, populateFields=[], filters={}, orderBy={} } = args;
  if (type) {

    try {
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/getRecordsWithFilters`,
        {
          page:type === 'auth' ? 'users' : type, limit, pageNr,populateFields, filters, orderBy 
        }, 
        {
          headers,
          withCredentials: true 
        });
      return response.data;
    } catch (error) {
      return { status: "error", code: "unknown_error" };
    }
  } else {
    return { status: "error", code: "invalid_data" };
  }
};



const addRecords = async (args: GetRecordsArgs) => {
  const { type, body, action="add", id=null } = args;

  if (type) {

    try {
      const response = await axios.post(`${API_URL}/${type === "users" ? "auth" : type}/${action}`, 
        {
          page:type === 'auth' ? 'users' : type, data:body?body :{}
        }, 
        {
          headers,
          withCredentials: true 
        });
      return response.data;
    } catch (error) {
      return { status: "error", code: "unknown_error" };
    }
  } else {
    return { status: "error", code: "invalid_data" };
  }
};



// GET ALL DATA
interface pathInterface {
  path:string
}

interface GeTRecordsWithID {
  type:string;
  body?:any
  id?:string | string[] | ObjectId | ObjectId[];
  populateFields?:string[] | pathInterface[];
}

// get single record with ID
const getRecordWithID = async(args:GeTRecordsWithID)=>{
  const {type, body={}, id, populateFields=[]}  = args;
  if(type && id){
    try{
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/getRecordsWithId`,{
        page:type === 'auth' ? 'users' : type, data:body || {}, id, populateFields
      }, {
        headers,
        withCredentials: true 
      });
      return response.data; 
    }catch(error){
      return { status: "error", code: "invalid_data" };
    }
  }
}

/**
 * 
 * assign task
 * 
 */
interface AssignTaskType {
  body?:any,
  id?:string | null;
  relatedUpdates?:RelatedUpdates[];
}
const assignTasks = async (args: AssignTaskType) => {
  const {relatedUpdates=[], body, id=null} = args;
  if (body) {
    console.log(body);
   console.log(relatedUpdates);
   console.log(id);
    try {
      const response = await axios.post(`${API_URL}/resource/tasks/assign`, 
        {
          page:'tasks', data:body, relatedUpdates, id
        }, 
        {
          headers,
          withCredentials: true 
        });
      return response.data;
    } catch (error) {
      console.log(error);
      return { status: "error", code: "unknown_error", error };
    }
  } else {
    return { status: "error", code: "invalid_data" };
  }
};
/**
 * 
 * Add update all recoreds in general
 * 
 */
interface AddUpdateRecords {
  type: string;
  body?:any
  limit?: number;
  action?:'add' | 'update';
  id?:string | null;
  checkDataBy?:string[];
  relatedUpdates?:RelatedUpdates[];
}

const addUpdateRecords = async (args: AddUpdateRecords) => {
  const { type, body, action="add", id=null, checkDataBy=[], relatedUpdates=[] } = args;
  if (type) {
    console.log(type);
    console.log(action);
    console.log(body);
    try {
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/${action}`, 
        {
          page:type === 'auth' ? 'users' : type, data:body || {}, action, id, checkDataBy, relatedUpdates
        }, 
        {
          headers,
          withCredentials: true 
        });
      return response.data;
    } catch (error) {
      console.log(error);
      return { status: "error", code: "unknown_error", error };
    }
  } else {
    return { status: "error", code: "invalid_data" };
  }
};

// FORGOT PASSWORD
interface ForgotPassword {
  email: string;
}
const forgotPassword = async(args:ForgotPassword) =>{
  const {email} = args;

  try{
    const response = await axios.post(`${API_URL}/auth/forgot-password`, 
      {
        email
      },
      {
        headers,
        withCredentials: true 
    });
    return response.data; 
  }catch(error){
    return { status: "error", code: "server_error" };
  }
}

// reset password
interface ResetPassword {
  password: string;
  token:string;
}
const resetPassword = async(args:ResetPassword) =>{
  const {password, token} = args;

  try{
    const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, {password},
      {
        headers,
        withCredentials: true 
    });

    return response.data; 
  }catch(error){
    return { status: "error", code: "server_error" };
  }
}

// reset password
interface AdminResetPassword {
  id:String;
  password: string;
}
const adminResetPassword = async(args:AdminResetPassword) =>{
  const {id, password} = args;

  try{
    const response = await axios.post(`${API_URL}/auth/admin-reset-password`, 
      {
        page:'users',id, password
      }, 
      {
        headers,
        withCredentials: true 
      });
    return response.data; 
  }catch(error){
    return { status: "error", code: "server_error" };
  }
}

// DELETE RECORD BY ID
interface DeleteDataType {
  id: string;
  action?: string;
}

interface DeleteByIdArgs {
  type:string;
  body: DeleteDataType;
  relatedUpdates?:RelatedUpdates[];
  deleteRelated?:DeleteRelated[]
}

const deleteRecordById = async (args: DeleteByIdArgs) => {
  const { type, body, relatedUpdates=[], deleteRelated=[] } = args;
  if (type) {

    try {
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/delete`, 
        {
          page:type === 'auth' ? 'users' : type, data:body?body:{}, relatedUpdates, deleteRelated
        },
        {
          headers,
          withCredentials: true 
      });
      return response.data; 
    } catch (error) {
      return { status: "error", code: "unknown_error", message:error, error };
    }
  } else {
    return { status: "error", code: "invalid_data" }; 
  }
};

// search user by username
interface SearchByUsername {
  query:string,
  role?: "user" | "manager" | "admin" | "employee"| "client"
}
const searchUserByUsername = async(args:SearchByUsername)=>{
  const {query, role} = args;
  if(query){
    try{
      const response = await axios.get(`${API_URL}/auth/search-users?name=${query}&role=${role ? role : 'user'}`, 
        {
          headers,
          withCredentials: true 
      });

      return response.data;
    }catch(error){
      return { status: "error", code: "unknown_error", message:error, error };
    }
  }else{
    return { status: "error", code: "invalid_data" };
  }
}
interface ISearchByName {
  query:string,
  type:'users' | 'tasks' | 'projects';
}
const searchByName = async(args:ISearchByName)=>{
  const {query, type} = args;
  if(query && type){
    try{
      const response = await axios.get(`${API_URL}/resource/${type === 'users' ? 'auth' : type}/search-by-name?name=${query}`, 
        {
          headers,
          withCredentials: true 
      });

      return response.data;
    }catch(error){
      return { status: "error", code: "unknown_error", message:error, error };
    }
  }else{
    return { status: "error", code: "invalid_data" };
  }
}

// ------------------ WORKLOG
// ------------------ 
interface SprintInterface{
  body?:any; // {id:sprintid, tasks:tasksIdArray[]}
  id?:string;
  type:'add-tasks' | 'remove-tasks' | 'get-tasks' | 'delete';
}
const sprintActions = async(args:SprintInterface)=>{
  const { body, id, type} = args;
  if (type) {
    try {
      const response = await axios.post(`${API_URL}/sprint/${type}${id ? '/'+id :''}`, 
        {
          page:'sprints', data:body?body:{}
        },
        {
          headers,
          withCredentials: true 
      });
      return response.data; 
    } catch (error) {
      return { status: "error", code: "unknown_error", message:error, error };
    }
  } else {
    return { status: "error", code: "invalid_data" }; 
  }
}


interface WorkLogInterface{
  body?:any;
  id?:string;
  type:'start'|'stop'|'update'|'report' | 'report2' | 'adminActiveWorklog'| 'user-report' | 'admin-report' | 'reportByType' | 'projectReport' | 'adminReport' | 'adminReportByType';
}

const workLogActions = async(args:WorkLogInterface)=>{
  const { body, id, type} = args;
  if (type) {
    try {
      const response = await axios.post(`${API_URL}/worklog/${type}${id ? '/'+id :''}`, 
        {
          page:'worklogs', data:body?body:{}
        },
        {
          headers,
          withCredentials: true 
      });
      return response.data; 
    } catch (error) {
      return { status: "error", code: "unknown_error", message:error, error };
    }
  } else {
    return { status: "error", code: "invalid_data" }; 
  }
}

interface DailyReportType{
  body?:any;
  id?:string;
  type:'start'|'stop'|'update'| 'active';
}

const dailyReportActions = async(args:DailyReportType)=>{
  const { body, id, type} = args;
  if (type) {
    try {
      const response = await axios.post(`${API_URL}/daily-report/${type}${id ? '/'+id :''}`, 
        {
          page:'worklogs', data:body?body:{}
        },
        {
          headers,
          withCredentials: true 
      });
      return response.data; 
    } catch (error) {
      return { status: "error", code: "unknown_error", message:error, error };
    }
  } else {
    return { status: "error", code: "invalid_data" }; 
  }
}

const startWorkLog = async(args:WorkLogInterface)=>{
  const { body, id, type} = args;
  if (body) {
    try {
      const response = await axios.post(`${API_URL}/worklog/start`, 
        {
          page:'worklog', data:body?body:{}
        },
        {
          headers,
          withCredentials: true 
      });
      return response.data; 
    } catch (error) {
      return { status: "error", code: "unknown_error", message:error, error };
    }
  } else {
    return { status: "error", code: "invalid_data" }; 
  }
}

// stop worklog
const stopWorkLog = async(args:WorkLogInterface)=>{
  const { body, id} = args;
  if (id) {
    try {
      const response = await axios.post(`${API_URL}/worklog/stop/${id}`, 
        {
          page:'worklog', data:body?body:{}
        },
        {
          headers,
          withCredentials: true 
      });
      return response.data; 
    } catch (error) {
      return { status: "error", code: "unknown_error", message:error, error };
    }
  } else {
    return { status: "error", code: "invalid_data" }; 
  }
}

// update worklog
const updateWorkLog = async(args:WorkLogInterface)=>{
  const { body, id} = args;
  if (id) {
    try {
      const response = await axios.post(`${API_URL}/worklog/update/${id}`, 
        {
          page:'worklog', data:body?body:{}
        },
        {
          headers,
          withCredentials: true 
      });
      return response.data; 
    } catch (error) {
      return { status: "error", code: "unknown_error", message:error, error };
    }
  } else {
    return { status: "error", code: "invalid_data" }; 
  }
}

/**
 * 
 * @param args string
 * 
 * @returns 
 */
const searchTasksAI = async(args:{query:string, type:"tasks"|"maintasks" })=>{
  const {query, type}  = args;
  if (query && (type === "tasks" || type==="maintasks")) {
    try {
      const response = await axios.post(`${API_URL}/resource/${type}/search`, 
        {
          page:type, data:{query}
        },
        {
          headers,
          withCredentials: true 
      });
      return response.data; 
    } catch (error) {
      console.log(query, type);
      return { status: "error", code: "unknown_error", message:error, error };
    }
  } else {
    return { status: "error", code: "invalid_data" }; 
  }
}

export {
  sprintActions,
  dailyReportActions,
  workLogActions,
  startWorkLog,
  stopWorkLog,
  updateWorkLog, 
  searchTasksAI,
  searchByName,
  searchUserByUsername, 
  getRecords, 
  deleteRecordById, 
  addRecords, 
  addUpdateRecords, 
  assignTasks,
  resetPassword, 
  forgotPassword, 
  adminResetPassword, 
  getRecordsWithLimit,
  getRecordWithID,
  getRecordsWithFilters 
};
