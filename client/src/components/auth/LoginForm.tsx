import React, { useState } from "react";
import { login } from "../../context/login"; // Import login function
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CustomInput from "../forms/CustomInput";
import FormButton from "../common/FormButton";
import FormsTitle from "../common/FormsTitle";
import {useAuthContext } from "../../context/AuthContext";

const LoginForm: React.FC = () => {
  const { setUser, setRole, setRoles, setIsAuthenticated, setPermissions } = useAuthContext(); // Use setUser from context
  const [data, setData] = useState({ email: "", password: "" });
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  // Handle form input changes
  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name;
    setData({ ...data, [field]: event.target.value });
  };

  // Submit form
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const userData = await login(data.email, data.password);
      console.log();
      setUser(userData.data); // Update global user state
      setRole(userData.data.role);
      setRoles(userData.data.roles);
      setPermissions(userData.data.permissions);
      setIsAuthenticated(true);
      console.log(userData);
      if (userData.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
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
