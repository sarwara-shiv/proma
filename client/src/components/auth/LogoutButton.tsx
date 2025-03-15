import React from "react";
import {useAuthContext}  from "../../context/AuthContext";
import { logout } from "../../context/logout";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC = () => {
    const {setUser, setRole, setRoles, setIsAuthenticated, setPermissions } = useAuthContext();
    const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null); // Clear user state
      setRole(null);
      setRoles([]);
      setPermissions([]);
      setIsAuthenticated(false);
      // Redirect to login page
      navigate("/auth");
    } catch (error:any) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
        <div>
            <button onClick={handleLogout} className="btn btn-solid">Logout</button>
        </div>
    )
};

export default LogoutButton;
