// ResetPassword.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { resetPassword } from '../../hooks/dbHooks';
import { AlertPopupType } from '../../interfaces';
import { useTranslation } from 'react-i18next';
import CustomAlert from '../common/CustomAlert';

const ResetPassword = () => {
    const {t} = useTranslation();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await resetPassword({password, token: token || ''});
      if (response.status === "success") {
        const content = `${t(`RESPONSE.${response.code}`)}`;
        setMessage(content);
        setAlertData({...alertData, isOpen:true, title:"Success", type:"success", content})
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
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />
        <button type="submit">Reset Password</button>
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

export default ResetPassword;
