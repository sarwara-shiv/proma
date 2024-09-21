import React, { useState, useEffect } from 'react';
import CustomInput from '../../../../components/forms/CustomInput';
import { useTranslation } from 'react-i18next';
import FormButton from '../../../../components/common/FormButton';
import { addRecords, addUpdateRecords } from '../../../../hooks/dbHooks';
import { User } from '../../../../interfaces/users';
import { PermissionsMap, UserRole, UserWithRoles } from '../../../../interfaces';
import {RolesSelect, PagePermissionsSelect} from '../../../../components/forms';
import CustomAlert from '../../../../components/common/CustomAlert';
import ToggleSwitch from '../../../../components/common/ToggleSwitch';
import { AlertPopupType, FlashPopupType } from '@/interfaces';
import UserRolesSelect from '../../../../components/forms/UserRolesSelect';
import FlashPopup from '../../../../components/common/FlashPopup';

interface ArgsType {
  id?:string | null;
  action?:"add" | "update";
  data?: User; // Optional formData prop
  checkDataBy?:string[];
}

const checkDataBy: string[] = ['username', 'email'];

const UsersForm: React.FC<ArgsType> = ({ action = "add", data, id }) => {
  const { username = '', password = '', email = '', roles = [], permissions = {}, isActive=false } = data || {};
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  const [formData, setFormData] = useState<User>({ username, password, email, roles, permissions, isActive });
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionsMap>(permissions);
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  const { t } = useTranslation();

  useEffect(()=>{
    if(formData.roles && formData.roles.length > 0){
      console.log(formData.roles);
      const roleIds = formData.roles.map((role) => {
        const rdata = role as unknown as UserRole;
        if (rdata._id) {
          setSelectedRoleName(rdata.name);
          return rdata._id;
        }
      });
    
    }

  },[])
  const handlePermissionsChange = (newPermissions: PermissionsMap) => {
    setSelectedPermissions(newPermissions);
    console.log('Selected Permissions:', newPermissions);
  };

  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name;
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleRoleChange = (value: string | string[], name:string) => {
    console.log(name);
    setSelectedRoleName(name);
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
            // setAlertData({...alertData, isOpen:true, title:"Success", type:"success", content})
            setFlashPopupData({...flashPopupData, isOpen:true, message:content, type:"success"});
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
          <h2 className="text-lg font-bold mb-4">
            { action==='update' ? t('updateUser') : t('newUser')}
            </h2>
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
            <UserRolesSelect onChange={handleRoleChange} selectedRoles={formData.roles} />

          <div className="mt-6">
            {selectedRoleName && selectedRoleName !== 'admin' && selectedRoleName !== 'manager' && 
              <PagePermissionsSelect
                initialPermissions={selectedPermissions}
                onPermissionsChange={handlePermissionsChange}
              />
            }
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
          type={alertData.type || 'info'} 
        />

<FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>
        
      </div>
    </div>
  );
};

export default UsersForm;
