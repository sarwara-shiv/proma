import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store'
import axios from 'axios';
import Cookies from 'js-cookie'; 
import { ObjectId } from 'mongodb';

const JWT_TOKEN = Cookies.get('access_token');  
const API_URL = process.env.REACT_APP_API_URL;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 


const headers = {
    'Content-Type': 'application/json',
  }
/**
 * 
 * GET USERS AND GROUPS
 * 
 */
interface IGetMessages{
    id:string|ObjectId
    receiverId?:string;
    groupId?:string;
    limit?:number;
    pageNr?:number
}

export const getChatMessages = async ({ id, receiverId, groupId, pageNr, limit }: IGetMessages) => {
    if (!id || (!receiverId && !groupId)) {
      return { status: "error", code: "invalid_data" };
    }
  
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", 'users');
      if (receiverId) {
        queryParams.append("receiverId", receiverId);
      } else if (groupId) {
        queryParams.append("groupId", groupId);
      }

      if(pageNr){
        queryParams.append("pageNr", pageNr.toString());
      }
      if(limit){
        queryParams.append("limit", limit.toString());
      }
  
      queryParams.append("userId", id.toString());
  
      const response = await axios.get(`${API_URL}/messenger/messages?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
  
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      return { status: "error", code: "unknown_error" };
    }
  };

interface IChatUsers{
    id:string|ObjectId
    type?:string;
}

export const getChatUsers = async (args: IChatUsers) => {
    const { type='users', id } = args;
    if (type && id) {
        console.log(type);
      try {
        const response = await axios.post(`${API_URL}/messenger/users`, 
          {
            page:type , id, data:{id}
          }, 
          {
            headers,
            withCredentials: true 
          });
        console.log(response);
        return response.data;
      } catch (error) {
        return { status: "error", code: "unknown_error" };
      }
    } else {
      return { status: "error", code: "invalid_data" };
    }
};

