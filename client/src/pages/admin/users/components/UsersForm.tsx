import React, { useState, useEffect } from 'react';
import CustomInput from '../../../../components/forms/CustomInput';
import { useTranslation } from 'react-i18next';
import FormButton from '../../../../components/common/FormButton';
import { addRecords, addUpdateRecords } from '../../../../hooks/dbHooks';
import { User } from '@/interfaces/users';
import { PermissionsMap } from '../../../../interfaces';
import {RolesSelect, PagePermissionsSelect} from '../../../../components/forms';
import CustomAlert from '../../../../components/common/CustomAlert';
import ToggleSwitch from '../../../../components/common/ToggleSwitch';

interface ArgsType {
  id?:string | null;
  action?:"add" | "update";
  data?: User; // Optional formData prop
  checkDataBy?:string[];
}

const checkDataBy: string[] = ['username', 'email'];

const UsersForm: React.FC<ArgsType> = ({ action = "add", data, id }) => {
  const { username = '', password = '', email = '', roles = [], permissions = {}, isActive=false } = data || {};
  const [alertData, setAlertData] = useState({ isOpen: false, content: "", type: "info", title: "" });
  const [formData, setFormData] = useState<User>({ username, password, email, roles, permissions, isActive });
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionsMap>(permissions);
  const { t } = useTranslation();


  const handlePermissionsChange = (newPermissions: PermissionsMap) => {
    setSelectedPermissions(newPermissions);
    console.log('Selected Permissions:', newPermissions);
  };

  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name;
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleRoleChange = (value: string | string[]) => {
    setFormData({ ...formData, roles: Array.isArray(value) ? value : [value] });
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      let data = formData;
      if(action === 'update'){
        delete data.password;
      }
      const response = await addUpdateRecords({type: "users", checkDataBy:checkDataBy, action, id, body:{ ...data, permissions: selectedPermissions}}); 
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
      //   console.log({ ...formData, permissions: selectedPermissions } );
      // const response = await addRecords({ type: "users", body: { ...formData, permissions: selectedPermissions } });
      // if (response.status === "success") {
      //   setAlertData({ ...alertData, isOpen: true, content: 'User Created', type: 'success' });
      // } else {
      //   setAlertData({ ...alertData, isOpen: true, content: response.message, type: 'error', title: response.code });
      // }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatus = (isActive:boolean)=>{
    setFormData({...formData, 'isActive':isActive});
  }

  return (
    <div className='content flex justify-center'>
      <div className="p-4 bg-white shadow-md rounded max-w-screen-sm flex-1">
        <div className='flex flex-row justify-between align-center'>
          <h2 className="text-lg font-bold mb-4">{t('newUser')}</h2>
          <ToggleSwitch onChange={handleStatus} label={'Status'} initialState={formData.isActive ? true : false}/> 
        </div>
        <form onSubmit={(e) => submitForm(e)} className=''>
          <div className='fields-wrap grid grid-cols-1 md:grid-cols-2 gap-2'>
            <div className="mb-4">
              <CustomInput
                name='username'
                type="text"
                value={formData.username}
                label={t(`FORMS.username`)}
                onChange={handleInputs}
                fieldType='keyword'
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
          {action !== 'update' && 
            <div className="mb-4">
              <CustomInput
                name='password'
                type="password"
                value={formData.password}
                label={t(`FORMS.password`)}
                onChange={handleInputs}
              />
            </div>
          }

          {/* Render roles once they are fetched */}
          {/* {rolesData.length > 0 && (
            <CustomSelectList
              label={t('roles')}
              name='roles'
              data={rolesData}
              selectedValue={roles}
              inputType="radio"
              onChange={handleSelectChange}
            />
          )} */}

            <RolesSelect onChange={handleRoleChange} selectedRoles={[]}/>

          <div className="mt-6">
            <PagePermissionsSelect
              initialPermissions={selectedPermissions}
              onPermissionsChange={handlePermissionsChange}
            />
          </div>

          <div className="mt-6 text-right">
            <FormButton  btnText={action === 'update' ? t('update') : t('create')} />
          </div>
        </form>

        <CustomAlert
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
