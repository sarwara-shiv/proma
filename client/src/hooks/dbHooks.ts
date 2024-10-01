import { OrderByFilter, QueryFilters } from '@/interfaces';
import axios from 'axios';
import Cookies from 'js-cookie'; 
import { ObjectId } from 'mongodb';

const JWT_TOKEN = Cookies.get('access_token');  
const API_URL = process.env.REACT_APP_API_URL;

const headers = {
  'Authorization': `Bearer ${JWT_TOKEN}`, 
  'Content-Type': 'application/json'
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

const getRecords = async (args: GetRecordsArgs) => {
  const { type, body } = args;
  if (type) {

    try {
      const response = await axios.post(`${API_URL}/${type === "users" ? "auth" : type}/get`, 
        {
          page:type === 'auth' ? 'users' : type, data:body?body : {}
        }, 
        {
          headers
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
  populateFields?:string[]
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
          headers
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
  populateFields?:string[]
  orderBy?:OrderByFilter
}

const getRecordsWithFilters = async (args: GetRecorsWithFilters) => {
  console.log(args);
  const { type, limit, pageNr, populateFields=[], filters={}, orderBy={} } = args;
  if (type) {

    try {
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/getRecordsWithFilters`,
        {
          page:type === 'auth' ? 'users' : type, limit, pageNr,populateFields, filters, orderBy
        }, 
        {
          headers
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
          headers
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
        headers
      });
      return response.data; 
    }catch(error){
      return { status: "error", code: "invalid_data" };
    }
  }
}

const addUpdateRecords = async (args: GetRecordsArgs) => {
  const { type, body, action="add", id=null, checkDataBy=[] } = args;
  if (type) {
    try {
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/${action}`, 
        {
          page:type === 'auth' ? 'users' : type, data:body || {}, action, id, checkDataBy
        }, 
        {
          headers
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
        headers
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
        headers
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
        headers
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
}

const deleteRecordById = async (args: DeleteByIdArgs) => {
  const { type, body } = args;
  if (type) {

    try {
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/delete`, 
        {
          page:type === 'auth' ? 'users' : type, data:body?body:{}
        },
        {
          headers
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
  query:string
}
const searchUserByUsername = async(args:SearchByUsername)=>{
  const {query} = args;
  if(query){
    try{
      const response = await axios.get(`${API_URL}/auth/search-users?name=${query}`, 
        {
          headers
      });

      return response.data;
    }catch(error){
      return { status: "error", code: "unknown_error", message:error, error };
    }
  }else{
    return { status: "error", code: "invalid_data" };
  }
}

export { 
  searchUserByUsername, 
  getRecords, 
  deleteRecordById, 
  addRecords, 
  addUpdateRecords, 
  resetPassword, 
  forgotPassword, 
  adminResetPassword, 
  getRecordsWithLimit,
  getRecordWithID,
  getRecordsWithFilters 
};
