import React, { useState } from 'react';
import CustomInput from '../../../../components/forms/CustomInput';
import { useTranslation } from 'react-i18next';
import FormButton from '../../../../components/common/FormButton';
import { useAuth } from '../../../../hooks/useAuth'; 
import { PermissionsMap, UserRole } from '../../../../interfaces';
import PagePermissionsSelect from '../../../../components/forms/PagePermissionsSelect';
import CustomAlert from '../../../../components/common/CustomAlert';
import { addRecords, addUpdateRecords } from '../../../../hooks/dbHooks';
import { ObjectId } from 'mongodb';
import FormsTitle from '../../../../components/common/FormsTitle';

interface ArgsType {
  action?:"add" | "update";
  data?: UserRole; // Optional formData prop
  id?:string | null;
  checkDataBy?:string[];
}

const checkDataBy: string[] = ['name', 'displayName'];

const GroupsForm: React.FC<ArgsType> = ({ data, action = 'add', id=null }) => {
  const { name = '', displayName = '', description = ''} = data || {};
  const { user } = useAuth();
  const [alertData, setAlertData] = useState({isOpen:false, title:"", content:'', data:{}, type:"success"});

  // Initialize formData state with props
  const [formData, setFormData] = useState({ name, displayName, description });

  const { t } = useTranslation();
  const API_URL = process.env.REACT_APP_API_URL;

  // Handle input changes
  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form submission handler
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {

      if(action === 'add'){
      }
      // const response = await addRecords({type: "roles", body:{ ...formData, permissions: Object.values(selectedPermissions) }}); 
      const response = await addUpdateRecords({type: "groups", checkDataBy:checkDataBy, action, id, body:{ ...formData}}); 
            console.log(response);
        if (response.status === "success") {
            // const content = action === 'update' ? `${t('dataUpdated')}` : `${t('dataAdded')}`;
            const content = `${t(`RESPONSE.${response.code}`)}`;
            setAlertData({...alertData, isOpen:true, title:"Success", type:"success", content})
            console.log('Response Data:', response.data);
        } else {
          let content = `${t(`RESPONSE.${response.code}`)}`
          if(response.data){
            content = Object.entries(response.data).map(([key, value]) => {
                return value && `${key} exists`;
            }).filter(Boolean).join(', ');
          }
          setAlertData({...alertData, isOpen:true, title:"Fail", type:"fail", content});
          console.error('Error:', response.message, 'Code:', response.code);
        }
      
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  return (
    <div className="content flex justify-center">
      <div className="p-4 bg-white shadow-md rounded max-w-screen-sm flex-1">
        <FormsTitle text= { action==='update' ? t('updateGroup') : t('newGroup')} classes='mb-3'/> 
        <form onSubmit={submitForm}>
          <div className="fields-wrap grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="mb-4">
              <CustomInput
                name="displayName"
                type="text"
                value={formData.displayName}
                label={t('FORMS.displayName')}
                onChange={handleInputs}
                fieldType='fullname'
              />
            </div>
            <div className="mb-4">
              <CustomInput
                name="name"
                type="text"
                value={formData.name}
                label={t('FORMS.name')}
                onChange={handleInputs}
                fieldType="keyword"
                required={true}
              />
            </div>
          </div>

          <div className="mb-4">
            <CustomInput
              name="description"
              type="textarea"
              value={formData.description}
              label={t('FORMS.description')}
              onChange={handleInputs}
            />
          </div>
          <div className="mt-6 text-right">
            <FormButton btnText={action === 'update' ? t('update') : t('create')} />
          </div>
        </form>
        <CustomAlert isOpen={alertData.isOpen} onClose={()=>setAlertData({...alertData, isOpen:false})} title={alertData.title} content={alertData.content} />
      </div>
    </div>
  );
};

export default GroupsForm;
