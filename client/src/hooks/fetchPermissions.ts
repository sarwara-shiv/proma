// src/utils/fetchPermissions.ts
import Cookies from 'js-cookie';  // Correct library
import axios from 'axios';
import PagesConfig from '../config/pagesConfig';

export const fetchPagePermissions = async (page: string, token: string) => {
  const pageConfig = PagesConfig[page.toUpperCase()];

  if (!pageConfig) {
    throw new Error(`Page "${page}" does not exist in PagesConfig`);
  }

  const JWT_TOKEN = Cookies.get('access_token');  // Correct usage of js-cookie
  const API_URL = process.env.REACT_APP_API_URL;

  const response = await axios.post(`${API_URL}/auth/get`, 
    {
      page: pageConfig.name
    }, 
    {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`, 
        'Content-Type': 'application/json'
      }
    });

  return response.data.permissions;
};
