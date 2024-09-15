import React, { useState } from 'react';
import CustomInput from '../../../../components/forms/CustomInput';
import { useTranslation } from 'react-i18next';
import FormButton from '../../../../components/common/FormButton';
import { useAuth } from '../../../../hooks/useAuth'; 
import { PermissionsMap, UserRole } from '../../../../interfaces';
import PagePermissionsSelect from '../../../../components/forms/PagePermissionsSelect';
import CustomAlert from '../../../../components/common/CustomAlert';
import { addRecords } from '../../../../hooks/dbHooks';

interface ArgsType {
  data?: UserRole; // Optional formData prop
}

const RolesForm: React.FC<ArgsType> = ({ data }) => {
  const { name = '', displayName = '', description = '', permissions = [] } = data || {};
  const { user } = useAuth();
  const [alertData, setAlertData] = useState({isOpen:false, title:"", content:'', data:{}, type:"success"});

  // Initialize formData state with props
  const [formData, setFormData] = useState({ name, displayName, description });

  // Initialize permissionsState directly from props
  const initialPermissions: PermissionsMap = permissions.reduce((map, perm) => {
    map[perm.page] = perm;
    return map;
  }, {} as PermissionsMap);

  const [selectedPermissions, setSelectedPermissions] = useState<PermissionsMap>(initialPermissions);

  const { t } = useTranslation();
  const API_URL = process.env.REACT_APP_API_URL;

  // Handle permission changes from the PagePermissionsSelect component
  const handlePermissionsChange = (newPermissions: PermissionsMap) => { 
    setSelectedPermissions(newPermissions);
    console.log('Selected Permissions:', newPermissions);
  };

  // Handle input changes
  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form submission handler
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await addRecords({type: "roles", body:{ ...formData, permissions: Object.values(selectedPermissions) }}); 
            console.log(response);
        if (response.status === "success") {
            setAlertData({...alertData, isOpen:true, title:"Role Added", type:"success", content:'Role added'})
            console.log('Response Data:', response.data);
        } else {
          setAlertData({...alertData, isOpen:true, title:response.code, type:"fail", content:response.message})
          console.error('Error:', response.message, 'Code:', response.code);
        }
      // console.log({ ...formData, permissions: Object.values(selectedPermissions) });
      
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  return (
    <div className="content flex justify-center">
      <div className="p-4 bg-white shadow-md rounded max-w-screen-sm flex-1">
        <h2 className="text-lg font-bold mb-4">{t('Role Form')}</h2>

        <form onSubmit={submitForm}>
          <div className="fields-wrap grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="mb-4">
              <CustomInput
                name="displayName"
                type="text"
                value={formData.displayName}
                label={t('FORMS.displayName')}
                onChange={handleInputs}
                fieldType='name'
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

          {/* Page Permissions Form */}
          <PagePermissionsSelect onPermissionsChange={handlePermissionsChange} initialPermissions={selectedPermissions} />

          <div className="mt-6 text-right">
            <FormButton btnText={t('create')} />
          </div>
        </form>
        <CustomAlert isOpen={alertData.isOpen} onClose={()=>setAlertData({...alertData, isOpen:false})} title={alertData.title} content={alertData.content} />
      </div>
    </div>
  );
};

export default RolesForm;
