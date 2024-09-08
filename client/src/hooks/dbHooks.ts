import axios from 'axios';
import Cookies from 'js-cookie';  // Correct library

// GET ALL DATA
interface GetRecordsArgs {
  type: "roles" | "users" | "groups";
  limit?: number;
}

const getRecords = async (args: GetRecordsArgs) => {
  const { type } = args;
  if (type) {
    const JWT_TOKEN = Cookies.get('access_token');  // Correct usage of js-cookie
    const API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.get(`${API_URL}/${type === "users" ? "auth" : type}/get`, {
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
  type: "roles" | "users" | "userGroups";
  data: DeleteDataType;
}

const deleteRecordById = async (args: DeleteByIdArgs) => {
  const { type, data } = args;
  if (type) {
    const JWT_TOKEN = Cookies.get('access_token');  // Correct usage of js-cookie
    const API_URL = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${API_URL}/${type === "users" ? "auth" : type}/delete`, data, {
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

export { getRecords, deleteRecordById };
