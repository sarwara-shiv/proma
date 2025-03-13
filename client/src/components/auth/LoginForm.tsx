import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../forms/CustomInput';
import FormButton from '../common/FormButton';
import axios from 'axios';
import FormsTitle from '../common/FormsTitle';

const LoginForm: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ email: '', password: '' });
  const { t } = useTranslation('common');
  const [cookies, setCookies] = useCookies(['access_token']);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // Handle form input changes
  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name;
    setData({ ...data, [field]: event.target.value });
  };

  // Submit form
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);

      if (response.data.status === 'success') {
        window.localStorage.setItem('userID', response.data.userID); // Optional storage for userID
        setCookies('access_token', response.data.token, { path: '/', maxAge: 24 * 60 * 60 }); // Cookie persists for 1 day
        // setCookies('access_token', response.data.token, {
        //   path: '/',
        //   maxAge: 24 * 60 * 60,
        //   secure: process.env.NODE_ENV === 'production', // Ensure the cookie is set securely in production
        //   sameSite: 'strict', // or 'Lax', depending on your needs
        // });
        console.log(response);
        // Navigate based on role
        if (response.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      } else {
        console.error({ error: response.data.message, code: response.data.code });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (cookies.access_token) {
      console.log('Token from cookies:', cookies.access_token);
    }
  }, [cookies.access_token]);

  return (
    <div className='login-wrap form-container sm:mx-auto sm:w-full sm:max-w-sm shadow-lg p-4 rounded-lg bg-white'>
      <form className="space-y-6" onSubmit={(e) => submitForm(e)}>
        <FormsTitle text={t('PAGES.login')} />
        <div className="fields-wrap flex flex-col">
          <CustomInput 
            type="email" id='lemail' name="email" value={data.email} onChange={(event) => handleInputs(event)} label={t('FORMS.email')}
          />
          <CustomInput 
            type="password" id='lpassword' name="password" value={data.password} onChange={(event) => handleInputs(event)} label={t('FORMS.password')} 
          />
          <div className="btn-wrap text-right">
            <FormButton btnText={t('BUTTONS.submit')} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
