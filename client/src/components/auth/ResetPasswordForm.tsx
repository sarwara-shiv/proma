// ResetPassword.jsx
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { resetPassword } from '../../hooks/dbHooks';
import { AlertPopupType } from '../../interfaces';
import { useTranslation } from 'react-i18next';
import CustomAlert from '../common/CustomAlert';
import { CustomInput } from '../forms';
import FormButton from '../common/FormButton';
import FormsTitle from '../common/FormsTitle';

const ResetPasswordForm = () => {
    const {t} = useTranslation();
    const [formData, setFormData] = useState({password:"", rPassword:""});
    const [message, setMessage] = useState({type:"success", text:""});
    const { token } = useParams();
    const[page, setPage] = useState('resetPassword');
    const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    event.preventDefault();
    setMessage({...message, text:""});
    if(formData.password === formData.rPassword){
        const response = await resetPassword({password:formData.password, token:token || ''}); 
        console.log(response);
        if(response.status === 'success'){
            setPage('login');
            setMessage({...message, type:"success", text:`${t(`RESPONSE.${response.code}`)}`});
        }else{
            setMessage({...message, type:'error', text:`${t(`RESPONSE.${response.code}`)}`});
        }
    }else{
        setMessage({...message, type:'error', text:`${t(`RESPONSE.password_not_same`)}`});
    }

  };

  return (
      <div className='form-container sm:mx-auto sm:w-full sm:max-w-sm shadow-lg p-4 rounded-lg bg-white'>
        {page === 'resetPassword' && 
            <form className="space-y-6" onSubmit={(e)=>submitForm(e)}>
                <FormsTitle text ={t('PAGES.resetPassword')} />
                <span className={`${message.type === 'error' ? 'text-red-500' : 'text-green-500'} italic text-xs`}>
                    {message.text  && message.text}
                </span>
                <div className="fields-wrap flex flex-col">
                    <CustomInput
                        type="password" id='pass' name="password" value={formData.password}  onChange={(e) => setFormData({...formData, password:e.target.value})} label={t("FORMS.newPassword")}
                    />
                    <CustomInput
                        type="password" id='pass2' name="rpassword" value={formData.rPassword}  onChange={(e) => setFormData({...formData, rPassword:e.target.value})}label={t("FORMS.rPassword")}
                    />
                    <div className="btn-wrap text-right">
                        <FormButton btnText={t("BUTTONS.submit")} />
                    </div>
                </div>
            </form>
        }
        {page === 'login' && 
        <div className='text-center'>
            <span className={`${message.type === 'error' ? 'text-red-500' : 'text-green-500'} italic text-xs`}>
                {message.text  && message.text}
            </span> <br></br>
            <NavLink to='/login'>
                {t('BUTTONS.login')}
            </NavLink>
        </div>
        }
        <CustomAlert
            onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
            isOpen={alertData.isOpen}
            content={alertData.content}
            title={alertData.title}
            type={alertData.type || 'info'} 
          />
    </div>
    
  );
};

export default ResetPasswordForm;
