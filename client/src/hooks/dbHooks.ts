import axios from 'axios';
import Cookies from 'js-cookie';  // Correct library

// GET ALL DATA
interface GetRecordsArgs {
  type: "roles" | "users" | "groups" | "auth" | "documentation" | "projects" | "tasks";
  body?:any
  limit?: number;
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
  const { type, body } = args;
  if (type) {
    const JWT_TOKEN = Cookies.get('access_token');  // Correct usage of js-cookie
    const API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${API_URL}/${type === "users" ? "auth" : type}/add`, 
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
    const JWT_TOKEN = Cookies.get('access_token');  // Correct usage of js-cookie
    const API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${API_URL}/${type === "users" ? "auth" : type}/delete`, 
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
      return { status: "error", code: "unknown_error" };
    }
  } else {
    return { status: "error", code: "invalid_data" };
  }
};

export { getRecords, deleteRecordById, addRecords };
