// ForgotPassword.jsx
import { useState } from 'react';
import { forgotPassword } from '../../hooks/dbHooks';
import { AlertPopupType } from '../../interfaces';
import { useTranslation } from 'react-i18next';
import CustomAlert from '../common/CustomAlert';

const ForgotPassword = () => {
    const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await forgotPassword({email})
      if (response.status === "success") {
        const content = `${t(`RESPONSE.${response.code}`)}`;
        setAlertData({...alertData, isOpen:true, title:"Success", type:"success", content})
        setMessage(content);
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
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}

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

export default ForgotPassword;
