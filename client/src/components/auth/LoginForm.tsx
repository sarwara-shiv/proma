import React, { useEffect, useState } from "react";
import { login } from "../../context/login"; // Import login function
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CustomInput from "../forms/CustomInput";
import FormButton from "../common/FormButton";
import FormsTitle from "../common/FormsTitle";
import {useAuthContext } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { UserRole } from "@/interfaces";

const LoginForm: React.FC = () => {
  const { 
    setUser, 
    setRole, 
    setRoles, 
    setIsAuthenticated, 
    setPermissions, 
    setIsAdmin, 
    setIsClient, 
    setIsManager, 
    setIsEmployee, 
    setIsScrumMaster,
    setIsTeamLeader,
    setIsCustomRole,
    setSlug,
    isAdmin, 
    isManager,
    isEmployee,
    isClient,
    isAuthenticated,
    isCustomRole,
    isScrumMaster,
    isTeamLeader,
   } = useAuthContext(); // Use setUser from context
  const [data, setData] = useState({ email: "", password: "" });
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const socket = useSocket();

  // Handle form input changes
  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name;
    setData({ ...data, [field]: event.target.value });
  };

  useEffect(() => {
    if (socket) {
      // Listen for the 'user-connected' event (optional, for debugging)
      socket.on('user-connected', (userId) => {
        console.log('🎉 Received user-connected event in frontend:', userId);
      });

      // Cleanup listener on unmount
      return () => {
        socket.off('user-connected'); 
      };
    }
  }, [socket]);

  // Submit form
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const userData = await login(data.email, data.password);
      console.log(userData);
      setUser(userData.data); // Update global user state
      setRole(userData.data.role);
      setRoles(userData.data.roles);
      setPermissions(userData.data.permissions);
      setIsAuthenticated(true);
      if (userData.data) {
        setUser(userData.data); // Set user info
        setRoles(userData.data.roles);
        setRole(userData.data.role);
        setPermissions(userData.data.permissions);
        setIsAuthenticated(true);

        // SET ROLES
        if(userData.data.roles && userData.data.roles.length > 0){
            setIsAdmin(userData.data.roles.some((role:UserRole) => role.name === 'admin'));
            setIsManager(userData.data.roles.some((role:UserRole) => role.name === 'manager'));
            setIsEmployee(userData.data.roles.some((role:UserRole) => role.name === 'employee'));
            setIsClient(userData.data.roles.some((role:UserRole) => role.name === 'client'));
            setIsScrumMaster(userData.data.roles.some((role:UserRole) => role.name === 'scrumMaster'));
            setIsTeamLeader(userData.data.roles.some((role:UserRole) => role.name === 'teamLeader'));
            if(!isAdmin && !isManager && !isEmployee && !isClient && !isScrumMaster && !isTeamLeader){
                setIsCustomRole(true);
            }

            if(userData.data.roles.some((role:UserRole) => role.name === 'admin')){
                setSlug('admin');
            }
            if(userData.data.roles.some((role:UserRole) => role.name === 'client')){
                setSlug('client');
            }
        }

    }

      if(socket){
        socket.emit('user-connected', userData.data._id);
      }
      navigate('/dashboard');
      // if (userData.data.role === 'admin') {
      //   console.log('admin');
      //   setIsAdmin(true);
      //   navigate('/admin/dashboard');
      // } else {
      //   navigate('/user/dashboard');
      // }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="login-wrap form-container sm:mx-auto sm:w-full sm:max-w-sm shadow-lg p-4 rounded-lg bg-white">
      <form className="space-y-6" onSubmit={submitForm}>
        <FormsTitle text={t("PAGES.login")} />
        <div className="fields-wrap flex flex-col">
          <CustomInput 
            type="email" id="lemail" name="email" value={data.email} onChange={handleInputs} label={t("FORMS.email")}
          />
          <CustomInput 
            type="password" id="lpassword" name="password" value={data.password} onChange={handleInputs} label={t("FORMS.password")}
          />
          <div className="btn-wrap text-right">
            <FormButton btnText={t("BUTTONS.submit")} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
