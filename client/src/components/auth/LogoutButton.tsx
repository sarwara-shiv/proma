import React from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const [_, setCookies] = useCookies(["access_token"]);
    const navigate = useNavigate();

    const logout = () => {
        // Expire the cookie by setting a past expiration date (or simply remove it)
        setCookies("access_token", "", { path: "/" });

        // Remove token & user data from localStorage
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("userID");

        // Redirect to login page
        navigate("/auth");
    };

    return (
        <div>
            <button onClick={logout} className="btn btn-solid">Logout</button>
        </div>
    );
};

export default LogoutButton;
