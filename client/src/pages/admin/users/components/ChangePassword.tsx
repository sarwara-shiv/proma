import FormButton from '../../../../components/common/FormButton';
import { CustomInput } from '../../../../components/forms';
import { adminResetPassword } from '../../../../hooks/dbHooks';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
interface ArgsType{
    id:string;
    username?:string
}

const ChangePassword: React.FC<ArgsType>  = ({id, username}) => {
    const {t} = useTranslation();
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState<{password:string, rPassword:string}>({password:'Pass@123', rPassword:'Pass@123'});

    const handleInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        const {name, value} = event.target;
        setFormData({...formData, [name]:value});
    }

    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage('');
        if(formData.password === formData.rPassword){
            const response = adminResetPassword({id, password:formData.password});
        }else{
            setMessage('Password & repeat Password does not match');
        }
    }

  return (
    <div>
          <div className='flex flex-row justify-between align-center'>
            <h2 className="text-md font-bold mb-4">{t('changePassword')}</h2>
          </div>
        <form onSubmit={(e) => submitForm(e)} className=''>
          <div className='fields-wrap grid grid-cols-1 md:grid-cols-1 gap-2'>
            <div className="mb-2">
                <CustomInput
                        name='password'
                        type="password"
                        value={formData.password || ''}
                        label={t(`FORMS.password`)}
                        onChange={handleInput}
                    />
            </div>
            <div className="mb-2">
                <CustomInput
                        name='rPassword'
                        type="password"
                        value={formData.rPassword || ''}
                        label={t(`FORMS.rPassword`)}
                        onChange={handleInput}
                    />
            </div>
            {message  && message}
            <div className="mt-0 text-right">
                <FormButton  btnText={t('update')} />
            </div>
            </div>
        </form>
    </div>
  )
}

export default ChangePassword
