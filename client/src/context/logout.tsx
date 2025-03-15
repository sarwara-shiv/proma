import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Function to log out user
export const logout = async () => {
    try {
        const res = await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        console.log(res);
        return true; // Logout successful
    } catch (error) {
        throw new Error("Logout failed");
    }
};
