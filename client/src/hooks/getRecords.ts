import axios from 'axios';
import Cookies from 'js-cookie'; 
import { ObjectId } from 'mongodb';

const JWT_TOKEN = Cookies.get('access_token');  
const API_URL = process.env.REACT_APP_API_URL;

const headers = {
    'Authorization': `Bearer ${JWT_TOKEN}`, 
    'Content-Type': 'application/json'
}

interface GeTRecordsWithID {
    id?:string | string[] | ObjectId | ObjectId[];
}
  
// get single record with ID
const getUsers = async(args:GeTRecordsWithID)=>{
    const {id}  = args;
    if(id){
        try{
        const response = await axios.post(`${API_URL}/resource/auth/getRecordsWithId`,{
            page:'users', id
        }, {
            headers
        });
        if(response.data.data.status === 'ok'){
            return response.data.data.data;
        }else{
            return false;
        }
        }catch(error){
        return { status: "error", code: "invalid_data" };
        }
    }
}

export { getUsers }
  