import { CustomInput } from '../../../../components/forms';
import { Project } from '@/interfaces';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';

interface ArgsType {
  id?:string | null;
  action?:"add" | "update";
  data?: Project; 
  checkDataBy?:string[];
}
const initialValues: Project = {
  name: '',
  description: '',
  status: 'notStarted',
  priority: 'medium',
  startDate: new Date(),
  documentation: [],
  personsInvolved: [],
  tasks: [],
  customFields: [],
  permissions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};


const ProjectsForm:React.FC<ArgsType> = ({ action = "add", data, id }) => {
  const {t} = useTranslation();
  const [formData, setFormData] = useState<Project>(initialValues)

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {

  }

  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = event.target;

  };

  return (
    <div className='content flex justify-center'>
      <div className="p-4 bg-white shadow-md rounded max-w-screen-sm flex-1">
        <div className='flex flex-row justify-between align-center'>
          <h2 className="text-lg font-bold mb-4">
          { action==='update' ? t('updateProject') : t('newProject')}
          </h2>
        </div>
        <form onSubmit={(e) => submitForm(e)} className=''>
          <div className='fields-wrap grid grid-cols-1 md:grid-cols-2 gap-2'>
            <div className="mb-4">
              <CustomInput type='text' onChange={handleInputs} label={`${t('FORMS.name')}`} required/>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectsForm



