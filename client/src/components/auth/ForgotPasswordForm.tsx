// ForgotPassword.jsx
import { ReactNode, useState } from 'react';
import { forgotPassword } from '../../hooks/dbHooks';
import { AlertPopupType, FlashPopupType } from '../../interfaces';
import { useTranslation } from 'react-i18next';
import CustomAlert from '../common/CustomAlert';
import { CustomInput } from '../forms';
import FormButton from '../common/FormButton';
import { NavLink } from 'react-router-dom';
import FormsTitle from '../common/FormsTitle';
import FlashPopup from '../common/FlashPopup';

const ForgotPasswordForm = () => {
    const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | ReactNode>('');
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await forgotPassword({email});
      if (response.status === "success") {
        let content:string | ReactNode = `${t(`RESPONSE.${response.code}`)}`;
        // setAlertData({...alertData, isOpen:true, title:"Success", type:"success", content});
        const msg =  `${t(`RESPONSE.${response.code}`)}`
        setFlashPopupData({...flashPopupData, isOpen:true, message:msg, type:"success"});
        if(response.link){
          content = (
            <>
              {content} <NavLink to={response.link}>click here</NavLink>
            </>
          );
        }
        setMessage(content);
        console.log(response);
      }else{
        const content = `${t(`RESPONSE.${response.code}`)}`;
        setAlertData({...alertData, isOpen:true, title:"Fail", type:"fail", content});
        setMessage(content);
      }
    } catch (error) {
        console.error(error);
      }
  };

  return (
    <>
      <div className='login-wrap form-container sm:mx-auto sm:w-full sm:max-w-sm shadow-lg p-4 rounded-lg bg-white'>
        <form className="space-y-6" onSubmit={(e)=>submitForm(e)}>
              <FormsTitle text ={t('PAGES.forgotPassword')} />
              <div className="fields-wrap flex flex-col">
                  <CustomInput 
                      type="email" id='lemail' name="email" value={email} onChange={(event) => setEmail(event.target.value)} label={t("FORMS.email")}
                  />
                  <div className="btn-wrap text-right">
                      <FormButton btnText={t("BUTTONS.submit")} />
                  </div>
              </div>
          {message && <p>{message}</p>}
        </form>

        <CustomAlert
            onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
            isOpen={alertData.isOpen}
            content={alertData.content}
            title={alertData.title}
            type={alertData.type || 'info'} 
          />
           <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
