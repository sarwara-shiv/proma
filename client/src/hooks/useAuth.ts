import {jwtDecode} from 'jwt-decode'; // Import as default
import { useCookies } from 'react-cookie';

// Define the interface for your JWT payload
interface DecodedToken {
  role?: string; // Define other properties based on your JWT payload
  // Add additional properties if your token includes them
}

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
console.log(user);
  if (user) {
    console.log(user);
    return {
      isAuthenticated: true,
      role: user.role || null, // Safely access role
      user,
    };
  } else {
    return {
      isAuthenticated: false,
      role: null,
      user: null,
    };
  }
}

export { useAuth };