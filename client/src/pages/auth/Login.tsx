import {useState } from "react";
import LoginForm from "../../components/auth/LoginForm"
import Logo from '../../components/common/Logo';
import LinkButton from "../../components/actions/LinkButton";
import { useTranslation } from "react-i18next";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
const Login = () => {
  const {t} = useTranslation();
  const [page, setPage] = useState('login');

  const handlePage = (value:string)=>{
    setPage(value);
  }

  return (
    <div className="flex flex-col min-w-full min-h-screen justify-center items-center p-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center">
        <div className="mb-6 text-center">
          <Logo size="md"/>
        </div>
        {page === 'login' && <LoginForm />}
        {page === 'forgotPassword' && <ForgotPasswordForm />}
        <div className="mt-4">
          {page === 'login' && <LinkButton onClick={handlePage} value="forgotPassword" text={t('BUTTONS.forgotPassword')}/>}
          {page === 'forgotPassword' && <LinkButton onClick={handlePage} value="login" text={t('BUTTONS.login')}/>}
          
        </div>
      </div>
    </div>
  )
}

export default Login
