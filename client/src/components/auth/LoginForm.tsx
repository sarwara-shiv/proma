import React, { useState } from 'react'
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import {useNavigate } from 'react-router-dom';
import CustomInput from '../common/CustomInput';
import FormButton from '../common/FormButton';
import axios from 'axios';

const LoginForm: React.FC = () => {
  const [data, setData] = useState({email:"", password:""});
  const {t} = useTranslation("common");
  const [_, setCookies] = useCookies(["access_token"]);
  const navigation = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // handle inputs
  const handleInputs = (event: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>)=>{
    console.log(API_URL);

    const field = event.target.name;
    setData({...data, [field]:event.target.value});
  }

  // submit form
  const submitForm = async(event: React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    console.log(data);
    try{
      await axios.post(`${API_URL}/auth/login`, data).then(response=>{
        if(response.data.status === "success"){
            window.localStorage.setItem("userID", response.data.userID);
            setCookies("access_token", response.data.token);
            if(response.data.role == "admin"){
              navigation("/admin");
            }else{
              navigation("/users");

            }
            // navigation("/");
        }else{
          console.error({error:response.data.message, code:response.data.code}); 
        }
      }).catch(error =>{
        console.error(error);
      })

    }catch(error){
      console.log(error);
    }
  }

  return (
    <div className='login-wrap form-container sm:mx-auto sm:w-full sm:max-w-sm shadow-lg p-4 rounded-lg bg-white'>
      <form className="space-y-6" onSubmit={(e)=>submitForm(e)}>
            <h2 className="text-lg text-primary">Login</h2>
            <div className="fields-wrap flex flex-col">
                <CustomInput 
                    type="email" id='lemail' name="email" value={data.email} onChange={(event) => handleInputs(event)} label={t("FORMS.email")}
                />
                <CustomInput 
                    type="password" id='lpassword' name="password" value={data.password} onChange={(event) => handleInputs(event)} label={t("FORMS.password")}
                />
                <div className="btn-wrap text-right">
                    <FormButton btnText={t("BUTTONS.submit")} />
                </div>
            </div>
       </form>
    </div>
  )
}

export default LoginForm
