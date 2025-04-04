import { DeleteRelated, OrderByFilter, QueryFilters, RelatedUpdates } from '@/interfaces';
import axios from 'axios';
import Cookies from 'js-cookie'; 
import { ObjectId } from 'mongodb';

const JWT_TOKEN = Cookies.get('access_token');  
const API_URL = process.env.REACT_APP_API_URL;
console.log(JWT_TOKEN);

const headers = {
    'Content-Type': 'application/json',
}


interface MessageArgs {
    message: string;
    isNew?:boolean 
}
// sent message
const sendMessageToAI = async (args: MessageArgs) => {
    const { message, isNew=false} = args;
    if (message) {
  
      try {
        const response = await axios.post(`${API_URL}/leads/chat`, 
          {
            message, isNew
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

interface LeadDataType {
    leadData: any; 
}

const saveLead = async (args: LeadDataType) => {
    const { leadData} = args;
    if (leadData) {
  
      try {
        const response = await axios.post(`${API_URL}/leads/save`, leadData, 
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

  export {
    sendMessageToAI,
    saveLead,
}
  