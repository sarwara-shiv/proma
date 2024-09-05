import React, { useState } from 'react';
import CustomInput from '../../../../components/common/CustomInput';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import FormButton from '../../../../components/common/FormButton';
import axios from 'axios';
import { useAuth } from '../../../../hooks/useAuth'; 

interface FormData {
  roleName?: string;
  shortName?: string;
  description?: string;
}

interface ArgsType {
  data?: FormData; // Optional formData prop
}

const RolesForm: React.FC<ArgsType> = ({ data = {} }) => { // Provide a default value for formData
  const { roleName = '', shortName = '', description = ''} = data;
  const {user} = useAuth();
  const [cookies] = useCookies(['access_token']);
  const JWT_TOKEN = cookies.access_token;
  const [formData, setFormData] = useState({roleName, shortName, description});
  const {t} = useTranslation();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleInputs = (event: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>)=>{
    const field = event.target.name;
    setFormData({...formData, [field]:event.target.value});
  }

  const submitForm = async(event: React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    console.log(formData);
    try{
        await axios.post(`${API_URL}/roles/add`, formData,
            {headers :{'Authorization':`Bearer ${JWT_TOKEN}`,'Content-Type': 'application/json'}}
         ).then(response=>{
          if(response.data.status === "success"){ 
              alert("data saved");
              console.log(response.data)
              // setFormData(response.data.data);
              // navigation("/");
          }else{
            console.error({error:response.data.message, code:response.data.code}); 
          }
        }).catch(error =>{
          console.error(error);
        })
  
      }catch(error){
        console.log(error);
      }
  }


  return (
    <div className='content  flex justify-center'>
    <div className="p-4 bg-white shadow-md rounded max-w-screen-sm flex-1">
      <h2 className="text-lg font-bold mb-4">Role Form</h2>
      
      <form onSubmit={(e)=>submitForm(e)} className=''>
        <div className='fields-wrap grid grid-cols-1 md:grid-cols-2 gap-2 '>
          <div className="mb-4">
            <CustomInput 
              name='roleName'
              type="text" 
              value={formData.roleName && formData.roleName} 
              label={t(`FORMS.roleName`)}
              onChange={(e)=>handleInputs(e)}
              required ={true}
            />
          </div>

          <div className="mb-4">
              <CustomInput 
              name='shortName'
              type="text" 
              value={formData.shortName && formData.shortName} 
              label={t(`FORMS.shortName`)}
              onChange={(e)=>handleInputs(e)}
              fieldType='keyword'
            />
          </div>
        </div>

          <div className="mb-4">
              <CustomInput 
              name='description'
              type="textarea" 
              value={formData.description && formData.description} 
              label={t(`FORMS.description`)}
              onChange={(e)=>handleInputs(e)}
            />
          </div>
        

        <div className="mt-6 text-right">
            <FormButton btnText={t(`create`)}/>
        </div>
      </form>
    </div>
    </div>
  );
}

export default RolesForm;
