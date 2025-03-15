// src/utils/fetchPermissions.ts
import axios from 'axios';
import PagesConfig from '../config/pagesConfig';

export const fetchPagePermissions = async (page: string) => {
  // Fetch page configuration from PagesConfig
  const pageConfig = PagesConfig[page.toUpperCase()];

  if (!pageConfig) {
    throw new Error(`Page "${page}" does not exist in PagesConfig`);
  }

  // Get API URL from environment variables
  const API_URL = process.env.REACT_APP_API_URL;

  try {
    // Send the request to the server
    const response = await axios.post(
      `${API_URL}/auth/get`, 
      {
        page: pageConfig.name,  // Passing the page name to the API
      }, 
      {
        headers: {
          'Content-Type': 'application/json',  // Ensure content-type is set
        },
        withCredentials: true,  // Ensure that cookies (HTTP-only cookies) are sent along with the request
      }
    );

    // Assuming the response contains a 'permissions' field
    return response.data.permissions;
  } catch (error:any) {
    console.error('Error fetching page permissions:', error);
    throw new Error(error);
  }
};
