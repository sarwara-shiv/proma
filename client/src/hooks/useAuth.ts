import {jwtDecode} from 'jwt-decode'; // Import as default
import { useCookies } from 'react-cookie';
import { DecodedToken } from '../interfaces';

// Define the interface for your JWT payload
function useGetUserFromToken() {
  const [cookies] = useCookies(['access_token']);
  const token = cookies.access_token;

  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded;
    } catch (error) {
      console.error('Invalid token', error);
    }
  }
  return null;
}

function useAuth() {
  const user = useGetUserFromToken();
  if (user) {
    return {
      isAuthenticated: true,
      role: user.role || null,
      roles: user.roles || [], 
      user,
    };
  } else {
    return {
      isAuthenticated: false,
      role: null,
      roles:[],
      user: null,
    };
  }
}

export { useAuth };