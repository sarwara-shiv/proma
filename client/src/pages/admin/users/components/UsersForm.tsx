import React, { useState, useEffect } from 'react';
import CustomInput from '../../../../components/forms/CustomInput';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import FormButton from '../../../../components/common/FormButton';
import axios from 'axios';
import { useAuth } from '../../../../hooks/useAuth'; 
import Popup from '../../../../components/common/CustomAlert';
import { getRecords, addRecords } from '../../../../hooks/dbHooks';
import CustomSelectList from '../../../../components/forms/CustomSelectList';

interface FormData {
  username?: string;
  password?: string;
  email?: string;

}

interface ArgsType {
  data?: FormData; // Optional formData prop
  action?:string;
}

const UsersForm: React.FC<ArgsType> = ({ action="add", data = {} }) => { 
    const { username = '', password = '', email = ''} = data;
    const { user } = useAuth();
    const [cookies] = useCookies(['access_token']);
    const [alertData, setAlertData] = useState({isOpen: false, content: "", type: "info", title: ""}); 
    const JWT_TOKEN = cookies.access_token;
    const [formData, setFormData] = useState({ username, password, email });
    const { t } = useTranslation();
    const API_URL = process.env.REACT_APP_API_URL;
    
    const [rolesData, setRolesData] = useState<string[]>([]);

    // Fetch roles when the component mounts
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await getRecords({ type: "roles", body:{} });
                if (res.status === "success") {
                    setRolesData(res.data);
                }
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };

        fetchRoles();
    }, []);

    const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const field = event.target.name;
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleSelectChange = (value: string | string[]) => {
        console.log("Selected value:", value);
        // You can set this value in the formData if needed
    };

    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await addRecords({type: "users", body:{ ...formData}}); 
            // const response = await axios.post(`${API_URL}/auth/register`, formData, {
            //     headers: {
            //         'Authorization': `Bearer ${JWT_TOKEN}`,
            //         'Content-Type': 'application/json',
            //     },
            // });
            if (response.data.status === "success") {
                setAlertData({ ...alertData, isOpen: true, content: 'User Created', type: 'success' });
            } else {
                setAlertData({ ...alertData, isOpen: true, content: response.data.message, type: 'error', title: response.data.code });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='content flex justify-center'>
            <div className="p-4 bg-white shadow-md rounded max-w-screen-sm flex-1">
                <h2 className="text-lg font-bold mb-4">{t('newUser')}</h2>
                
                <form onSubmit={(e) => submitForm(e)} className=''>
                    <div className='fields-wrap grid grid-cols-1 md:grid-cols-2 gap-2'>
                        <div className="mb-4">
                            <CustomInput 
                                name='username'
                                type="text" 
                                value={formData.username} 
                                label={t(`FORMS.username`)}
                                onChange={handleInputs}
                                fieldType='username'
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <CustomInput 
                                name='email'
                                type="text" 
                                value={formData.email} 
                                label={t(`FORMS.email`)}
                                onChange={handleInputs}
                                fieldType='email'
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <CustomInput 
                            name='password'
                            type="password" 
                            value={formData.password} 
                            label={t(`FORMS.password`)}
                            onChange={handleInputs}
                        />
                    </div>

                    {/* Render roles once they are fetched */}
                    {rolesData.length > 0 && (
                        <CustomSelectList
                            label={t('roles')}
                            name='roles'
                            data={rolesData}
                            selectedValue='user'
                            inputType="checkbox" 
                            onChange={handleSelectChange}
                        />
                    )}

                    <div className="mt-6 text-right">
                        <FormButton btnText={t(`create`)} />
                    </div>
                </form>

                <Popup 
                    onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
                    isOpen={alertData.isOpen}
                    content={alertData.content}
                    title={alertData.title}
                    type={alertData.type}
                />
            </div>
        </div>
    );
};

export default UsersForm;
