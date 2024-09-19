import Cookies from 'js-cookie'; 
import axios from 'axios';

export const fetchPagePermissions = async (password: string) => {

    const JWT_TOKEN = Cookies.get('access_token');
    const API_URL = process.env.REACT_APP_API_URL;

  const response = await axios.post(`${API_URL}/auth/depass`, 
    {
      password: password
    }, 
    {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`, 
        'Content-Type': 'application/json'
      }
    });

  return response.data;
};