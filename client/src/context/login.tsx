import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Function to check if user is logged in
export const checkAuthStatus = async () => {
    const page = 'auth';
    try {
        const response = await axios.get(`${API_URL}/auth/check-users`, { withCredentials: true, params: { page } });
        console.log(response);
        return response.data; // Return user details
    } catch (error) {
        console.error('Error checking authentication status:', error);
        return null; // No user found
    }
};

// Function to log in user
export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/auth/login`,
            { email, password },
            { withCredentials: true }  // Ensure cookies are sent with request
        );
        console.log(response.data);
        return response.data; // Return user data after login
    } catch (error: any) {
        // Log error with more context
        console.error('Login failed:', error?.response?.data || error.message);

        // Return a more detailed error message
        throw new Error(error?.response?.data?.message || "Login failed due to a server error.");
    }
};
