import axios from 'axios';
import Cookies from 'js-cookie';  // Correct library
import { ObjectId } from 'mongodb';

// GET ALL DATA
interface GetRecordsArgs {
  type: "roles" | "users" | "groups" | "auth" | "documentation" | "projects" | "tasks";
  body?:any
  limit?: number;
  action?:'add' | 'update';
  id?:string | null;
  checkDataBy?:string[];
}

const getRecords = async (args: GetRecordsArgs) => {
  console.log(args);
  const { type, body } = args;
  if (type) {
    const JWT_TOKEN = Cookies.get('access_token');  // Correct usage of js-cookie
    const API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${API_URL}/${type === "users" ? "auth" : type}/get`, 
        {
          page:type === 'auth' ? 'users' : type, data:body?body : {}
        }, 
        {
          headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`, 
            'Content-Type': 'application/json'
          }
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
    const JWT_TOKEN = Cookies.get('access_token');  // Correct usage of js-cookie
    const API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${API_URL}/${type === "users" ? "auth" : type}/${action}`, 
        {
          page:type === 'auth' ? 'users' : type, data:body?body :{}
        }, 
        {
          headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`, 
            'Content-Type': 'application/json'
          }
        });
      return response.data;
    } catch (error) {
      return { status: "error", code: "unknown_error" };
    }
  } else {
    return { status: "error", code: "invalid_data" };
  }
};

const addUpdateRecords = async (args: GetRecordsArgs) => {
  const { type, body, action="add", id=null, checkDataBy=[] } = args;
  console.log(args);
  if (type) {
    const JWT_TOKEN = Cookies.get('access_token');  // Correct usage of js-cookie
    const API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/${action}`, 
        {
          page:type === 'auth' ? 'users' : type, data:body || {}, action, id, checkDataBy
        }, 
        {
          headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`, 
            'Content-Type': 'application/json'
          }
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
  const JWT_TOKEN = Cookies.get('access_token'); 
  const API_URL = process.env.REACT_APP_API_URL;

  try{
    const response = await axios.post(`${API_URL}/auth/forgot-password`, 
      {
        email
      },
      {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(response);
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
  const JWT_TOKEN = Cookies.get('access_token'); 
  const API_URL = process.env.REACT_APP_API_URL;

  try{
    const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, {password},
      {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
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
  const JWT_TOKEN = Cookies.get('access_token'); 
  const API_URL = process.env.REACT_APP_API_URL;

  try{
    const response = await axios.post(`${API_URL}/auth/admin-reset-password`, 
      {
        page:'users',id, password
      }, 
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`, 
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data);
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
  type: "roles" | "users" | "groups" | "auth" | "documentation" | "projects" | "tasks";
  body: DeleteDataType;
}

const deleteRecordById = async (args: DeleteByIdArgs) => {
  const { type, body } = args;
  if (type) {
    const JWT_TOKEN = Cookies.get('access_token'); 
    const API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${API_URL}/resource/${type === "users" ? "auth" : type}/delete`, 
        {
          page:type === 'auth' ? 'users' : type, data:body?body:{}
        },
        {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data; 
    } catch (error) {
      return { status: "error", code: "unknown_error", message:error, error };
    }
  } else {
    return { status: "error", code: "invalid_data" };
  }
};

export { getRecords, deleteRecordById, addRecords, addUpdateRecords, resetPassword, forgotPassword, adminResetPassword };
