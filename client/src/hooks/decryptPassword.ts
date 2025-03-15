import axios from 'axios';

export const fetchPagePermissions = async (password: string) => {
    const API_URL = process.env.REACT_APP_API_URL;

    try {
        // Sending the request with the password and the necessary headers
        const response = await axios.post(
            `${API_URL}/auth/depass`,
            { password: password },
            {
                headers: {
                    'Content-Type': 'application/json', // Ensure correct content type
                },
                withCredentials: true, // This ensures the HTTP-only cookie is sent with the request
            }
        );

        // Return the response data
        return response.data;
    } catch (error) {
        // Error handling: Return an error response
        console.error('Error fetching page permissions:', error);
        return { status: "error", code: "request_failed", message: error};
    }
};
