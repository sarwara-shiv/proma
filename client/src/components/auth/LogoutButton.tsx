import React from "react";
import {useAuthContext}  from "../../context/AuthContext";
import { logout } from "../../context/logout";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ArgsType{
  type?: "button"|'link';
  classes?:string
}

const LogoutButton: React.FC<ArgsType> = ({type="button", classes}) => {
    const {setUser, setRole, setRoles, setIsAuthenticated, setPermissions } = useAuthContext();
    const navigate = useNavigate();
    const {t} = useTranslation();

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
            {type === 'button' &&
             <button onClick={handleLogout} className="btn btn-solid">{t('logout')}</button>
            }
            {type === 'link' &&
             <div onClick={handleLogout} className={`
              underline cursor-pointer hover:no-underline 
              ${classes && classes}`
              }>
                {t('logout')}
              </div>
            }
        </div>
    )
};

export default LogoutButton;
